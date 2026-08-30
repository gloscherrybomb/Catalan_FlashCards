# Conversation practice setup

The Catalan conversation tutor runs on **Gemini via Vertex AI**, called from a
Firebase Cloud Function (`functions/src/conversation.ts`).

## There is nothing to configure

No API key, no secret. The function runs as the project's service account and
authenticates to Vertex with Application Default Credentials, so there is
nothing to store, rotate or leak. It bills to the same project as the rest of
the app.

Requirements, all already in place:

- Billing enabled (Blaze)
- `aiplatform.googleapis.com` enabled
- The function's service account (`catalanflashcards@appspot.gserviceaccount.com`)
  holding a role that permits Vertex — currently `roles/editor`

Deploy with:

```bash
firebase deploy --only functions
```

## Model

Set by one constant in `conversation.ts`:

```ts
const TUTOR_MODEL: string = MODELS.flash;   // lite | flash | pro
```

| Profile | Model |
|---|---|
| `lite` | `gemini-2.5-flash-lite` |
| `flash` (default) | `gemini-2.5-flash` |
| `pro` | `gemini-2.5-pro` |

These were verified callable on this project rather than taken from memory —
`gemini-2.0-flash` and `gemini-3-flash` do **not** exist for it, so do not
assume a name works because it appears in documentation elsewhere.

The model is pinned rather than `gemini-flash-latest` so behaviour cannot shift
underneath the app.

Flash is the default because the hard judgement here — "is the learner's Catalan
actually wrong, or merely regional or colloquial?" — is carried mostly by the
correction rules in the system prompt rather than raw model strength. Move up a
profile if corrections start looking shallow or the role-play drifts.

## Cost controls

Conversation turns cost real money per token, so the function has three limits:

| Control | Value | Where |
|---|---|---|
| Messages per user per day | 60 | `DAILY_MESSAGE_LIMIT` |
| History sent per turn | last 12 turns | `HISTORY_TURNS` |
| Max reply length | 2048 tokens | `maxOutputTokens` |

The daily count is written in a Firestore transaction, so two concurrent
requests cannot both slip past the limit. Counters live at
`users/{uid}/usage/conversation-{YYYY-MM-DD}` with a TTL policy on `expiresAt`
that clears them automatically.

**The security rules deny client writes to that path.** They are written by the
Admin SDK, which bypasses rules. Without that, a learner could simply delete
their own usage document and reset their daily cap.

## Behaviour when unavailable

If the function fails for any reason, the client falls back to the offline
keyword responses in `conversationService.ts` and says so on screen — the
fallback cannot react to what was written and does not correct it, so
presenting it as the real tutor would be misleading.
