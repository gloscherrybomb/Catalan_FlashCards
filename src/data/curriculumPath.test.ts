import { describe, it, expect } from 'vitest';
import { CURRICULUM_UNITS, type CEFRLevel } from './curriculum';

/**
 * The learning path has to be walkable from one end to the other.
 *
 * Two failures got through before this existed. Concatenating the original
 * twenty units with the extended ones ran A1, A2, B1 and then back down to A2,
 * so a learner reached B1 material at unit 15 and was dropped to A2 at 21. And
 * unit 21 was chained to `unit-20-festival` - the id of the *vocabulary* unit
 * rather than the curriculum one - so its prerequisite could never be met and
 * every unit from 21 onwards was locked permanently.
 *
 * Both are invisible in the UI: a locked unit looks exactly like one you have
 * not reached yet.
 */

const RANK: Record<CEFRLevel, number> = { A1: 0, A2: 1, B1: 2, B2: 3 };

describe('learning path', () => {
  it('never asks for a prerequisite that does not exist', () => {
    const ids = new Set(CURRICULUM_UNITS.map(unit => unit.id));
    const dangling = CURRICULUM_UNITS.flatMap(unit =>
      unit.prerequisites.filter(id => !ids.has(id)).map(id => `${unit.id} -> ${id}`)
    );

    expect(dangling).toEqual([]);
  });

  it('only depends on units that come earlier in the path', () => {
    const position = new Map(CURRICULUM_UNITS.map((unit, i) => [unit.id, i]));
    const unreachable = CURRICULUM_UNITS.filter((unit, i) =>
      unit.prerequisites.some(id => (position.get(id) ?? Infinity) >= i)
    ).map(unit => unit.id);

    expect(unreachable).toEqual([]);
  });

  it('never drops back to an easier level', () => {
    const regressions = CURRICULUM_UNITS.filter(
      (unit, i) => i > 0 && RANK[unit.level] < RANK[CURRICULUM_UNITS[i - 1].level]
    ).map(unit => `${unit.id} (${unit.level}) follows a harder unit`);

    expect(regressions).toEqual([]);
  });

  it('gives every unit a route from the first one', () => {
    const byId = new Map(CURRICULUM_UNITS.map(unit => [unit.id, unit]));
    const reachable = new Set<string>();

    // A unit is reachable once all of its prerequisites are.
    let added = true;
    while (added) {
      added = false;
      for (const unit of CURRICULUM_UNITS) {
        if (reachable.has(unit.id)) continue;
        if (unit.prerequisites.every(id => reachable.has(id) && byId.has(id))) {
          reachable.add(unit.id);
          added = true;
        }
      }
    }

    const stranded = CURRICULUM_UNITS.filter(unit => !reachable.has(unit.id)).map(u => u.id);
    expect(stranded).toEqual([]);
  });
});
