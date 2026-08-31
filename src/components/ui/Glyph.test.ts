import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { isGlyphName } from './Glyph';

/**
 * Icons are semantic names in the data, resolved at render.
 *
 * That indirection has one failure mode: a name with no entry in the registry
 * falls back to a neutral dot, which looks deliberate. Nothing throws and
 * nothing logs, so a typo in a data file would ship and simply look dull.
 */

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(entry => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return path.endsWith('.ts') || path.endsWith('.tsx') ? [path] : [];
  });
}

// Emoji, but not the typographic arrows and stars used deliberately in prose
// (→ in grammar examples) or as brand accents (✦ in the Miró decoration).
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{1F1E6}-\u{1F1FF}]/u;

/** `icon: 'name'` in a data or component file. */
const ICON_FIELD = /\bicon:\s*'([^']+)'/g;

describe('Glyph', () => {
  const files = sourceFiles('src').filter(f => !f.includes('.test.') && !f.endsWith('Glyph.tsx'));

  it('has no emoji left in an icon field', () => {
    const offenders: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(ICON_FIELD)) {
        if (EMOJI.test(match[1])) {
          const line = source.slice(0, match.index!).split('\n').length;
          offenders.push(`${file.replace(/^src\//, '')}:${line} "${match[1]}"`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('resolves every icon name used in the data', () => {
    const unknown: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(ICON_FIELD)) {
        const name = match[1];
        // Skip paths and Tailwind classes: CategoryIcon and the notification
        // service both use an `icon:` key for something that is not a glyph.
        if (name.includes('/') || name.startsWith('text-') || name.startsWith('bg-')) continue;
        if (!isGlyphName(name)) {
          const line = source.slice(0, match.index!).split('\n').length;
          unknown.push(`${file.replace(/^src\//, '')}:${line} "${name}"`);
        }
      }
    }

    expect(unknown).toEqual([]);
  });
});
