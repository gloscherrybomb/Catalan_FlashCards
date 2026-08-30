# Conversation practice setup

The Catalan conversation tutor is backed by Claude through a Firebase Cloud
Function (`functions/src/conversation.ts`). It is optional: without a key the
app falls back to pre-written replies and tells the learner so.

## Why a Cloud Function

The Anthropic API key must never reach the browser. Anything prefixed `VITE_`
is compiled into the client bundle and is readable by anyone who opens the
site, so the key lives as a Firebase secret and only the function can see it.

## Setup

```bash
# 1. Store the key (Firebase encrypts it; it is never written to the repo)
firebase functions:secrets:set ANTHROPIC_API_KEY

# 2. Install function dependencies and deploy
cd functions && npm install && cd ..
firebase deploy --only functions
```

## Cost controls

Conversation turns cost real money per token, so the function has three limits
built in:

| Control | Value | Where |
|---|---|---|
| Messages per user per day | 60 | `DAILY_MESSAGE_LIMIT` in `conversation.ts` |
| History sent per turn | last 12 turns | `history.slice(-12)` |
| Max reply length | 4096 tokens | `max_tokens` |

The daily count is written in a Firestore transaction, so two concurrent
requests cannot both slip past the limit. Counters live at
`users/{uid}/usage/conversation-{YYYY-MM-DD}` and carry an `expiresAt` field —
add a Firestore TTL policy on that field if you want them cleaned up
automatically.

The scenario system prompt is marked with `cache_control`, so follow-up turns
in the same conversation re-use the cached prefix and cost noticeably less than
the first.

## Model

Configured by a single profile in `conversation.ts`:

```ts
const TUTOR: TutorProfile = TUTOR_PROFILES.haiku;   // haiku | sonnet | opus
```

| Profile | Model | Reasoning | Approx. per turn |
|---|---|---|---|
| `haiku` (default) | `claude-haiku-4-5` | none | ~0.4p |
| `sonnet` | `claude-sonnet-5` | adaptive, low effort | ~0.8p |
| `opus` | `claude-opus-5` | adaptive, medium effort | ~2p |

Costs are rough — thinking tokens bill as output and vary — but the ratios hold.

Haiku is the default because the hard judgement in this task ("is the learner's
Catalan actually wrong, or merely regional or colloquial?") is carried mostly by
the correction rules in the system prompt rather than by raw model strength.
Move up a profile if corrections start looking shallow or the role-play drifts
out of character.

**The profile carries the request shape, not just the model id, and that
matters.** The reasoning controls differ by model generation and sending the
wrong shape is a 400, not a silent downgrade: Opus 5 and Sonnet 5 take adaptive
thinking and `output_config.effort`, while Haiku 4.5 predates both — it rejects
`effort` outright and needs an explicit `budget_tokens` for thinking. Change
models by switching profile, not by editing the model string on its own.
