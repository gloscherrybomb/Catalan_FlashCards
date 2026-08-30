import type { CurriculumUnit, CEFRLevel } from './curriculum';
import { A2_UNITS } from './vocabularyA2';
import { B1_UNITS } from './vocabularyB1';
import type { UnitVocabulary } from './colloquialVocabulary';

/**
 * Learning-path units for the vocabulary added beyond the original twenty.
 *
 * The Learning Path is driven by CURRICULUM_UNITS, not by the vocabulary. Units
 * 21 to 50 would otherwise exist as flashcards with nothing linking to them -
 * exactly the failure the original course had, where twelve units were labelled
 * A2 and B1 with no material behind the labels.
 *
 * These are derived from the vocabulary units rather than hand-written, so a
 * new unit in vocabularyA2.ts or vocabularyB1.ts appears in the path
 * automatically and its title can never drift from the cards it teaches.
 */

/** A repeating palette, so the path keeps its visual rhythm past unit 20. */
const GRADIENTS = [
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-sky-500',
];

/** One icon per unit, in order, so each is recognisable in the path. */
const ICONS: Record<number, string> = {
  21: '💼', 22: '🩺', 23: '🏠', 24: '👕', 25: '🎓', 26: '⚽', 27: '🙂',
  28: '🍲', 29: '🌿', 30: '💻', 31: '💶', 32: '🧳', 33: '🏙️', 34: '❤️', 35: '📏',
  36: '📰', 37: '🌍', 38: '🏛️', 39: '🏰', 40: '🎨', 41: '🔬', 42: '📈', 43: '🧩',
  44: '💭', 45: '🔗', 46: '💬', 47: '🗺️', 48: '📷', 49: '🔤', 50: '✨',
};

function levelFor(unitNumber: number): CEFRLevel {
  return unitNumber <= 35 ? 'A2' : 'B1';
}

/**
 * Build a path unit from a vocabulary unit.
 *
 * Each gets a vocabulary lesson wired to the unit number - which is what
 * addUnitVocabulary and getStudyDeck key off - and a practice lesson, matching
 * the shape of the original twenty. Prerequisites are left empty and filled in
 * by curriculum.ts, which orders the whole path and chains it in one place.
 */
function toCurriculumUnit(unit: UnitVocabulary, index: number): CurriculumUnit {
  const level = levelFor(unit.unitNumber);
  const xp = level === 'B1' ? 40 : 35;

  return {
    id: unit.unitId,
    title: unit.title,
    titleCatalan: unit.titleCatalan,
    description: unit.description,
    level,
    icon: ICONS[unit.unitNumber] ?? '📘',
    color: GRADIENTS[index % GRADIENTS.length],
    // Filled in by curriculum.ts, which chains the whole path in level order.
    prerequisites: [],
    courseUnit: unit.unitNumber,
    milestoneTitle: unit.unitNumber === 35 ? 'A2 Complete' : unit.unitNumber === 50 ? 'B1 Complete' : undefined,
    lessons: [
      {
        id: `u${unit.unitNumber}-vocab`,
        title: `${unit.title} Vocabulary`,
        titleCatalan: `Vocabulari: ${unit.titleCatalan}`,
        icon: '📚',
        estimatedMinutes: 12,
        xpReward: xp,
        content: {
          type: 'vocabulary',
          unitNumber: unit.unitNumber,
          description: unit.description,
        },
      },
      {
        id: `u${unit.unitNumber}-practice`,
        title: `Practise: ${unit.title}`,
        titleCatalan: `Practica: ${unit.titleCatalan}`,
        icon: '🎯',
        estimatedMinutes: 10,
        xpReward: Math.round(xp * 0.8),
        content: {
          type: 'conversation',
          description: `Use the ${unit.titleCatalan.toLowerCase()} vocabulary in conversation`,
        },
      },
    ],
  };
}

const ALL = [...A2_UNITS, ...B1_UNITS];

export const EXTENDED_CURRICULUM_UNITS: CurriculumUnit[] = ALL.map(toCurriculumUnit);
