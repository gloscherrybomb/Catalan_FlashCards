# Firebase setup

Current state of the `catalanflashcards` project, and the one step still
outstanding.

## What is configured

| | State |
|---|---|
| Billing | Blaze (pay-as-you-go) |
| Firestore rules | Per-user, collection-allowlisted, `usage` server-only |
| Point-in-time recovery | Enabled — 7 days of recovery |
| Delete protection | Enabled |
| TTL on `users/{uid}/usage` | Enabled on `expiresAt` |
| App Check | reCAPTCHA Enterprise registered, **monitoring only** |

## The outstanding step: turn App Check on

App Check is registered and the client sends tokens, but enforcement is
deliberately **off**. Turning it on before real traffic carries valid tokens
would lock the live app out of its own backend.

1. Deploy the app so the client with App Check is live.
2. Wait a day or two of normal use.
3. Open **Firebase console → App Check → APIs**. Each service shows a split of
   verified against unverified requests.
4. When verified requests dominate, switch **Firestore** and **Cloud Storage**
   to *Enforced*.

If something breaks afterwards, set it back to unenforced — it takes effect
immediately.

Callable functions are not listed there. `chatWithTutor` checks `context.app`
itself and currently logs a warning for an unattested request rather than
rejecting it; change that warning to an `HttpsError` at the same time you
enforce the rest.

## Costs

Blaze is pay-as-you-go with a free tier that this app sits well inside. The
things that actually cost money:

- **Cloud Functions** — the tutor and TTS. Bounded by the tutor's 60
  messages/user/day cap.
- **Anthropic API** — billed separately, not by Google. See
  CONVERSATION_SETUP.md.
- **PITR** — charges for stored change history. Pennies at this data volume.
- **Firestore** — reads and writes, far inside the free tier here.

Worth setting a budget alert: **Google Cloud console → Billing → Budgets &
alerts**. A £5/month budget with alerts at 50/90/100% is enough to notice
anything unexpected long before it matters.

## Why the app broke in August 2026

The project was created with Firebase's test-mode rules:

```
allow read, write: if request.time < timestamp.date(2026, 2, 11);
```

Those expired on 11 February and nothing replaced them, because `.firebaserc`
had no project configured so `firebase deploy` had no target. From that date
every client request was denied, which surfaced as
"Missing or insufficient permissions" and a study session that could not advance.

Two consequences worth remembering: rules in the repo are not rules in
production until deployed, and for the ~30 days before expiry the database was
readable and writable by anyone who found the project.
