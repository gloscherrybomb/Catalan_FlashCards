# Content checking

`checkAllCatalan.mjs` runs every Catalan string in the app — vocabulary,
example sentences, story text and grammar examples — through LanguageTool's
`ca-ES` rule set, which is the Softcatalà one behind the Catalan spell and
grammar checkers.

There is no native speaker reviewing this content, so correctness comes from
the tool rather than from confidence. It has already caught obsolete diacritics
(`sóc`, `adéu`), a missing apostrophe, Spanish calques (`anar a` + infinitive,
`Què tal?`), an anglicism, gender errors and a grammar lesson that taught the
Spanish `-ment` rule instead of the Catalan one.

```bash
npx vite-node scripts/checkAllCatalan.mjs            # everything
npx vite-node scripts/checkAllCatalan.mjs sentences  # one source
npx vite-node scripts/checkAllCatalan.mjs all --refresh   # ignore the cache
```

Sources: `vocab`, `sentences`, `stories`, `grammar`, `all`.

Results cache to `.catalan-check-cache.json` (gitignored) so a re-run after
fixing a handful of items does not re-query the whole corpus. The public
endpoint is rate-limited, so a full run takes several minutes.

Rules listed in `IGNORED_RULES` fire on correct teaching material — batching
artefacts, and `sisplau`, which the course teaches deliberately with a note
that the IEC has not adopted it.
