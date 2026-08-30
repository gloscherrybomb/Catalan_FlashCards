import { B1_GRAMMAR_LESSONS } from './grammarLessonsB1';

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
  type: 'fill-blank' | 'multiple-choice' | 'match' | 'sentence-build' | 'translate';
  question: string;
  options?: string[];
  words?: string[];              // For sentence-build: jumbled words to arrange
  pairs?: { left: string; right: string }[];  // For match: pairs to connect
  hints?: string[];              // For translate: hint words
  targetLanguage?: 'catalan' | 'english';  // For translate: direction
  correctAnswer: string;
  explanation: string;
}

export interface GrammarLesson {
  id: string;
  title: string;
  titleCatalan: string;
  category: 'articles' | 'verbs' | 'pronouns' | 'adjectives' | 'prepositions' | 'basics' | 'structure' | 'tenses';
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

const CORE_GRAMMAR_LESSONS: GrammarLesson[] = [
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
            { catalan: 'Soc català', english: 'I am Catalan (identity)', highlight: 'Soc' },
            { catalan: 'És alta', english: 'She is tall (characteristic)', highlight: 'És' },
            { catalan: 'Som de Barcelona', english: 'We are from Barcelona (origin)', highlight: 'Som' },
            { catalan: 'Són les tres', english: 'It\'s three o\'clock (time)', highlight: 'Són' },
          ],
          table: {
            verb: 'ser',
            verbEnglish: 'to be (permanent)',
            tense: 'Present',
            conjugations: [
              { pronoun: 'jo', form: 'soc' },
              { pronoun: 'tu', form: 'ets' },
              { pronoun: 'ell/ella', form: 'és' },
              { pronoun: 'nosaltres', form: 'som' },
              { pronoun: 'vosaltres', form: 'sou' },
              { pronoun: 'ells/elles', form: 'són' },
            ],
          },
          tips: [
            'Identity: Soc estudiant (I am a student)',
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
  {
    id: 'plurals',
    title: 'Plural Nouns',
    titleCatalan: 'Els plurals',
    category: 'basics',
    difficulty: 'beginner',
    icon: '📚',
    estimatedMinutes: 10,
    content: {
      introduction: 'Learning to form plurals in Catalan is essential for speaking correctly. Most plurals follow predictable patterns based on word endings.',
      sections: [
        {
          title: 'Basic Plural Rules',
          explanation: 'Most Catalan nouns form their plural by adding -s or -es to the singular form.',
          examples: [
            { catalan: 'el gat → els gats', english: 'the cat → the cats', highlight: 'gats' },
            { catalan: 'la casa → les cases', english: 'the house → the houses', highlight: 'cases' },
            { catalan: 'el llibre → els llibres', english: 'the book → the books', highlight: 'llibres' },
            { catalan: 'la taula → les taules', english: 'the table → the tables', highlight: 'taules' },
          ],
          tips: [
            'Words ending in a vowel: add -s (gat → gats)',
            'Words ending in -a: change to -es (casa → cases)',
            'Words ending in a consonant: usually add -s',
          ],
        },
        {
          title: 'Words Ending in -s, -ç, -x, -ix',
          explanation: 'Words ending in these sounds add -os to form the plural.',
          examples: [
            { catalan: 'el vas → els vasos', english: 'the glass → the glasses', highlight: 'vasos' },
            { catalan: 'el peix → els peixos', english: 'the fish → the fishes', highlight: 'peixos' },
            { catalan: 'el braç → els braços', english: 'the arm → the arms', highlight: 'braços' },
          ],
          tips: [
            'This prevents awkward consonant clusters',
            'The -os ending is pronounced clearly',
          ],
        },
        {
          title: 'Words Ending in Stressed Vowel',
          explanation: 'Words ending in a stressed vowel often add -ns.',
          examples: [
            { catalan: 'el germà → els germans', english: 'the brother → the brothers', highlight: 'germans' },
            { catalan: 'el cafè → els cafès', english: 'the coffee → the coffees', highlight: 'cafès' },
            { catalan: 'el menú → els menús', english: 'the menu → the menus', highlight: 'menús' },
          ],
          tips: [
            'Words in -à often add -ns: germà → germans',
            'Some words in -è, -í, -ó, -ú just add -s',
            'Listen to native speakers to learn which pattern each word follows',
          ],
        },
        {
          title: 'Irregular Plurals',
          explanation: 'Some common words have irregular plural forms.',
          examples: [
            { catalan: "l'home → els homes", english: 'the man → the men', highlight: 'homes' },
            { catalan: 'el peu → els peus', english: 'the foot → the feet', highlight: 'peus' },
            { catalan: "l'ou → els ous", english: 'the egg → the eggs', highlight: 'ous' },
          ],
          tips: [
            'Most irregulars are common words you\'ll learn through practice',
            'The article always changes: el → els, la → les',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'plurals-1',
        type: 'fill-blank',
        question: 'el gat → els ___',
        correctAnswer: 'gats',
        explanation: 'Words ending in a consonant add -s: gat → gats.',
      },
      {
        id: 'plurals-2',
        type: 'multiple-choice',
        question: 'What is the plural of "casa" (house)?',
        options: ['casas', 'cases', 'casaes', 'cass'],
        correctAnswer: 'cases',
        explanation: 'Words ending in -a change to -es: casa → cases.',
      },
      {
        id: 'plurals-3',
        type: 'fill-blank',
        question: 'el peix → els ___',
        correctAnswer: 'peixos',
        explanation: 'Words ending in -ix add -os: peix → peixos.',
      },
      {
        id: 'plurals-4',
        type: 'multiple-choice',
        question: 'What is the plural of "germà" (brother)?',
        options: ['germàs', 'germans', 'germàes', 'germanes'],
        correctAnswer: 'germans',
        explanation: 'Words ending in stressed -à typically add -ns: germà → germans.',
      },
    ],
    relatedCategories: ['Nouns', 'Basics'],
  },
  {
    id: 'adjectives',
    title: 'Adjective Agreement',
    titleCatalan: 'La concordança dels adjectius',
    category: 'adjectives',
    difficulty: 'beginner',
    icon: '🎨',
    estimatedMinutes: 12,
    content: {
      introduction: 'In Catalan, adjectives must agree with the noun they describe in both gender (masculine/feminine) and number (singular/plural). This is one of the most important grammar rules to master!',
      sections: [
        {
          title: 'Basic Agreement Pattern',
          explanation: 'Most adjectives have four forms: masculine singular, feminine singular, masculine plural, and feminine plural.',
          examples: [
            { catalan: 'el noi alt', english: 'the tall boy', highlight: 'alt' },
            { catalan: 'la noia alta', english: 'the tall girl', highlight: 'alta' },
            { catalan: 'els nois alts', english: 'the tall boys', highlight: 'alts' },
            { catalan: 'les noies altes', english: 'the tall girls', highlight: 'altes' },
          ],
          tips: [
            'Masculine singular: base form (alt)',
            'Feminine singular: add -a (alta)',
            'Masculine plural: add -s (alts)',
            'Feminine plural: add -es (altes)',
          ],
        },
        {
          title: 'Adjectives Ending in -e',
          explanation: 'Adjectives ending in -e often have the same form for masculine and feminine singular.',
          examples: [
            { catalan: 'el cotxe verd', english: 'the green car', highlight: 'verd' },
            { catalan: 'la casa verda', english: 'the green house', highlight: 'verda' },
            { catalan: 'un home amable', english: 'a kind man', highlight: 'amable' },
            { catalan: 'una dona amable', english: 'a kind woman', highlight: 'amable' },
          ],
          tips: [
            'Some -e adjectives are invariable in gender: amable, intel·ligent, interessant',
            'Color adjectives in -e usually change: verd/verda, negre/negra',
          ],
        },
        {
          title: 'Adjective Position',
          explanation: 'Unlike English, most adjectives come AFTER the noun in Catalan.',
          examples: [
            { catalan: 'un cotxe vermell', english: 'a red car (not "vermell cotxe")', highlight: 'vermell' },
            { catalan: 'una persona simpàtica', english: 'a nice person', highlight: 'simpàtica' },
            { catalan: 'un bon amic', english: 'a good friend (exception!)', highlight: 'bon' },
            { catalan: 'una gran casa', english: 'a great house (exception!)', highlight: 'gran' },
          ],
          tips: [
            'Most adjectives follow the noun: cuina catalana, vi blanc',
            'Some common adjectives can precede: bon/bona, gran, petit/a, mateix/a',
            'Position can change meaning: un home gran (a big man) vs un gran home (a great man)',
          ],
        },
        {
          title: 'Nationality Adjectives',
          explanation: 'Nationality adjectives follow the same agreement rules and always come after the noun.',
          examples: [
            { catalan: 'el vi català', english: 'Catalan wine', highlight: 'català' },
            { catalan: 'la cuina catalana', english: 'Catalan cuisine', highlight: 'catalana' },
            { catalan: 'els turistes espanyols', english: 'Spanish tourists', highlight: 'espanyols' },
            { catalan: 'les pel·lícules franceses', english: 'French films', highlight: 'franceses' },
          ],
          tips: [
            'Nationality adjectives are not capitalized in Catalan',
            'They always follow the noun',
            'Common nationalities: català/ana, espanyol/a, francès/esa, anglès/esa, italià/ana',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'adj-1',
        type: 'fill-blank',
        question: 'La casa és molt ___. (The house is very big - gran)',
        correctAnswer: 'gran',
        explanation: '"Gran" is invariable for gender in this position.',
      },
      {
        id: 'adj-2',
        type: 'multiple-choice',
        question: 'How do you say "the tall girls"?',
        options: ['les noies alt', 'les noies alta', 'les noies alts', 'les noies altes'],
        correctAnswer: 'les noies altes',
        explanation: 'Feminine plural noun requires feminine plural adjective: altes.',
      },
      {
        id: 'adj-3',
        type: 'sentence-build',
        question: 'Arrange: (a red car)',
        words: ['vermell', 'un', 'cotxe'],
        correctAnswer: 'un cotxe vermell',
        explanation: 'Adjectives follow the noun: cotxe vermell (not vermell cotxe).',
      },
      {
        id: 'adj-4',
        type: 'fill-blank',
        question: 'La cuina ___ és deliciosa. (Catalan cuisine is delicious)',
        correctAnswer: 'catalana',
        explanation: '"Cuina" is feminine, so we use "catalana".',
      },
    ],
    relatedCategories: ['Adjectives', 'Basics'],
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
            { catalan: 'Jo parlo català, no ell', english: 'I speak Catalan, not him (emphasis)', highlight: 'JO' },
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

  // ==========================================
  // NEW STRUCTURE & SENTENCE PATTERN LESSONS
  // ==========================================

  // LESSON: Word Order Basics
  {
    id: 'word-order-basics',
    title: 'Word Order in Catalan',
    titleCatalan: "L'ordre de les paraules",
    category: 'structure',
    difficulty: 'beginner',
    icon: '📝',
    estimatedMinutes: 12,
    content: {
      introduction: 'Catalan follows Subject-Verb-Object (SVO) order like English, but with important differences in adjective and adverb placement.',
      sections: [
        {
          title: 'Basic SVO Order',
          explanation: 'Simple sentences follow Subject + Verb + Object order, just like English.',
          examples: [
            { catalan: 'El noi es menja una poma', english: 'The boy eats an apple', highlight: 'menja' },
            { catalan: 'La Maria llegeix un llibre', english: 'Maria reads a book', highlight: 'llegeix' },
            { catalan: 'Nosaltres parlem català', english: 'We speak Catalan', highlight: 'parlem' },
          ],
          tips: [
            'Subject comes first (who does the action)',
            'Verb comes second (the action)',
            'Object comes last (what receives the action)',
          ],
        },
        {
          title: 'Adjective Placement',
          explanation: 'Unlike English, most adjectives come AFTER the noun in Catalan.',
          examples: [
            { catalan: 'un gat negre', english: 'a black cat', highlight: 'negre' },
            { catalan: 'una casa gran', english: 'a big house', highlight: 'gran' },
            { catalan: 'el cotxe vermell', english: 'the red car', highlight: 'vermell' },
            { catalan: 'una noia intel·ligent', english: 'an intelligent girl', highlight: 'intel·ligent' },
          ],
          tips: [
            'Color adjectives always follow: cotxe vermell (red car)',
            'Size adjectives usually follow: casa gran (big house)',
            'Some common adjectives can precede: bon amic (good friend)',
            'Nationality adjectives follow: cuina catalana (Catalan cuisine)',
          ],
        },
        {
          title: 'Adverb Placement',
          explanation: 'Adverbs typically come after the verb or at the end of the sentence.',
          examples: [
            { catalan: 'Parla bé el català', english: 'She speaks Catalan well', highlight: 'bé' },
            { catalan: 'Corre ràpidament', english: 'He runs quickly', highlight: 'ràpidament' },
            { catalan: 'Sempre arriba tard', english: 'He always arrives late', highlight: 'Sempre' },
          ],
          tips: [
            'Time adverbs often come at the beginning: Avui treballo (Today I work)',
            'Manner adverbs follow the verb: Canta bé (She sings well)',
            'Frequency adverbs are flexible: Sempre menjo aquí / Menjo sempre aquí',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'word-order-1',
        type: 'sentence-build',
        question: 'Arrange the words to form a correct sentence: (The girl reads a book)',
        words: ['un', 'llegeix', 'La', 'noia', 'llibre'],
        correctAnswer: 'La noia llegeix un llibre',
        explanation: 'Subject (La noia) + Verb (llegeix) + Object (un llibre)',
      },
      {
        id: 'word-order-2',
        type: 'sentence-build',
        question: 'Arrange: (a black cat)',
        words: ['negre', 'gat', 'un'],
        correctAnswer: 'un gat negre',
        explanation: 'In Catalan, adjectives come after the noun: gat negre (not negre gat).',
      },
      {
        id: 'word-order-3',
        type: 'multiple-choice',
        question: 'Which is correct for "a big house"?',
        options: ['una gran casa', 'una casa gran', 'gran una casa', 'casa gran una'],
        correctAnswer: 'una casa gran',
        explanation: 'Adjectives follow nouns in Catalan: casa gran.',
      },
    ],
    relatedCategories: ['Basics', 'Structure'],
  },

  // LESSON: Question Formation
  {
    id: 'question-formation',
    title: 'Forming Questions',
    titleCatalan: 'Formar preguntes',
    category: 'structure',
    difficulty: 'beginner',
    icon: '❓',
    estimatedMinutes: 15,
    content: {
      introduction: 'Learn how to ask questions in Catalan - from simple yes/no questions to questions using question words.',
      sections: [
        {
          title: 'Yes/No Questions',
          explanation: 'To form a yes/no question, you can simply raise your intonation, or invert the subject and verb.',
          examples: [
            { catalan: 'Parles català?', english: 'Do you speak Catalan?', highlight: 'Parles' },
            { catalan: 'Vols un cafè?', english: 'Do you want a coffee?', highlight: 'Vols' },
            { catalan: 'És professor?', english: 'Is he a teacher?', highlight: 'És' },
            { catalan: 'Tens germans?', english: 'Do you have siblings?', highlight: 'Tens' },
          ],
          tips: [
            'Simply raise intonation at the end to make a question',
            'No auxiliary verb needed (no "do" like in English)',
            'Subject can be dropped: "Parles català?" (You speak Catalan?)',
          ],
        },
        {
          title: 'Question Words (Interrogatius)',
          explanation: 'Use question words at the beginning of the sentence.',
          examples: [
            { catalan: 'Què vols?', english: 'What do you want?', highlight: 'Què' },
            { catalan: 'Qui és?', english: 'Who is it?', highlight: 'Qui' },
            { catalan: 'On vius?', english: 'Where do you live?', highlight: 'On' },
            { catalan: 'Quan arribes?', english: 'When do you arrive?', highlight: 'Quan' },
            { catalan: 'Com estàs?', english: 'How are you?', highlight: 'Com' },
            { catalan: 'Per què plores?', english: 'Why are you crying?', highlight: 'Per què' },
            { catalan: 'Quant costa?', english: 'How much does it cost?', highlight: 'Quant' },
            { catalan: 'Quin llibre vols?', english: 'Which book do you want?', highlight: 'Quin' },
          ],
          tips: [
            'QUÈ = What (Què fas? What are you doing?)',
            'QUI = Who (Qui és ella? Who is she?)',
            'ON = Where (On és el banc? Where is the bank?)',
            'QUAN = When (Quan ve? When is he coming?)',
            'COM = How (Com es diu? What is it called?)',
            'PER QUÈ = Why (Per què no vens? Why don\'t you come?)',
            'QUANT/A = How much/many',
            'QUIN/A = Which/What',
          ],
        },
        {
          title: 'Question Word Agreement',
          explanation: 'Some question words change based on gender and number.',
          examples: [
            { catalan: 'Quin cotxe tens?', english: 'Which car do you have? (masc)', highlight: 'Quin' },
            { catalan: 'Quina casa vols?', english: 'Which house do you want? (fem)', highlight: 'Quina' },
            { catalan: 'Quins llibres llegeixes?', english: 'Which books do you read? (masc pl)', highlight: 'Quins' },
            { catalan: 'Quantes persones venen?', english: 'How many people are coming? (fem pl)', highlight: 'Quantes' },
          ],
          tips: [
            'QUIN (masc sing), QUINA (fem sing)',
            'QUINS (masc pl), QUINES (fem pl)',
            'QUANT (masc sing), QUANTA (fem sing)',
            'QUANTS (masc pl), QUANTES (fem pl)',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'question-1',
        type: 'fill-blank',
        question: '___ et dius? (What is your name?)',
        correctAnswer: 'Com',
        explanation: '"Com et dius?" literally means "How do you call yourself?" - the standard way to ask someone\'s name.',
      },
      {
        id: 'question-2',
        type: 'multiple-choice',
        question: 'How do you ask "Where is the station?"',
        options: ['Què és l\'estació?', 'On és l\'estació?', 'Qui és l\'estació?', 'Com és l\'estació?'],
        correctAnswer: 'On és l\'estació?',
        explanation: '"On" means "where" for location questions.',
      },
      {
        id: 'question-3',
        type: 'translate',
        question: 'Why are you tired?',
        targetLanguage: 'catalan',
        hints: ['per què', 'cansat/cansada', 'estàs'],
        correctAnswer: 'Per què estàs cansat?',
        explanation: 'Per què (why) + estàs (are you) + cansat (tired)',
      },
      {
        id: 'question-4',
        type: 'fill-blank',
        question: '___ llibre vols, aquest o aquell? (Which book do you want?)',
        correctAnswer: 'Quin',
        explanation: '"Quin" is masculine singular, matching "llibre".',
      },
    ],
    relatedCategories: ['Structure', 'Basics'],
  },

  // LESSON: Negation Patterns
  {
    id: 'negation-patterns',
    title: 'Negation in Catalan',
    titleCatalan: 'La negació',
    category: 'structure',
    difficulty: 'beginner',
    icon: '🚫',
    estimatedMinutes: 10,
    content: {
      introduction: 'Making negative sentences in Catalan is simple - just add "no" before the verb. But there are some special patterns to learn!',
      sections: [
        {
          title: 'Basic Negation with NO',
          explanation: 'Place "no" directly before the verb to make a sentence negative.',
          examples: [
            { catalan: 'No parlo anglès', english: 'I don\'t speak English', highlight: 'No' },
            { catalan: 'No tinc gana', english: 'I\'m not hungry', highlight: 'No' },
            { catalan: 'Ella no ve avui', english: 'She isn\'t coming today', highlight: 'no' },
            { catalan: 'No és difícil', english: 'It\'s not difficult', highlight: 'No' },
          ],
          tips: [
            'NO always comes directly before the verb',
            'Subject can come before NO: "Jo no parlo"',
            'No auxiliary verb needed (unlike English "don\'t/doesn\'t")',
          ],
        },
        {
          title: 'Double Negatives',
          explanation: 'Unlike English, Catalan uses double negatives! When using negative words like "res" (nothing), you still need "no".',
          examples: [
            { catalan: 'No vull res', english: 'I don\'t want anything', highlight: 'res' },
            { catalan: 'No ve ningú', english: 'Nobody is coming', highlight: 'ningú' },
            { catalan: 'No vaig mai al gimnàs', english: 'I never go to the gym', highlight: 'mai' },
            { catalan: 'No tinc cap problema', english: 'I don\'t have any problem', highlight: 'cap' },
          ],
          tips: [
            'RES = nothing/anything (No sé res - I don\'t know anything)',
            'NINGÚ = nobody/anyone (No conec ningú - I don\'t know anyone)',
            'MAI = never/ever (No ho faig mai - I never do it)',
            'CAP = no/any (No tinc cap idea - I have no idea)',
            'ENLLOC = nowhere (No vaig enlloc - I\'m not going anywhere)',
          ],
        },
        {
          title: 'Negative Words at the Start',
          explanation: 'If a negative word comes BEFORE the verb, you don\'t need "no".',
          examples: [
            { catalan: 'Ningú no ve', english: 'Nobody is coming', highlight: 'Ningú' },
            { catalan: 'Res no passa', english: 'Nothing happens', highlight: 'Res' },
            { catalan: 'Mai diu la veritat', english: 'He never tells the truth', highlight: 'Mai' },
          ],
          tips: [
            'Negative word first = no "no" needed',
            'Both forms are correct: "No ve ningú" = "Ningú no ve"',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'negation-1',
        type: 'fill-blank',
        question: '___ entenc el que dius. (I don\'t understand what you say)',
        correctAnswer: 'No',
        explanation: 'Place "no" before the verb to negate.',
      },
      {
        id: 'negation-2',
        type: 'sentence-build',
        question: 'Arrange: (I don\'t want anything)',
        words: ['vull', 'No', 'res'],
        correctAnswer: 'No vull res',
        explanation: 'Double negative: No + verb + res',
      },
      {
        id: 'negation-3',
        type: 'multiple-choice',
        question: 'How do you say "I never eat meat"?',
        options: ['Mai menjo carn', 'No menjo mai carn', 'No menjo carn', 'Menjo no carn'],
        correctAnswer: 'No menjo mai carn',
        explanation: 'Double negative with "mai": No + verb + mai + object',
      },
      {
        id: 'negation-4',
        type: 'translate',
        question: 'Nobody speaks English here',
        targetLanguage: 'catalan',
        hints: ['ningú', 'parla', 'anglès', 'aquí'],
        correctAnswer: 'Ningú no parla anglès aquí',
        explanation: 'When ningú comes first, the "no" is optional but common.',
      },
    ],
    relatedCategories: ['Structure', 'Basics'],
  },

  // LESSON: Possessive Adjectives
  {
    id: 'possessive-adjectives',
    title: 'Possessive Adjectives',
    titleCatalan: 'Els adjectius possessius',
    category: 'adjectives',
    difficulty: 'beginner',
    icon: '👤',
    estimatedMinutes: 12,
    content: {
      introduction: 'Possessive adjectives show ownership. In Catalan, they agree with the thing possessed, not the possessor!',
      sections: [
        {
          title: 'The Possessive Forms',
          explanation: 'Possessives change based on the gender and number of what is possessed.',
          examples: [
            { catalan: 'el meu llibre', english: 'my book', highlight: 'meu' },
            { catalan: 'la meva casa', english: 'my house', highlight: 'meva' },
            { catalan: 'els meus amics', english: 'my friends', highlight: 'meus' },
            { catalan: 'les meves germanes', english: 'my sisters', highlight: 'meves' },
          ],
          tips: [
            'MY: el meu / la meva / els meus / les meves',
            'YOUR (sing): el teu / la teva / els teus / les teves',
            'HIS/HER/ITS: el seu / la seva / els seus / les seves',
            'OUR: el nostre / la nostra / els nostres / les nostres',
            'YOUR (pl): el vostre / la vostra / els vostres / les vostres',
            'THEIR: el seu / la seva / els seus / les seves',
          ],
        },
        {
          title: 'Using Articles with Possessives',
          explanation: 'Unlike Spanish, Catalan typically uses the definite article WITH possessives.',
          examples: [
            { catalan: 'el meu cotxe', english: 'my car (with article)', highlight: 'el' },
            { catalan: 'la teva mare', english: 'your mother', highlight: 'la' },
            { catalan: 'Tinc el meu telèfon', english: 'I have my phone', highlight: 'el meu' },
          ],
          tips: [
            'Always include the article: "el meu", not just "meu"',
            'After prepositions, the article is optional: "a casa meva" or "a la meva casa"',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'possessive-1',
        type: 'fill-blank',
        question: 'On és ___ mare? (Where is your mother?)',
        correctAnswer: 'la teva',
        explanation: '"Mare" is feminine singular, so we use "la teva".',
      },
      {
        id: 'possessive-2',
        type: 'multiple-choice',
        question: 'How do you say "our house"?',
        options: ['el nostre casa', 'la nostra casa', 'nostre casa', 'casa nostra'],
        correctAnswer: 'la nostra casa',
        explanation: '"Casa" is feminine, so we use "la nostra".',
      },
      {
        id: 'possessive-3',
        type: 'match',
        question: 'Match the possessives with their meanings:',
        pairs: [
          { left: 'el meu', right: 'my (masc)' },
          { left: 'la teva', right: 'your (fem)' },
          { left: 'els seus', right: 'his/her (masc pl)' },
          { left: 'les nostres', right: 'our (fem pl)' },
        ],
        correctAnswer: 'el meu-my (masc),la teva-your (fem),els seus-his/her (masc pl),les nostres-our (fem pl)',
        explanation: 'Possessives agree with the noun they modify in gender and number.',
      },
    ],
    relatedCategories: ['Adjectives', 'Pronouns'],
  },

  // LESSON: Demonstratives
  {
    id: 'demonstratives',
    title: 'Demonstratives (This/That)',
    titleCatalan: 'Els demostratius',
    category: 'adjectives',
    difficulty: 'beginner',
    icon: '👆',
    estimatedMinutes: 10,
    content: {
      introduction: 'Demonstratives point to specific things. Catalan has three levels of distance: this (here), that (there), and that (over there).',
      sections: [
        {
          title: 'Aquest/Aquesta (This - near speaker)',
          explanation: 'Use for things close to the speaker.',
          examples: [
            { catalan: 'aquest llibre', english: 'this book (near me)', highlight: 'aquest' },
            { catalan: 'aquesta casa', english: 'this house', highlight: 'aquesta' },
            { catalan: 'aquests nens', english: 'these children', highlight: 'aquests' },
            { catalan: 'aquestes flors', english: 'these flowers', highlight: 'aquestes' },
          ],
          tips: [
            'AQUEST (masc sing), AQUESTA (fem sing)',
            'AQUESTS (masc pl), AQUESTES (fem pl)',
            'For things you can touch or that are very close',
          ],
        },
        {
          title: 'Aquell/Aquella (That - far from speaker)',
          explanation: 'Use for things far from the speaker.',
          examples: [
            { catalan: 'aquell edifici', english: 'that building (over there)', highlight: 'aquell' },
            { catalan: 'aquella muntanya', english: 'that mountain', highlight: 'aquella' },
            { catalan: 'aquells cotxes', english: 'those cars', highlight: 'aquells' },
            { catalan: 'aquelles persones', english: 'those people', highlight: 'aquelles' },
          ],
          tips: [
            'AQUELL (masc sing), AQUELLA (fem sing)',
            'AQUELLS (masc pl), AQUELLES (fem pl)',
            'For things at a distance',
          ],
        },
        {
          title: 'Neuter Demonstratives',
          explanation: 'For abstract ideas or when not referring to a specific noun.',
          examples: [
            { catalan: 'Això és important', english: 'This is important', highlight: 'Això' },
            { catalan: 'Allò era difícil', english: 'That was difficult', highlight: 'Allò' },
            { catalan: 'Què és això?', english: 'What is this?', highlight: 'això' },
          ],
          tips: [
            'AIXÒ = this (thing/concept)',
            'ALLÒ = that (thing/concept)',
            'Use when not pointing to a specific gendered noun',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'demonstrative-1',
        type: 'fill-blank',
        question: '___ és el meu amic Pere. (This is my friend Pere - pointing to someone near)',
        correctAnswer: 'Aquest',
        explanation: '"Aquest" for masculine, near the speaker.',
      },
      {
        id: 'demonstrative-2',
        type: 'multiple-choice',
        question: 'How do you say "those houses" (far away)?',
        options: ['aquestes cases', 'aquelles cases', 'aquest cases', 'aquella cases'],
        correctAnswer: 'aquelles cases',
        explanation: '"Cases" is feminine plural, far away = aquelles.',
      },
      {
        id: 'demonstrative-3',
        type: 'translate',
        question: 'What is that?',
        targetLanguage: 'catalan',
        hints: ['què', 'és', 'això/allò'],
        correctAnswer: 'Què és això?',
        explanation: 'Use "això" for nearby things, "allò" for distant things.',
      },
    ],
    relatedCategories: ['Adjectives'],
  },

  // LESSON: Present Tense -ir Verbs
  {
    id: 'present-tense-ir',
    title: 'Present Tense: -ir Verbs',
    titleCatalan: 'Present: verbs en -ir',
    category: 'verbs',
    difficulty: 'beginner',
    icon: '🔤',
    estimatedMinutes: 12,
    content: {
      introduction: 'The third verb group in Catalan ends in -IR. Many of these verbs have stem changes, so pay attention to the patterns!',
      sections: [
        {
          title: 'Pure -IR Verbs (like "dormir")',
          explanation: 'Regular -IR verbs follow this pattern:',
          examples: [
            { catalan: 'Dormo vuit hores', english: 'I sleep eight hours', highlight: 'Dormo' },
            { catalan: 'Els nens dormen', english: 'The children sleep', highlight: 'dormen' },
          ],
          table: {
            verb: 'dormir',
            verbEnglish: 'to sleep',
            tense: 'Present',
            conjugations: [
              { pronoun: 'jo', form: 'dormo' },
              { pronoun: 'tu', form: 'dorms' },
              { pronoun: 'ell/ella', form: 'dorm' },
              { pronoun: 'nosaltres', form: 'dormim' },
              { pronoun: 'vosaltres', form: 'dormiu' },
              { pronoun: 'ells/elles', form: 'dormen' },
            ],
          },
          tips: [
            'The endings: -o, -s, -(none), -im, -iu, -en',
            'Similar to -RE verbs but with -im, -iu for nosaltres/vosaltres',
          ],
        },
        {
          title: 'Incoative -IR Verbs (like "servir")',
          explanation: 'Many -IR verbs add -eix- in some forms. These are called "incoative" verbs.',
          examples: [
            { catalan: 'Serveixo el dinar', english: 'I serve lunch', highlight: 'Serveixo' },
            { catalan: 'Prefereixo el te', english: 'I prefer tea', highlight: 'Prefereixo' },
          ],
          table: {
            verb: 'servir',
            verbEnglish: 'to serve',
            tense: 'Present',
            conjugations: [
              { pronoun: 'jo', form: 'serveixo', irregular: true },
              { pronoun: 'tu', form: 'serveixes', irregular: true },
              { pronoun: 'ell/ella', form: 'serveix', irregular: true },
              { pronoun: 'nosaltres', form: 'servim' },
              { pronoun: 'vosaltres', form: 'serviu' },
              { pronoun: 'ells/elles', form: 'serveixen', irregular: true },
            ],
          },
          tips: [
            'The -eix- appears in jo, tu, ell/ella, ells/elles',
            'Nosaltres and vosaltres are regular',
            'Common incoative verbs: servir, preferir, decidir, repetir',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'ir-verb-1',
        type: 'fill-blank',
        question: 'Jo ___ a les onze. (I sleep at eleven - dormir)',
        correctAnswer: 'dormo',
        explanation: 'Regular -IR verb: dorm + o = dormo.',
      },
      {
        id: 'ir-verb-2',
        type: 'multiple-choice',
        question: 'Complete: Ella ___ el cafè. (She serves the coffee - servir)',
        options: ['servo', 'serveix', 'serveixo', 'servim'],
        correctAnswer: 'serveix',
        explanation: 'Incoative verb: for ell/ella, use serveix.',
      },
    ],
    relatedCategories: ['Verbs'],
  },

  // LESSON: Reflexive Verbs
  {
    id: 'reflexive-verbs',
    title: 'Reflexive Verbs',
    titleCatalan: 'Els verbs reflexius',
    category: 'verbs',
    difficulty: 'intermediate',
    icon: '🔄',
    estimatedMinutes: 15,
    content: {
      introduction: 'Reflexive verbs express actions done to oneself. They\'re very common in Catalan for daily routines!',
      sections: [
        {
          title: 'Reflexive Pronouns',
          explanation: 'Reflexive verbs use special pronouns that refer back to the subject.',
          examples: [
            { catalan: 'Em rento les mans', english: 'I wash my hands', highlight: 'Em' },
            { catalan: 'Et lleves tard', english: 'You get up late', highlight: 'Et' },
            { catalan: 'Es dutxa cada dia', english: 'She showers every day', highlight: 'Es' },
          ],
          tips: [
            'EM = myself (jo)',
            'ET = yourself (tu)',
            'ES = himself/herself/itself (ell/ella)',
            'ENS = ourselves (nosaltres)',
            'US = yourselves (vosaltres)',
            'ES = themselves (ells/elles)',
          ],
        },
        {
          title: 'Common Reflexive Verbs',
          explanation: 'Many daily routine verbs are reflexive in Catalan.',
          examples: [
            { catalan: 'llevar-se', english: 'to get up', highlight: 'llevar-se' },
            { catalan: 'dutxar-se', english: 'to shower', highlight: 'dutxar-se' },
            { catalan: 'vestir-se', english: 'to get dressed', highlight: 'vestir-se' },
            { catalan: 'pentinar-se', english: 'to comb one\'s hair', highlight: 'pentinar-se' },
            { catalan: 'rentar-se', english: 'to wash oneself', highlight: 'rentar-se' },
          ],
          table: {
            verb: 'llevar-se',
            verbEnglish: 'to get up',
            tense: 'Present',
            conjugations: [
              { pronoun: 'jo', form: 'em llevo' },
              { pronoun: 'tu', form: 'et lleves' },
              { pronoun: 'ell/ella', form: 'es lleva' },
              { pronoun: 'nosaltres', form: 'ens llevem' },
              { pronoun: 'vosaltres', form: 'us lleveu' },
              { pronoun: 'ells/elles', form: 'es lleven' },
            ],
          },
          tips: [
            'The pronoun goes BEFORE the conjugated verb',
            'In infinitives, the pronoun attaches: llevar-se',
            'Many verbs that aren\'t reflexive in English are reflexive in Catalan',
          ],
        },
        {
          title: 'Pronoun Placement',
          explanation: 'The reflexive pronoun changes position with infinitives and commands.',
          examples: [
            { catalan: 'Vull dutxar-me', english: 'I want to shower', highlight: 'dutxar-me' },
            { catalan: 'Lleva\'t!', english: 'Get up!', highlight: 'Lleva\'t' },
            { catalan: 'Em vull dutxar', english: 'I want to shower (alt.)', highlight: 'Em' },
          ],
          tips: [
            'With infinitive: pronoun can attach (dutxar-me) or go before the conjugated verb (em vull dutxar)',
            'With commands: pronoun attaches (Lleva\'t!)',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'reflexive-1',
        type: 'fill-blank',
        question: 'Jo ___ a les set del matí. (I get up at 7 in the morning)',
        correctAnswer: 'em llevo',
        explanation: 'Reflexive pronoun "em" + verb "llevo".',
      },
      {
        id: 'reflexive-2',
        type: 'sentence-build',
        question: 'Arrange: (She showers every day)',
        words: ['dia', 'dutxa', 'Es', 'cada'],
        correctAnswer: 'Es dutxa cada dia',
        explanation: 'Reflexive pronoun (Es) comes before the verb (dutxa).',
      },
      {
        id: 'reflexive-3',
        type: 'multiple-choice',
        question: 'How do you say "We get dressed"?',
        options: ['Ens vestim', 'Es vestim', 'Em vestim', 'Vestim-nos'],
        correctAnswer: 'Ens vestim',
        explanation: '"Nosaltres" uses the reflexive pronoun "ens".',
      },
    ],
    relatedCategories: ['Verbs', 'Pronouns'],
  },

  // LESSON: Direct Object Pronouns
  {
    id: 'direct-object-pronouns',
    title: 'Direct Object Pronouns',
    titleCatalan: 'Els pronoms febles de CD',
    category: 'pronouns',
    difficulty: 'intermediate',
    icon: '➡️',
    estimatedMinutes: 15,
    content: {
      introduction: 'Direct object pronouns replace the thing directly receiving the action. They\'re called "weak pronouns" (pronoms febles) in Catalan.',
      sections: [
        {
          title: 'The Direct Object Pronouns',
          explanation: 'These pronouns replace direct objects to avoid repetition.',
          examples: [
            { catalan: 'Veus el gat? Sí, el veig.', english: 'Do you see the cat? Yes, I see it.', highlight: 'el' },
            { catalan: 'Tens la clau? Sí, la tinc.', english: 'Do you have the key? Yes, I have it.', highlight: 'la' },
            { catalan: 'Em veus?', english: 'Do you see me?', highlight: 'Em' },
          ],
          tips: [
            'EM = me',
            'ET = you (informal)',
            'EL = him / it (masc)',
            'LA = her / it (fem)',
            'ENS = us',
            'US = you (plural)',
            'ELS = them (masc)',
            'LES = them (fem)',
          ],
        },
        {
          title: 'Pronoun Placement',
          explanation: 'Direct object pronouns go BEFORE the conjugated verb.',
          examples: [
            { catalan: 'El compro demà', english: 'I\'ll buy it tomorrow', highlight: 'El' },
            { catalan: 'La veig cada dia', english: 'I see her every day', highlight: 'La' },
            { catalan: 'No els conec', english: 'I don\'t know them', highlight: 'els' },
          ],
          tips: [
            'Before the verb: El veig (I see it)',
            'Before "no": No el veig (I don\'t see it)',
            'With infinitives, can attach: Vull veure-la or La vull veure',
          ],
        },
        {
          title: 'Elision and Contraction',
          explanation: 'Some pronouns contract with vowels.',
          examples: [
            { catalan: "L'estimo", english: 'I love him/her', highlight: "L'" },
            { catalan: 'M\'ajudes?', english: 'Will you help me?', highlight: "M'" },
            { catalan: "T'entenc", english: 'I understand you', highlight: "T'" },
          ],
          tips: [
            'Before vowels: em → m\', et → t\', el/la → l\'',
            'Examples: m\'agrada, l\'he vist, t\'escolto',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'dop-1',
        type: 'fill-blank',
        question: 'Vols el cafè? Sí, ___ vull. (Do you want the coffee? Yes, I want it.)',
        correctAnswer: 'el',
        explanation: '"El cafè" is masculine singular, so we use "el".',
      },
      {
        id: 'dop-2',
        type: 'multiple-choice',
        question: 'How do you say "I see them (feminine)"?',
        options: ['Els veig', 'Les veig', 'La veig', 'Los veig'],
        correctAnswer: 'Les veig',
        explanation: 'Feminine plural direct object uses "les".',
      },
      {
        id: 'dop-3',
        type: 'translate',
        question: 'I love you (informal)',
        targetLanguage: 'catalan',
        hints: ['estimo', "t'"],
        correctAnswer: "T'estimo",
        explanation: '"Et" contracts to "t\'" before a vowel.',
      },
    ],
    relatedCategories: ['Pronouns'],
  },

  // LESSON: Past Tense - Preterit Perifràstic
  {
    id: 'past-periphrastic',
    title: 'Past Tense: Preterit Perifràstic',
    titleCatalan: 'El pretèrit perifràstic',
    category: 'tenses',
    difficulty: 'intermediate',
    icon: '⏮️',
    estimatedMinutes: 15,
    content: {
      introduction: 'The most common past tense in spoken Catalan! It\'s formed with "anar" (to go) + infinitive. Yes, "went" + verb!',
      sections: [
        {
          title: 'Formation',
          explanation: 'Use the present tense of "anar" + the infinitive of the main verb.',
          examples: [
            { catalan: 'Vaig menjar', english: 'I ate', highlight: 'Vaig' },
            { catalan: 'Vas parlar', english: 'You spoke', highlight: 'Vas' },
            { catalan: 'Va arribar', english: 'He/She arrived', highlight: 'Va' },
            { catalan: 'Vam comprar', english: 'We bought', highlight: 'Vam' },
          ],
          table: {
            verb: 'menjar',
            verbEnglish: 'to eat (past)',
            tense: 'Preterit Perifràstic',
            conjugations: [
              { pronoun: 'jo', form: 'vaig menjar' },
              { pronoun: 'tu', form: 'vas menjar' },
              { pronoun: 'ell/ella', form: 'va menjar' },
              { pronoun: 'nosaltres', form: 'vam menjar' },
              { pronoun: 'vosaltres', form: 'vau menjar' },
              { pronoun: 'ells/elles', form: 'van menjar' },
            ],
          },
          tips: [
            'VAIG, VAS, VA, VAM, VAU, VAN + infinitive',
            'The main verb stays in infinitive form',
            'This is the most common past tense in everyday speech',
          ],
        },
        {
          title: 'Using It',
          explanation: 'Use for completed actions in the past.',
          examples: [
            { catalan: 'Ahir vaig anar al cine', english: 'Yesterday I went to the cinema', highlight: 'vaig anar' },
            { catalan: 'Què vas fer?', english: 'What did you do?', highlight: 'vas fer' },
            { catalan: 'Van arribar tard', english: 'They arrived late', highlight: 'Van arribar' },
          ],
          tips: [
            'Used for specific completed actions',
            'Common with time markers: ahir, l\'any passat, fa dos dies',
            'In writing, the simple preterite is sometimes used instead',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'past-1',
        type: 'fill-blank',
        question: 'Ahir ___ al supermercat. (Yesterday I went to the supermarket)',
        correctAnswer: 'vaig anar',
        explanation: 'Vaig (I) + anar (to go) = I went.',
      },
      {
        id: 'past-2',
        type: 'sentence-build',
        question: 'Arrange: (She ate paella)',
        words: ['paella', 'Va', 'menjar'],
        correctAnswer: 'Va menjar paella',
        explanation: 'Va (auxiliary for she) + menjar (infinitive) + object.',
      },
      {
        id: 'past-3',
        type: 'translate',
        question: 'What did you do yesterday?',
        targetLanguage: 'catalan',
        hints: ['què', 'vas', 'fer', 'ahir'],
        correctAnswer: 'Què vas fer ahir?',
        explanation: 'Question word + vas (you) + fer (do/make) + ahir (yesterday).',
      },
    ],
    relatedCategories: ['Verbs', 'Tenses'],
  },

  // LESSON: Imperfect Tense
  {
    id: 'imperfect-tense',
    title: 'Past Tense: Imperfect',
    titleCatalan: "L'imperfet",
    category: 'tenses',
    difficulty: 'intermediate',
    icon: '🔄',
    estimatedMinutes: 15,
    content: {
      introduction: 'The imperfect tense describes ongoing or habitual actions in the past - things you "used to do" or "were doing".',
      sections: [
        {
          title: 'Regular -AR Verbs',
          explanation: 'For -AR verbs, replace -ar with these endings:',
          examples: [
            { catalan: 'De petit, jugava cada dia', english: 'As a child, I played every day', highlight: 'jugava' },
            { catalan: 'Parlàvem català a casa', english: 'We used to speak Catalan at home', highlight: 'Parlàvem' },
          ],
          table: {
            verb: 'parlar',
            verbEnglish: 'to speak',
            tense: 'Imperfet',
            conjugations: [
              { pronoun: 'jo', form: 'parlava' },
              { pronoun: 'tu', form: 'parlaves' },
              { pronoun: 'ell/ella', form: 'parlava' },
              { pronoun: 'nosaltres', form: 'parlàvem' },
              { pronoun: 'vosaltres', form: 'parlàveu' },
              { pronoun: 'ells/elles', form: 'parlaven' },
            ],
          },
          tips: [
            'Endings: -ava, -aves, -ava, -àvem, -àveu, -aven',
            'Note: jo and ell/ella have the same form',
          ],
        },
        {
          title: 'Regular -ER/-IR Verbs',
          explanation: 'For -ER and -IR verbs, use these endings:',
          examples: [
            { catalan: 'Vivia a Barcelona', english: 'I lived in Barcelona', highlight: 'Vivia' },
            { catalan: 'Bevia molta aigua', english: 'He drank a lot of water', highlight: 'Bevia' },
          ],
          table: {
            verb: 'viure',
            verbEnglish: 'to live',
            tense: 'Imperfet',
            conjugations: [
              { pronoun: 'jo', form: 'vivia' },
              { pronoun: 'tu', form: 'vivies' },
              { pronoun: 'ell/ella', form: 'vivia' },
              { pronoun: 'nosaltres', form: 'vivíem' },
              { pronoun: 'vosaltres', form: 'vivíeu' },
              { pronoun: 'ells/elles', form: 'vivien' },
            ],
          },
          tips: [
            'Endings: -ia, -ies, -ia, -íem, -íeu, -ien',
            'Same pattern for both -ER and -IR verbs',
          ],
        },
        {
          title: 'When to Use Imperfect',
          explanation: 'Use imperfect for background descriptions, habits, and ongoing past states.',
          examples: [
            { catalan: 'Quan era petit...', english: 'When I was little...', highlight: 'era' },
            { catalan: 'Feia bon temps', english: 'The weather was nice', highlight: 'Feia' },
            { catalan: 'Mentre dormia...', english: 'While I was sleeping...', highlight: 'dormia' },
          ],
          tips: [
            'Habitual past: "Anava al gimnàs cada dia" (I used to go to the gym every day)',
            'Background: "Feia sol" (It was sunny)',
            'Ongoing action: "Llegia quan va trucar" (I was reading when he called)',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'imperfect-1',
        type: 'fill-blank',
        question: 'Quan era petit, ___ futbol. (When I was little, I played football)',
        correctAnswer: 'jugava',
        explanation: 'Habitual action in the past: jugava (used to play).',
      },
      {
        id: 'imperfect-2',
        type: 'multiple-choice',
        question: 'How do you say "We used to live in Girona"?',
        options: ['Vam viure a Girona', 'Vivíem a Girona', 'Viure a Girona', 'Vivim a Girona'],
        correctAnswer: 'Vivíem a Girona',
        explanation: 'Habitual/ongoing past state = imperfect: vivíem.',
      },
    ],
    relatedCategories: ['Verbs', 'Tenses'],
  },

  // LESSON: Future Tense
  {
    id: 'future-tense',
    title: 'Future Tense',
    titleCatalan: 'El futur',
    category: 'tenses',
    difficulty: 'intermediate',
    icon: '⏭️',
    estimatedMinutes: 12,
    content: {
      introduction: 'The future tense in Catalan adds endings directly to the infinitive. It\'s simpler than you might think!',
      sections: [
        {
          title: 'Formation',
          explanation: 'Add these endings directly to the infinitive form:',
          examples: [
            { catalan: 'Demà parlaré amb ella', english: 'Tomorrow I\'ll speak with her', highlight: 'parlaré' },
            { catalan: 'Vindràs a la festa?', english: 'Will you come to the party?', highlight: 'Vindràs' },
          ],
          table: {
            verb: 'parlar',
            verbEnglish: 'to speak',
            tense: 'Futur',
            conjugations: [
              { pronoun: 'jo', form: 'parlaré' },
              { pronoun: 'tu', form: 'parlaràs' },
              { pronoun: 'ell/ella', form: 'parlarà' },
              { pronoun: 'nosaltres', form: 'parlarem' },
              { pronoun: 'vosaltres', form: 'parlareu' },
              { pronoun: 'ells/elles', form: 'parlaran' },
            ],
          },
          tips: [
            'Endings: -é, -às, -à, -em, -eu, -an',
            'These endings are the same for ALL verb types',
            'Simply add them to the full infinitive',
          ],
        },
        {
          title: 'Irregular Stems',
          explanation: 'Some common verbs have irregular future stems:',
          examples: [
            { catalan: 'Faré els deures', english: 'I\'ll do my homework', highlight: 'Faré' },
            { catalan: 'Tindré temps', english: 'I\'ll have time', highlight: 'Tindré' },
            { catalan: 'Podrem venir', english: 'We\'ll be able to come', highlight: 'Podrem' },
          ],
          tips: [
            'FER → far- (faré, faràs...)',
            'TENIR → tindr- (tindré, tindràs...)',
            'PODER → podr- (podré, podràs...)',
            'VENIR → vindr- (vindré, vindràs...)',
            'SABER → sabr- (sabré, sabràs...)',
            'VOLER → voldr- (voldré, voldràs...)',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'future-1',
        type: 'fill-blank',
        question: 'Demà ___ a Barcelona. (Tomorrow I will go to Barcelona - anar)',
        correctAnswer: 'aniré',
        explanation: 'Anar + é = aniré.',
      },
      {
        id: 'future-2',
        type: 'translate',
        question: 'Will you have time?',
        targetLanguage: 'catalan',
        hints: ['tindràs', 'temps'],
        correctAnswer: 'Tindràs temps?',
        explanation: 'Tenir has irregular stem tindr-: tindràs.',
      },
      {
        id: 'future-3',
        type: 'multiple-choice',
        question: 'How do you say "We will eat at eight"?',
        options: ['Menjam a les vuit', 'Menjarem a les vuit', 'Vam menjar a les vuit', 'Menjar a les vuit'],
        correctAnswer: 'Menjarem a les vuit',
        explanation: 'Menjar + em = menjarem.',
      },
    ],
    relatedCategories: ['Verbs', 'Tenses'],
  },

  // LESSON: Conditional Mood
  {
    id: 'conditional-mood',
    title: 'Conditional Mood',
    titleCatalan: 'El condicional',
    category: 'tenses',
    difficulty: 'intermediate',
    icon: '🤔',
    estimatedMinutes: 12,
    content: {
      introduction: 'The conditional expresses what "would" happen. It\'s formed like the future but with different endings.',
      sections: [
        {
          title: 'Formation',
          explanation: 'Add these endings to the infinitive (or irregular future stem):',
          examples: [
            { catalan: 'M\'agradaria viatjar', english: 'I would like to travel', highlight: 'agradaria' },
            { catalan: 'Podries ajudar-me?', english: 'Could you help me?', highlight: 'Podries' },
          ],
          table: {
            verb: 'parlar',
            verbEnglish: 'to speak',
            tense: 'Condicional',
            conjugations: [
              { pronoun: 'jo', form: 'parlaria' },
              { pronoun: 'tu', form: 'parlaries' },
              { pronoun: 'ell/ella', form: 'parlaria' },
              { pronoun: 'nosaltres', form: 'parlaríem' },
              { pronoun: 'vosaltres', form: 'parlaríeu' },
              { pronoun: 'ells/elles', form: 'parlarien' },
            ],
          },
          tips: [
            'Endings: -ia, -ies, -ia, -íem, -íeu, -ien',
            'Same irregular stems as future: far-, tindr-, podr-, etc.',
            'Jo and ell/ella have the same form',
          ],
        },
        {
          title: 'Common Uses',
          explanation: 'The conditional is used for polite requests, hypotheticals, and wishes.',
          examples: [
            { catalan: 'Voldria un cafè', english: 'I would like a coffee', highlight: 'Voldria' },
            { catalan: 'Si pogués, vindria', english: 'If I could, I would come', highlight: 'vindria' },
            { catalan: "Hauries d'estudiar", english: 'You should study', highlight: 'Hauries' },
          ],
          tips: [
            'Polite requests: Podria... (Could I...)',
            'Wishes: M\'agradaria... (I would like...)',
            '"Should": hauria de + infinitive',
            'Hypothetical: Si tingués diners, compraria... (If I had money, I would buy...)',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'conditional-1',
        type: 'fill-blank',
        question: '___ un got d\'aigua, sisplau. (I would like a glass of water)',
        correctAnswer: 'Voldria',
        explanation: 'Voler → voldr- + ia = voldria.',
      },
      {
        id: 'conditional-2',
        type: 'translate',
        question: 'Could you help me?',
        targetLanguage: 'catalan',
        hints: ['podries', 'ajudar-me'],
        correctAnswer: 'Podries ajudar-me?',
        explanation: 'Poder → podr- + ies = podries.',
      },
    ],
    relatedCategories: ['Verbs', 'Tenses'],
  },

  // LESSON: Indirect Object Pronouns
  {
    id: 'indirect-object-pronouns',
    title: 'Indirect Object Pronouns',
    titleCatalan: 'Els pronoms febles de CI',
    category: 'pronouns',
    difficulty: 'intermediate',
    icon: '↩️',
    estimatedMinutes: 12,
    content: {
      introduction: 'Indirect object pronouns indicate to whom or for whom an action is done. They\'re essential for natural-sounding Catalan!',
      sections: [
        {
          title: 'The Indirect Object Pronouns',
          explanation: 'These pronouns answer "to whom?" or "for whom?"',
          examples: [
            { catalan: 'Li dono el llibre', english: 'I give him/her the book', highlight: 'Li' },
            { catalan: 'Em diu la veritat', english: 'He tells me the truth', highlight: 'Em' },
            { catalan: 'Ens escriu cartes', english: 'She writes us letters', highlight: 'Ens' },
          ],
          tips: [
            'EM = to me',
            'ET = to you (informal)',
            'LI = to him/her/you (formal)',
            'ENS = to us',
            'US = to you (plural)',
            'ELS = to them',
          ],
        },
        {
          title: 'Common Verbs with Indirect Objects',
          explanation: 'These verbs commonly use indirect object pronouns:',
          examples: [
            { catalan: "M'agrada el cafè", english: 'I like coffee (lit: coffee pleases to me)', highlight: "M'" },
            { catalan: 'Li sembla bé', english: 'It seems good to him/her', highlight: 'Li' },
            { catalan: 'Ens falta temps', english: 'We lack time', highlight: 'Ens' },
          ],
          tips: [
            'AGRADAR: M\'agrada (I like), T\'agrada (you like), Li agrada (he/she likes)',
            'SEMBLAR: Li sembla (it seems to him/her)',
            'FALTAR: Em falta (I\'m missing / I need)',
            'INTERESSAR: M\'interessa (it interests me)',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'iop-1',
        type: 'fill-blank',
        question: '___ agrada la música. (I like music)',
        correctAnswer: "M'",
        explanation: 'Agradar uses indirect object: M\' (to me) agrada.',
      },
      {
        id: 'iop-2',
        type: 'multiple-choice',
        question: 'How do you say "She gives them a gift"?',
        options: ['Els dona un regal', 'Les dona un regal', 'Li dona un regal', 'Ens dona un regal'],
        correctAnswer: 'Els dona un regal',
        explanation: '"To them" = els.',
      },
    ],
    relatedCategories: ['Pronouns'],
  },
  {
    id: 'agradar',
    title: 'Verb: Agradar (to like)',
    titleCatalan: 'El verb agradar',
    category: 'verbs',
    difficulty: 'intermediate',
    icon: '❤️',
    estimatedMinutes: 12,
    content: {
      introduction: 'The verb "agradar" (to like/please) works differently from English. Instead of "I like coffee", you say "Coffee pleases me". This is one of the most important verbs to master!',
      sections: [
        {
          title: 'How Agradar Works',
          explanation: 'In Catalan, the thing you like is the subject, and you are the indirect object. This reverses the English sentence structure.',
          examples: [
            { catalan: "M'agrada el cafè", english: 'I like coffee (lit: Coffee pleases me)', highlight: "M'agrada" },
            { catalan: "T'agrada la música?", english: 'Do you like music?', highlight: "T'agrada" },
            { catalan: 'Li agrada llegir', english: 'He/She likes to read', highlight: 'Li agrada' },
            { catalan: 'Ens agrada Barcelona', english: 'We like Barcelona', highlight: 'Ens agrada' },
          ],
          tips: [
            "M'agrada = I like (lit: it pleases me)",
            "T'agrada = You like (informal)",
            'Li agrada = He/She likes / You like (formal)',
            'Ens agrada = We like',
            'Us agrada = You (plural) like',
            'Els agrada = They like',
          ],
        },
        {
          title: 'Singular vs Plural',
          explanation: 'Use "agrada" for singular things and "agraden" for plural things.',
          examples: [
            { catalan: "M'agrada el vi", english: 'I like wine (singular)', highlight: 'agrada' },
            { catalan: "M'agraden els gats", english: 'I like cats (plural)', highlight: 'agraden' },
            { catalan: "T'agrada aquesta cançó?", english: 'Do you like this song?', highlight: 'agrada' },
            { catalan: "T'agraden aquestes cançons?", english: 'Do you like these songs?', highlight: 'agraden' },
          ],
          tips: [
            'AGRADA for singular nouns or infinitives',
            'AGRADEN for plural nouns',
            'The verb agrees with what is liked, not who likes it',
          ],
        },
        {
          title: 'With Infinitives',
          explanation: 'When you like doing something, use "agrada" + infinitive.',
          examples: [
            { catalan: "M'agrada cantar", english: 'I like to sing', highlight: 'cantar' },
            { catalan: 'Li agrada cuinar', english: 'He/She likes to cook', highlight: 'cuinar' },
            { catalan: "M'agrada molt viatjar", english: 'I really like to travel', highlight: 'viatjar' },
            { catalan: 'No ens agrada esperar', english: "We don't like to wait", highlight: 'esperar' },
          ],
          tips: [
            'Always use singular "agrada" with infinitives',
            'Add "molt" for "really like": M\'agrada molt',
            'Negate with "no": No m\'agrada',
          ],
        },
        {
          title: 'Related Verbs',
          explanation: 'Several other verbs follow the same pattern as agradar.',
          examples: [
            { catalan: "M'encanta la xocolata", english: 'I love chocolate', highlight: 'encanta' },
            { catalan: "M'interessa la història", english: "I'm interested in history", highlight: 'interessa' },
            { catalan: 'Em fa falta temps', english: 'I need time', highlight: 'fa falta' },
            { catalan: 'Em sembla bé', english: 'It seems good to me', highlight: 'sembla' },
          ],
          tips: [
            'ENCANTAR = to love (stronger than agradar)',
            'INTERESSAR = to interest',
            'FER FALTA = to need/lack',
            'SEMBLAR = to seem',
            'All these verbs use indirect object pronouns like agradar',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'agradar-1',
        type: 'fill-blank',
        question: "___ el futbol. (I like football)",
        correctAnswer: "M'agrada",
        explanation: 'Use indirect object pronoun + agrada: M\'agrada.',
      },
      {
        id: 'agradar-2',
        type: 'multiple-choice',
        question: 'How do you say "I like cats" (plural)?',
        options: ["M'agrada els gats", "M'agraden els gats", 'Agrado els gats', "M'agrada gats"],
        correctAnswer: "M'agraden els gats",
        explanation: 'Plural noun "gats" requires plural verb "agraden".',
      },
      {
        id: 'agradar-3',
        type: 'fill-blank',
        question: 'A la Maria ___ molt ballar. (Maria likes dancing a lot)',
        correctAnswer: 'li agrada',
        explanation: 'Third person singular uses "li" + agrada (singular because ballar is an infinitive).',
      },
      {
        id: 'agradar-4',
        type: 'translate',
        question: 'Do you like this film?',
        targetLanguage: 'catalan',
        hints: ["t'agrada", 'aquesta', 'pel·lícula'],
        correctAnswer: "T'agrada aquesta pel·lícula?",
        explanation: 'Singular film uses agrada: T\'agrada aquesta pel·lícula?',
      },
    ],
    relatedCategories: ['Verbs', 'Pronouns'],
  },
  {
    id: 'present-perfect',
    title: 'Present Perfect Tense',
    titleCatalan: 'El pretèrit perfet',
    category: 'tenses',
    difficulty: 'intermediate',
    icon: '✅',
    estimatedMinutes: 15,
    content: {
      introduction: 'The present perfect (pretèrit perfet) is used for actions completed in the recent past or that have relevance to the present. It\'s formed with "haver" + past participle.',
      sections: [
        {
          title: 'Formation',
          explanation: 'Use the present tense of "haver" + the past participle of the main verb.',
          examples: [
            { catalan: 'He menjat', english: 'I have eaten', highlight: 'He' },
            { catalan: 'Has vist', english: 'You have seen', highlight: 'Has' },
            { catalan: 'Ha arribat', english: 'He/She has arrived', highlight: 'Ha' },
            { catalan: 'Hem parlat', english: 'We have spoken', highlight: 'Hem' },
          ],
          table: {
            verb: 'haver',
            verbEnglish: 'to have (auxiliary)',
            tense: 'Present',
            conjugations: [
              { pronoun: 'jo', form: 'he' },
              { pronoun: 'tu', form: 'has' },
              { pronoun: 'ell/ella', form: 'ha' },
              { pronoun: 'nosaltres', form: 'hem' },
              { pronoun: 'vosaltres', form: 'heu' },
              { pronoun: 'ells/elles', form: 'han' },
            ],
          },
          tips: [
            'HE, HAS, HA, HEM, HEU, HAN + past participle',
            'The past participle never changes (unlike in French)',
            'This is different from "tenir" (to have possessions)',
          ],
        },
        {
          title: 'Forming Past Participles',
          explanation: 'Past participles are formed based on the verb ending.',
          examples: [
            { catalan: 'parlar → parlat', english: 'to speak → spoken', highlight: 'parlat' },
            { catalan: 'perdre → perdut', english: 'to lose → lost', highlight: 'perdut' },
            { catalan: 'dormir → dormit', english: 'to sleep → slept', highlight: 'dormit' },
            { catalan: 'fer → fet', english: 'to do → done (irregular)', highlight: 'fet' },
          ],
          tips: [
            '-AR verbs: -at (parlar → parlat)',
            '-ER/-RE verbs: -ut (perdre → perdut)',
            '-IR verbs: -it (dormir → dormit)',
            'Some verbs are irregular: fer → fet, dir → dit, veure → vist',
          ],
        },
        {
          title: 'Common Irregular Participles',
          explanation: 'Some frequently used verbs have irregular past participles.',
          examples: [
            { catalan: 'He fet els deures', english: 'I have done the homework', highlight: 'fet' },
            { catalan: "Hem vist la pel·lícula", english: 'We have seen the film', highlight: 'vist' },
            { catalan: 'Has dit la veritat', english: 'You have told the truth', highlight: 'dit' },
            { catalan: 'Ha escrit una carta', english: 'She has written a letter', highlight: 'escrit' },
          ],
          tips: [
            'FER → fet (done)',
            'VEURE → vist (seen)',
            'DIR → dit (said)',
            'ESCRIURE → escrit (written)',
            'OBRIR → obert (opened)',
            'MORIR → mort (died)',
          ],
        },
        {
          title: 'When to Use It',
          explanation: 'Use present perfect for recent past or when the past connects to the present.',
          examples: [
            { catalan: 'Avui he treballat molt', english: 'Today I have worked a lot', highlight: 'Avui' },
            { catalan: 'Ja he acabat', english: 'I have already finished', highlight: 'Ja' },
            { catalan: 'Encara no ha arribat', english: 'He hasn\'t arrived yet', highlight: 'Encara no' },
            { catalan: 'Mai he visitat París', english: 'I have never visited Paris', highlight: 'Mai' },
          ],
          tips: [
            'AVUI (today): Avui he menjat pa',
            'JA (already): Ja he acabat',
            'ENCARA NO (not yet): Encara no ha vingut',
            'MAI (never): Mai he vist això',
            'AQUEST MATÍ (this morning): Aquest matí he llegit el diari',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'present-perfect-1',
        type: 'fill-blank',
        question: 'Jo ___ menjat. (I have eaten)',
        correctAnswer: 'he',
        explanation: 'First person singular of haver is "he".',
      },
      {
        id: 'present-perfect-2',
        type: 'multiple-choice',
        question: 'What is the past participle of "fer" (to do)?',
        options: ['ferit', 'fet', 'feit', 'fert'],
        correctAnswer: 'fet',
        explanation: '"Fer" has an irregular past participle: "fet".',
      },
      {
        id: 'present-perfect-3',
        type: 'sentence-build',
        question: 'Arrange: (We have seen the film)',
        words: ['vist', 'la', 'Hem', 'pel·lícula'],
        correctAnswer: 'Hem vist la pel·lícula',
        explanation: 'Hem (we have) + vist (seen) + object.',
      },
      {
        id: 'present-perfect-4',
        type: 'translate',
        question: 'Have you finished?',
        targetLanguage: 'catalan',
        hints: ['has', 'acabat'],
        correctAnswer: 'Has acabat?',
        explanation: 'Has (you have) + acabat (finished).',
      },
    ],
    relatedCategories: ['Verbs', 'Tenses'],
  },

  // LESSON: Relative Clauses
  {
    id: 'relative-clauses',
    title: 'Relative Clauses',
    titleCatalan: 'Les oracions de relatiu',
    category: 'structure',
    difficulty: 'intermediate',
    icon: '🔗',
    estimatedMinutes: 12,
    content: {
      introduction: 'Relative clauses connect ideas using words like "that," "which," "who," and "where." They\'re essential for complex sentences!',
      sections: [
        {
          title: 'QUE (that/which/who)',
          explanation: 'The most common relative pronoun, used for people and things.',
          examples: [
            { catalan: 'El llibre que llegeixes', english: 'The book that you are reading', highlight: 'que' },
            { catalan: 'La noia que parla', english: 'The girl who is speaking', highlight: 'que' },
            { catalan: 'Les coses que vull', english: 'The things that I want', highlight: 'que' },
          ],
          tips: [
            'QUE is invariable (doesn\'t change)',
            'Used for subjects and direct objects',
            'Can refer to people or things',
          ],
        },
        {
          title: 'QUI (who - after prepositions)',
          explanation: 'Use QUI for people after prepositions.',
          examples: [
            { catalan: 'L\'home amb qui parlo', english: 'The man with whom I speak', highlight: 'qui' },
            { catalan: 'La persona a qui escric', english: 'The person to whom I write', highlight: 'qui' },
          ],
          tips: [
            'Use QUI after prepositions when referring to people',
            'amb qui, a qui, per a qui, de qui',
          ],
        },
        {
          title: 'ON (where)',
          explanation: 'Use ON for places.',
          examples: [
            { catalan: 'La ciutat on visc', english: 'The city where I live', highlight: 'on' },
            { catalan: 'El restaurant on mengem', english: 'The restaurant where we eat', highlight: 'on' },
          ],
          tips: [
            'ON = where (for locations)',
            'Can also be d\'on (from where)',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'relative-1',
        type: 'fill-blank',
        question: 'El cotxe ___ he comprat és vermell. (The car that I bought is red)',
        correctAnswer: 'que',
        explanation: '"Que" is the general relative pronoun.',
      },
      {
        id: 'relative-2',
        type: 'multiple-choice',
        question: 'Complete: La casa ___ viuen és gran.',
        options: ['que', 'on', 'qui', 'qual'],
        correctAnswer: 'on',
        explanation: 'For places, use "on" (where).',
      },
      {
        id: 'relative-3',
        type: 'sentence-build',
        question: 'Arrange: (The person who called)',
        words: ['persona', 'que', 'La', 'trucat', 'ha'],
        correctAnswer: 'La persona que ha trucat',
        explanation: 'Subject + que + verb.',
      },
    ],
    relatedCategories: ['Structure'],
  },

  // LESSON: Present Subjunctive
  {
    id: 'present-subjunctive',
    title: 'Present Subjunctive',
    titleCatalan: 'El present de subjuntiu',
    category: 'tenses',
    difficulty: 'advanced',
    icon: '💭',
    estimatedMinutes: 20,
    content: {
      introduction: 'The subjunctive mood expresses doubt, wishes, emotions, and hypothetical situations. It\'s essential for expressing nuance!',
      sections: [
        {
          title: 'Formation - AR Verbs',
          explanation: 'For -AR verbs, use these endings:',
          examples: [
            { catalan: 'Vull que parlis', english: 'I want you to speak', highlight: 'parlis' },
            { catalan: 'Espero que arribi', english: 'I hope he/she arrives', highlight: 'arribi' },
          ],
          table: {
            verb: 'parlar',
            verbEnglish: 'to speak',
            tense: 'Present Subjuntiu',
            conjugations: [
              { pronoun: 'jo', form: 'parli' },
              { pronoun: 'tu', form: 'parlis' },
              { pronoun: 'ell/ella', form: 'parli' },
              { pronoun: 'nosaltres', form: 'parlem' },
              { pronoun: 'vosaltres', form: 'parleu' },
              { pronoun: 'ells/elles', form: 'parlin' },
            ],
          },
          tips: [
            'Endings: -i, -is, -i, -em, -eu, -in',
            'Similar to imperative forms',
          ],
        },
        {
          title: 'Formation - ER/IR Verbs',
          explanation: 'For -ER and -IR verbs:',
          examples: [
            { catalan: 'Cal que vingui', english: 'It\'s necessary that he/she comes', highlight: 'vingui' },
          ],
          table: {
            verb: 'viure',
            verbEnglish: 'to live',
            tense: 'Present Subjuntiu',
            conjugations: [
              { pronoun: 'jo', form: 'visqui' },
              { pronoun: 'tu', form: 'visquis' },
              { pronoun: 'ell/ella', form: 'visqui' },
              { pronoun: 'nosaltres', form: 'visquem' },
              { pronoun: 'vosaltres', form: 'visqueu' },
              { pronoun: 'ells/elles', form: 'visquin' },
            ],
          },
        },
        {
          title: 'When to Use It',
          explanation: 'The subjunctive appears after certain triggers:',
          examples: [
            { catalan: 'Vull que vinguis', english: 'I want you to come (desire)', highlight: 'vinguis' },
            { catalan: 'Dubto que sàpiga', english: 'I doubt that he/she knows (doubt)', highlight: 'sàpiga' },
            { catalan: 'És important que estudiïs', english: 'It\'s important that you study (necessity)', highlight: 'estudïis' },
          ],
          tips: [
            'After DESIRE verbs: voler, desitjar, preferir',
            'After DOUBT verbs: dubtar, no creure',
            'After EMOTION verbs: alegrar-se, tenir por',
            'After IMPERSONAL expressions: cal que, és important que',
            'After COMMANDS: dir que, demanar que',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'subjunctive-1',
        type: 'fill-blank',
        question: 'Vull que ___ a la festa. (I want you to come to the party)',
        correctAnswer: 'vinguis',
        explanation: 'After "vull que" (I want that), use subjunctive.',
      },
      {
        id: 'subjunctive-2',
        type: 'multiple-choice',
        question: 'Complete: És important que ___. (It\'s important that he studies)',
        options: ['estudia', 'estudïi', 'estudiar', 'estudiava'],
        correctAnswer: 'estudïi',
        explanation: 'After "és important que", use subjunctive.',
      },
    ],
    relatedCategories: ['Verbs', 'Tenses'],
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

/**
 * The course grammar: the original 27 lessons plus the A2/B1 set that fills the
 * gap between the present subjunctive and actually being able to speak.
 */
export const GRAMMAR_LESSONS: GrammarLesson[] = [
  ...CORE_GRAMMAR_LESSONS,
  ...B1_GRAMMAR_LESSONS,
];
