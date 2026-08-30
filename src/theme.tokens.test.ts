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

/**
 * Guards against elements styled for light mode only.
 *
 * A hard-coded `text-gray-800` or `bg-white` with no dark counterpart renders
 * dark-on-dark: technically present, effectively invisible. This was widespread
 * - 153 occurrences across 30 files, including most of the Settings, Stats and
 * Browse pages - and none of it was caught by types, lint or the build.
 */
describe('dark mode coverage', () => {
  const LIGHT_ONLY =
    /\b(bg-white|bg-gray-50|bg-gray-100|bg-gray-200|text-gray-500|text-gray-600|text-gray-700|text-gray-800|text-gray-900|border-gray-100|border-gray-200|border-gray-300)\b/g;

  it('pairs every light-mode colour with a dark variant', () => {
    const offenders: string[] = [];

    for (const file of sourceFiles('src')) {
      if (!file.endsWith('.tsx')) continue;

      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, index) => {
          for (const [, cls] of line.matchAll(LIGHT_ONLY)) {
            const utility = cls.split('-')[0]; // bg | text | border
            // A dark: variant of the same utility on the same element counts.
            if (!new RegExp(`dark:${utility}-`).test(line)) {
              offenders.push(`${file.replace(/^src\//, '')}:${index + 1} ${cls}`);
            }
          }
        });
    }

    expect(offenders).toEqual([]);
  });
});


/**
 * Guards against controls that only work with a mouse.
 *
 * The shared Card rendered a bare div with an onClick: no role, not focusable,
 * no key handler. Thirteen places use a clickable Card, including the
 * study-mode picker, so a keyboard or screen-reader user could not start a
 * study session at all.
 */
/**
 * Extract the opening tag of every `<name ...>` in a JSX source.
 *
 * A regex cannot do this. `[^>]*` stops at the first '>', and an arrow function
 * in an attribute (`onClick={() => ...}`) supplies one long before the tag ends,
 * so a regex silently skips exactly the elements that have handlers - the ones
 * these guards exist to check. Attribute values are only ever quoted strings or
 * braced expressions, so tracking brace depth and quotes finds the true end.
 */
function openingTags(source: string, name: string) {
  const tags: Array<{ index: number; attrs: string; end: number }> = [];
  const opener = new RegExp(`<${name}\\b`, 'g');

  for (const match of source.matchAll(opener)) {
    let i = match.index! + name.length + 1;
    let depth = 0;
    let quote = '';

    for (; i < source.length; i++) {
      const char = source[i];
      if (quote) {
        if (char === quote && source[i - 1] !== '\\') quote = '';
        continue;
      }
      if (char === '"' || char === "'" || char === '`') quote = char;
      else if (char === '{') depth++;
      else if (char === '}') depth--;
      else if (char === '>' && depth === 0) break;
    }

    tags.push({ index: match.index!, attrs: source.slice(match.index!, i), end: i + 1 });
  }

  return tags;
}

/** 1-indexed line number of an offset, for a clickable offender path. */
function lineAt(source: string, index: number) {
  return source.slice(0, index).split('\n').length;
}

describe('keyboard accessibility', () => {
  it('gives every clickable element a role and a key handler', () => {
    const offenders: string[] = [];

    for (const file of sourceFiles('src')) {
      if (!file.endsWith('.tsx')) continue;
      const source = readFileSync(file, 'utf8');

      for (const tag of openingTags(source, 'div')) {
        if (!/onClick=/.test(tag.attrs)) continue;

        // A backdrop that only swallows a click is not an interactive control.
        const isStopPropagationOnly = /onClick=\{\(e\w*\) => e\w*\.stopPropagation\(\)\}/.test(
          tag.attrs
        );
        if (isStopPropagationOnly) continue;

        if (!/role=/.test(tag.attrs) || !/onKeyDown=|onKeyUp=|onKeyPress=/.test(tag.attrs)) {
          offenders.push(`${file.replace(/^src\//, '')}:${lineAt(source, tag.index)}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('gives every icon-only button an accessible name', () => {
    const offenders: string[] = [];

    for (const file of sourceFiles('src')) {
      if (!file.endsWith('.tsx')) continue;
      const source = readFileSync(file, 'utf8');

      for (const tag of openingTags(source, 'button')) {
        if (/aria-label|title=|aria-labelledby/.test(tag.attrs)) continue;
        if (tag.attrs.trimEnd().endsWith('/')) continue; // self-closing, no body

        const close = source.indexOf('</button>', tag.end);
        if (close === -1) continue;

        const body = source.slice(tag.end, close);
        // Strip nested tags but keep `{expr}` - an expression such as
        // {option.label} renders visible text and does name the button.
        const visibleText = body.replace(/<[^>]+>/g, ' ').trim();
        const hasIcon = /<[A-Z]\w+|<svg/.test(body);

        // An icon with no text beside it announces only as "button".
        if (hasIcon && !visibleText) {
          offenders.push(`${file.replace(/^src\//, '')}:${lineAt(source, tag.index)}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
