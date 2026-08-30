import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { defineSecret } from "firebase-functions/params";
import Anthropic from "@anthropic-ai/sdk";
// zod/v4: the SDK's zodOutputFormat helper is built against the Zod 4 API,
// which ships inside zod 3.25+ under this subpath.
import { z } from "zod/v4";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

/**
 * Claude-backed Catalan conversation practice.
 *
 * The client previously had a lookup table of canned replies keyed by scenario,
 * which is fine as a fallback but cannot respond to what the learner actually
 * wrote, and never corrects them. This proxies Claude so the tutor can react to
 * real input and explain the mistakes.
 *
 * It runs server-side because the API key must never reach the browser. The
 * client calls it through Firebase callable auth, so only signed-in users
 * reach it.
 */

const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");

/** Kept small deliberately: this is a personal-scale app paying real per-token costs. */
const DAILY_MESSAGE_LIMIT = 60;

const LEVELS = ["A1", "A2", "B1", "B2"] as const;
type Level = (typeof LEVELS)[number];

interface ChatRequest {
  scenarioId: string;
  scenarioTitle: string;
  level: Level;
  /** Prior turns, oldest first. */
  history: Array<{ role: "user" | "assistant"; content: string }>;
  userMessage: string;
}

/**
 * The shape we need back. Declared as a schema rather than parsed out of prose
 * so the client can render corrections and vocabulary as structured UI.
 */
const TutorReplySchema = z.object({
  reply: z
    .string()
    .describe("Your reply in Catalan, staying in character for the scenario."),
  translation: z
    .string()
    .describe("A natural English translation of your Catalan reply."),
  corrections: z
    .array(
      z.object({
        original: z.string().describe("The learner's original wording."),
        corrected: z.string().describe("The corrected Catalan."),
        explanation: z
          .string()
          .describe("A short, kind explanation in English of why."),
        type: z.enum(["grammar", "spelling", "word-choice", "accent"]),
      })
    )
    .describe(
      "Mistakes worth correcting. Empty when the learner's Catalan was fine - " +
        "do not invent corrections."
    ),
  newVocabulary: z
    .array(z.object({ catalan: z.string(), english: z.string() }))
    .describe("At most three useful words from your reply the learner may not know."),
});

function systemPromptFor(level: Level, scenarioTitle: string): string {
  return [
    "You are a warm, patient Catalan conversation partner helping an English",
    `speaker practise. The learner is at CEFR level ${level}.`,
    "",
    `Role-play this situation: ${scenarioTitle}.`,
    "Stay in character and keep the conversation going with a natural question",
    "or prompt, so the learner always has something to reply to.",
    "",
    "Language rules:",
    "- Reply in standard Central (Barcelona) Catalan, using IEC orthography.",
    `- Match the learner's level: at A1/A2 use short sentences, present tense,`,
    "  and high-frequency vocabulary. At B1/B2 you may use past and future",
    "  tenses, subordinate clauses and idiom.",
    "- Keep replies to one to three sentences. This is practice for them, not",
    "  a monologue from you.",
    "",
    "Correction rules:",
    "- Correct only real mistakes in the learner's Catalan. If what they wrote",
    "  was correct, return an empty corrections list. Never invent a correction",
    "  to seem useful, and never correct a valid regional or colloquial form.",
    "- A missing accent is worth flagging; awkward-but-correct phrasing is not.",
    "- Explanations go in English, are one sentence, and say why rather than",
    "  just restating the fix.",
    "- If the learner writes in English, gently reply in Catalan anyway and",
    "  give them the Catalan they were reaching for as new vocabulary.",
  ].join("\n");
}

/**
 * Per-user daily message count.
 *
 * Without this a single loop in a client - or one enthusiastic evening - runs
 * up a real bill on a personal project. Uses a transaction so concurrent calls
 * cannot both read the same count and each decide there is room.
 */
async function consumeDailyQuota(userId: string): Promise<number> {
  const today = new Date();
  const dayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const ref = admin
    .firestore()
    .doc(`users/${userId}/usage/conversation-${dayKey}`);

  return admin.firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const used = (snap.exists ? snap.data()?.count : 0) ?? 0;

    if (used >= DAILY_MESSAGE_LIMIT) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        `You've reached today's practice limit of ${DAILY_MESSAGE_LIMIT} messages. ` +
          "It resets tomorrow."
      );
    }

    tx.set(
      ref,
      {
        count: used + 1,
        // Lets a TTL policy clean these up without a scheduled function.
        expiresAt: admin.firestore.Timestamp.fromMillis(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      },
      { merge: true }
    );

    return used + 1;
  });
}

export const chatWithTutor = functions
  .region("europe-west2")
  .runWith({
    secrets: [anthropicApiKey],
    // Adaptive thinking makes turns slower than a plain completion.
    timeoutSeconds: 120,
    memory: "512MB",
  })
  .https.onCall(async (data: ChatRequest, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Sign in to use conversation practice."
      );
    }

    const userMessage = (data?.userMessage ?? "").trim();
    if (!userMessage) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Message cannot be empty."
      );
    }
    if (userMessage.length > 1000) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Message is too long."
      );
    }

    const level: Level = LEVELS.includes(data?.level) ? data.level : "A1";

    await consumeDailyQuota(context.auth.uid);

    const client = new Anthropic({ apiKey: anthropicApiKey.value() });

    // Only the recent turns: the scenario resets often and the whole point is
    // short practice exchanges, so sending everything wastes tokens.
    const history = (data.history ?? []).slice(-12).map((m) => ({
      role: m.role,
      content: String(m.content ?? "").slice(0, 1000),
    }));

    try {
      const response = await client.messages.parse({
        model: "claude-opus-5",
        max_tokens: 4096,
        // Judging whether a learner's Catalan is actually wrong - rather than
        // merely unusual - benefits from reasoning; medium keeps chat latency
        // tolerable.
        thinking: { type: "adaptive" },
        output_config: {
          effort: "medium",
          format: zodOutputFormat(TutorReplySchema),
        },
        system: [
          {
            type: "text",
            text: systemPromptFor(level, data.scenarioTitle ?? "a friendly chat"),
            // The system prompt is identical for every turn of a scenario, so
            // caching it makes each follow-up materially cheaper.
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          ...history,
          { role: "user" as const, content: userMessage },
        ],
      });

      if (response.stop_reason === "refusal") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "I can't help with that one - try a different message."
        );
      }

      const parsed = response.parsed_output;
      if (!parsed) {
        throw new functions.https.HttpsError(
          "internal",
          "The tutor's reply could not be read. Please try again."
        );
      }

      return parsed;
    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error;

      if (error instanceof Anthropic.RateLimitError) {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          "The tutor is busy right now. Try again in a moment."
        );
      }
      if (error instanceof Anthropic.AuthenticationError) {
        functions.logger.error("Anthropic auth failed - check ANTHROPIC_API_KEY");
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Conversation practice is not configured."
        );
      }

      functions.logger.error("Tutor request failed", { error: String(error) });
      throw new functions.https.HttpsError(
        "internal",
        "Could not reach the tutor. Please try again."
      );
    }
  });
