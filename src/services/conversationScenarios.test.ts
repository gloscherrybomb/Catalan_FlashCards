import { describe, it, expect } from 'vitest';
import { SCENARIOS, getScenarioById, getScenariosByLevel } from './conversationService';

/**
 * The scenario list is content, and content drifts. These check the shape every
 * scenario has to satisfy for the tutor and the selector to work, so a new one
 * with a missing field or a duplicate id fails here rather than at runtime.
 */
describe('conversation scenarios', () => {
  it('offers a substantial set', () => {
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(30);
  });

  it('uses unique ids', () => {
    const seen = new Set<string>();
    const duplicates = SCENARIOS.map(s => s.id).filter(id =>
      seen.has(id) ? true : (seen.add(id), false)
    );
    expect(duplicates).toEqual([]);
  });

  it('gives every scenario the fields the tutor and selector need', () => {
    const incomplete = SCENARIOS.filter(
      s =>
        !s.title?.trim() ||
        !s.titleCatalan?.trim() ||
        !s.description?.trim() ||
        !s.icon?.trim() ||
        !s.starterPrompt?.trim() ||
        !s.starterPromptEnglish?.trim()
    ).map(s => s.id);

    expect(incomplete).toEqual([]);
  });

  it('gives every scenario suggested replies and key vocabulary', () => {
    // The selector renders three vocabulary chips and the starter suggestions;
    // fewer than that leaves visible gaps.
    const thin = SCENARIOS.filter(
      s => s.suggestedResponses.length < 3 || s.keyVocabulary.length < 3
    ).map(s => s.id);

    expect(thin).toEqual([]);
  });

  it('gives every vocabulary entry both languages', () => {
    const broken = SCENARIOS.flatMap(s =>
      s.keyVocabulary
        .filter(v => !v.catalan?.trim() || !v.english?.trim())
        .map(v => `${s.id}: ${JSON.stringify(v)}`)
    );
    expect(broken).toEqual([]);
  });

  it('covers every level, so the level filter is never empty', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2'] as const) {
      expect(getScenariosByLevel(level).length).toBeGreaterThan(0);
    }
  });

  it('covers every category declared in the type', () => {
    const used = new Set(SCENARIOS.map(s => s.category));
    for (const category of ['daily-life', 'travel', 'shopping', 'dining', 'social', 'work']) {
      expect(used).toContain(category);
    }
  });

  it('keeps the free-chat scenario the offline fallback depends on', () => {
    // findBestResponse falls back to SCENARIO_RESPONSES['free-chat'] for any
    // scenario without its own canned replies, which is now most of them.
    expect(getScenarioById('free-chat')).toBeDefined();
  });

  it('finds a scenario by id', () => {
    expect(getScenarioById('cafe-breakfast')?.level).toBe('A1');
    expect(getScenarioById('not-a-scenario')).toBeUndefined();
  });
});
