/**
 * Collect every Catalan string in the app and report what LanguageTool objects
 * to. See checkCatalan.mjs for why this exists.
 *
 * Run with:  npx vite-node scripts/checkAllCatalan.mjs [source] [--refresh]
 * Sources:   vocab | sentences | stories | grammar | conversation | all
 */
import { checkItems } from './checkCatalan.mjs';
import { COURSE_UNITS } from '../src/data/colloquialVocabulary.ts';
import { STARTER_VOCABULARY } from '../src/data/starterVocabulary.ts';
import { EXAMPLE_SENTENCES } from '../src/data/exampleSentences.ts';
import { STORIES } from '../src/data/stories.ts';
import { GRAMMAR_LESSONS } from '../src/data/grammarLessons.ts';

// argv[0] is node and argv[1] the script, so only look past them.
const want = process.argv.slice(2).find(a => !a.startsWith('-')) ?? 'all';

const sources = {
  vocab: () => [
    ...COURSE_UNITS.flatMap(u =>
      u.words.map(w => ({ label: `u${u.unitNumber} ${w.front}`, text: w.back }))
    ),
    ...STARTER_VOCABULARY.map(w => ({ label: `starter ${w.front}`, text: w.back })),
  ],
  sentences: () =>
    EXAMPLE_SENTENCES.map(s => ({ label: `sentence ${s.id}`, text: s.catalan })),
  stories: () =>
    STORIES.flatMap(s =>
      (s.paragraphs ?? s.content ?? []).map((p, i) => ({
        label: `story ${s.id} p${i + 1}`,
        text: typeof p === 'string' ? p : (p.catalan ?? ''),
      }))
    ).filter(i => i.text),
  grammar: () =>
    GRAMMAR_LESSONS.flatMap(l =>
      (l.content?.sections ?? []).flatMap((sec, si) =>
        (sec.examples ?? []).map((e, i) => ({
          label: `grammar ${l.id} s${si + 1}e${i + 1}`,
          text: e.catalan ?? '',
        }))
      )
    ).filter(i => i.text),
};

const chosen = want === 'all' ? Object.keys(sources) : [want];
let all = [];
for (const key of chosen) {
  if (!sources[key]) { console.error(`unknown source: ${key}`); process.exit(1); }
  const items = sources[key]();
  console.error(`${key}: ${items.length} items`);
  all = all.concat(items);
}

const findings = await checkItems(all, n => process.stderr.write(`\r  findings: ${n}   `));
process.stderr.write('\n');

console.log(`\n=== ${findings.length} findings across ${all.length} items ===\n`);
const byRule = {};
for (const f of findings) (byRule[f.rule] ??= []).push(f);
for (const [rule, list] of Object.entries(byRule).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n## ${rule}  (${list.length})`);
  for (const f of list.slice(0, 25)) {
    console.log(`  [${f.label}] "${f.text}"`);
    console.log(`     ${f.bad ? `«${f.bad}» ` : ''}${f.message}${f.suggest ? `  -> ${f.suggest}` : ''}`);
  }
  if (list.length > 25) console.log(`  ... and ${list.length - 25} more`);
}
