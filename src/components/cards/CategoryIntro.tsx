/**
 * CategoryIntro Component
 * Shows cultural context and learning tips when studying a category for the first time
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Globe,
  Lightbulb,
  ArrowRight,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { audioService } from '../../services/audioService';

interface CategoryIntroProps {
  category: string;
  unitNumber?: number;
  onContinue: () => void;
  onSkip?: () => void;
}

interface CategoryInfo {
  titleCatalan: string;
  description: string;
  culturalNote?: string;
  learningTip: string;
  keyPatterns?: string[];
  exampleWords: Array<{
    catalan: string;
    english: string;
  }>;
}

// Cultural and learning information for each category
const CATEGORY_INFO: Record<string, CategoryInfo> = {
  Greetings: {
    titleCatalan: 'Salutacions',
    description: 'Basic greetings and polite expressions used in daily conversation.',
    culturalNote: 'Catalans are generally warm and friendly. Greetings often include two kisses on the cheek (right then left) between friends and acquaintances. "Bon dia" is used until around 2pm, then "bona tarda" until sunset.',
    learningTip: 'These phrases will be among your most-used vocabulary. Practice them until they become automatic!',
    keyPatterns: [
      'Time-based greetings: bon dia, bona tarda, bona nit',
      'Formal vs informal: vostè (formal) vs tu (informal)',
    ],
    exampleWords: [
      { catalan: 'Hola', english: 'Hello' },
      { catalan: 'Bon dia', english: 'Good morning' },
      { catalan: 'Gràcies', english: 'Thank you' },
    ],
  },
  Verbs: {
    titleCatalan: 'Verbs',
    description: 'Action words that form the backbone of Catalan sentences.',
    culturalNote: 'Like Spanish, Catalan is a "pro-drop" language - you can often omit subject pronouns because the verb ending shows who is doing the action.',
    learningTip: 'Focus on the three verb groups (-ar, -er/-re, -ir) as they follow regular patterns. Master these endings and you can conjugate hundreds of verbs!',
    keyPatterns: [
      '-AR verbs: parlar (to speak) → parlo, parles, parla...',
      '-ER/-RE verbs: beure (to drink) → bec, beus, beu...',
      '-IR verbs: dormir (to sleep) → dormo, dorms, dorm...',
    ],
    exampleWords: [
      { catalan: 'parlar', english: 'to speak' },
      { catalan: 'menjar', english: 'to eat' },
      { catalan: 'viure', english: 'to live' },
    ],
  },
  Articles: {
    titleCatalan: 'Articles',
    description: 'Words that come before nouns to indicate definiteness.',
    culturalNote: 'Catalan has a unique feature among Romance languages: the "personal article" (en/na) used before people\'s names in informal contexts.',
    learningTip: 'Articles agree in gender and number with nouns. Learning them together with new nouns helps cement both in memory!',
    keyPatterns: [
      'Definite: el (m.sg), la (f.sg), els (m.pl), les (f.pl)',
      'Indefinite: un (m.sg), una (f.sg), uns (m.pl), unes (f.pl)',
      'Personal: en (men), na (women) - before names',
    ],
    exampleWords: [
      { catalan: 'el gat', english: 'the cat' },
      { catalan: 'la casa', english: 'the house' },
      { catalan: 'en Pere', english: 'Peter (informal)' },
    ],
  },
  Family: {
    titleCatalan: 'Família',
    description: 'Words for family members and relationships.',
    culturalNote: 'Family is central to Catalan culture. Sunday lunches with extended family are common. The traditional greeting between relatives involves two kisses. Children often use "avi" and "àvia" (grandpa/grandma) as affectionate terms.',
    learningTip: 'Notice the gender patterns: many family words have masculine and feminine forms (germà/germana, fill/filla).',
    keyPatterns: [
      'Gender pairs: pare/mare, germà/germana, fill/filla',
      'Diminutives are common: padrí (grandpa), iaia (granny)',
    ],
    exampleWords: [
      { catalan: 'pare', english: 'father' },
      { catalan: 'mare', english: 'mother' },
      { catalan: 'germà', english: 'brother' },
    ],
  },
  Numbers: {
    titleCatalan: 'Nombres',
    description: 'Cardinal numbers for counting and everyday use.',
    culturalNote: 'Catalans use the metric system. Prices may be quoted with decimals using a comma (10,50€). Phone numbers are often given in pairs.',
    learningTip: 'Numbers 1-2 have gender forms (un/una, dos/dues) that agree with the noun they describe. Other numbers are invariable.',
    keyPatterns: [
      '1-10: un, dos, tres, quatre, cinc, sis, set, vuit, nou, deu',
      'Teens: onze, dotze, tretze, catorze, quinze, setze...',
      'Tens: vint, trenta, quaranta, cinquanta...',
    ],
    exampleWords: [
      { catalan: 'un', english: 'one' },
      { catalan: 'deu', english: 'ten' },
      { catalan: 'cent', english: 'one hundred' },
    ],
  },
  Colors: {
    titleCatalan: 'Colors',
    description: 'Words to describe colors and shades.',
    culturalNote: 'The Catalan flag (Senyera) features distinctive red and yellow stripes - vermell and groc/daurat. These colors are deeply symbolic of Catalan identity.',
    learningTip: 'Most colors agree in gender with the noun (vermell/vermella, groc/groga). Some colors like taronja and rosa are invariable.',
    keyPatterns: [
      'Variable: vermell/a, groc/a, blau/blava, negre/a, blanc/a',
      'Invariable: taronja, rosa, marró, lila',
    ],
    exampleWords: [
      { catalan: 'vermell', english: 'red' },
      { catalan: 'blau', english: 'blue' },
      { catalan: 'groc', english: 'yellow' },
    ],
  },
  Food: {
    titleCatalan: 'Menjar',
    description: 'Food vocabulary including ingredients, dishes, and meals.',
    culturalNote: 'Catalan cuisine is renowned! Key dishes include pa amb tomàquet (bread with tomato), escalivada (roasted vegetables), and crema catalana (similar to crème brûlée). Meals are important social occasions.',
    learningTip: 'Food words are great for learning gender - many follow patterns (fruits ending in -a are often feminine).',
    keyPatterns: [
      'Meal times: esmorzar (breakfast), dinar (lunch), sopar (dinner)',
      'Common ingredients: pa (bread), vi (wine), carn (meat), peix (fish)',
    ],
    exampleWords: [
      { catalan: 'pa', english: 'bread' },
      { catalan: 'vi', english: 'wine' },
      { catalan: 'aigua', english: 'water' },
    ],
  },
  Time: {
    titleCatalan: 'El temps',
    description: 'Expressing time, days, months, and seasons.',
    culturalNote: 'Catalans typically eat later than northern Europeans - lunch around 2pm, dinner around 9pm. Shops often close for a break in early afternoon.',
    learningTip: 'Time expressions often use "de" for parts of day: de matí (in the morning), de tarda (in the afternoon), de nit (at night).',
    keyPatterns: [
      'Days: dilluns, dimarts, dimecres, dijous, divendres, dissabte, diumenge',
      'Telling time: "Quina hora és?" - What time is it?',
    ],
    exampleWords: [
      { catalan: 'avui', english: 'today' },
      { catalan: 'demà', english: 'tomorrow' },
      { catalan: 'ara', english: 'now' },
    ],
  },
  Phrases: {
    titleCatalan: 'Frases',
    description: 'Common expressions and useful phrases for daily life.',
    culturalNote: 'Catalans appreciate when visitors make an effort to speak Catalan. Even basic phrases like "Perdona" (excuse me) or "Molt bé" (very good) show respect for the language.',
    learningTip: 'Learn phrases as complete units rather than word-by-word. This helps with natural pronunciation and rhythm.',
    exampleWords: [
      { catalan: 'Com estàs?', english: 'How are you?' },
      { catalan: 'Molt bé', english: 'Very good' },
      { catalan: 'No entenc', english: "I don't understand" },
    ],
  },
  Basics: {
    titleCatalan: 'Bàsics',
    description: 'Essential words for building your foundation in Catalan.',
    culturalNote: 'Catalan is a Romance language closely related to Occitan. It has about 10 million speakers, primarily in Catalonia, Valencia, the Balearic Islands, and Andorra.',
    learningTip: 'These foundational words appear constantly. Master them early and everything else becomes easier!',
    exampleWords: [
      { catalan: 'sí', english: 'yes' },
      { catalan: 'no', english: 'no' },
      { catalan: 'i', english: 'and' },
    ],
  },
  Questions: {
    titleCatalan: 'Preguntes',
    description: 'Question words and how to ask things in Catalan.',
    culturalNote: 'In Catalan, questions have the same word order as statements - only the intonation changes. Question words go at the beginning.',
    learningTip: 'All Catalan question words start with "qu-" or "c-" and carry an accent: què, qui, quan, quant, com, on.',
    keyPatterns: [
      'què (what), qui (who), on (where), quan (when)',
      'com (how), quant/a (how much), per què (why)',
    ],
    exampleWords: [
      { catalan: 'Què?', english: 'What?' },
      { catalan: 'On?', english: 'Where?' },
      { catalan: 'Per què?', english: 'Why?' },
    ],
  },
};

// Default info for unknown categories
const DEFAULT_CATEGORY_INFO: CategoryInfo = {
  titleCatalan: 'Vocabulari',
  description: 'New vocabulary to expand your Catalan knowledge.',
  learningTip: 'Take your time with each word. Try to visualize it and connect it to what you already know.',
  exampleWords: [],
};

// Storage key for tracking shown category intros
const SHOWN_INTROS_KEY = 'catalan_shown_category_intros';

/**
 * Check if a category intro has been shown before
 */
export function hasCategoryIntroBeenShown(category: string): boolean {
  try {
    const shown = localStorage.getItem(SHOWN_INTROS_KEY);
    const shownCategories: string[] = shown ? JSON.parse(shown) : [];
    return shownCategories.includes(category);
  } catch {
    return false;
  }
}

/**
 * Mark a category intro as shown
 */
export function markCategoryIntroShown(category: string): void {
  try {
    const shown = localStorage.getItem(SHOWN_INTROS_KEY);
    const shownCategories: string[] = shown ? JSON.parse(shown) : [];
    if (!shownCategories.includes(category)) {
      shownCategories.push(category);
      localStorage.setItem(SHOWN_INTROS_KEY, JSON.stringify(shownCategories));
    }
  } catch {
    // Ignore storage errors
  }
}

export function CategoryIntro({
  category,
  unitNumber,
  onContinue,
  onSkip,
}: CategoryIntroProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const categoryInfo = CATEGORY_INFO[category] || DEFAULT_CATEGORY_INFO;

  // Mark as shown when component mounts
  useEffect(() => {
    markCategoryIntroShown(category);
  }, [category]);

  const handlePlayExample = async (catalan: string) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await audioService.speakCatalan(catalan);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-miro-yellow/20 rounded-full mb-3">
          <Sparkles className="w-4 h-4 text-miro-yellow" />
          <span className="text-sm font-medium text-miro-yellow">
            {unitNumber ? `Unit ${unitNumber}` : 'New Category'}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-miro-blue dark:text-ink-light mb-1">
          {category}
        </h1>
        <p className="text-lg text-miro-blue/60 dark:text-ink-light/60 italic">
          {categoryInfo.titleCatalan}
        </p>
      </motion.div>

      {/* Main content card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 bg-gradient-to-br from-white to-miro-blue/5 dark:from-gray-800 dark:to-miro-blue/10 border-2 border-miro-blue/20">
          {/* Description */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-miro-blue dark:text-ink-light" />
              <h2 className="font-semibold text-miro-blue dark:text-ink-light">
                What You'll Learn
              </h2>
            </div>
            <p className="text-miro-blue/80 dark:text-ink-light/80">
              {categoryInfo.description}
            </p>
          </div>

          {/* Cultural note */}
          {categoryInfo.culturalNote && (
            <div className="mb-6 p-4 bg-miro-orange/10 dark:bg-miro-orange/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-miro-orange" />
                <h2 className="font-semibold text-miro-orange">
                  Cultural Context
                </h2>
              </div>
              <p className="text-sm text-miro-blue/80 dark:text-ink-light/80">
                {categoryInfo.culturalNote}
              </p>
            </div>
          )}

          {/* Key patterns */}
          {categoryInfo.keyPatterns && categoryInfo.keyPatterns.length > 0 && (
            <div className="mb-6 p-4 bg-miro-green/10 dark:bg-miro-green/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-miro-green" />
                <h2 className="font-semibold text-miro-green">
                  Key Patterns
                </h2>
              </div>
              <ul className="space-y-1">
                {categoryInfo.keyPatterns.map((pattern, i) => (
                  <li
                    key={i}
                    className="text-sm text-miro-blue/80 dark:text-ink-light/80 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-miro-green"
                  >
                    {pattern}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Learning tip */}
          <div className="mb-6 p-4 bg-miro-yellow/10 dark:bg-miro-yellow/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-miro-yellow" />
              <h2 className="font-semibold text-miro-yellow">
                Learning Tip
              </h2>
            </div>
            <p className="text-sm text-miro-blue/80 dark:text-ink-light/80">
              {categoryInfo.learningTip}
            </p>
          </div>

          {/* Example words */}
          {categoryInfo.exampleWords.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold text-miro-blue dark:text-ink-light mb-3">
                Preview Words
              </h2>
              <div className="space-y-2">
                {categoryInfo.exampleWords.map((word, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                  >
                    <div>
                      <span className="font-bold text-miro-blue dark:text-ink-light">
                        {word.catalan}
                      </span>
                      <span className="text-miro-blue/60 dark:text-ink-light/60 mx-2">
                        →
                      </span>
                      <span className="text-miro-blue/80 dark:text-ink-light/80">
                        {word.english}
                      </span>
                    </div>
                    <button
                      onClick={() => handlePlayExample(word.catalan)}
                      disabled={isPlayingAudio}
                      className="p-2 rounded-full hover:bg-miro-blue/10 transition-colors"
                      aria-label={`Play pronunciation of ${word.catalan}`}
                    >
                      <Volume2
                        className={`w-4 h-4 ${
                          isPlayingAudio
                            ? 'text-miro-green animate-pulse'
                            : 'text-miro-blue/60 dark:text-ink-light/60'
                        }`}
                      />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {onSkip && (
              <Button variant="outline" onClick={onSkip} className="flex-1">
                Skip Intro
              </Button>
            )}
            <Button
              fullWidth={!onSkip}
              onClick={onContinue}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="flex-1"
            >
              Start Learning
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Footer note */}
      <p className="text-xs text-center text-miro-blue/50 dark:text-ink-light/50 mt-4">
        This intro only shows once per category
      </p>
    </div>
  );
}
