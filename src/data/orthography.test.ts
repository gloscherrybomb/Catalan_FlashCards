import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * The 2016 IEC orthography reform, guarded.
 *
 * The reform cut the diacritical accents to fifteen: bé, déu, és, mà, més, món,
 * pèl, què, sé, sí, sòl, són, té, ús, vós. Everything else lost its accent,
 * including compounds and derivatives of those fifteen - adeu, adeu-siau,
 * marededeu - and the very common sóc, nét, dóna and vénen.
 *
 * This exists because the forms kept coming back. They were swept out of the
 * whole codebase once, and then reappeared twice in new material written the
 * same afternoon, because "sóc" is what a pre-2016 memory produces. A test is
 * more reliable than remembering.
 */

/** Removed diacritics that are plausible in this content, and their replacements. */
const REMOVED: Record<string, string> = {
  'sóc': 'soc',
  'nét': 'net',
  'néta': 'neta',
  'néts': 'nets',
  'dóna': 'dona',
  'dónes': 'dones',
  'dónen': 'donen',
  'vénen': 'venen',
  'véns': 'vens',
  'vénc': 'vinc',
  'adéu': 'adeu',
  'ós': 'os',
  'féu': 'feu',
  'vés': 'ves',
  'móra': 'mora',
  'sòls': 'sols',
};

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(entry => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return path.endsWith('.ts') || path.endsWith('.tsx') ? [path] : [];
  });
}

describe('IEC 2016 orthography', () => {
  it('uses no diacritic the 2016 reform removed', () => {
    const offenders: string[] = [];

    for (const file of sourceFiles('src')) {
      // This file names the obsolete forms on purpose. The leading-hyphen
      // exclusion in the pattern spares suffix tables like mnemonicService's
      // '-ós': '-ous', where the accent is the stress accent of famós.
      if (file.endsWith('orthography.test.ts')) continue;
      const source = readFileSync(file, 'utf8');

      for (const [obsolete, correct] of Object.entries(REMOVED)) {
        // Not \b: it is ASCII-only in JavaScript, so it finds a boundary
        // between "m" and "ó" and matches the "ós" inside "famós". The
        // lookarounds below treat accented letters as letters.
        const pattern = new RegExp(`(?<![A-Za-zÀ-ÿ·-])${obsolete}(?![A-Za-zÀ-ÿ·])`, 'gi');
        for (const match of source.matchAll(pattern)) {
          const line = source.slice(0, match.index!).split('\n').length;
          offenders.push(
            `${file.replace(/^src\//, '')}:${line} "${match[0]}" -> "${correct}"`
          );
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
