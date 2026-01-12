// Conversation service for AI-powered Catalan conversation practice

export interface ConversationScenario {
  id: string;
  title: string;
  titleCatalan: string;
  description: string;
  icon: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  category: 'daily-life' | 'travel' | 'shopping' | 'dining' | 'social' | 'work';
  starterPrompt: string;
  starterPromptEnglish: string;
  suggestedResponses: string[];
  keyVocabulary: { catalan: string; english: string }[];
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
  type: 'grammar' | 'spelling' | 'word-choice' | 'accent';
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  corrections?: GrammarCorrection[];
  newVocabulary?: { catalan: string; english: string }[];
  timestamp: Date;
}

export interface ConversationContext {
  scenarioId: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  messages: ConversationMessage[];
  startedAt: Date;
}

// Pre-defined conversation scenarios
export const SCENARIOS: ConversationScenario[] = [
  {
    id: 'restaurant-order',
    title: 'At the Restaurant',
    titleCatalan: 'Al restaurant',
    description: 'Practice ordering food and drinks at a Catalan restaurant',
    icon: '🍽️',
    level: 'A1',
    category: 'dining',
    starterPrompt: 'Bona tarda! Benvinguts al restaurant. Què voleu per beure?',
    starterPromptEnglish: 'Good afternoon! Welcome to the restaurant. What would you like to drink?',
    suggestedResponses: [
      'Vull una aigua, si us plau.',
      'Una cervesa, si us plau.',
      'Té vi negre?',
    ],
    keyVocabulary: [
      { catalan: 'la carta', english: 'the menu' },
      { catalan: 'el compte', english: 'the bill' },
      { catalan: 'si us plau', english: 'please' },
      { catalan: 'gràcies', english: 'thank you' },
    ],
  },
  {
    id: 'market-shopping',
    title: 'At the Market',
    titleCatalan: 'Al mercat',
    description: 'Buy fruits, vegetables and more at a local market',
    icon: '🥬',
    level: 'A1',
    category: 'shopping',
    starterPrompt: 'Bon dia! Què li poso avui?',
    starterPromptEnglish: 'Good morning! What can I get for you today?',
    suggestedResponses: [
      'Voldria mig quilo de tomàquets.',
      'Quant costen les taronges?',
      'Té pomes?',
    ],
    keyVocabulary: [
      { catalan: 'un quilo', english: 'one kilo' },
      { catalan: 'quant costa?', english: 'how much does it cost?' },
      { catalan: 'fresc/fresca', english: 'fresh' },
    ],
  },
  {
    id: 'asking-directions',
    title: 'Asking for Directions',
    titleCatalan: 'Demanar indicacions',
    description: 'Learn to ask for and understand directions',
    icon: '🗺️',
    level: 'A2',
    category: 'travel',
    starterPrompt: 'Hola! Et puc ajudar? Sembla que estàs perdut.',
    starterPromptEnglish: 'Hello! Can I help you? You seem lost.',
    suggestedResponses: [
      'Sí, busco la plaça Catalunya.',
      'On és l\'estació de metro més propera?',
      'Com puc arribar a la platja?',
    ],
    keyVocabulary: [
      { catalan: 'gira a la dreta', english: 'turn right' },
      { catalan: 'gira a l\'esquerra', english: 'turn left' },
      { catalan: 'tot recte', english: 'straight ahead' },
      { catalan: 'a prop', english: 'nearby' },
    ],
  },
  {
    id: 'hotel-checkin',
    title: 'Hotel Check-in',
    titleCatalan: 'Registre a l\'hotel',
    description: 'Check into a hotel and ask about amenities',
    icon: '🏨',
    level: 'A2',
    category: 'travel',
    starterPrompt: 'Benvingut a l\'Hotel Barcelona! Té una reserva?',
    starterPromptEnglish: 'Welcome to Hotel Barcelona! Do you have a reservation?',
    suggestedResponses: [
      'Sí, tinc una reserva a nom de...',
      'Voldria una habitació doble.',
      'A quina hora és l\'esmorzar?',
    ],
    keyVocabulary: [
      { catalan: 'la clau', english: 'the key' },
      { catalan: 'l\'habitació', english: 'the room' },
      { catalan: 'l\'ascensor', english: 'the elevator' },
    ],
  },
  {
    id: 'making-friends',
    title: 'Making New Friends',
    titleCatalan: 'Fer nous amics',
    description: 'Practice small talk and getting to know someone',
    icon: '👋',
    level: 'A2',
    category: 'social',
    starterPrompt: 'Hola! Em dic Maria. D\'on ets?',
    starterPromptEnglish: 'Hello! My name is Maria. Where are you from?',
    suggestedResponses: [
      'Hola Maria! Sóc de...',
      'Encant de conèixer-te!',
      'Què fas a Barcelona?',
    ],
    keyVocabulary: [
      { catalan: 'encant de conèixer-te', english: 'nice to meet you' },
      { catalan: 'què tal?', english: 'how are you?' },
      { catalan: 'd\'on ets?', english: 'where are you from?' },
    ],
  },
  {
    id: 'doctor-visit',
    title: 'At the Doctor\'s',
    titleCatalan: 'A la consulta del metge',
    description: 'Describe symptoms and understand medical advice',
    icon: '🏥',
    level: 'B1',
    category: 'daily-life',
    starterPrompt: 'Bon dia. Què li passa? Com es troba?',
    starterPromptEnglish: 'Good morning. What\'s wrong? How are you feeling?',
    suggestedResponses: [
      'Em fa mal el cap.',
      'Tinc febre des d\'ahir.',
      'Em trobo marejat/da.',
    ],
    keyVocabulary: [
      { catalan: 'em fa mal...', english: 'my ... hurts' },
      { catalan: 'tinc febre', english: 'I have a fever' },
      { catalan: 'la recepta', english: 'the prescription' },
    ],
  },
  {
    id: 'job-interview',
    title: 'Job Interview',
    titleCatalan: 'Entrevista de feina',
    description: 'Practice answering common interview questions',
    icon: '💼',
    level: 'B1',
    category: 'work',
    starterPrompt: 'Bon dia, sisplau, segui. Parli\'m una mica de vostè.',
    starterPromptEnglish: 'Good morning, please sit down. Tell me a bit about yourself.',
    suggestedResponses: [
      'Tinc experiència en...',
      'He treballat durant cinc anys a...',
      'M\'agradaria aprendre més sobre...',
    ],
    keyVocabulary: [
      { catalan: 'l\'experiència', english: 'experience' },
      { catalan: 'els estudis', english: 'studies/education' },
      { catalan: 'el sou', english: 'salary' },
    ],
  },
  {
    id: 'free-chat',
    title: 'Free Conversation',
    titleCatalan: 'Conversa lliure',
    description: 'Practice open-ended conversation on any topic',
    icon: '💬',
    level: 'B2',
    category: 'social',
    starterPrompt: 'Hola! De què t\'agradaria parlar avui?',
    starterPromptEnglish: 'Hello! What would you like to talk about today?',
    suggestedResponses: [
      'M\'agradaria parlar sobre...',
      'Què opines de...?',
      'Podries explicar-me sobre...?',
    ],
    keyVocabulary: [
      { catalan: 'opino que...', english: 'I think that...' },
      { catalan: 'estic d\'acord', english: 'I agree' },
      { catalan: 'no estic d\'acord', english: 'I disagree' },
    ],
  },
];

// Pre-scripted responses for demo mode (no AI backend)
const SCRIPTED_RESPONSES: Record<string, Record<string, { response: string; translation: string }[]>> = {
  'restaurant-order': {
    'default': [
      {
        response: 'Molt bé. I per menjar, què voleu? Avui tenim peix fresc i paella.',
        translation: 'Very good. And to eat, what would you like? Today we have fresh fish and paella.',
      },
      {
        response: 'La paella és per a dues persones. També tenim tapes si preferiu.',
        translation: 'The paella is for two people. We also have tapas if you prefer.',
      },
      {
        response: 'Excel·lent elecció! Els hi porto de seguida. Volen res més?',
        translation: 'Excellent choice! I\'ll bring it right away. Would you like anything else?',
      },
      {
        response: 'Aquí tenen el compte. Han estat 25 euros. Acceptem targeta o efectiu.',
        translation: 'Here\'s the bill. It was 25 euros. We accept card or cash.',
      },
    ],
  },
  'market-shopping': {
    'default': [
      {
        response: 'Sí, tinc tomàquets molt frescos avui. Quants en vol?',
        translation: 'Yes, I have very fresh tomatoes today. How many do you want?',
      },
      {
        response: 'Les taronges són a 2 euros el quilo. Són de València, molt dolces!',
        translation: 'The oranges are 2 euros per kilo. They\'re from Valencia, very sweet!',
      },
      {
        response: 'Miri, també tinc fruita molt bona: pomes, peres i préssecs.',
        translation: 'Look, I also have very good fruit: apples, pears and peaches.',
      },
    ],
  },
  'asking-directions': {
    'default': [
      {
        response: 'Ah, la plaça Catalunya! Segueix tot recte per aquest carrer i després gira a la dreta.',
        translation: 'Ah, Plaça Catalunya! Go straight down this street and then turn right.',
      },
      {
        response: 'L\'estació de metro és a uns 5 minuts caminant. Baixa per aquelles escales.',
        translation: 'The metro station is about 5 minutes walking. Go down those stairs.',
      },
      {
        response: 'La platja és una mica lluny. Pots agafar el metro línia 4, direcció Barceloneta.',
        translation: 'The beach is a bit far. You can take metro line 4, direction Barceloneta.',
      },
    ],
  },
  'hotel-checkin': {
    'default': [
      {
        response: 'Deixi\'m mirar... Sí, aquí la tinc. Habitació 302, al tercer pis.',
        translation: 'Let me check... Yes, here it is. Room 302, on the third floor.',
      },
      {
        response: 'L\'esmorzar és de 7 a 10 al menjador del primer pis. Inclou buffet complet.',
        translation: 'Breakfast is from 7 to 10 in the dining room on the first floor. It includes full buffet.',
      },
      {
        response: 'Aquí té la clau. Si necessita alguna cosa, truqui a recepció.',
        translation: 'Here\'s your key. If you need anything, call reception.',
      },
    ],
  },
  'making-friends': {
    'default': [
      {
        response: 'Ah, molt bé! I què et porta a Barcelona? Estudis o feina?',
        translation: 'Ah, great! And what brings you to Barcelona? Studies or work?',
      },
      {
        response: 'Jo sóc de Girona però visc aquí fa 5 anys. M\'encanta la ciutat!',
        translation: 'I\'m from Girona but I\'ve lived here for 5 years. I love the city!',
      },
      {
        response: 'Fas alguna cosa aquest cap de setmana? Podríem prendre un cafè!',
        translation: 'Are you doing anything this weekend? We could have a coffee!',
      },
    ],
  },
  'doctor-visit': {
    'default': [
      {
        response: 'Entenc. Des de quan té aquests símptomes? Ha pres alguna cosa?',
        translation: 'I understand. Since when have you had these symptoms? Have you taken anything?',
      },
      {
        response: 'Deixi\'m examinar-lo. Respiri profundament, si us plau.',
        translation: 'Let me examine you. Breathe deeply, please.',
      },
      {
        response: 'No és greu. Li recepto un medicament. Prengui\'l dos cops al dia durant una setmana.',
        translation: 'It\'s not serious. I\'ll prescribe a medication. Take it twice a day for a week.',
      },
    ],
  },
  'job-interview': {
    'default': [
      {
        response: 'Molt interessant. Per què vol treballar amb nosaltres?',
        translation: 'Very interesting. Why do you want to work with us?',
      },
      {
        response: 'Quins són els seus punts forts? I alguna àrea que voldria millorar?',
        translation: 'What are your strengths? And any area you\'d like to improve?',
      },
      {
        response: 'Té alguna pregunta sobre la posició o l\'empresa?',
        translation: 'Do you have any questions about the position or the company?',
      },
    ],
  },
  'free-chat': {
    'default': [
      {
        response: 'Què interessant! Pots explicar-me més sobre això?',
        translation: 'How interesting! Can you tell me more about that?',
      },
      {
        response: 'Jo també penso que és important. Quin és el teu punt de vista?',
        translation: 'I also think it\'s important. What\'s your point of view?',
      },
      {
        response: 'M\'agrada parlar amb tu. Tens alguna altra cosa que vulguis comentar?',
        translation: 'I enjoy talking with you. Is there anything else you\'d like to discuss?',
      },
    ],
  },
};

// Analyze user input for common errors (simplified)
export function analyzeGrammar(input: string): GrammarCorrection[] {
  const corrections: GrammarCorrection[] = [];
  const lowerInput = input.toLowerCase();

  // Common error patterns
  const patterns = [
    {
      pattern: /\bjo tinc\b/i,
      correction: 'tinc',
      explanation: 'In Catalan, the subject pronoun "jo" is often omitted when it\'s clear from context.',
      type: 'grammar' as const,
    },
    {
      pattern: /\besta\b/i,
      correction: 'està',
      explanation: 'The verb "estar" in third person is "està" with an accent on the final "a".',
      type: 'accent' as const,
    },
    {
      pattern: /\bvol (.*?)\?$/i,
      correction: 'Vols $1?',
      explanation: 'Use "vols" (informal) when speaking to friends, "vol" is formal.',
      type: 'word-choice' as const,
    },
    {
      pattern: /\bmucho\b/i,
      correction: 'molt',
      explanation: '"Mucho" is Spanish. In Catalan, use "molt" for "very" or "much".',
      type: 'word-choice' as const,
    },
    {
      pattern: /\bpuedo\b/i,
      correction: 'puc',
      explanation: '"Puedo" is Spanish. In Catalan, "I can" is "puc".',
      type: 'word-choice' as const,
    },
    {
      pattern: /\bgracias\b/i,
      correction: 'gràcies',
      explanation: '"Gracias" is Spanish. In Catalan, "thank you" is "gràcies".',
      type: 'spelling' as const,
    },
  ];

  for (const { pattern, correction, explanation, type } of patterns) {
    const match = lowerInput.match(pattern);
    if (match) {
      corrections.push({
        original: match[0],
        corrected: correction.replace('$1', match[1] || ''),
        explanation,
        type,
      });
    }
  }

  return corrections;
}

// Get scenario by ID
export function getScenarioById(id: string): ConversationScenario | undefined {
  return SCENARIOS.find(s => s.id === id);
}

// Get scenarios by level
export function getScenariosByLevel(level: 'A1' | 'A2' | 'B1' | 'B2'): ConversationScenario[] {
  return SCENARIOS.filter(s => s.level === level);
}

// Generate a response (using scripted responses for demo)
export function generateResponse(
  scenarioId: string,
  messageIndex: number
): { response: string; translation: string } {
  const scenarioResponses = SCRIPTED_RESPONSES[scenarioId]?.default || SCRIPTED_RESPONSES['free-chat'].default;
  const index = messageIndex % scenarioResponses.length;
  return scenarioResponses[index];
}

// Create a new conversation context
export function startConversation(scenarioId: string): ConversationContext {
  const scenario = getScenarioById(scenarioId);
  const initialMessage: ConversationMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: scenario?.starterPrompt || 'Hola! Com et puc ajudar?',
    translation: scenario?.starterPromptEnglish,
    timestamp: new Date(),
  };

  return {
    scenarioId,
    level: scenario?.level || 'A1',
    messages: [initialMessage],
    startedAt: new Date(),
  };
}

// Process user message and generate response
export function processUserMessage(
  context: ConversationContext,
  userMessage: string
): { userMsg: ConversationMessage; assistantMsg: ConversationMessage } {
  // Analyze grammar
  const corrections = analyzeGrammar(userMessage);

  // Create user message
  const userMsg: ConversationMessage = {
    id: crypto.randomUUID(),
    role: 'user',
    content: userMessage,
    corrections: corrections.length > 0 ? corrections : undefined,
    timestamp: new Date(),
  };

  // Generate assistant response
  const responseIndex = Math.floor(context.messages.length / 2);
  const { response, translation } = generateResponse(context.scenarioId, responseIndex);

  const assistantMsg: ConversationMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: response,
    translation,
    timestamp: new Date(),
  };

  return { userMsg, assistantMsg };
}
