export interface ConjugationTable {
  verb: string;
  verbEnglish: string;
  tense: string;
  conjugations: {
    pronoun: string;
    form: string;
    irregular?: boolean;
  }[];
}

export interface GrammarExample {
  catalan: string;
  english: string;
  highlight?: string; // Word to highlight in the catalan sentence
}

export interface GrammarExercise {
  id: string;
  type: 'fill-blank' | 'multiple-choice' | 'match';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GrammarLesson {
  id: string;
  title: string;
  titleCatalan: string;
  category: 'articles' | 'verbs' | 'pronouns' | 'adjectives' | 'prepositions' | 'basics';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  estimatedMinutes: number;
  content: {
    introduction: string;
    sections: {
      title: string;
      explanation: string;
      examples: GrammarExample[];
      table?: ConjugationTable;
      tips?: string[];
    }[];
  };
  exercises: GrammarExercise[];
  relatedCategories: string[];
}

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  // BEGINNER LESSONS
  {
    id: 'definite-articles',
    title: 'Definite Articles',
    titleCatalan: 'Els articles definits',
    category: 'articles',
    difficulty: 'beginner',
    icon: '📰',
    estimatedMinutes: 10,
    content: {
      introduction: 'In Catalan, definite articles (the) change based on gender and number. Unlike English, every noun has a gender!',
      sections: [
        {
          title: 'The Four Definite Articles',
          explanation: 'Catalan has four definite articles that correspond to "the" in English.',
          examples: [
            { catalan: 'el gat', english: 'the cat (masculine singular)', highlight: 'el' },
            { catalan: 'la casa', english: 'the house (feminine singular)', highlight: 'la' },
            { catalan: 'els gats', english: 'the cats (masculine plural)', highlight: 'els' },
            { catalan: 'les cases', english: 'the houses (feminine plural)', highlight: 'les' },
          ],
          tips: [
            'EL is for masculine singular nouns',
            'LA is for feminine singular nouns',
            'ELS is for masculine plural nouns',
            'LES is for feminine plural nouns',
          ],
        },
        {
          title: 'Contractions with Prepositions',
          explanation: 'When EL or ELS follow certain prepositions, they contract.',
          examples: [
            { catalan: 'a + el = al', english: 'to the', highlight: 'al' },
            { catalan: 'de + el = del', english: 'of/from the', highlight: 'del' },
            { catalan: 'per + el = pel', english: 'for/through the', highlight: 'pel' },
            { catalan: 'Vaig al mercat', english: 'I go to the market', highlight: 'al' },
          ],
          tips: [
            'These contractions only happen with EL and ELS, never with LA or LES',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'def-art-1',
        type: 'fill-blank',
        question: '___ nena juga al parc. (The girl plays in the park)',
        correctAnswer: 'La',
        explanation: '"Nena" (girl) is feminine singular, so we use "la".',
      },
      {
        id: 'def-art-2',
        type: 'multiple-choice',
        question: 'Which article goes with "llibres" (books)?',
        options: ['el', 'la', 'els', 'les'],
        correctAnswer: 'els',
        explanation: '"Llibres" is masculine plural, so we use "els".',
      },
      {
        id: 'def-art-3',
        type: 'fill-blank',
        question: 'Vaig ___ escola. (I go to the school)',
        correctAnswer: 'a l\'',
        explanation: 'Before a vowel, "la" becomes "l\'" (elision).',
      },
    ],
    relatedCategories: ['Articles'],
  },
  {
    id: 'indefinite-articles',
    title: 'Indefinite Articles',
    titleCatalan: 'Els articles indefinits',
    category: 'articles',
    difficulty: 'beginner',
    icon: '📝',
    estimatedMinutes: 8,
    content: {
      introduction: 'Indefinite articles (a, an, some) also change based on gender and number in Catalan.',
      sections: [
        {
          title: 'The Four Indefinite Articles',
          explanation: 'Just like definite articles, indefinite articles have four forms.',
          examples: [
            { catalan: 'un llibre', english: 'a book (masculine singular)', highlight: 'un' },
            { catalan: 'una taula', english: 'a table (feminine singular)', highlight: 'una' },
            { catalan: 'uns llibres', english: 'some books (masculine plural)', highlight: 'uns' },
            { catalan: 'unes taules', english: 'some tables (feminine plural)', highlight: 'unes' },
          ],
          tips: [
            'UN is for masculine singular',
            'UNA is for feminine singular',
            'UNS is for masculine plural',
            'UNES is for feminine plural',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'indef-art-1',
        type: 'fill-blank',
        question: 'Vull ___ cafè. (I want a coffee)',
        correctAnswer: 'un',
        explanation: '"Cafè" is masculine singular, so we use "un".',
      },
      {
        id: 'indef-art-2',
        type: 'multiple-choice',
        question: 'Complete: Tinc ___ amigues. (I have some friends - female)',
        options: ['un', 'una', 'uns', 'unes'],
        correctAnswer: 'unes',
        explanation: '"Amigues" is feminine plural, so we use "unes".',
      },
    ],
    relatedCategories: ['Articles'],
  },
  {
    id: 'personal-articles',
    title: 'Personal Articles (en/na)',
    titleCatalan: 'Els articles personals',
    category: 'articles',
    difficulty: 'beginner',
    icon: '👤',
    estimatedMinutes: 6,
    content: {
      introduction: 'Catalan has a unique feature: personal articles used before proper names! This doesn\'t exist in Spanish or English.',
      sections: [
        {
          title: 'En and Na',
          explanation: 'Personal articles are used before first names in casual speech. EN is for men, NA is for women.',
          examples: [
            { catalan: 'en Joan', english: 'Joan (male name)', highlight: 'en' },
            { catalan: 'na Maria', english: 'Maria (female name)', highlight: 'na' },
            { catalan: 'He vist en Pere', english: 'I saw Pere', highlight: 'en' },
            { catalan: 'Parla amb na Rosa', english: 'Talk to Rosa', highlight: 'na' },
          ],
          tips: [
            'EN is used for masculine names',
            'NA is used for feminine names',
            'This is a distinctly Catalan feature!',
            'In formal writing, personal articles are often omitted',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'pers-art-1',
        type: 'fill-blank',
        question: 'He parlat amb ___ Carles. (I talked to Carles)',
        correctAnswer: 'en',
        explanation: 'Carles is a masculine name, so we use "en".',
      },
    ],
    relatedCategories: ['Articles'],
  },
  {
    id: 'ser-vs-estar',
    title: 'Ser vs Estar',
    titleCatalan: 'Ser i Estar',
    category: 'verbs',
    difficulty: 'beginner',
    icon: '⚖️',
    estimatedMinutes: 15,
    content: {
      introduction: 'Like Spanish, Catalan has two verbs meaning "to be": SER and ESTAR. Learning when to use each is essential!',
      sections: [
        {
          title: 'SER - For Permanent States',
          explanation: 'Use SER for identity, origin, characteristics, time, and permanent conditions.',
          examples: [
            { catalan: 'Sóc català', english: 'I am Catalan (identity)', highlight: 'Sóc' },
            { catalan: 'És alta', english: 'She is tall (characteristic)', highlight: 'És' },
            { catalan: 'Som de Barcelona', english: 'We are from Barcelona (origin)', highlight: 'Som' },
            { catalan: 'Són les tres', english: 'It\'s three o\'clock (time)', highlight: 'Són' },
          ],
          table: {
            verb: 'ser',
            verbEnglish: 'to be (permanent)',
            tense: 'Present',
            conjugations: [
              { pronoun: 'jo', form: 'sóc' },
              { pronoun: 'tu', form: 'ets' },
              { pronoun: 'ell/ella', form: 'és' },
              { pronoun: 'nosaltres', form: 'som' },
              { pronoun: 'vosaltres', form: 'sou' },
              { pronoun: 'ells/elles', form: 'són' },
            ],
          },
          tips: [
            'Identity: Sóc estudiant (I am a student)',
            'Origin: És de França (He is from France)',
            'Time: És dilluns (It\'s Monday)',
            'Characteristics: La casa és gran (The house is big)',
          ],
        },
        {
          title: 'ESTAR - For Temporary States',
          explanation: 'Use ESTAR for location, temporary conditions, and states that can change.',
          examples: [
            { catalan: 'Estic a casa', english: 'I am at home (location)', highlight: 'Estic' },
            { catalan: 'Està cansat', english: 'He is tired (temporary state)', highlight: 'Està' },
            { catalan: 'Estem contents', english: 'We are happy (mood)', highlight: 'Estem' },
            { catalan: 'El cafè està calent', english: 'The coffee is hot', highlight: 'està' },
          ],
          table: {
            verb: 'estar',
            verbEnglish: 'to be (temporary)',
            tense: 'Present',
            conjugations: [
              { pronoun: 'jo', form: 'estic' },
              { pronoun: 'tu', form: 'estàs' },
              { pronoun: 'ell/ella', form: 'està' },
              { pronoun: 'nosaltres', form: 'estem' },
              { pronoun: 'vosaltres', form: 'esteu' },
              { pronoun: 'ells/elles', form: 'estan' },
            ],
          },
          tips: [
            'Location: On estàs? (Where are you?)',
            'Health: Estic malalt (I am sick)',
            'Moods: Està trist (He is sad)',
            'Temporary conditions: L\'aigua està freda (The water is cold)',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'ser-estar-1',
        type: 'multiple-choice',
        question: 'El meu germà ___ metge. (My brother is a doctor)',
        options: ['és', 'està'],
        correctAnswer: 'és',
        explanation: 'Profession is a permanent identity, so we use "és" (ser).',
      },
      {
        id: 'ser-estar-2',
        type: 'multiple-choice',
        question: 'On ___ el restaurant? (Where is the restaurant?)',
        options: ['és', 'està'],
        correctAnswer: 'està',
        explanation: 'Location uses "està" (estar).',
      },
      {
        id: 'ser-estar-3',
        type: 'fill-blank',
        question: '___ molt cansada avui. (I am very tired today - female speaker)',
        correctAnswer: 'Estic',
        explanation: 'Tiredness is a temporary state, so we use "estic" (estar).',
      },
    ],
    relatedCategories: ['Verbs'],
  },
  {
    id: 'present-tense-ar',
    title: 'Present Tense: -ar Verbs',
    titleCatalan: 'Present: verbs en -ar',
    category: 'verbs',
    difficulty: 'beginner',
    icon: '🔤',
    estimatedMinutes: 12,
    content: {
      introduction: 'Most Catalan verbs are regular and follow predictable patterns. Let\'s start with -AR verbs, the most common type!',
      sections: [
        {
          title: 'Regular -AR Verb Pattern',
          explanation: 'To conjugate, remove -AR and add the appropriate ending.',
          examples: [
            { catalan: 'parlar → jo parlo', english: 'to speak → I speak', highlight: 'parlo' },
            { catalan: 'cantar → ella canta', english: 'to sing → she sings', highlight: 'canta' },
            { catalan: 'treballar → nosaltres treballem', english: 'to work → we work', highlight: 'treballem' },
          ],
          table: {
            verb: 'parlar',
            verbEnglish: 'to speak',
            tense: 'Present',
            conjugations: [
              { pronoun: 'jo', form: 'parlo' },
              { pronoun: 'tu', form: 'parles' },
              { pronoun: 'ell/ella', form: 'parla' },
              { pronoun: 'nosaltres', form: 'parlem' },
              { pronoun: 'vosaltres', form: 'parleu' },
              { pronoun: 'ells/elles', form: 'parlen' },
            ],
          },
          tips: [
            'The endings are: -o, -es, -a, -em, -eu, -en',
            'Common -AR verbs: parlar, cantar, comprar, estudiar, treballar',
            'The stem (parl-) stays the same for all forms',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'ar-verb-1',
        type: 'fill-blank',
        question: 'Jo ___ català cada dia. (I study Catalan every day - estudiar)',
        correctAnswer: 'estudio',
        explanation: 'For "jo" with -AR verbs, we add -o to the stem: estudi + o = estudio.',
      },
      {
        id: 'ar-verb-2',
        type: 'multiple-choice',
        question: 'Nosaltres ___ al supermercat. (We buy at the supermarket - comprar)',
        options: ['compro', 'compra', 'comprem', 'compren'],
        correctAnswer: 'comprem',
        explanation: 'For "nosaltres" with -AR verbs, we add -em: compr + em = comprem.',
      },
    ],
    relatedCategories: ['Verbs'],
  },
  {
    id: 'gender-nouns',
    title: 'Gender of Nouns',
    titleCatalan: 'El gènere dels noms',
    category: 'basics',
    difficulty: 'beginner',
    icon: '⚥',
    estimatedMinutes: 10,
    content: {
      introduction: 'Every Catalan noun has a gender: masculine or feminine. Here are the patterns to help you guess correctly!',
      sections: [
        {
          title: 'Masculine Noun Patterns',
          explanation: 'Most nouns with these endings are masculine:',
          examples: [
            { catalan: 'el cotxe', english: 'the car (-e ending)', highlight: 'cotxe' },
            { catalan: 'el problema', english: 'the problem (Greek origin)', highlight: 'problema' },
            { catalan: 'el restaurant', english: 'the restaurant (-nt ending)', highlight: 'restaurant' },
            { catalan: 'el color', english: 'the color (-or ending)', highlight: 'color' },
          ],
          tips: [
            'Words ending in consonants are often masculine',
            'Words ending in -e are usually masculine',
            'Greek-origin words in -ma, -ta are masculine',
            'Days, months, colors are masculine',
          ],
        },
        {
          title: 'Feminine Noun Patterns',
          explanation: 'Most nouns with these endings are feminine:',
          examples: [
            { catalan: 'la casa', english: 'the house (-a ending)', highlight: 'casa' },
            { catalan: 'la nació', english: 'the nation (-ó ending)', highlight: 'nació' },
            { catalan: 'la veritat', english: 'the truth (-tat ending)', highlight: 'veritat' },
            { catalan: 'la llibertat', english: 'freedom (-tat ending)', highlight: 'llibertat' },
          ],
          tips: [
            'Words ending in -a are usually feminine',
            'Words ending in -ció, -sió are feminine',
            'Words ending in -tat, -dat are feminine',
            'Abstract qualities are often feminine',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'gender-1',
        type: 'multiple-choice',
        question: 'What gender is "problema" (problem)?',
        options: ['Masculine', 'Feminine'],
        correctAnswer: 'Masculine',
        explanation: 'Despite ending in -a, "problema" is masculine (Greek origin).',
      },
      {
        id: 'gender-2',
        type: 'multiple-choice',
        question: 'What gender is "universitat" (university)?',
        options: ['Masculine', 'Feminine'],
        correctAnswer: 'Feminine',
        explanation: 'Words ending in -tat are feminine: la universitat.',
      },
    ],
    relatedCategories: ['Nouns'],
  },
  // INTERMEDIATE LESSONS
  {
    id: 'present-tense-er-re',
    title: 'Present Tense: -er/-re Verbs',
    titleCatalan: 'Present: verbs en -er/-re',
    category: 'verbs',
    difficulty: 'intermediate',
    icon: '📚',
    estimatedMinutes: 15,
    content: {
      introduction: 'Catalan has two more verb groups: -ER and -RE verbs. These are slightly different from -AR verbs.',
      sections: [
        {
          title: 'Regular -ER Verb Pattern (like "perdre")',
          explanation: 'Many -ER verbs are actually -RE verbs in disguise. Here\'s how "perdre" (to lose) conjugates:',
          examples: [
            { catalan: 'perdo el tren', english: 'I miss the train', highlight: 'perdo' },
            { catalan: 'perdem temps', english: 'we lose time', highlight: 'perdem' },
          ],
          table: {
            verb: 'perdre',
            verbEnglish: 'to lose',
            tense: 'Present',
            conjugations: [
              { pronoun: 'jo', form: 'perdo' },
              { pronoun: 'tu', form: 'perds' },
              { pronoun: 'ell/ella', form: 'perd' },
              { pronoun: 'nosaltres', form: 'perdem' },
              { pronoun: 'vosaltres', form: 'perdeu' },
              { pronoun: 'ells/elles', form: 'perden' },
            ],
          },
          tips: [
            'The endings: -o, -s, -(nothing), -em, -eu, -en',
            'Note: 3rd person singular has NO ending!',
            'Common verbs: perdre, vendre, aprendre, entendre',
          ],
        },
        {
          title: 'Pure -ER Verbs (like "témer")',
          explanation: 'Some verbs keep their -ER pattern throughout:',
          examples: [
            { catalan: 'temo les aranyes', english: 'I fear spiders', highlight: 'temo' },
          ],
          table: {
            verb: 'témer',
            verbEnglish: 'to fear',
            tense: 'Present',
            conjugations: [
              { pronoun: 'jo', form: 'temo' },
              { pronoun: 'tu', form: 'tems' },
              { pronoun: 'ell/ella', form: 'tem' },
              { pronoun: 'nosaltres', form: 'temem' },
              { pronoun: 'vosaltres', form: 'temeu' },
              { pronoun: 'ells/elles', form: 'temen' },
            ],
          },
        },
      ],
    },
    exercises: [
      {
        id: 'er-verb-1',
        type: 'fill-blank',
        question: 'Ell ___ el partit. (He loses the match - perdre)',
        correctAnswer: 'perd',
        explanation: 'For ell/ella with -RE verbs, we use just the stem with no ending.',
      },
    ],
    relatedCategories: ['Verbs'],
  },
  {
    id: 'pronouns-subject',
    title: 'Subject Pronouns',
    titleCatalan: 'Els pronoms personals',
    category: 'pronouns',
    difficulty: 'beginner',
    icon: '👥',
    estimatedMinutes: 8,
    content: {
      introduction: 'Subject pronouns in Catalan are often optional (the verb tells us who\'s acting), but it\'s important to know them!',
      sections: [
        {
          title: 'The Subject Pronouns',
          explanation: 'Here are all the Catalan subject pronouns:',
          examples: [
            { catalan: 'Jo parlo català', english: 'I speak Catalan', highlight: 'Jo' },
            { catalan: 'Tu ets molt amable', english: 'You are very kind', highlight: 'Tu' },
            { catalan: 'Nosaltres vivim aquí', english: 'We live here', highlight: 'Nosaltres' },
          ],
          tips: [
            'JO = I',
            'TU = you (informal singular)',
            'ELL/ELLA = he/she',
            'VOSTÈ = you (formal singular)',
            'NOSALTRES = we',
            'VOSALTRES = you (plural informal)',
            'ELLS/ELLES = they (masc/fem)',
            'VOSTÈS = you (plural formal)',
          ],
        },
        {
          title: 'When to Use Them',
          explanation: 'Pronouns are usually dropped unless emphasizing or clarifying:',
          examples: [
            { catalan: 'Parlo català', english: 'I speak Catalan (pronoun dropped)', highlight: 'Parlo' },
            { catalan: 'JO parlo català, no ell', english: 'I speak Catalan, not him (emphasis)', highlight: 'JO' },
          ],
          tips: [
            'Drop pronouns when the verb makes the subject clear',
            'Use pronouns for emphasis or contrast',
            'Always use VOSTÈ/VOSTÈS in formal situations',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'pronoun-1',
        type: 'multiple-choice',
        question: 'Which pronoun means "we"?',
        options: ['Nosaltres', 'Vosaltres', 'Ells', 'Jo'],
        correctAnswer: 'Nosaltres',
        explanation: '"Nosaltres" is the first person plural (we).',
      },
    ],
    relatedCategories: ['Pronouns'],
  },
];

// Helper function to get lessons by category
export function getLessonsByCategory(category: string): GrammarLesson[] {
  return GRAMMAR_LESSONS.filter(l => l.category === category);
}

// Helper function to get lessons by difficulty
export function getLessonsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): GrammarLesson[] {
  return GRAMMAR_LESSONS.filter(l => l.difficulty === difficulty);
}

// Get all categories
export function getGrammarCategories(): string[] {
  return [...new Set(GRAMMAR_LESSONS.map(l => l.category))];
}
