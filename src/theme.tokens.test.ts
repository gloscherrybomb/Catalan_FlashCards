import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guards against Tailwind classes that silently do nothing.
 *
 * `dark:bg-ink-dark` was used in ten components, but `ink.dark` was never
 * defined in tailwind.config.js. Tailwind emits no rule for an unknown token
 * and reports no error, so those cards kept their light `bg-white` and rendered
 * white in dark mode. The built CSS contained zero `ink-dark` rules.
 *
 * A misspelt or missing colour token is invisible in review, invisible at build
 * time, and only shows up as a wrong colour on screen - usually in the mode the
 * author was not looking at.
 */

const GROUPS = ['miro', 'primary', 'secondary', 'accent', 'canvas', 'ink'] as const;
const UTILITIES = 'bg|text|border|stroke|fill|from|to|via|ring|divide|decoration|shadow|outline';

function validTokens(): Set<string> {
  const config = readFileSync('tailwind.config.js', 'utf8');
  const valid = new Set<string>();

  for (const group of GROUPS) {
    valid.add(group);
    const block = new RegExp(`${group}:\\s*\\{(.*?)\\n\\s{6}\\}`, 's').exec(config);
    if (!block) continue;
    for (const [, key] of block[1].matchAll(/^\s*'?([\w-]+)'?:/gm)) {
      valid.add(key === 'DEFAULT' ? group : `${group}-${key}`);
    }
  }
  for (const flat of ['success', 'warning', 'error']) valid.add(flat);
  return valid;
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(entry => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry) && !/\.test\./.test(entry) ? [full] : [];
  });
}

describe('tailwind colour tokens', () => {
  it('only uses colour tokens that tailwind.config.js actually defines', () => {
    const valid = validTokens();
    const pattern = new RegExp(`\\b(?:${UTILITIES})-(${GROUPS.join('|')})(-[a-z0-9]+)?`, 'g');
    const offenders: string[] = [];

    for (const file of sourceFiles('src')) {
      const source = readFileSync(file, 'utf8');
      for (const [match, group, suffix] of source.matchAll(pattern)) {
        const token = suffix ? `${group}${suffix}` : group;
        if (!valid.has(token)) {
          offenders.push(`${file.replace(/^src\//, '')}: ${match} (no such token: ${token})`);
        }
      }
    }

    expect([...new Set(offenders)]).toEqual([]);
  });

  it('defines a dark surface, which ten components already depended on', () => {
    expect(validTokens().has('ink-dark')).toBe(true);
  });
});
