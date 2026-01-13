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

// Keyword-based response system for contextually aware conversations
interface KeywordResponse {
  keywords: string[];
  response: string;
  translation: string;
}

interface ScenarioResponses {
  keywordResponses: KeywordResponse[];
  fallbackResponses: { response: string; translation: string }[];
}

// Pre-scripted responses organized by keywords for context-aware matching
const SCENARIO_RESPONSES: Record<string, ScenarioResponses> = {
  'restaurant-order': {
    keywordResponses: [
      // Drinks
      { keywords: ['aigua', 'water'], response: 'Perfecte, una aigua. Fresca o del temps?', translation: 'Perfect, a water. Cold or room temperature?' },
      { keywords: ['cervesa', 'beer'], response: 'Molt bé, una cervesa fresca. Tenim Estrella o Moritz.', translation: 'Very good, a cold beer. We have Estrella or Moritz.' },
      { keywords: ['vi', 'wine', 'negre', 'blanc'], response: 'Tenim vi negre de la Rioja i blanc de Penedès. Quin preferiu?', translation: 'We have red wine from Rioja and white from Penedès. Which do you prefer?' },
      { keywords: ['refresc', 'cola', 'suc'], response: 'Tenim Coca-Cola, Fanta i suc de taronja natural.', translation: 'We have Coca-Cola, Fanta and fresh orange juice.' },
      // Food
      { keywords: ['paella'], response: 'La paella és excel·lent! És per a dues persones mínim. La volen amb marisc o mixta?', translation: 'The paella is excellent! It\'s for two people minimum. Would you like it with seafood or mixed?' },
      { keywords: ['peix', 'fish'], response: 'El peix del dia és lluç a la planxa amb patates. Molt recomanable!', translation: 'Today\'s fish is grilled hake with potatoes. Highly recommended!' },
      { keywords: ['carn', 'meat', 'bistec'], response: 'Tenim bistec amb patates fregides o costelles a la brasa.', translation: 'We have steak with fries or grilled ribs.' },
      { keywords: ['tapes', 'tapas'], response: 'Les tapes més populars són les patates braves, el pa amb tomàquet i les croquetes.', translation: 'The most popular tapas are patatas bravas, bread with tomato and croquettes.' },
      { keywords: ['carta', 'menu'], response: 'Aquí té la carta. Avui recomanem el peix fresc i la paella.', translation: 'Here\'s the menu. Today we recommend the fresh fish and paella.' },
      // Bill/Payment
      { keywords: ['compte', 'bill', 'pagar'], response: 'El compte són 28 euros. Acceptem efectiu o targeta.', translation: 'The bill is 28 euros. We accept cash or card.' },
      { keywords: ['targeta', 'card'], response: 'Sí, acceptem targeta. Aquí té el datàfon.', translation: 'Yes, we accept card. Here\'s the card reader.' },
      // Thanks/Farewell
      { keywords: ['gràcies', 'gracies', 'thanks'], response: 'De res! Ha estat un plaer. Tornin aviat!', translation: 'You\'re welcome! It was a pleasure. Come back soon!' },
      { keywords: ['adéu', 'adeu', 'goodbye'], response: 'Adéu! Que vagi bé!', translation: 'Goodbye! Take care!' },
    ],
    fallbackResponses: [
      { response: 'Molt bé. I per menjar, què voleu? Avui tenim peix fresc i paella.', translation: 'Very good. And to eat, what would you like? Today we have fresh fish and paella.' },
      { response: 'Excel·lent elecció! Els hi porto de seguida. Volen res més?', translation: 'Excellent choice! I\'ll bring it right away. Would you like anything else?' },
      { response: 'Perfecte! Alguna altra cosa?', translation: 'Perfect! Anything else?' },
    ],
  },
  'market-shopping': {
    keywordResponses: [
      // Specific fruits/vegetables
      { keywords: ['poma', 'pomes', 'apple'], response: 'Les pomes són molt fresques, de Lleida! A 1,80 el quilo. Quantes en vol?', translation: 'The apples are very fresh, from Lleida! 1.80 per kilo. How many do you want?' },
      { keywords: ['taronja', 'taronges', 'orange'], response: 'Les taronges són de València, molt dolces! A 2 euros el quilo.', translation: 'The oranges are from Valencia, very sweet! 2 euros per kilo.' },
      { keywords: ['tomàquet', 'tomaquet', 'tomato'], response: 'Els tomàquets són de l\'hort, molt madurs! A 2,50 el quilo.', translation: 'The tomatoes are from the garden, very ripe! 2.50 per kilo.' },
      { keywords: ['pera', 'peres', 'pear'], response: 'Les peres Conference són delicioses! A 2,20 el quilo.', translation: 'The Conference pears are delicious! 2.20 per kilo.' },
      { keywords: ['préssec', 'pressec', 'peach'], response: 'Els préssecs són de temporada, molt sucosos! A 3 euros el quilo.', translation: 'The peaches are in season, very juicy! 3 euros per kilo.' },
      { keywords: ['plàtan', 'platan', 'banana'], response: 'Els plàtans són de Canàries! A 1,50 el quilo.', translation: 'The bananas are from the Canary Islands! 1.50 per kilo.' },
      { keywords: ['enciam', 'lettuce', 'amanida'], response: 'L\'enciam és molt fresc, perfecte per amanida! A 1 euro la peça.', translation: 'The lettuce is very fresh, perfect for salad! 1 euro each.' },
      { keywords: ['ceba', 'onion'], response: 'Les cebes són bones per cuinar! A 1,20 el quilo.', translation: 'The onions are good for cooking! 1.20 per kilo.' },
      { keywords: ['patata', 'potato'], response: 'Les patates són de Galícia, excel·lents! A 1 euro el quilo.', translation: 'The potatoes are from Galicia, excellent! 1 euro per kilo.' },
      // Quantities
      { keywords: ['quilo', 'kilo', 'mig'], response: 'Cap problema! Aquí té. Res més?', translation: 'No problem! Here you go. Anything else?' },
      { keywords: ['quant costa', 'quant costen', 'preu', 'price'], response: 'Deixi\'m mirar... Tot plegat són 5,50 euros.', translation: 'Let me see... All together it\'s 5.50 euros.' },
      // General
      { keywords: ['fruita', 'fruit'], response: 'Tenim fruita molt bona avui: pomes, taronges, peres i préssecs.', translation: 'We have very good fruit today: apples, oranges, pears and peaches.' },
      { keywords: ['verdura', 'vegetable'], response: 'Tenim tomàquets, enciams, cebes i patates, tot molt fresc!', translation: 'We have tomatoes, lettuce, onions and potatoes, all very fresh!' },
      { keywords: ['fresc', 'fresh'], response: 'Tot és del dia! Arriba cada matí de l\'hort.', translation: 'Everything is fresh today! It arrives every morning from the garden.' },
      // Thanks/Farewell
      { keywords: ['gràcies', 'gracies', 'thanks'], response: 'De res! Que vagi bé! Fins demà!', translation: 'You\'re welcome! Take care! See you tomorrow!' },
      { keywords: ['adéu', 'adeu', 'goodbye'], response: 'Adéu! Torni quan vulgui!', translation: 'Goodbye! Come back anytime!' },
    ],
    fallbackResponses: [
      { response: 'Què més li poso? Tinc fruita i verdura molt fresca avui.', translation: 'What else can I get you? I have very fresh fruit and vegetables today.' },
      { response: 'Miri, també tinc ofertes avui. Quina fruita li agrada?', translation: 'Look, I also have offers today. What fruit do you like?' },
      { response: 'Molt bé! Alguna cosa més?', translation: 'Very good! Anything else?' },
    ],
  },
  'asking-directions': {
    keywordResponses: [
      // Locations
      { keywords: ['plaça catalunya', 'placa catalunya'], response: 'La plaça Catalunya és a 10 minuts. Segueix tot recte i després gira a l\'esquerra.', translation: 'Plaça Catalunya is 10 minutes away. Go straight and then turn left.' },
      { keywords: ['metro', 'estació'], response: 'L\'estació de metro més propera és a 200 metres. Baixa per aquell carrer.', translation: 'The nearest metro station is 200 meters away. Go down that street.' },
      { keywords: ['platja', 'beach'], response: 'La platja és a uns 20 minuts caminant. Pots agafar el metro línia 4.', translation: 'The beach is about 20 minutes walking. You can take metro line 4.' },
      { keywords: ['rambla', 'ramblas'], response: 'Les Rambles són per allà! Baixa tot recte uns 5 minuts.', translation: 'Las Ramblas are that way! Go straight down for about 5 minutes.' },
      { keywords: ['sagrada familia', 'sagrada'], response: 'La Sagrada Família és una mica lluny. Millor agafa el metro línia 5.', translation: 'The Sagrada Família is a bit far. Better take metro line 5.' },
      { keywords: ['hospital', 'farmàcia', 'farmacia'], response: 'Hi ha una farmàcia aquí a prop, gira a la dreta al següent carrer.', translation: 'There\'s a pharmacy nearby, turn right at the next street.' },
      // Direction questions
      { keywords: ['on és', 'on es', 'where'], response: 'Depèn d\'on vols anar. Quin lloc busques exactament?', translation: 'It depends on where you want to go. What place are you looking for exactly?' },
      { keywords: ['com puc arribar', 'how', 'arrive'], response: 'Pots anar caminant o amb transport públic. Què prefereixes?', translation: 'You can walk or take public transport. What do you prefer?' },
      { keywords: ['lluny', 'far', 'prop', 'near'], response: 'No és gaire lluny, uns 10 minuts caminant.', translation: 'It\'s not too far, about 10 minutes walking.' },
      // Thanks
      { keywords: ['gràcies', 'gracies', 'thanks'], response: 'De res! Bon viatge!', translation: 'You\'re welcome! Have a good trip!' },
    ],
    fallbackResponses: [
      { response: 'Cap on vols anar? Et puc ajudar a trobar el camí.', translation: 'Where do you want to go? I can help you find the way.' },
      { response: 'Segueix tot recte i pregunta si et perds, la gent és molt amable!', translation: 'Go straight and ask if you get lost, people are very friendly!' },
      { response: 'Aquesta zona és fàcil de navegar. Tens el mòbil per mirar el mapa?', translation: 'This area is easy to navigate. Do you have your phone to check the map?' },
    ],
  },
  'hotel-checkin': {
    keywordResponses: [
      // Reservation
      { keywords: ['reserva', 'reservation', 'booking'], response: 'Deixi\'m comprovar... Sí, aquí la tinc! Habitació 205, al segon pis.', translation: 'Let me check... Yes, here it is! Room 205, on the second floor.' },
      { keywords: ['nom', 'name'], response: 'Perfecte, trobo la reserva. Necessito el seu passaport o DNI, si us plau.', translation: 'Perfect, I found the reservation. I need your passport or ID, please.' },
      // Room types
      { keywords: ['habitació doble', 'habitacio doble', 'double'], response: 'Tenim habitacions dobles amb vistes al mar o a la ciutat. Quina prefereix?', translation: 'We have double rooms with sea or city views. Which do you prefer?' },
      { keywords: ['habitació individual', 'habitacio individual', 'single'], response: 'L\'habitació individual és al tercer pis, molt tranquil·la.', translation: 'The single room is on the third floor, very quiet.' },
      // Amenities
      { keywords: ['esmorzar', 'breakfast'], response: 'L\'esmorzar és de 7 a 10:30 al restaurant del primer pis. Inclou buffet complet!', translation: 'Breakfast is from 7 to 10:30 in the restaurant on the first floor. Includes full buffet!' },
      { keywords: ['wifi', 'internet'], response: 'El WiFi és gratuït. La contrasenya és "hotelbarcelona2024".', translation: 'WiFi is free. The password is "hotelbarcelona2024".' },
      { keywords: ['piscina', 'pool'], response: 'La piscina és a la terrassa, oberta de 9 a 21h.', translation: 'The pool is on the terrace, open from 9am to 9pm.' },
      { keywords: ['gimnàs', 'gimnas', 'gym'], response: 'El gimnàs és al soterrani, obert les 24 hores.', translation: 'The gym is in the basement, open 24 hours.' },
      // Keys/Room
      { keywords: ['clau', 'key'], response: 'Aquí té la clau de l\'habitació. L\'ascensor és per allà.', translation: 'Here\'s your room key. The elevator is that way.' },
      { keywords: ['ascensor', 'elevator'], response: 'L\'ascensor és al final del passadís a la dreta.', translation: 'The elevator is at the end of the corridor on the right.' },
      // Checkout
      { keywords: ['sortida', 'checkout'], response: 'La sortida és abans de les 12 del migdia. Pot deixar les maletes a recepció si vol.', translation: 'Checkout is before noon. You can leave your luggage at reception if you want.' },
      // Thanks
      { keywords: ['gràcies', 'gracies', 'thanks'], response: 'De res! Que gaudeixi de l\'estada!', translation: 'You\'re welcome! Enjoy your stay!' },
    ],
    fallbackResponses: [
      { response: 'Necessita alguna cosa més? Estem aquí per ajudar-lo.', translation: 'Do you need anything else? We\'re here to help you.' },
      { response: 'Si té cap pregunta durant l\'estada, truqui a recepció.', translation: 'If you have any questions during your stay, call reception.' },
      { response: 'Espero que gaudeixi de l\'estada!', translation: 'I hope you enjoy your stay!' },
    ],
  },
  'making-friends': {
    keywordResponses: [
      // Origins
      { keywords: ['anglès', 'angles', 'english', 'anglaterra', 'uk'], response: 'Ah, d\'Anglaterra! M\'encanta Londres. Has visitat Barcelona abans?', translation: 'Ah, from England! I love London. Have you visited Barcelona before?' },
      { keywords: ['americà', 'america', 'estats units', 'usa'], response: 'Genial! D\'on dels Estats Units? Tinc família a Nova York.', translation: 'Great! Where in the US? I have family in New York.' },
      { keywords: ['alemany', 'alemanya', 'germany'], response: 'Oh, Alemanya! M\'agrada molt Berlín. Parles una mica de català?', translation: 'Oh, Germany! I really like Berlin. Do you speak a bit of Catalan?' },
      { keywords: ['francès', 'frança', 'france'], response: 'Ah, França! Sou veïns nostres! El català i el francès tenen coses en comú.', translation: 'Ah, France! You\'re our neighbors! Catalan and French have things in common.' },
      // Activities
      { keywords: ['estudis', 'estudiar', 'universitat', 'study'], response: 'Què estudies? Barcelona té molt bones universitats.', translation: 'What do you study? Barcelona has very good universities.' },
      { keywords: ['feina', 'treballar', 'work'], response: 'I de què treballes? Hi ha molta feina a Barcelona en tecnologia.', translation: 'And what do you work in? There\'s a lot of work in Barcelona in tech.' },
      { keywords: ['turisme', 'vacances', 'tourist', 'holiday'], response: 'Genial! Quants dies et quedes? Et puc recomanar llocs!', translation: 'Great! How many days are you staying? I can recommend places!' },
      // Interests
      { keywords: ['futbol', 'barça', 'barcelona fc'], response: 'Ets del Barça? Jo també! Has anat al Camp Nou?', translation: 'Are you a Barça fan? Me too! Have you been to Camp Nou?' },
      { keywords: ['platja', 'beach', 'mar'], response: 'T\'agrada la platja? La Barceloneta és molt bona, però hi ha platges més tranquil·les al nord.', translation: 'Do you like the beach? Barceloneta is very good, but there are quieter beaches to the north.' },
      { keywords: ['menjar', 'menjar', 'food', 'restaurant'], response: 'El menjar català és increïble! Has provat la paella o el pa amb tomàquet?', translation: 'Catalan food is amazing! Have you tried paella or bread with tomato?' },
      // Social
      { keywords: ['cafè', 'cafe', 'coffee'], response: 'Sí! Conec un cafè molt bonic al Born. Anem-hi!', translation: 'Yes! I know a very nice café in El Born. Let\'s go!' },
      { keywords: ['cap de setmana', 'weekend'], response: 'Podríem quedar! T\'agrada sortir de festa o prefereixes plans més tranquils?', translation: 'We could hang out! Do you like going out partying or prefer quieter plans?' },
      { keywords: ['telèfon', 'whatsapp', 'number'], response: 'Clar! Et passo el meu WhatsApp i quedem un dia!', translation: 'Sure! I\'ll give you my WhatsApp and we\'ll meet up one day!' },
      // General responses
      { keywords: ['encantat', 'nice to meet'], response: 'Igualment! M\'alegro de conèixer-te. D\'on ets exactament?', translation: 'Likewise! I\'m glad to meet you. Where exactly are you from?' },
      { keywords: ['gràcies', 'gracies', 'thanks'], response: 'De res! Ha estat un plaer parlar amb tu!', translation: 'You\'re welcome! It\'s been a pleasure talking with you!' },
    ],
    fallbackResponses: [
      { response: 'Què interessant! I què t\'agrada fer en el teu temps lliure?', translation: 'How interesting! And what do you like to do in your free time?' },
      { response: 'M\'encanta conèixer gent nova. Barcelona és una ciutat molt internacional!', translation: 'I love meeting new people. Barcelona is a very international city!' },
      { response: 'Hauríem de quedar algun dia per prendre alguna cosa!', translation: 'We should meet up someday for a drink!' },
    ],
  },
  'doctor-visit': {
    keywordResponses: [
      // Symptoms
      { keywords: ['cap', 'head', 'mal de cap'], response: 'Mal de cap? Té febre també? Des de quan li fa mal?', translation: 'Headache? Do you have a fever too? Since when has it been hurting?' },
      { keywords: ['febre', 'fever', 'temperatura'], response: 'Quanta febre té? Li prenc la temperatura ara mateix.', translation: 'How much fever do you have? I\'ll take your temperature right now.' },
      { keywords: ['gola', 'throat'], response: 'Li fa mal la gola? Obri la boca, deixi\'m veure.', translation: 'Does your throat hurt? Open your mouth, let me see.' },
      { keywords: ['tos', 'cough'], response: 'Té tos seca o amb mucositat? Quants dies fa que té tos?', translation: 'Do you have a dry cough or with mucus? How many days have you had the cough?' },
      { keywords: ['panxa', 'estómac', 'stomach', 'ventre'], response: 'On li fa mal exactament? Premi aquí, li fa mal?', translation: 'Where does it hurt exactly? Press here, does it hurt?' },
      { keywords: ['marejat', 'mareig', 'dizzy'], response: 'Es mareja quan s\'aixeca? S\'assegui, li prenc la tensió.', translation: 'Do you get dizzy when you stand up? Sit down, I\'ll take your blood pressure.' },
      { keywords: ['al·lèrgia', 'alergia', 'allergy'], response: 'Té alguna al·lèrgia coneguda a medicaments?', translation: 'Do you have any known allergies to medications?' },
      // Duration
      { keywords: ['ahir', 'yesterday'], response: 'Des d\'ahir? Anem a veure què li passa exactament.', translation: 'Since yesterday? Let\'s see what\'s wrong exactly.' },
      { keywords: ['setmana', 'week', 'dies', 'days'], response: 'Fa massa dies que dura això. Hem de fer algunes proves.', translation: 'This has been going on too long. We need to do some tests.' },
      // Treatment
      { keywords: ['medicament', 'medicine', 'pastilla'], response: 'Li recepto un antiinflamatori. Prengui\'l cada 8 hores amb menjar.', translation: 'I\'ll prescribe an anti-inflammatory. Take it every 8 hours with food.' },
      { keywords: ['recepta', 'prescription'], response: 'Aquí té la recepta. Pot recollir el medicament a qualsevol farmàcia.', translation: 'Here\'s the prescription. You can pick up the medication at any pharmacy.' },
      // General
      { keywords: ['gràcies', 'gracies', 'thanks'], response: 'De res! Si no millora en 3 dies, torni a la consulta.', translation: 'You\'re welcome! If you don\'t improve in 3 days, come back to the office.' },
    ],
    fallbackResponses: [
      { response: 'Entenc. Li faré un examen per veure què li passa.', translation: 'I understand. I\'ll do an examination to see what\'s wrong.' },
      { response: 'No es preocupi, sembla que no és greu. Però l\'hem de tractar.', translation: 'Don\'t worry, it doesn\'t seem serious. But we need to treat it.' },
      { response: 'Necessito que em doni més detalls. Com es va començar a trobar malament?', translation: 'I need you to give me more details. How did you start feeling unwell?' },
    ],
  },
  'job-interview': {
    keywordResponses: [
      // Experience
      { keywords: ['experiència', 'experiencia', 'experience', 'treballat'], response: 'Molt bona experiència! Què va aprendre d\'aquest lloc de feina?', translation: 'Very good experience! What did you learn from this job?' },
      { keywords: ['anys', 'years'], response: 'Impressionant! Sembla que té molta experiència en el sector.', translation: 'Impressive! It seems you have a lot of experience in the sector.' },
      // Skills
      { keywords: ['idiomes', 'languages', 'anglès', 'català'], response: 'Els idiomes són molt importants per nosaltres. Quin nivell de català té?', translation: 'Languages are very important for us. What level of Catalan do you have?' },
      { keywords: ['equip', 'team'], response: 'Treballar en equip és fonamental aquí. Com descriuria el seu estil de treball?', translation: 'Teamwork is fundamental here. How would you describe your work style?' },
      { keywords: ['informàtica', 'informatica', 'computer', 'software'], response: 'Quins programes domina? Utilitzem molt Excel i sistemes CRM.', translation: 'What programs do you know? We use Excel and CRM systems a lot.' },
      // Motivation
      { keywords: ['empresa', 'company', 'companyia'], response: 'Què l\'atrau de la nostra empresa específicament?', translation: 'What attracts you to our company specifically?' },
      { keywords: ['aprendre', 'learn', 'créixer', 'grow'], response: 'M\'agrada la seva actitud! Valorem molt les ganes d\'aprendre.', translation: 'I like your attitude! We value the desire to learn a lot.' },
      // Salary/Benefits
      { keywords: ['sou', 'salari', 'salary'], response: 'El rang salarial per aquesta posició és competitiu. En parlarem si avancen les entrevistes.', translation: 'The salary range for this position is competitive. We\'ll discuss it if the interviews progress.' },
      { keywords: ['horari', 'hours', 'schedule'], response: 'L\'horari és de 9 a 18h amb flexibilitat. També hi ha opció de teletreball.', translation: 'The schedule is 9 to 6pm with flexibility. There\'s also remote work option.' },
      // Questions
      { keywords: ['pregunta', 'question'], response: 'Sí, pregunti el que vulgui sobre la posició o l\'empresa.', translation: 'Yes, ask whatever you want about the position or the company.' },
      // Thanks
      { keywords: ['gràcies', 'gracies', 'thanks'], response: 'Gràcies a vostè per venir. Li comunicarem la decisió la setmana vinent.', translation: 'Thank you for coming. We\'ll communicate the decision next week.' },
    ],
    fallbackResponses: [
      { response: 'Molt interessant! Pot donar-me un exemple concret?', translation: 'Very interesting! Can you give me a concrete example?' },
      { response: 'Entenc. I com creu que pot aportar valor al nostre equip?', translation: 'I understand. And how do you think you can add value to our team?' },
      { response: 'Perfecte. Té alguna pregunta sobre les responsabilitats del lloc?', translation: 'Perfect. Do you have any questions about the job responsibilities?' },
    ],
  },
  'free-chat': {
    keywordResponses: [
      // Topics
      { keywords: ['temps', 'weather', 'plou', 'sol'], response: 'Sí, el temps a Barcelona sol ser molt bo! T\'agrada el clima mediterrani?', translation: 'Yes, the weather in Barcelona is usually very good! Do you like the Mediterranean climate?' },
      { keywords: ['música', 'musica', 'music'], response: 'M\'encanta la música! Quin tipus de música t\'agrada més?', translation: 'I love music! What type of music do you like best?' },
      { keywords: ['pel·lícula', 'pelicula', 'cinema', 'movie'], response: 'El cinema és genial! Has vist alguna pel·lícula bona últimament?', translation: 'Cinema is great! Have you seen any good movies lately?' },
      { keywords: ['llibre', 'book', 'llegir'], response: 'Llegir és una de les meves passions! Què estàs llegint ara?', translation: 'Reading is one of my passions! What are you reading now?' },
      { keywords: ['esport', 'sport', 'futbol'], response: 'T\'agrada l\'esport? Aquí el futbol és gairebé una religió!', translation: 'Do you like sports? Here football is almost a religion!' },
      { keywords: ['menjar', 'food', 'cuina'], response: 'La cuina catalana és increïble! Has provat algun plat típic?', translation: 'Catalan cuisine is amazing! Have you tried any typical dish?' },
      { keywords: ['viatge', 'travel', 'viatjar'], response: 'M\'encanta viatjar! Quin és el millor lloc que has visitat?', translation: 'I love traveling! What\'s the best place you\'ve visited?' },
      // Opinions
      { keywords: ['penso', 'crec', 'think', 'believe'], response: 'És un punt de vista interessant! Per què ho veus així?', translation: 'That\'s an interesting point of view! Why do you see it that way?' },
      { keywords: ['d\'acord', 'agree'], response: 'Estic d\'acord amb tu! És important tenir perspectives compartides.', translation: 'I agree with you! It\'s important to have shared perspectives.' },
      // Catalan culture
      { keywords: ['català', 'catalan', 'catalunya'], response: 'M\'alegra que t\'interessi el català! És una llengua molt rica.', translation: 'I\'m glad you\'re interested in Catalan! It\'s a very rich language.' },
      { keywords: ['festa', 'party', 'celebració'], response: 'Les festes catalanes són úniques! Has vist mai els castellers?', translation: 'Catalan festivals are unique! Have you ever seen the human towers?' },
      // General
      { keywords: ['gràcies', 'gracies', 'thanks'], response: 'De res! M\'ha agradat molt parlar amb tu!', translation: 'You\'re welcome! I really enjoyed talking with you!' },
    ],
    fallbackResponses: [
      { response: 'Què interessant! Pots explicar-me més sobre això?', translation: 'How interesting! Can you tell me more about that?' },
      { response: 'M\'agrada el que dius. Quin és el teu punt de vista?', translation: 'I like what you\'re saying. What\'s your point of view?' },
      { response: 'Continuem parlant! De què més t\'agradaria parlar?', translation: 'Let\'s keep talking! What else would you like to talk about?' },
    ],
  },
};

// Find the best response based on keywords in user message
function findBestResponse(
  scenarioId: string,
  userMessage: string,
  messageHistory: ConversationMessage[]
): { response: string; translation: string } {
  const scenarioData = SCENARIO_RESPONSES[scenarioId] || SCENARIO_RESPONSES['free-chat'];
  const lowerMessage = userMessage.toLowerCase();

  // Track which keywords have already been used to avoid repeating responses
  const usedKeywords = new Set<string>();
  messageHistory.forEach(msg => {
    if (msg.role === 'user') {
      scenarioData.keywordResponses.forEach(kr => {
        kr.keywords.forEach(kw => {
          if (msg.content.toLowerCase().includes(kw)) {
            usedKeywords.add(kr.response);
          }
        });
      });
    }
  });

  // Find matching keyword responses (prioritize unused ones)
  let bestMatch: { response: string; translation: string; score: number } | null = null;

  for (const keywordResponse of scenarioData.keywordResponses) {
    let matchScore = 0;

    for (const keyword of keywordResponse.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        // Higher score for longer keyword matches (more specific)
        matchScore += keyword.length;
      }
    }

    if (matchScore > 0) {
      // Penalize already used responses
      const penalty = usedKeywords.has(keywordResponse.response) ? 0.5 : 1;
      const adjustedScore = matchScore * penalty;

      if (!bestMatch || adjustedScore > bestMatch.score) {
        bestMatch = {
          response: keywordResponse.response,
          translation: keywordResponse.translation,
          score: adjustedScore,
        };
      }
    }
  }

  if (bestMatch) {
    return { response: bestMatch.response, translation: bestMatch.translation };
  }

  // No keyword match - use fallback responses
  // Pick a fallback that hasn't been used recently
  const usedFallbacks = new Set<string>();
  messageHistory.slice(-6).forEach(msg => {
    if (msg.role === 'assistant') {
      usedFallbacks.add(msg.content);
    }
  });

  const availableFallbacks = scenarioData.fallbackResponses.filter(
    fb => !usedFallbacks.has(fb.response)
  );

  const fallbacks = availableFallbacks.length > 0
    ? availableFallbacks
    : scenarioData.fallbackResponses;

  const randomIndex = Math.floor(Math.random() * fallbacks.length);
  return fallbacks[randomIndex];
}

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

  // Generate assistant response using keyword matching
  const { response, translation } = findBestResponse(
    context.scenarioId,
    userMessage,
    context.messages
  );

  const assistantMsg: ConversationMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: response,
    translation,
    timestamp: new Date(),
  };

  return { userMsg, assistantMsg };
}
