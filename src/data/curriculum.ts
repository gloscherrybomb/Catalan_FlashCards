// Curriculum Data for Structured Learning Path
// Based on "Colloquial Catalan: The Complete Course for Beginners"

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface LessonContent {
  type: 'vocabulary' | 'grammar' | 'conversation' | 'culture' | 'review';
  unitNumber?: number;        // Reference to colloquialVocabulary unit
  cardCategories?: string[];  // Flashcard categories to include
  grammarLessonId?: string;   // Reference to grammar lesson
  description: string;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  titleCatalan: string;
  icon: string;
  content: LessonContent;
  estimatedMinutes: number;
  xpReward: number;
}

export interface CurriculumUnit {
  id: string;
  title: string;
  titleCatalan: string;
  description: string;
  level: CEFRLevel;
  icon: string;
  color: string;
  prerequisites: string[];  // Unit IDs that must be completed first
  lessons: CurriculumLesson[];
  milestoneTitle?: string;  // Achievement unlocked on completion
  courseUnit?: number;      // Reference to Colloquial Catalan unit number
}

export interface PlacementQuestion {
  id: string;
  level: CEFRLevel;
  type: 'vocabulary' | 'grammar' | 'listening';
  question: string;
  options: string[];
  correctAnswer: string;
  categoryHint?: string;
}

// CURRICULUM UNITS - Based on "Colloquial Catalan" 20-unit course
export const CURRICULUM_UNITS: CurriculumUnit[] = [
  // === A1 LEVEL: BEGINNER (Units 1-8) ===
  {
    id: 'unit-1-welcome',
    title: 'Welcome!',
    titleCatalan: 'Benvinguda i benvingut!',
    description: 'Essential greetings and your first Catalan words',
    level: 'A1',
    icon: '👋',
    color: 'from-emerald-400 to-teal-500',
    prerequisites: [],
    milestoneTitle: 'First Words',
    courseUnit: 1,
    lessons: [
      {
        id: 'u1-vocab',
        title: 'Greetings Vocabulary',
        titleCatalan: 'Vocabulari de salutacions',
        icon: '📚',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          unitNumber: 1,
          description: 'Learn hello, goodbye, please, and thank you',
        },
      },
      {
        id: 'u1-practice',
        title: 'Practice Greetings',
        titleCatalan: 'Practica salutacions',
        icon: '🎯',
        estimatedMinutes: 8,
        xpReward: 25,
        content: {
          type: 'conversation',
          description: 'Practice greeting people in different situations',
        },
      },
    ],
  },
  {
    id: 'unit-2-introductions',
    title: 'What is your name?',
    titleCatalan: 'Com es diu?',
    description: 'Introducing yourself and meeting others',
    level: 'A1',
    icon: '🤝',
    color: 'from-blue-400 to-indigo-500',
    prerequisites: ['unit-1-welcome'],
    courseUnit: 2,
    lessons: [
      {
        id: 'u2-vocab',
        title: 'Introduction Vocabulary',
        titleCatalan: 'Vocabulari de presentacions',
        icon: '📚',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          unitNumber: 2,
          description: 'Learn to ask names and introduce yourself',
        },
      },
      {
        id: 'u2-grammar',
        title: 'Verbs: Ser & Estar',
        titleCatalan: 'Verbs: Ser i Estar',
        icon: '📖',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'grammar',
          grammarLessonId: 'ser-vs-estar',
          description: 'The two verbs for "to be" in Catalan',
        },
      },
      {
        id: 'u2-practice',
        title: 'Meeting People',
        titleCatalan: 'Conèixer gent',
        icon: '💬',
        estimatedMinutes: 8,
        xpReward: 25,
        content: {
          type: 'conversation',
          description: 'Practice introductions in real scenarios',
        },
      },
    ],
  },
  {
    id: 'unit-3-cafe',
    title: 'A coffee, please',
    titleCatalan: 'Un cafè, sisplau',
    description: 'Ordering drinks and snacks at a café',
    level: 'A1',
    icon: '☕',
    color: 'from-amber-400 to-orange-500',
    prerequisites: ['unit-2-introductions'],
    courseUnit: 3,
    lessons: [
      {
        id: 'u3-vocab',
        title: 'Café Vocabulary',
        titleCatalan: 'Vocabulari del cafè',
        icon: '📚',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          unitNumber: 3,
          description: 'Drinks, snacks, and ordering phrases',
        },
      },
      {
        id: 'u3-grammar',
        title: 'Articles: El, La, Un, Una',
        titleCatalan: 'Articles',
        icon: '📖',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'grammar',
          grammarLessonId: 'definite-articles',
          description: 'Definite and indefinite articles',
        },
      },
      {
        id: 'u3-practice',
        title: 'At the Café',
        titleCatalan: 'Al cafè',
        icon: '💬',
        estimatedMinutes: 8,
        xpReward: 25,
        content: {
          type: 'conversation',
          description: 'Order drinks and pay the bill',
        },
      },
    ],
  },
  {
    id: 'unit-4-wants',
    title: 'What would you like?',
    titleCatalan: 'Què vols?',
    description: 'Expressing wants and needs',
    level: 'A1',
    icon: '🍽️',
    color: 'from-rose-400 to-pink-500',
    prerequisites: ['unit-3-cafe'],
    milestoneTitle: 'Café Regular',
    courseUnit: 4,
    lessons: [
      {
        id: 'u4-vocab',
        title: 'Wants & Needs Vocabulary',
        titleCatalan: 'Vocabulari de desitjos',
        icon: '📚',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          unitNumber: 4,
          description: 'Learn to express what you want',
        },
      },
      {
        id: 'u4-grammar',
        title: 'Verb: Voler (to want)',
        titleCatalan: 'Verb: Voler',
        icon: '📖',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'grammar',
          grammarLessonId: 'present-tense-ar',
          description: 'Present tense conjugation of voler',
        },
      },
    ],
  },
  {
    id: 'unit-5-possessives',
    title: 'My mobile phone',
    titleCatalan: 'El meu mòbil',
    description: 'Possessives and personal belongings',
    level: 'A1',
    icon: '📱',
    color: 'from-violet-400 to-purple-500',
    prerequisites: ['unit-4-wants'],
    courseUnit: 5,
    lessons: [
      {
        id: 'u5-vocab',
        title: 'Possessives Vocabulary',
        titleCatalan: 'Vocabulari de possessius',
        icon: '📚',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          unitNumber: 5,
          description: 'My, your, his, her in Catalan',
        },
      },
      {
        id: 'u5-grammar',
        title: 'Possessive Adjectives',
        titleCatalan: 'Adjectius possessius',
        icon: '📖',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'grammar',
          grammarLessonId: 'possessive-adjectives',
          description: 'Meu/meva, teu/teva, seu/seva',
        },
      },
    ],
  },
  {
    id: 'unit-6-family',
    title: 'My family',
    titleCatalan: 'La meva família',
    description: 'Family members and relationships',
    level: 'A1',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-cyan-400 to-teal-500',
    prerequisites: ['unit-5-possessives'],
    milestoneTitle: 'Family Matters',
    courseUnit: 6,
    lessons: [
      {
        id: 'u6-vocab',
        title: 'Family Vocabulary',
        titleCatalan: 'Vocabulari de família',
        icon: '📚',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'vocabulary',
          unitNumber: 6,
          description: 'Parents, siblings, grandparents, and more',
        },
      },
      {
        id: 'u6-grammar',
        title: 'Plural Nouns',
        titleCatalan: 'Plurals',
        icon: '📖',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'grammar',
          grammarLessonId: 'plurals',
          description: 'How to form plural nouns in Catalan',
        },
      },
      {
        id: 'u6-practice',
        title: 'Describe Your Family',
        titleCatalan: 'Descriu la teva família',
        icon: '💬',
        estimatedMinutes: 8,
        xpReward: 25,
        content: {
          type: 'conversation',
          description: 'Talk about your family members',
        },
      },
    ],
  },
  {
    id: 'unit-7-directions',
    title: 'Where is the hotel?',
    titleCatalan: "Perdoni, on és l'hotel?",
    description: 'Asking for and giving directions',
    level: 'A1',
    icon: '🗺️',
    color: 'from-lime-400 to-green-500',
    prerequisites: ['unit-6-family'],
    courseUnit: 7,
    lessons: [
      {
        id: 'u7-vocab',
        title: 'Directions Vocabulary',
        titleCatalan: 'Vocabulari de direccions',
        icon: '📚',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          unitNumber: 7,
          description: 'Left, right, straight ahead, near, far',
        },
      },
      {
        id: 'u7-practice',
        title: 'Finding Your Way',
        titleCatalan: 'Trobar el camí',
        icon: '💬',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'conversation',
          description: 'Ask for and give directions',
        },
      },
    ],
  },
  {
    id: 'unit-8-numbers',
    title: 'What is your address?',
    titleCatalan: 'Quina és la teva adreça?',
    description: 'Numbers, addresses, and phone numbers',
    level: 'A1',
    icon: '🔢',
    color: 'from-sky-400 to-blue-500',
    prerequisites: ['unit-7-directions'],
    milestoneTitle: 'A1 Complete!',
    courseUnit: 8,
    lessons: [
      {
        id: 'u8-vocab',
        title: 'Numbers 1-100',
        titleCatalan: 'Nombres 1-100',
        icon: '📚',
        estimatedMinutes: 15,
        xpReward: 40,
        content: {
          type: 'vocabulary',
          unitNumber: 8,
          description: 'Master numbers from 1 to 100',
        },
      },
      {
        id: 'u8-practice',
        title: 'Phone Numbers & Addresses',
        titleCatalan: 'Telèfons i adreces',
        icon: '💬',
        estimatedMinutes: 8,
        xpReward: 25,
        content: {
          type: 'conversation',
          description: 'Exchange contact information',
        },
      },
    ],
  },

  // === A2 LEVEL: ELEMENTARY (Units 9-14) ===
  {
    id: 'unit-9-ramblas',
    title: 'A walk down the Ramblas',
    titleCatalan: 'Tot passejant per la Rambla',
    description: 'Describing places and expressing opinions',
    level: 'A2',
    icon: '🚶',
    color: 'from-emerald-500 to-teal-600',
    prerequisites: ['unit-8-numbers'],
    courseUnit: 9,
    lessons: [
      {
        id: 'u9-vocab',
        title: 'Places & Descriptions',
        titleCatalan: 'Llocs i descripcions',
        icon: '📚',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'vocabulary',
          unitNumber: 9,
          description: 'City places and adjectives',
        },
      },
      {
        id: 'u9-grammar',
        title: 'Adjective Agreement',
        titleCatalan: 'Concordança adjectius',
        icon: '📖',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'grammar',
          grammarLessonId: 'adjectives',
          description: 'How adjectives agree with nouns',
        },
      },
    ],
  },
  {
    id: 'unit-10-market',
    title: 'At the market',
    titleCatalan: 'Al Mercat de la Boqueria',
    description: 'Shopping for food at the market',
    level: 'A2',
    icon: '🛒',
    color: 'from-orange-500 to-red-500',
    prerequisites: ['unit-9-ramblas'],
    milestoneTitle: 'Market Expert',
    courseUnit: 10,
    lessons: [
      {
        id: 'u10-vocab',
        title: 'Food & Shopping',
        titleCatalan: 'Menjar i compres',
        icon: '📚',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'vocabulary',
          unitNumber: 10,
          description: 'Fruits, vegetables, meat, fish',
        },
      },
      {
        id: 'u10-practice',
        title: 'At the Market',
        titleCatalan: 'Al mercat',
        icon: '💬',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'conversation',
          description: 'Buy food and ask for prices',
        },
      },
    ],
  },
  {
    id: 'unit-11-preferences',
    title: 'How would you like them?',
    titleCatalan: 'Com els vol?',
    description: 'Expressing preferences and opinions',
    level: 'A2',
    icon: '👍',
    color: 'from-pink-500 to-rose-600',
    prerequisites: ['unit-10-market'],
    courseUnit: 11,
    lessons: [
      {
        id: 'u11-vocab',
        title: 'Preferences Vocabulary',
        titleCatalan: 'Vocabulari de preferències',
        icon: '📚',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          unitNumber: 11,
          description: 'Like, prefer, better, worse',
        },
      },
      {
        id: 'u11-grammar',
        title: 'Verb: Agradar (to like)',
        titleCatalan: 'Verb: Agradar',
        icon: '📖',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'grammar',
          grammarLessonId: 'agradar',
          description: 'How to say what you like in Catalan',
        },
      },
    ],
  },
  {
    id: 'unit-12-restaurant',
    title: 'At the restaurant',
    titleCatalan: 'Al restaurant',
    description: 'Dining out and ordering food',
    level: 'A2',
    icon: '🍽️',
    color: 'from-amber-500 to-yellow-600',
    prerequisites: ['unit-11-preferences'],
    milestoneTitle: 'Foodie',
    courseUnit: 12,
    lessons: [
      {
        id: 'u12-vocab',
        title: 'Restaurant Vocabulary',
        titleCatalan: 'Vocabulari del restaurant',
        icon: '📚',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'vocabulary',
          unitNumber: 12,
          description: 'Menu items, courses, ordering',
        },
      },
      {
        id: 'u12-practice',
        title: 'Ordering a Meal',
        titleCatalan: 'Demanar un àpat',
        icon: '💬',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'conversation',
          description: 'Complete restaurant dialogue',
        },
      },
    ],
  },
  {
    id: 'unit-13-daily-life',
    title: 'Daily life',
    titleCatalan: 'La vida diària',
    description: 'Daily routines and activities',
    level: 'A2',
    icon: '🌅',
    color: 'from-indigo-500 to-purple-600',
    prerequisites: ['unit-12-restaurant'],
    courseUnit: 13,
    lessons: [
      {
        id: 'u13-vocab',
        title: 'Daily Routine Vocabulary',
        titleCatalan: 'Vocabulari de rutina diària',
        icon: '📚',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'vocabulary',
          unitNumber: 13,
          description: 'Wake up, work, eat, sleep',
        },
      },
      {
        id: 'u13-grammar',
        title: 'Reflexive Verbs',
        titleCatalan: 'Verbs reflexius',
        icon: '📖',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'grammar',
          grammarLessonId: 'reflexive-verbs',
          description: 'Llevar-se, dutxar-se, etc.',
        },
      },
    ],
  },
  {
    id: 'unit-14-present-perfect',
    title: 'What have you done today?',
    titleCatalan: 'Què has fet avui?',
    description: 'Talking about recent events',
    level: 'A2',
    icon: '✅',
    color: 'from-teal-500 to-cyan-600',
    prerequisites: ['unit-13-daily-life'],
    milestoneTitle: 'A2 Complete!',
    courseUnit: 14,
    lessons: [
      {
        id: 'u14-vocab',
        title: 'Present Perfect Vocabulary',
        titleCatalan: 'Vocabulari del passat recent',
        icon: '📚',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          unitNumber: 14,
          description: 'Today, already, yet, never',
        },
      },
      {
        id: 'u14-grammar',
        title: 'Present Perfect Tense',
        titleCatalan: 'Pretèrit perfet',
        icon: '📖',
        estimatedMinutes: 15,
        xpReward: 40,
        content: {
          type: 'grammar',
          grammarLessonId: 'present-perfect',
          description: 'He anat, has fet, ha vist...',
        },
      },
    ],
  },

  // === B1 LEVEL: INTERMEDIATE (Units 15-18) ===
  {
    id: 'unit-15-conversation',
    title: 'After dinner talk',
    titleCatalan: 'La sobretaula',
    description: 'Casual conversation and expressing opinions',
    level: 'B1',
    icon: '💬',
    color: 'from-violet-600 to-purple-700',
    prerequisites: ['unit-14-present-perfect'],
    courseUnit: 15,
    lessons: [
      {
        id: 'u15-vocab',
        title: 'Opinion Vocabulary',
        titleCatalan: 'Vocabulari d\'opinions',
        icon: '📚',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          unitNumber: 15,
          description: 'Think, believe, agree, disagree',
        },
      },
      {
        id: 'u15-practice',
        title: 'Discussing Topics',
        titleCatalan: 'Discutir temes',
        icon: '💬',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'conversation',
          description: 'Practice expressing opinions',
        },
      },
    ],
  },
  {
    id: 'unit-16-past',
    title: 'What did you do?',
    titleCatalan: 'Què vas fer?',
    description: 'Talking about past events',
    level: 'B1',
    icon: '📅',
    color: 'from-blue-600 to-indigo-700',
    prerequisites: ['unit-15-conversation'],
    milestoneTitle: 'Time Traveler',
    courseUnit: 16,
    lessons: [
      {
        id: 'u16-vocab',
        title: 'Past Time Vocabulary',
        titleCatalan: 'Vocabulari del passat',
        icon: '📚',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          unitNumber: 16,
          description: 'Yesterday, last week, ago',
        },
      },
      {
        id: 'u16-grammar',
        title: 'Simple Past Tense',
        titleCatalan: 'Pretèrit indefinit',
        icon: '📖',
        estimatedMinutes: 15,
        xpReward: 40,
        content: {
          type: 'grammar',
          grammarLessonId: 'past-periphrastic',
          description: 'Vaig anar, vas fer, va veure...',
        },
      },
    ],
  },
  {
    id: 'unit-17-weather',
    title: 'What will the weather be like?',
    titleCatalan: 'Quin temps farà?',
    description: 'Weather and future plans',
    level: 'B1',
    icon: '🌤️',
    color: 'from-sky-600 to-blue-700',
    prerequisites: ['unit-16-past'],
    courseUnit: 17,
    lessons: [
      {
        id: 'u17-vocab',
        title: 'Weather Vocabulary',
        titleCatalan: 'Vocabulari del temps',
        icon: '📚',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          unitNumber: 17,
          description: 'Sun, rain, hot, cold, seasons',
        },
      },
      {
        id: 'u17-grammar',
        title: 'Future Tense',
        titleCatalan: 'Futur',
        icon: '📖',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'grammar',
          grammarLessonId: 'future-tense',
          description: 'Aniré, faré, seré...',
        },
      },
    ],
  },
  {
    id: 'unit-18-information',
    title: 'Could you give me information?',
    titleCatalan: 'Em podria donar informació?',
    description: 'Polite requests and formal language',
    level: 'B1',
    icon: 'ℹ️',
    color: 'from-emerald-600 to-teal-700',
    prerequisites: ['unit-17-weather'],
    courseUnit: 18,
    lessons: [
      {
        id: 'u18-vocab',
        title: 'Formal Request Vocabulary',
        titleCatalan: 'Vocabulari formal',
        icon: '📚',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          unitNumber: 18,
          description: 'Polite phrases and formal language',
        },
      },
      {
        id: 'u18-grammar',
        title: 'Conditional Tense',
        titleCatalan: 'Condicional',
        icon: '📖',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'grammar',
          grammarLessonId: 'conditional-mood',
          description: 'Podria, voldria, seria...',
        },
      },
    ],
  },

  // === B1+ LEVEL: UPPER INTERMEDIATE (Units 19-20) ===
  {
    id: 'unit-19-transport',
    title: 'Public transport',
    titleCatalan: 'El transport públic',
    description: 'Getting around by public transport',
    level: 'B1',
    icon: '🚇',
    color: 'from-slate-600 to-gray-700',
    prerequisites: ['unit-18-information'],
    milestoneTitle: 'City Navigator',
    courseUnit: 19,
    lessons: [
      {
        id: 'u19-vocab',
        title: 'Transport Vocabulary',
        titleCatalan: 'Vocabulari de transport',
        icon: '📚',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'vocabulary',
          unitNumber: 19,
          description: 'Train, bus, metro, tickets',
        },
      },
      {
        id: 'u19-practice',
        title: 'Buying Tickets',
        titleCatalan: 'Comprar bitllets',
        icon: '💬',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'conversation',
          description: 'Navigate the transport system',
        },
      },
    ],
  },
  {
    id: 'unit-20-culture',
    title: 'Festival!',
    titleCatalan: 'Festa major!',
    description: 'Catalan culture and celebrations',
    level: 'B1',
    icon: '🎉',
    color: 'from-red-600 to-orange-600',
    prerequisites: ['unit-19-transport'],
    milestoneTitle: 'Course Complete!',
    courseUnit: 20,
    lessons: [
      {
        id: 'u20-vocab',
        title: 'Culture & Festivals',
        titleCatalan: 'Cultura i festes',
        icon: '📚',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'vocabulary',
          unitNumber: 20,
          description: 'Traditions, celebrations, music',
        },
      },
      {
        id: 'u20-culture',
        title: 'Catalan Traditions',
        titleCatalan: 'Tradicions catalanes',
        icon: '🏰',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'culture',
          description: 'Learn about castells, sardana, and more',
        },
      },
      {
        id: 'u20-review',
        title: 'Final Review',
        titleCatalan: 'Repàs final',
        icon: '🏆',
        estimatedMinutes: 15,
        xpReward: 50,
        content: {
          type: 'review',
          description: 'Review everything you have learned',
        },
      },
    ],
  },
];

// PLACEMENT TEST QUESTIONS
export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // A1 Questions
  {
    id: 'p1',
    level: 'A1',
    type: 'vocabulary',
    question: 'How do you say "hello" in Catalan?',
    options: ['Adéu', 'Hola', 'Gràcies', 'Sisplau'],
    correctAnswer: 'Hola',
  },
  {
    id: 'p2',
    level: 'A1',
    type: 'vocabulary',
    question: 'What does "gràcies" mean?',
    options: ['Please', 'Sorry', 'Thank you', 'Goodbye'],
    correctAnswer: 'Thank you',
  },
  {
    id: 'p3',
    level: 'A1',
    type: 'grammar',
    question: 'Complete: "Jo ___ català" (I am Catalan)',
    options: ['és', 'som', 'sóc', 'ets'],
    correctAnswer: 'sóc',
  },
  {
    id: 'p4',
    level: 'A1',
    type: 'vocabulary',
    question: 'How do you say "coffee" in Catalan?',
    options: ['Te', 'Cafè', 'Aigua', 'Llet'],
    correctAnswer: 'Cafè',
  },
  // A2 Questions
  {
    id: 'p5',
    level: 'A2',
    type: 'grammar',
    question: 'Complete: "M\'___ la paella" (I like paella)',
    options: ['agrado', 'agrada', 'agraden', 'agradi'],
    correctAnswer: 'agrada',
  },
  {
    id: 'p6',
    level: 'A2',
    type: 'vocabulary',
    question: 'What does "mercat" mean?',
    options: ['Restaurant', 'Market', 'Shop', 'Street'],
    correctAnswer: 'Market',
  },
  {
    id: 'p7',
    level: 'A2',
    type: 'grammar',
    question: 'Complete: "Avui he ___ al mercat" (Today I went to the market)',
    options: ['anar', 'anat', 'anant', 'vaig'],
    correctAnswer: 'anat',
  },
  {
    id: 'p8',
    level: 'A2',
    type: 'vocabulary',
    question: 'How do you say "I wake up" in Catalan?',
    options: ['Em dutxo', 'Em llevo', 'Dormo', 'Treballo'],
    correctAnswer: 'Em llevo',
  },
  // B1 Questions
  {
    id: 'p9',
    level: 'B1',
    type: 'grammar',
    question: 'Complete: "Ahir ___ anar al cinema" (Yesterday I went to the cinema)',
    options: ['he', 'vaig', 'vull', 'sóc'],
    correctAnswer: 'vaig',
  },
  {
    id: 'p10',
    level: 'B1',
    type: 'grammar',
    question: 'How do you say "I will go" in Catalan?',
    options: ['Vaig anar', 'He anat', 'Aniré', 'Anava'],
    correctAnswer: 'Aniré',
  },
  {
    id: 'p11',
    level: 'B1',
    type: 'vocabulary',
    question: 'What does "potser" mean?',
    options: ['Always', 'Never', 'Perhaps', 'Often'],
    correctAnswer: 'Perhaps',
  },
  {
    id: 'p12',
    level: 'B1',
    type: 'grammar',
    question: 'Complete: "___ venir demà?" (Could you come tomorrow?)',
    options: ['Pot', 'Pots', 'Podries', 'Puguis'],
    correctAnswer: 'Podries',
  },
  // B2 Questions
  {
    id: 'p13',
    level: 'B2',
    type: 'grammar',
    question: 'Which is correct for "If I had time..."?',
    options: ['Si tinc temps...', 'Si tingués temps...', 'Si tindré temps...', 'Si he tingut temps...'],
    correctAnswer: 'Si tingués temps...',
  },
  {
    id: 'p14',
    level: 'B2',
    type: 'vocabulary',
    question: 'What does "malgrat" mean?',
    options: ['Because', 'Although', 'Therefore', 'However'],
    correctAnswer: 'Although',
  },
  {
    id: 'p15',
    level: 'B2',
    type: 'grammar',
    question: 'Complete: "Espero que ___ bé" (I hope you are well)',
    options: ['estàs', 'estiguis', 'estaràs', 'estaves'],
    correctAnswer: 'estiguis',
  },
  {
    id: 'p16',
    level: 'B2',
    type: 'vocabulary',
    question: 'What is "desenvolupament"?',
    options: ['Development', 'Entertainment', 'Achievement', 'Movement'],
    correctAnswer: 'Development',
  },
];

// Helper functions
export function getUnitById(unitId: string): CurriculumUnit | undefined {
  return CURRICULUM_UNITS.find((u) => u.id === unitId);
}

export function getUnitForLesson(lessonId: string): CurriculumUnit | undefined {
  return CURRICULUM_UNITS.find((u) => u.lessons.some((l) => l.id === lessonId));
}

export function getUnitsByLevel(level: CEFRLevel): CurriculumUnit[] {
  return CURRICULUM_UNITS.filter((u) => u.level === level);
}

export function getTotalLessons(): number {
  return CURRICULUM_UNITS.reduce((sum, unit) => sum + unit.lessons.length, 0);
}

export function getUnitByCourseNumber(courseUnit: number): CurriculumUnit | undefined {
  return CURRICULUM_UNITS.find((u) => u.courseUnit === courseUnit);
}
