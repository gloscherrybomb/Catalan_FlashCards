// Curriculum Data for Structured Learning Path

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface LessonContent {
  type: 'vocabulary' | 'grammar' | 'conversation' | 'culture';
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

// CURRICULUM UNITS
export const CURRICULUM_UNITS: CurriculumUnit[] = [
  // === A1 LEVEL: BASICS ===
  {
    id: 'a1-greetings',
    title: 'First Words',
    titleCatalan: 'Primeres Paraules',
    description: 'Learn essential greetings and introductions',
    level: 'A1',
    icon: '👋',
    color: 'from-emerald-400 to-teal-500',
    prerequisites: [],
    milestoneTitle: 'First Steps',
    lessons: [
      {
        id: 'a1-greetings-1',
        title: 'Hello & Goodbye',
        titleCatalan: 'Hola i Adéu',
        icon: '🤝',
        estimatedMinutes: 5,
        xpReward: 20,
        content: {
          type: 'vocabulary',
          cardCategories: ['Greetings'],
          description: 'Master basic greetings like hola, bon dia, adéu',
        },
      },
      {
        id: 'a1-greetings-2',
        title: 'How Are You?',
        titleCatalan: 'Com estàs?',
        icon: '😊',
        estimatedMinutes: 5,
        xpReward: 20,
        content: {
          type: 'vocabulary',
          cardCategories: ['Greetings'],
          description: 'Learn to ask and respond about well-being',
        },
      },
      {
        id: 'a1-greetings-3',
        title: 'My Name Is...',
        titleCatalan: 'Em dic...',
        icon: '🏷️',
        estimatedMinutes: 8,
        xpReward: 30,
        content: {
          type: 'conversation',
          description: 'Introduce yourself and ask others\' names',
        },
      },
    ],
  },
  {
    id: 'a1-numbers',
    title: 'Numbers',
    titleCatalan: 'Els Nombres',
    description: 'Count from 1 to 100 and beyond',
    level: 'A1',
    icon: '🔢',
    color: 'from-blue-400 to-indigo-500',
    prerequisites: ['a1-greetings'],
    lessons: [
      {
        id: 'a1-numbers-1',
        title: 'Numbers 1-20',
        titleCatalan: 'Nombres 1-20',
        icon: '1️⃣',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          cardCategories: ['Numbers'],
          description: 'Learn to count from one to twenty',
        },
      },
      {
        id: 'a1-numbers-2',
        title: 'Numbers 21-100',
        titleCatalan: 'Nombres 21-100',
        icon: '💯',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'vocabulary',
          cardCategories: ['Numbers'],
          description: 'Master larger numbers and patterns',
        },
      },
      {
        id: 'a1-numbers-3',
        title: 'Phone & Prices',
        titleCatalan: 'Telèfons i Preus',
        icon: '📱',
        estimatedMinutes: 8,
        xpReward: 25,
        content: {
          type: 'conversation',
          description: 'Use numbers in real situations',
        },
      },
    ],
  },
  {
    id: 'a1-articles',
    title: 'The & A',
    titleCatalan: 'Els Articles',
    description: 'Master definite and indefinite articles',
    level: 'A1',
    icon: '📰',
    color: 'from-amber-400 to-orange-500',
    prerequisites: ['a1-greetings'],
    lessons: [
      {
        id: 'a1-articles-1',
        title: 'The (el, la, els, les)',
        titleCatalan: 'El, la, els, les',
        icon: '📌',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'grammar',
          grammarLessonId: 'definite-articles',
          description: 'Learn when to use each definite article',
        },
      },
      {
        id: 'a1-articles-2',
        title: 'A/An (un, una)',
        titleCatalan: 'Un, una, uns, unes',
        icon: '✨',
        estimatedMinutes: 8,
        xpReward: 25,
        content: {
          type: 'grammar',
          grammarLessonId: 'indefinite-articles',
          description: 'Master indefinite articles',
        },
      },
      {
        id: 'a1-articles-3',
        title: 'Personal Articles',
        titleCatalan: 'En i Na',
        icon: '👤',
        estimatedMinutes: 6,
        xpReward: 20,
        content: {
          type: 'grammar',
          grammarLessonId: 'personal-articles',
          description: 'Learn this uniquely Catalan feature',
        },
      },
    ],
  },
  {
    id: 'a1-family',
    title: 'Family',
    titleCatalan: 'La Família',
    description: 'Talk about your family members',
    level: 'A1',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-pink-400 to-rose-500',
    prerequisites: ['a1-articles'],
    lessons: [
      {
        id: 'a1-family-1',
        title: 'Immediate Family',
        titleCatalan: 'Família Directa',
        icon: '🏠',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          cardCategories: ['Family'],
          description: 'Parents, siblings, and children',
        },
      },
      {
        id: 'a1-family-2',
        title: 'Extended Family',
        titleCatalan: 'Família Extensa',
        icon: '👴',
        estimatedMinutes: 8,
        xpReward: 25,
        content: {
          type: 'vocabulary',
          cardCategories: ['Family'],
          description: 'Grandparents, aunts, uncles, and cousins',
        },
      },
      {
        id: 'a1-family-3',
        title: 'Talking About Family',
        titleCatalan: 'Parlar de Família',
        icon: '💬',
        estimatedMinutes: 10,
        xpReward: 35,
        content: {
          type: 'conversation',
          description: 'Describe your family in conversations',
        },
      },
    ],
  },
  {
    id: 'a1-verbs-basics',
    title: 'To Be',
    titleCatalan: 'Ser i Estar',
    description: 'Master the two verbs meaning "to be"',
    level: 'A1',
    icon: '⚖️',
    color: 'from-violet-400 to-purple-500',
    prerequisites: ['a1-family'],
    milestoneTitle: 'Grammar Foundations',
    lessons: [
      {
        id: 'a1-verbs-1',
        title: 'Ser vs Estar',
        titleCatalan: 'Ser i Estar',
        icon: '🎭',
        estimatedMinutes: 15,
        xpReward: 50,
        content: {
          type: 'grammar',
          grammarLessonId: 'ser-vs-estar',
          description: 'The essential distinction every learner needs',
        },
      },
      {
        id: 'a1-verbs-2',
        title: 'Practice: Ser',
        titleCatalan: 'Practicar: Ser',
        icon: '🏋️',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'grammar',
          description: 'Drill ser conjugations and uses',
        },
      },
      {
        id: 'a1-verbs-3',
        title: 'Practice: Estar',
        titleCatalan: 'Practicar: Estar',
        icon: '🎯',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'grammar',
          description: 'Drill estar conjugations and uses',
        },
      },
    ],
  },
  {
    id: 'a1-colors',
    title: 'Colors',
    titleCatalan: 'Els Colors',
    description: 'Learn colors and how they agree with nouns',
    level: 'A1',
    icon: '🎨',
    color: 'from-red-400 to-pink-500',
    prerequisites: ['a1-articles'],
    lessons: [
      {
        id: 'a1-colors-1',
        title: 'Basic Colors',
        titleCatalan: 'Colors Bàsics',
        icon: '🌈',
        estimatedMinutes: 8,
        xpReward: 25,
        content: {
          type: 'vocabulary',
          cardCategories: ['Colors'],
          description: 'Red, blue, green, and more',
        },
      },
      {
        id: 'a1-colors-2',
        title: 'Color Agreement',
        titleCatalan: 'Concordança',
        icon: '✅',
        estimatedMinutes: 10,
        xpReward: 35,
        content: {
          type: 'grammar',
          description: 'How colors change with gender/number',
        },
      },
    ],
  },
  {
    id: 'a1-food',
    title: 'Food & Drink',
    titleCatalan: 'Menjar i Beure',
    description: 'Essential vocabulary for eating out',
    level: 'A1',
    icon: '🍽️',
    color: 'from-yellow-400 to-amber-500',
    prerequisites: ['a1-numbers'],
    lessons: [
      {
        id: 'a1-food-1',
        title: 'Common Foods',
        titleCatalan: 'Menjar Comú',
        icon: '🥖',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'vocabulary',
          cardCategories: ['Food'],
          description: 'Bread, meat, vegetables, fruits',
        },
      },
      {
        id: 'a1-food-2',
        title: 'Drinks',
        titleCatalan: 'Begudes',
        icon: '🥤',
        estimatedMinutes: 8,
        xpReward: 25,
        content: {
          type: 'vocabulary',
          cardCategories: ['Food'],
          description: 'Water, coffee, wine, and more',
        },
      },
      {
        id: 'a1-food-3',
        title: 'At a Restaurant',
        titleCatalan: 'Al Restaurant',
        icon: '🍴',
        estimatedMinutes: 12,
        xpReward: 40,
        content: {
          type: 'conversation',
          description: 'Order food and ask for the bill',
        },
      },
    ],
  },
  {
    id: 'a1-time',
    title: 'Time & Days',
    titleCatalan: 'Temps i Dies',
    description: 'Tell time and talk about schedules',
    level: 'A1',
    icon: '⏰',
    color: 'from-cyan-400 to-blue-500',
    prerequisites: ['a1-numbers'],
    milestoneTitle: 'A1 Complete!',
    lessons: [
      {
        id: 'a1-time-1',
        title: 'Days of the Week',
        titleCatalan: 'Dies de la Setmana',
        icon: '📅',
        estimatedMinutes: 8,
        xpReward: 25,
        content: {
          type: 'vocabulary',
          cardCategories: ['Time'],
          description: 'Monday through Sunday',
        },
      },
      {
        id: 'a1-time-2',
        title: 'Months & Seasons',
        titleCatalan: 'Mesos i Estacions',
        icon: '🗓️',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          cardCategories: ['Time'],
          description: 'All twelve months and four seasons',
        },
      },
      {
        id: 'a1-time-3',
        title: 'Telling Time',
        titleCatalan: 'Dir l\'Hora',
        icon: '🕐',
        estimatedMinutes: 12,
        xpReward: 40,
        content: {
          type: 'conversation',
          description: 'What time is it? At what time?',
        },
      },
    ],
  },

  // === A2 LEVEL: EXPANDING ===
  {
    id: 'a2-verbs-regular',
    title: 'Regular Verbs',
    titleCatalan: 'Verbs Regulars',
    description: 'Master the three verb conjugation patterns',
    level: 'A2',
    icon: '📖',
    color: 'from-emerald-500 to-green-600',
    prerequisites: ['a1-verbs-basics'],
    lessons: [
      {
        id: 'a2-verbs-1',
        title: '-AR Verbs',
        titleCatalan: 'Verbs en -AR',
        icon: '🔤',
        estimatedMinutes: 12,
        xpReward: 40,
        content: {
          type: 'grammar',
          grammarLessonId: 'present-tense-ar',
          description: 'The most common verb pattern',
        },
      },
      {
        id: 'a2-verbs-2',
        title: '-ER/-RE Verbs',
        titleCatalan: 'Verbs en -ER/-RE',
        icon: '📚',
        estimatedMinutes: 15,
        xpReward: 45,
        content: {
          type: 'grammar',
          grammarLessonId: 'present-tense-er-re',
          description: 'Second and third conjugation',
        },
      },
      {
        id: 'a2-verbs-3',
        title: '-IR Verbs',
        titleCatalan: 'Verbs en -IR',
        icon: '📝',
        estimatedMinutes: 12,
        xpReward: 40,
        content: {
          type: 'grammar',
          description: 'Complete the verb pattern trio',
        },
      },
    ],
  },
  {
    id: 'a2-places',
    title: 'Places & Directions',
    titleCatalan: 'Llocs i Direccions',
    description: 'Navigate cities and find your way',
    level: 'A2',
    icon: '🗺️',
    color: 'from-blue-500 to-indigo-600',
    prerequisites: ['a1-time'],
    lessons: [
      {
        id: 'a2-places-1',
        title: 'In the City',
        titleCatalan: 'A la Ciutat',
        icon: '🏙️',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'vocabulary',
          cardCategories: ['Places'],
          description: 'Shops, streets, landmarks',
        },
      },
      {
        id: 'a2-places-2',
        title: 'Giving Directions',
        titleCatalan: 'Donar Direccions',
        icon: '🧭',
        estimatedMinutes: 15,
        xpReward: 45,
        content: {
          type: 'conversation',
          description: 'Left, right, straight ahead',
        },
      },
      {
        id: 'a2-places-3',
        title: 'Public Transport',
        titleCatalan: 'Transport Públic',
        icon: '🚇',
        estimatedMinutes: 10,
        xpReward: 35,
        content: {
          type: 'vocabulary',
          cardCategories: ['Travel'],
          description: 'Metro, bus, train vocabulary',
        },
      },
    ],
  },
  {
    id: 'a2-weather',
    title: 'Weather',
    titleCatalan: 'El Temps',
    description: 'Discuss the weather in Catalonia',
    level: 'A2',
    icon: '☀️',
    color: 'from-amber-500 to-orange-600',
    prerequisites: ['a1-time'],
    lessons: [
      {
        id: 'a2-weather-1',
        title: 'Weather Words',
        titleCatalan: 'Paraules del Temps',
        icon: '🌤️',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'vocabulary',
          cardCategories: ['Weather'],
          description: 'Sun, rain, clouds, wind',
        },
      },
      {
        id: 'a2-weather-2',
        title: 'Weather Expressions',
        titleCatalan: 'Expressions del Temps',
        icon: '💨',
        estimatedMinutes: 10,
        xpReward: 35,
        content: {
          type: 'conversation',
          description: 'Fa fred, fa calor, plou...',
        },
      },
    ],
  },
  {
    id: 'a2-pronouns',
    title: 'Pronouns',
    titleCatalan: 'Els Pronoms',
    description: 'Subject, object, and reflexive pronouns',
    level: 'A2',
    icon: '👥',
    color: 'from-violet-500 to-purple-600',
    prerequisites: ['a2-verbs-regular'],
    milestoneTitle: 'Pronoun Master',
    lessons: [
      {
        id: 'a2-pronouns-1',
        title: 'Subject Pronouns',
        titleCatalan: 'Pronoms Subjecte',
        icon: '👤',
        estimatedMinutes: 8,
        xpReward: 25,
        content: {
          type: 'grammar',
          grammarLessonId: 'pronouns-subject',
          description: 'I, you, he, she, we, they',
        },
      },
      {
        id: 'a2-pronouns-2',
        title: 'Direct Object Pronouns',
        titleCatalan: 'Pronoms CD',
        icon: '🎯',
        estimatedMinutes: 15,
        xpReward: 45,
        content: {
          type: 'grammar',
          description: 'Me, you, him, her, it, us, them',
        },
      },
      {
        id: 'a2-pronouns-3',
        title: 'Reflexive Pronouns',
        titleCatalan: 'Pronoms Reflexius',
        icon: '🔄',
        estimatedMinutes: 12,
        xpReward: 40,
        content: {
          type: 'grammar',
          description: 'Myself, yourself, etc.',
        },
      },
    ],
  },
  {
    id: 'a2-daily-routines',
    title: 'Daily Routines',
    titleCatalan: 'Rutines Diàries',
    description: 'Describe your typical day',
    level: 'A2',
    icon: '📋',
    color: 'from-pink-500 to-rose-600',
    prerequisites: ['a2-pronouns'],
    milestoneTitle: 'A2 Complete!',
    lessons: [
      {
        id: 'a2-routines-1',
        title: 'Morning Routine',
        titleCatalan: 'Rutina del Matí',
        icon: '🌅',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'vocabulary',
          cardCategories: ['Daily Life'],
          description: 'Wake up, shower, breakfast',
        },
      },
      {
        id: 'a2-routines-2',
        title: 'Work & Study',
        titleCatalan: 'Treball i Estudi',
        icon: '💼',
        estimatedMinutes: 12,
        xpReward: 35,
        content: {
          type: 'vocabulary',
          cardCategories: ['Daily Life'],
          description: 'Work, meetings, classes',
        },
      },
      {
        id: 'a2-routines-3',
        title: 'Evening Activities',
        titleCatalan: 'Activitats del Vespre',
        icon: '🌙',
        estimatedMinutes: 10,
        xpReward: 30,
        content: {
          type: 'conversation',
          description: 'Dinner, hobbies, bedtime',
        },
      },
    ],
  },

  // === B1 LEVEL: INTERMEDIATE ===
  {
    id: 'b1-past-tense',
    title: 'Past Tenses',
    titleCatalan: 'El Passat',
    description: 'Talk about what happened',
    level: 'B1',
    icon: '⏮️',
    color: 'from-emerald-600 to-teal-700',
    prerequisites: ['a2-verbs-regular'],
    lessons: [
      {
        id: 'b1-past-1',
        title: 'Periphrastic Past',
        titleCatalan: 'Passat Perifràstic',
        icon: '📖',
        estimatedMinutes: 20,
        xpReward: 60,
        content: {
          type: 'grammar',
          description: 'The most common past tense: vaig + infinitive',
        },
      },
      {
        id: 'b1-past-2',
        title: 'Imperfect Tense',
        titleCatalan: 'L\'Imperfet',
        icon: '🔄',
        estimatedMinutes: 18,
        xpReward: 55,
        content: {
          type: 'grammar',
          description: 'Describing ongoing past actions',
        },
      },
      {
        id: 'b1-past-3',
        title: 'Past vs Imperfect',
        titleCatalan: 'Passat vs Imperfet',
        icon: '⚖️',
        estimatedMinutes: 15,
        xpReward: 50,
        content: {
          type: 'grammar',
          description: 'When to use each tense',
        },
      },
    ],
  },
  {
    id: 'b1-opinions',
    title: 'Opinions & Feelings',
    titleCatalan: 'Opinions i Sentiments',
    description: 'Express what you think and feel',
    level: 'B1',
    icon: '💭',
    color: 'from-blue-600 to-indigo-700',
    prerequisites: ['a2-daily-routines'],
    lessons: [
      {
        id: 'b1-opinions-1',
        title: 'I Think That...',
        titleCatalan: 'Penso que...',
        icon: '🧠',
        estimatedMinutes: 12,
        xpReward: 40,
        content: {
          type: 'conversation',
          description: 'Crec que, penso que, em sembla que',
        },
      },
      {
        id: 'b1-opinions-2',
        title: 'Emotions',
        titleCatalan: 'Emocions',
        icon: '😊',
        estimatedMinutes: 15,
        xpReward: 45,
        content: {
          type: 'vocabulary',
          cardCategories: ['Feelings'],
          description: 'Happy, sad, angry, surprised',
        },
      },
      {
        id: 'b1-opinions-3',
        title: 'Agreeing & Disagreeing',
        titleCatalan: 'Estar d\'acord',
        icon: '🤝',
        estimatedMinutes: 12,
        xpReward: 40,
        content: {
          type: 'conversation',
          description: 'Phrases for discussion',
        },
      },
    ],
  },
  {
    id: 'b1-culture',
    title: 'Catalan Culture',
    titleCatalan: 'Cultura Catalana',
    description: 'Traditions, festivals, and customs',
    level: 'B1',
    icon: '🎭',
    color: 'from-rose-600 to-red-700',
    prerequisites: ['a2-daily-routines'],
    milestoneTitle: 'Cultural Explorer',
    lessons: [
      {
        id: 'b1-culture-1',
        title: 'Festivals',
        titleCatalan: 'Festes',
        icon: '🎉',
        estimatedMinutes: 15,
        xpReward: 45,
        content: {
          type: 'culture',
          description: 'Sant Jordi, La Mercè, Castells',
        },
      },
      {
        id: 'b1-culture-2',
        title: 'Catalan Traditions',
        titleCatalan: 'Tradicions',
        icon: '🏰',
        estimatedMinutes: 12,
        xpReward: 40,
        content: {
          type: 'culture',
          description: 'Sardana, Caganer, Tió de Nadal',
        },
      },
      {
        id: 'b1-culture-3',
        title: 'Regional Variations',
        titleCatalan: 'Varietats Regionals',
        icon: '🗺️',
        estimatedMinutes: 10,
        xpReward: 35,
        content: {
          type: 'culture',
          description: 'Dialects across Catalan Countries',
        },
      },
    ],
  },
  {
    id: 'b1-future',
    title: 'Future Tense',
    titleCatalan: 'El Futur',
    description: 'Talk about plans and predictions',
    level: 'B1',
    icon: '🔮',
    color: 'from-purple-600 to-violet-700',
    prerequisites: ['b1-past-tense'],
    milestoneTitle: 'B1 Complete!',
    lessons: [
      {
        id: 'b1-future-1',
        title: 'Simple Future',
        titleCatalan: 'Futur Simple',
        icon: '⏭️',
        estimatedMinutes: 15,
        xpReward: 50,
        content: {
          type: 'grammar',
          description: 'Parlaré, menjaré, viuré',
        },
      },
      {
        id: 'b1-future-2',
        title: 'Going To...',
        titleCatalan: 'Anar a + infinitiu',
        icon: '🚶',
        estimatedMinutes: 12,
        xpReward: 40,
        content: {
          type: 'grammar',
          description: 'Immediate future plans',
        },
      },
      {
        id: 'b1-future-3',
        title: 'Future Plans',
        titleCatalan: 'Plans de Futur',
        icon: '📅',
        estimatedMinutes: 12,
        xpReward: 45,
        content: {
          type: 'conversation',
          description: 'Discussing upcoming events',
        },
      },
    ],
  },

  // === B2 LEVEL: UPPER INTERMEDIATE ===
  {
    id: 'b2-subjunctive',
    title: 'Subjunctive Mood',
    titleCatalan: 'El Subjuntiu',
    description: 'Express wishes, doubts, and emotions',
    level: 'B2',
    icon: '🌀',
    color: 'from-emerald-700 to-green-800',
    prerequisites: ['b1-future'],
    lessons: [
      {
        id: 'b2-subj-1',
        title: 'Present Subjunctive',
        titleCatalan: 'Subjuntiu Present',
        icon: '📝',
        estimatedMinutes: 25,
        xpReward: 75,
        content: {
          type: 'grammar',
          description: 'Formation and basic uses',
        },
      },
      {
        id: 'b2-subj-2',
        title: 'Subjunctive Triggers',
        titleCatalan: 'Quan usar-lo',
        icon: '🎯',
        estimatedMinutes: 20,
        xpReward: 60,
        content: {
          type: 'grammar',
          description: 'Verbs and phrases that require subjunctive',
        },
      },
      {
        id: 'b2-subj-3',
        title: 'Imperfect Subjunctive',
        titleCatalan: 'Subjuntiu Imperfet',
        icon: '⏮️',
        estimatedMinutes: 20,
        xpReward: 65,
        content: {
          type: 'grammar',
          description: 'Past subjunctive forms',
        },
      },
    ],
  },
  {
    id: 'b2-idioms',
    title: 'Idioms & Expressions',
    titleCatalan: 'Expressions Idiomàtiques',
    description: 'Sound like a native speaker',
    level: 'B2',
    icon: '💎',
    color: 'from-blue-700 to-indigo-800',
    prerequisites: ['b1-opinions'],
    milestoneTitle: 'Idiom Expert',
    lessons: [
      {
        id: 'b2-idioms-1',
        title: 'Common Idioms',
        titleCatalan: 'Frases Fetes',
        icon: '🗣️',
        estimatedMinutes: 15,
        xpReward: 50,
        content: {
          type: 'vocabulary',
          description: 'Everyday idiomatic expressions',
        },
      },
      {
        id: 'b2-idioms-2',
        title: 'Proverbs',
        titleCatalan: 'Refranys',
        icon: '📜',
        estimatedMinutes: 12,
        xpReward: 45,
        content: {
          type: 'culture',
          description: 'Traditional Catalan wisdom',
        },
      },
      {
        id: 'b2-idioms-3',
        title: 'Slang & Colloquial',
        titleCatalan: 'Argot',
        icon: '🆒',
        estimatedMinutes: 15,
        xpReward: 50,
        content: {
          type: 'conversation',
          description: 'Informal everyday speech',
        },
      },
    ],
  },
  {
    id: 'b2-advanced-verbs',
    title: 'Advanced Verbs',
    titleCatalan: 'Verbs Avançats',
    description: 'Conditional, passive, and more',
    level: 'B2',
    icon: '🎓',
    color: 'from-violet-700 to-purple-800',
    prerequisites: ['b2-subjunctive'],
    milestoneTitle: 'B2 Complete!',
    lessons: [
      {
        id: 'b2-adv-1',
        title: 'Conditional Mood',
        titleCatalan: 'El Condicional',
        icon: '❓',
        estimatedMinutes: 18,
        xpReward: 55,
        content: {
          type: 'grammar',
          description: 'Would + verb expressions',
        },
      },
      {
        id: 'b2-adv-2',
        title: 'Passive Voice',
        titleCatalan: 'Veu Passiva',
        icon: '🔄',
        estimatedMinutes: 15,
        xpReward: 50,
        content: {
          type: 'grammar',
          description: 'How things are done',
        },
      },
      {
        id: 'b2-adv-3',
        title: 'Reported Speech',
        titleCatalan: 'Estil Indirecte',
        icon: '💬',
        estimatedMinutes: 18,
        xpReward: 55,
        content: {
          type: 'grammar',
          description: 'He said that, she told me',
        },
      },
    ],
  },
];

// PLACEMENT TEST QUESTIONS
export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // A1 Level Questions
  {
    id: 'p1',
    level: 'A1',
    type: 'vocabulary',
    question: 'How do you say "Hello" in Catalan?',
    options: ['Adéu', 'Hola', 'Gràcies', 'Perdó'],
    correctAnswer: 'Hola',
  },
  {
    id: 'p2',
    level: 'A1',
    type: 'grammar',
    question: 'Complete: ___ taula és gran. (The table is big)',
    options: ['El', 'La', 'Un', 'Les'],
    correctAnswer: 'La',
    categoryHint: 'articles',
  },
  {
    id: 'p3',
    level: 'A1',
    type: 'vocabulary',
    question: 'What number is "vint-i-cinc"?',
    options: ['15', '25', '35', '52'],
    correctAnswer: '25',
    categoryHint: 'numbers',
  },
  {
    id: 'p4',
    level: 'A1',
    type: 'grammar',
    question: 'Which verb means "I am" (permanent state)?',
    options: ['Estic', 'Sóc', 'Tinc', 'Vaig'],
    correctAnswer: 'Sóc',
  },
  {
    id: 'p5',
    level: 'A1',
    type: 'vocabulary',
    question: 'What is "germà" in English?',
    options: ['Sister', 'Brother', 'Cousin', 'Uncle'],
    correctAnswer: 'Brother',
    categoryHint: 'family',
  },

  // A2 Level Questions
  {
    id: 'p6',
    level: 'A2',
    type: 'grammar',
    question: 'Complete: Nosaltres ___ català. (We speak Catalan)',
    options: ['parlo', 'parles', 'parlem', 'parlen'],
    correctAnswer: 'parlem',
  },
  {
    id: 'p7',
    level: 'A2',
    type: 'vocabulary',
    question: 'What is "a l\'esquerra"?',
    options: ['To the right', 'To the left', 'Straight ahead', 'Behind'],
    correctAnswer: 'To the left',
    categoryHint: 'directions',
  },
  {
    id: 'p8',
    level: 'A2',
    type: 'grammar',
    question: 'Which is the correct reflexive: ___ desperto a les 7.',
    options: ['Me', 'Em', 'Et', 'Es'],
    correctAnswer: 'Em',
  },
  {
    id: 'p9',
    level: 'A2',
    type: 'vocabulary',
    question: 'What does "fa fred" mean?',
    options: ['It\'s hot', 'It\'s cold', 'It\'s windy', 'It\'s raining'],
    correctAnswer: 'It\'s cold',
    categoryHint: 'weather',
  },
  {
    id: 'p10',
    level: 'A2',
    type: 'grammar',
    question: 'Complete: El veig ___. (I see him every day)',
    options: ['cada dia', 'ahir', 'demà', 'mai'],
    correctAnswer: 'cada dia',
  },

  // B1 Level Questions
  {
    id: 'p11',
    level: 'B1',
    type: 'grammar',
    question: 'How do you say "I went" using periphrastic past?',
    options: ['Anava', 'Vaig anar', 'Aniré', 'Vaig'],
    correctAnswer: 'Vaig anar',
  },
  {
    id: 'p12',
    level: 'B1',
    type: 'vocabulary',
    question: 'What is "Sant Jordi"?',
    options: ['Christmas', 'Easter', 'Catalan Valentine\'s Day with books', 'New Year'],
    correctAnswer: 'Catalan Valentine\'s Day with books',
    categoryHint: 'culture',
  },
  {
    id: 'p13',
    level: 'B1',
    type: 'grammar',
    question: 'Complete: Quan era petit, ___ molt. (When I was little, I played a lot)',
    options: ['jugo', 'vaig jugar', 'jugava', 'jugaré'],
    correctAnswer: 'jugava',
  },
  {
    id: 'p14',
    level: 'B1',
    type: 'grammar',
    question: 'How do you say "I will speak"?',
    options: ['Parlo', 'Parlava', 'Vaig parlar', 'Parlaré'],
    correctAnswer: 'Parlaré',
  },
  {
    id: 'p15',
    level: 'B1',
    type: 'vocabulary',
    question: 'What does "estic d\'acord" mean?',
    options: ['I disagree', 'I agree', 'I don\'t know', 'I think so'],
    correctAnswer: 'I agree',
  },

  // B2 Level Questions
  {
    id: 'p16',
    level: 'B2',
    type: 'grammar',
    question: 'Complete: Vull que ___ aquí. (I want you to come here)',
    options: ['véns', 'vinguis', 'vindrà', 'venia'],
    correctAnswer: 'vinguis',
  },
  {
    id: 'p17',
    level: 'B2',
    type: 'vocabulary',
    question: 'What does "fer el mus" mean?',
    options: ['To make music', 'To pout/sulk', 'To exercise', 'To cook'],
    correctAnswer: 'To pout/sulk',
    categoryHint: 'idioms',
  },
  {
    id: 'p18',
    level: 'B2',
    type: 'grammar',
    question: 'Complete: Si tingués temps, ___. (If I had time, I would go)',
    options: ['vaig', 'aniré', 'aniria', 'vaig anar'],
    correctAnswer: 'aniria',
  },
  {
    id: 'p19',
    level: 'B2',
    type: 'grammar',
    question: 'How do you say "The book was written by Mercè Rodoreda"?',
    options: [
      'El llibre va escriure Mercè Rodoreda',
      'El llibre va ser escrit per Mercè Rodoreda',
      'Mercè Rodoreda escriu el llibre',
      'El llibre escriurà Mercè Rodoreda',
    ],
    correctAnswer: 'El llibre va ser escrit per Mercè Rodoreda',
  },
  {
    id: 'p20',
    level: 'B2',
    type: 'grammar',
    question: 'Complete: Em va dir que ___ demà. (She told me she would come tomorrow)',
    options: ['ve', 'vindrà', 'vindria', 'vingui'],
    correctAnswer: 'vindria',
  },
];

// Helper functions
export function getUnitsByLevel(level: CEFRLevel): CurriculumUnit[] {
  return CURRICULUM_UNITS.filter(u => u.level === level);
}

export function getUnitById(id: string): CurriculumUnit | undefined {
  return CURRICULUM_UNITS.find(u => u.id === id);
}

export function getLessonById(lessonId: string): CurriculumLesson | undefined {
  for (const unit of CURRICULUM_UNITS) {
    const lesson = unit.lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getUnitForLesson(lessonId: string): CurriculumUnit | undefined {
  return CURRICULUM_UNITS.find(unit =>
    unit.lessons.some(l => l.id === lessonId)
  );
}

export function getTotalLessons(): number {
  return CURRICULUM_UNITS.reduce((acc, unit) => acc + unit.lessons.length, 0);
}

export function getTotalXP(): number {
  return CURRICULUM_UNITS.reduce(
    (acc, unit) => acc + unit.lessons.reduce((a, l) => a + l.xpReward, 0),
    0
  );
}
