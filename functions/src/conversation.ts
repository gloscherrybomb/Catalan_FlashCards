// v1 subpath: from firebase-functions v6 the bare import resolves to the v2
// API, whose callable handlers take a single request object rather than
// (data, context). These functions use the v1 shape.
import * as functions from "firebase-functions/v1";
// firebase-admin v12+ is modular: the namespaced admin.firestore() form was
// removed in v14.
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {GoogleGenAI} from "@google/genai";

/**
 * Gemini-backed Catalan conversation practice.
 *
 * The client previously had a lookup table of canned replies keyed by scenario,
 * which is fine as a fallback but cannot respond to what the learner actually
 * wrote, and never corrects them. This proxies Gemini so the tutor can react to
 * real input and explain the mistakes.
 *
 * Runs on Vertex AI with Application Default Credentials: the function already
 * executes as a service account, so there is no API key to store, rotate or
 * leak, and it bills to the same project as everything else.
 */

/** Vertex location. "global" gives the widest model availability. */
const LOCATION = "global";

/**
 * Which model answers.
 *
 * Verified callable on this project before being written here rather than
 * taken from memory: gemini-2.5-flash, -flash-lite and -pro all respond, while
 * gemini-2.0-flash and gemini-3-flash do not exist for it.
 *
 * Flash is the default. The hard judgement in this task - "is the learner's
 * Catalan actually wrong, or merely regional or colloquial?" - is carried
 * mostly by the correction rules in the system prompt, and an A1-B2 role-play
 * is not a demanding generation task. Pinned rather than gemini-flash-latest,
 * so behaviour does not shift underneath the app.
 */
const MODELS = {
  lite: "gemini-2.5-flash-lite",
  flash: "gemini-2.5-flash",
  pro: "gemini-2.5-pro",
} as const;

const TUTOR_MODEL: string = MODELS.flash;

/** Kept small deliberately: this is a personal-scale app paying real per-token costs. */
const DAILY_MESSAGE_LIMIT = 60;

/** Turns of history sent per request - enough for context, not the whole session. */
const HISTORY_TURNS = 12;

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

interface TutorReply {
  reply: string;
  translation: string;
  corrections: Array<{
    original: string;
    corrected: string;
    explanation: string;
    type: "grammar" | "spelling" | "word-choice" | "accent";
  }>;
  newVocabulary: Array<{ catalan: string; english: string }>;
}

/**
 * The shape we need back, declared as a schema rather than parsed out of prose
 * so the client can render corrections and vocabulary as structured UI.
 */
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    reply: {
      type: "STRING",
      description: "Your reply in Catalan, staying in character for the scenario.",
    },
    translation: {
      type: "STRING",
      description: "A natural English translation of your Catalan reply.",
    },
    corrections: {
      type: "ARRAY",
      description:
        "Mistakes worth correcting. Empty when the learner's Catalan was fine - " +
        "do not invent corrections.",
      items: {
        type: "OBJECT",
        properties: {
          original: {type: "STRING"},
          corrected: {type: "STRING"},
          explanation: {type: "STRING"},
          type: {
            type: "STRING",
            enum: ["grammar", "spelling", "word-choice", "accent"],
          },
        },
        required: ["original", "corrected", "explanation", "type"],
      },
    },
    newVocabulary: {
      type: "ARRAY",
      description: "At most three useful words from your reply the learner may not know.",
      items: {
        type: "OBJECT",
        properties: {
          catalan: {type: "STRING"},
          english: {type: "STRING"},
        },
        required: ["catalan", "english"],
      },
    },
  },
  required: ["reply", "translation", "corrections", "newVocabulary"],
};

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
    "- Match the learner's level: at A1/A2 use short sentences, present tense,",
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
 *
 * Written through the Admin SDK, which bypasses security rules; the rules deny
 * client writes to this path precisely so a learner cannot reset their own cap.
 */
async function consumeDailyQuota(userId: string): Promise<number> {
  const today = new Date();
  const dayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const db = getFirestore();
  const ref = db.doc(`users/${userId}/usage/conversation-${dayKey}`);

  return db.runTransaction(async (tx) => {
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
        // A TTL policy on this field clears old counters automatically.
        expiresAt: Timestamp.fromMillis(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      },
      {merge: true}
    );

    return used + 1;
  });
}

export const chatWithTutor = functions
  .region("europe-west2")
  .runWith({
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

    // App Check is not configurable for callable functions through the services
    // API - the function verifies the attestation itself. Warned rather than
    // rejected for now, matching the console's monitoring-only setting; tighten
    // to a throw once real traffic is consistently attested.
    if (!context.app) {
      functions.logger.warn("Request without a valid App Check token", {
        uid: context.auth.uid,
      });
    }

    const userMessage = (data?.userMessage ?? "").trim();
    if (!userMessage) {
      throw new functions.https.HttpsError("invalid-argument", "Message cannot be empty.");
    }
    if (userMessage.length > 1000) {
      throw new functions.https.HttpsError("invalid-argument", "Message is too long.");
    }

    const level: Level = LEVELS.includes(data?.level) ? data.level : "A1";

    await consumeDailyQuota(context.auth.uid);

    // Application Default Credentials: the function's own service account.
    const ai = new GoogleGenAI({
      vertexai: true,
      project: process.env.GCLOUD_PROJECT,
      location: LOCATION,
    });

    // Only the recent turns: the scenario resets often and the whole point is
    // short practice exchanges, so sending everything wastes tokens.
    const history = (data.history ?? []).slice(-HISTORY_TURNS).map((m) => ({
      // Gemini names the assistant role "model".
      role: m.role === "assistant" ? "model" : "user",
      parts: [{text: String(m.content ?? "").slice(0, 1000)}],
    }));

    try {
      const response = await ai.models.generateContent({
        model: TUTOR_MODEL,
        contents: [...history, {role: "user", parts: [{text: userMessage}]}],
        config: {
          systemInstruction: systemPromptFor(
            level,
            data.scenarioTitle ?? "a friendly chat"
          ),
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (!text) {
        throw new functions.https.HttpsError(
          "internal",
          "The tutor gave an empty reply. Please try again."
        );
      }

      let parsed: TutorReply;
      try {
        parsed = JSON.parse(text) as TutorReply;
      } catch {
        functions.logger.error("Tutor reply was not valid JSON", {
          sample: text.slice(0, 200),
        });
        throw new functions.https.HttpsError(
          "internal",
          "The tutor's reply could not be read. Please try again."
        );
      }

      // The schema guarantees the shape, but the client renders these directly,
      // so guard rather than trust.
      return {
        reply: String(parsed.reply ?? ""),
        translation: String(parsed.translation ?? ""),
        corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
        newVocabulary: Array.isArray(parsed.newVocabulary) ? parsed.newVocabulary : [],
      };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error;

      const message = String(error);
      if (/RESOURCE_EXHAUSTED|429/.test(message)) {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          "The tutor is busy right now. Try again in a moment."
        );
      }
      if (/PERMISSION_DENIED|403/.test(message)) {
        functions.logger.error(
          "Vertex AI permission denied - check the service account role",
          {error: message}
        );
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Conversation practice is not configured."
        );
      }

      functions.logger.error("Tutor request failed", {error: message});
      throw new functions.https.HttpsError(
        "internal",
        "Could not reach the tutor. Please try again."
      );
    }
  });
