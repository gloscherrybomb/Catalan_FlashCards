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

`claude-opus-5` with adaptive thinking at `medium` effort. Deciding whether a
learner's Catalan is genuinely wrong — rather than merely unusual, regional, or
colloquial — is a judgement call that benefits from reasoning; `medium` keeps
the reply latency tolerable for a chat interface. Lower it to `low` in
`conversation.ts` if replies feel slow, or raise it if corrections look shallow.
