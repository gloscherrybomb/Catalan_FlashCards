import { describe, it, expect } from 'vitest';
import { COURSE_UNITS } from './colloquialVocabulary';
import { STARTER_VOCABULARY } from './starterVocabulary';
import { extractAllForms } from '../utils/textUtils';

/**
 * A card is only answerable if its prompt has exactly one right answer.
 *
 * The study modes used to strip the parenthetical from the prompt as well as
 * from the answer, so "welcome (to a man)" and "welcome (to a woman)" both
 * appeared as plain "welcome" while wanting different words - 18 English
 * prompts were coin flips. Grading still strips the answer, so the note has to
 * live on the prompt and be unique there.
 */

interface Entry {
  front: string;
  back: string;
  where: string;
}

const ENTRIES: Entry[] = [
  ...COURSE_UNITS.flatMap(unit =>
    unit.words.map(word => ({ front: word.front, back: word.back, where: `unit ${unit.unitNumber}` }))
  ),
  ...STARTER_VOCABULARY.map(card => ({ front: card.front, back: card.back, where: 'starter' })),
];

/**
 * Prompts that can mark a correct answer wrong.
 *
 * The grader accepts any of the slash-separated forms, so "vermell / vermella"
 * and "vermell" are not in conflict - a learner typing "vermell" satisfies
 * both. Only prompts whose accepted forms are entirely disjoint are faults.
 */
function collisions(promptOf: (e: Entry) => string, answerOf: (e: Entry) => string) {
  const byPrompt = new Map<string, Array<{ forms: Set<string>; where: string; raw: string }>>();

  for (const entry of ENTRIES) {
    const prompt = promptOf(entry).trim().toLowerCase();
    const raw = answerOf(entry);
    const forms = new Set(extractAllForms(raw).map(form => form.toLowerCase()));
    if (!byPrompt.has(prompt)) byPrompt.set(prompt, []);
    byPrompt.get(prompt)!.push({ forms, where: entry.where, raw });
  }

  const faults: string[] = [];
  for (const [prompt, answers] of byPrompt) {
    for (let i = 0; i < answers.length; i++) {
      for (let j = i + 1; j < answers.length; j++) {
        const shares = [...answers[i].forms].some(form => answers[j].forms.has(form));
        if (!shares) {
          faults.push(
            `"${prompt}" -> ${answers[i].raw} (${answers[i].where}) vs ${answers[j].raw} (${answers[j].where})`
          );
        }
      }
    }
  }
  return faults;
}

describe('vocabulary integrity', () => {
  it('gives every English prompt exactly one Catalan answer', () => {
    expect(collisions(e => e.front, e => e.back)).toEqual([]);
  });

  it('gives every Catalan prompt exactly one English answer', () => {
    expect(collisions(e => e.back, e => e.front)).toEqual([]);
  });

  it('never teaches the same word as two separate cards', () => {
    const seen = new Map<string, string>();
    const repeats: string[] = [];

    for (const entry of ENTRIES) {
      // Course units and the starter deck deliberately overlap - a beginner
      // meets "hola" in both - so only repeats within the course are faults.
      if (entry.where === 'starter') continue;
      const key = `${entry.front.trim().toLowerCase()}|${entry.back.trim().toLowerCase()}`;
      const first = seen.get(key);
      if (first) repeats.push(`${entry.front} = ${entry.back} (${first} and ${entry.where})`);
      else seen.set(key, entry.where);
    }

    expect(repeats).toEqual([]);
  });
});
