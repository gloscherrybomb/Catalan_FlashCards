/**
 * Run every piece of Catalan in the app through LanguageTool's Catalan checker.
 *
 * There is no native speaker reviewing this content, so correctness has to come
 * from a tool rather than from confidence. LanguageTool's ca-ES rule set is the
 * Softcatalà one - the same engine behind the Catalan spell and grammar
 * checkers - and it catches exactly the class of error found by hand earlier:
 * obsolete diacritics, missing apostrophes, agreement slips, Spanish calques.
 *
 * Usage:
 *   node scripts/checkCatalan.mjs            # check everything
 *   node scripts/checkCatalan.mjs vocab      # one source only
 *   node scripts/checkCatalan.mjs --refresh  # ignore the cache
 *
 * Results are cached in scripts/.catalan-check-cache.json so a re-run after
 * fixing ten items does not re-query the whole corpus.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

// fileURLToPath, not .pathname: the repo path contains a space, which
// .pathname hands back percent-encoded and fs cannot open.
const CACHE = fileURLToPath(new URL('./.catalan-check-cache.json', import.meta.url));
const API = 'https://api.languagetool.org/v2/check';

// The public endpoint allows roughly 20 requests and 20k characters a minute.
const BATCH_CHARS = 1200;
const PAUSE_MS = 5000;

/** Rules that fire on correct teaching material and would drown the signal. */
const IGNORED_RULES = new Set([
  'UPPERCASE_SENTENCE_START', // fragments and single words are not sentences
  'WHITESPACE_RULE',
  'PUNT_FINAL', // a vocabulary entry is not a sentence
  'MAJ_DESPRES_INTERROGANT', // fires across the join between two batched entries
  'SISPLAU', // taught deliberately, with a note that the IEC has not adopted it
  'ENCANTAT_DE_CONEIXERTE', // encantat is normal usage and in the DIEC
  'CA_SIMPLE_REPLACE_ANGLICISM', // croissant, web and friends are wanted here
  'EXIGEIX_ACCENTUACIO_VALENCIANA',
  'EXIGEIX_VERBS_CENTRAL',
  'EXIGEIX_POSSESSIUS_V',
  'DIACRITICS_TRADICIONALS', // pre-2016 accents: the app follows the new norm
]);

function hash(text) {
  return createHash('sha1').update(text).digest('hex').slice(0, 16);
}

const cache = existsSync(CACHE) && !process.argv.includes('--refresh')
  ? JSON.parse(readFileSync(CACHE, 'utf8'))
  : {};

async function check(text) {
  const key = hash(text);
  if (cache[key]) return cache[key];

  const body = new URLSearchParams({ text, language: 'ca-ES' });
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`LanguageTool ${res.status}: ${await res.text()}`);
  const json = await res.json();
  cache[key] = json.matches ?? [];
  writeFileSync(CACHE, JSON.stringify(cache));
  await new Promise(r => setTimeout(r, PAUSE_MS));
  return cache[key];
}

/**
 * Check a list of {label, text} items.
 *
 * Items are packed one per line into a batch so a single request covers many,
 * then each match's offset is mapped back to the line it came from.
 */
export async function checkItems(items, onProgress) {
  const findings = [];
  let batch = [];
  let chars = 0;

  const flush = async () => {
    if (!batch.length) return;

    // Give every item terminal punctuation before packing it into the batch.
    // Without it LanguageTool reads consecutive vocabulary entries as one
    // running sentence and reports agreement and capitalisation errors across
    // the join - "germà germana", "vermella blau" - which are artefacts of the
    // batching rather than anything wrong with the content.
    const lines = batch.map(i => (/[.!?…]$/.test(i.text) ? i.text : `${i.text}.`));
    const text = lines.join('\n');
    const matches = await check(text);

    // Line starts, so an offset can be resolved to its item.
    const starts = [];
    let at = 0;
    for (const line of lines) {
      starts.push(at);
      at += line.length + 1;
    }

    for (const m of matches) {
      if (IGNORED_RULES.has(m.rule?.id)) continue;
      let idx = starts.findIndex((s, i) =>
        m.offset >= s && (i === starts.length - 1 || m.offset < starts[i + 1])
      );
      if (idx < 0) idx = 0;
      findings.push({
        label: batch[idx].label,
        text: batch[idx].text,
        message: m.message,
        bad: m.context?.text?.slice(m.context.offset, m.context.offset + m.context.length) ?? '',
        suggest: (m.replacements ?? []).slice(0, 3).map(r => r.value).join(' / '),
        rule: m.rule?.id,
      });
    }
    batch = [];
    chars = 0;
    onProgress?.(findings.length);
  };

  for (const item of items) {
    if (chars + item.text.length > BATCH_CHARS) await flush();
    batch.push(item);
    chars += item.text.length + 1;
  }
  await flush();
  return findings;
}
