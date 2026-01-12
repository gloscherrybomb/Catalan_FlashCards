// Story Data for Reading Comprehension

export type StoryLevel = 'A1' | 'A2' | 'B1' | 'B2';
export type StoryCategory = 'daily-life' | 'travel' | 'culture' | 'history' | 'fiction';

export interface StoryVocab {
  word: string;
  translation: string;
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'phrase';
}

export interface StoryParagraph {
  catalan: string;
  english: string;
}

export interface ComprehensionQuestion {
  id: string;
  question: string;        // In Catalan
  questionEnglish: string; // English translation of question
  options: string[];       // Answer options in Catalan
  correctIndex: number;
  explanation: string;     // Why this answer is correct
}

export interface Story {
  id: string;
  title: string;
  titleCatalan: string;
  level: StoryLevel;
  category: StoryCategory;
  icon: string;
  estimatedMinutes: number;
  description: string;
  paragraphs: StoryParagraph[];
  vocabulary: StoryVocab[];
  questions: ComprehensionQuestion[];
  xpReward: number;
}

// A1 Level Stories - Simple present tense, basic vocabulary
export const STORIES: Story[] = [
  {
    id: 'a1-first-day',
    title: 'My First Day',
    titleCatalan: 'El meu primer dia',
    level: 'A1',
    category: 'daily-life',
    icon: '🌅',
    estimatedMinutes: 5,
    description: 'A simple story about starting a new day',
    xpReward: 50,
    paragraphs: [
      {
        catalan: 'Hola! Em dic Maria. Tinc vint-i-cinc anys i visc a Barcelona.',
        english: 'Hello! My name is Maria. I am twenty-five years old and I live in Barcelona.',
      },
      {
        catalan: 'Avui és dilluns. Em desperto a les set del matí. Fa sol!',
        english: 'Today is Monday. I wake up at seven in the morning. It\'s sunny!',
      },
      {
        catalan: 'Esmorzo a la cuina. Menjo pa amb tomàquet i bec un cafè.',
        english: 'I have breakfast in the kitchen. I eat bread with tomato and drink a coffee.',
      },
      {
        catalan: 'A les vuit, surto de casa. Vaig a la feina amb metro.',
        english: 'At eight, I leave home. I go to work by metro.',
      },
      {
        catalan: 'M\'agrada molt Barcelona. És una ciutat molt bonica!',
        english: 'I like Barcelona a lot. It\'s a very beautiful city!',
      },
    ],
    vocabulary: [
      { word: 'em dic', translation: 'my name is', partOfSpeech: 'phrase' },
      { word: 'visc', translation: 'I live', partOfSpeech: 'verb' },
      { word: 'avui', translation: 'today', partOfSpeech: 'adverb' },
      { word: 'em desperto', translation: 'I wake up', partOfSpeech: 'verb' },
      { word: 'fa sol', translation: 'it\'s sunny', partOfSpeech: 'phrase' },
      { word: 'esmorzo', translation: 'I have breakfast', partOfSpeech: 'verb' },
      { word: 'cuina', translation: 'kitchen', partOfSpeech: 'noun' },
      { word: 'pa amb tomàquet', translation: 'bread with tomato', partOfSpeech: 'phrase' },
      { word: 'surto', translation: 'I leave/go out', partOfSpeech: 'verb' },
      { word: 'feina', translation: 'work/job', partOfSpeech: 'noun' },
      { word: 'bonica', translation: 'beautiful', partOfSpeech: 'adjective' },
    ],
    questions: [
      {
        id: 'q1',
        question: 'On viu la Maria?',
        questionEnglish: 'Where does Maria live?',
        options: ['Madrid', 'Barcelona', 'València', 'Girona'],
        correctIndex: 1,
        explanation: 'Maria says "visc a Barcelona" - I live in Barcelona.',
      },
      {
        id: 'q2',
        question: 'A quina hora es desperta?',
        questionEnglish: 'What time does she wake up?',
        options: ['A les sis', 'A les set', 'A les vuit', 'A les nou'],
        correctIndex: 1,
        explanation: '"Em desperto a les set del matí" - I wake up at seven in the morning.',
      },
      {
        id: 'q3',
        question: 'Què menja per esmorzar?',
        questionEnglish: 'What does she eat for breakfast?',
        options: ['Cereals', 'Pa amb tomàquet', 'Fruita', 'Ous'],
        correctIndex: 1,
        explanation: '"Menjo pa amb tomàquet" - I eat bread with tomato.',
      },
      {
        id: 'q4',
        question: 'Com va a la feina?',
        questionEnglish: 'How does she go to work?',
        options: ['Amb cotxe', 'A peu', 'Amb metro', 'Amb bicicleta'],
        correctIndex: 2,
        explanation: '"Vaig a la feina amb metro" - I go to work by metro.',
      },
    ],
  },
  {
    id: 'a1-at-market',
    title: 'At the Market',
    titleCatalan: 'Al mercat',
    level: 'A1',
    category: 'daily-life',
    icon: '🛒',
    estimatedMinutes: 6,
    description: 'Shopping for food at the local market',
    xpReward: 55,
    paragraphs: [
      {
        catalan: 'Avui vaig al mercat de la Boqueria. És el mercat més famós de Barcelona.',
        english: 'Today I go to the Boqueria market. It is the most famous market in Barcelona.',
      },
      {
        catalan: 'Primer, compro fruita. Vull pomes, taronges i plàtans.',
        english: 'First, I buy fruit. I want apples, oranges, and bananas.',
      },
      {
        catalan: '— Bon dia! Quant costen les pomes? — pregunto.',
        english: '"Good morning! How much do the apples cost?" I ask.',
      },
      {
        catalan: '— Dos euros el quilo — diu el venedor.',
        english: '"Two euros per kilo," says the vendor.',
      },
      {
        catalan: 'Després compro verdures: tomàquets, cebes i alls.',
        english: 'Then I buy vegetables: tomatoes, onions, and garlic.',
      },
      {
        catalan: 'Finalment, compro peix fresc. M\'agrada molt el peix!',
        english: 'Finally, I buy fresh fish. I really like fish!',
      },
      {
        catalan: 'Pago vint euros en total. El mercat és meravellós!',
        english: 'I pay twenty euros in total. The market is wonderful!',
      },
    ],
    vocabulary: [
      { word: 'mercat', translation: 'market', partOfSpeech: 'noun' },
      { word: 'compro', translation: 'I buy', partOfSpeech: 'verb' },
      { word: 'fruita', translation: 'fruit', partOfSpeech: 'noun' },
      { word: 'pomes', translation: 'apples', partOfSpeech: 'noun' },
      { word: 'taronges', translation: 'oranges', partOfSpeech: 'noun' },
      { word: 'quant costen', translation: 'how much do they cost', partOfSpeech: 'phrase' },
      { word: 'venedor', translation: 'vendor/seller', partOfSpeech: 'noun' },
      { word: 'verdures', translation: 'vegetables', partOfSpeech: 'noun' },
      { word: 'peix', translation: 'fish', partOfSpeech: 'noun' },
      { word: 'fresc', translation: 'fresh', partOfSpeech: 'adjective' },
      { word: 'pago', translation: 'I pay', partOfSpeech: 'verb' },
    ],
    questions: [
      {
        id: 'q1',
        question: 'Quin mercat visita?',
        questionEnglish: 'Which market does she visit?',
        options: ['El mercat de Sant Josep', 'La Boqueria', 'El mercat del Born', 'El mercat de Santa Caterina'],
        correctIndex: 1,
        explanation: '"Vaig al mercat de la Boqueria" - I go to the Boqueria market.',
      },
      {
        id: 'q2',
        question: 'Quant costen les pomes?',
        questionEnglish: 'How much do the apples cost?',
        options: ['Un euro el quilo', 'Dos euros el quilo', 'Tres euros el quilo', 'Cinc euros el quilo'],
        correctIndex: 1,
        explanation: '"Dos euros el quilo" - Two euros per kilo.',
      },
      {
        id: 'q3',
        question: 'Què compra al final?',
        questionEnglish: 'What does she buy at the end?',
        options: ['Carn', 'Formatge', 'Peix fresc', 'Pa'],
        correctIndex: 2,
        explanation: '"Finalment, compro peix fresc" - Finally, I buy fresh fish.',
      },
    ],
  },
  {
    id: 'a1-family',
    title: 'The García Family',
    titleCatalan: 'La família García',
    level: 'A1',
    category: 'daily-life',
    icon: '👨‍👩‍👧‍👦',
    estimatedMinutes: 5,
    description: 'Meet a typical Catalan family',
    xpReward: 50,
    paragraphs: [
      {
        catalan: 'La família García viu a Girona. Són cinc persones.',
        english: 'The García family lives in Girona. They are five people.',
      },
      {
        catalan: 'El pare es diu Joan i té quaranta-cinc anys. És metge.',
        english: 'The father is called Joan and he is forty-five years old. He is a doctor.',
      },
      {
        catalan: 'La mare es diu Montse i té quaranta-dos anys. És professora.',
        english: 'The mother is called Montse and she is forty-two years old. She is a teacher.',
      },
      {
        catalan: 'Tenen tres fills: en Pere, la Laia i en Marc.',
        english: 'They have three children: Pere, Laia, and Marc.',
      },
      {
        catalan: 'En Pere té setze anys i li agrada el futbol. La Laia té catorze anys i toca el piano.',
        english: 'Pere is sixteen years old and likes football. Laia is fourteen years old and plays the piano.',
      },
      {
        catalan: 'En Marc és el petit. Només té vuit anys. Li agraden els videojocs.',
        english: 'Marc is the youngest. He is only eight years old. He likes video games.',
      },
    ],
    vocabulary: [
      { word: 'família', translation: 'family', partOfSpeech: 'noun' },
      { word: 'pare', translation: 'father', partOfSpeech: 'noun' },
      { word: 'mare', translation: 'mother', partOfSpeech: 'noun' },
      { word: 'metge', translation: 'doctor', partOfSpeech: 'noun' },
      { word: 'professora', translation: 'teacher (f)', partOfSpeech: 'noun' },
      { word: 'fills', translation: 'children/sons', partOfSpeech: 'noun' },
      { word: 'li agrada', translation: 'he/she likes', partOfSpeech: 'phrase' },
      { word: 'toca', translation: 'plays (instrument)', partOfSpeech: 'verb' },
      { word: 'petit', translation: 'small/youngest', partOfSpeech: 'adjective' },
      { word: 'només', translation: 'only', partOfSpeech: 'adverb' },
    ],
    questions: [
      {
        id: 'q1',
        question: 'On viu la família García?',
        questionEnglish: 'Where does the García family live?',
        options: ['Barcelona', 'Tarragona', 'Girona', 'Lleida'],
        correctIndex: 2,
        explanation: '"La família García viu a Girona" - The García family lives in Girona.',
      },
      {
        id: 'q2',
        question: 'Quina és la professió del Joan?',
        questionEnglish: 'What is Joan\'s profession?',
        options: ['Professor', 'Metge', 'Advocat', 'Enginyer'],
        correctIndex: 1,
        explanation: '"És metge" - He is a doctor.',
      },
      {
        id: 'q3',
        question: 'Qui toca el piano?',
        questionEnglish: 'Who plays the piano?',
        options: ['En Pere', 'La Laia', 'En Marc', 'La Montse'],
        correctIndex: 1,
        explanation: '"La Laia té catorze anys i toca el piano" - Laia is fourteen years old and plays the piano.',
      },
      {
        id: 'q4',
        question: 'Quants anys té en Marc?',
        questionEnglish: 'How old is Marc?',
        options: ['Sis anys', 'Set anys', 'Vuit anys', 'Nou anys'],
        correctIndex: 2,
        explanation: '"Només té vuit anys" - He is only eight years old.',
      },
    ],
  },

  // A2 Level Stories - Past tense, more complex sentences
  {
    id: 'a2-barcelona-trip',
    title: 'A Day in Barcelona',
    titleCatalan: 'Un dia a Barcelona',
    level: 'A2',
    category: 'travel',
    icon: '🏛️',
    estimatedMinutes: 7,
    description: 'Exploring the sights of Barcelona',
    xpReward: 65,
    paragraphs: [
      {
        catalan: 'Ahir vaig visitar Barcelona amb els meus amics. Va ser un dia fantàstic!',
        english: 'Yesterday I visited Barcelona with my friends. It was a fantastic day!',
      },
      {
        catalan: 'Primer, vam anar a la Sagrada Família. L\'església és impressionant!',
        english: 'First, we went to the Sagrada Família. The church is impressive!',
      },
      {
        catalan: 'Vam fer moltes fotos. Les torres són molt altes i boniques.',
        english: 'We took many photos. The towers are very tall and beautiful.',
      },
      {
        catalan: 'Després, vam passejar per les Rambles. Hi havia molta gent!',
        english: 'Then, we walked along the Ramblas. There were many people!',
      },
      {
        catalan: 'Vam dinar en un restaurant al Barri Gòtic. Vaig menjar paella.',
        english: 'We had lunch at a restaurant in the Gothic Quarter. I ate paella.',
      },
      {
        catalan: 'A la tarda, vam anar a la platja de la Barceloneta. L\'aigua estava una mica freda!',
        english: 'In the afternoon, we went to Barceloneta beach. The water was a bit cold!',
      },
      {
        catalan: 'Vam tornar a casa molt cansats però contents. Vull tornar aviat!',
        english: 'We returned home very tired but happy. I want to come back soon!',
      },
    ],
    vocabulary: [
      { word: 'ahir', translation: 'yesterday', partOfSpeech: 'adverb' },
      { word: 'vaig visitar', translation: 'I visited', partOfSpeech: 'verb' },
      { word: 'vam anar', translation: 'we went', partOfSpeech: 'verb' },
      { word: 'església', translation: 'church', partOfSpeech: 'noun' },
      { word: 'impressionant', translation: 'impressive', partOfSpeech: 'adjective' },
      { word: 'vam fer fotos', translation: 'we took photos', partOfSpeech: 'phrase' },
      { word: 'vam passejar', translation: 'we walked/strolled', partOfSpeech: 'verb' },
      { word: 'hi havia', translation: 'there was/were', partOfSpeech: 'phrase' },
      { word: 'gent', translation: 'people', partOfSpeech: 'noun' },
      { word: 'vam dinar', translation: 'we had lunch', partOfSpeech: 'verb' },
      { word: 'platja', translation: 'beach', partOfSpeech: 'noun' },
      { word: 'cansats', translation: 'tired', partOfSpeech: 'adjective' },
    ],
    questions: [
      {
        id: 'q1',
        question: 'Quan van visitar Barcelona?',
        questionEnglish: 'When did they visit Barcelona?',
        options: ['Avui', 'Ahir', 'La setmana passada', 'Demà'],
        correctIndex: 1,
        explanation: '"Ahir vaig visitar Barcelona" - Yesterday I visited Barcelona.',
      },
      {
        id: 'q2',
        question: 'Què van visitar primer?',
        questionEnglish: 'What did they visit first?',
        options: ['La platja', 'Les Rambles', 'La Sagrada Família', 'El Barri Gòtic'],
        correctIndex: 2,
        explanation: '"Primer, vam anar a la Sagrada Família" - First, we went to the Sagrada Família.',
      },
      {
        id: 'q3',
        question: 'On van dinar?',
        questionEnglish: 'Where did they have lunch?',
        options: ['A la platja', 'A les Rambles', 'Al Barri Gòtic', 'A casa'],
        correctIndex: 2,
        explanation: '"Vam dinar en un restaurant al Barri Gòtic" - We had lunch at a restaurant in the Gothic Quarter.',
      },
      {
        id: 'q4',
        question: 'Com estava l\'aigua de la platja?',
        questionEnglish: 'How was the beach water?',
        options: ['Calenta', 'Una mica freda', 'Molt calenta', 'Perfecta'],
        correctIndex: 1,
        explanation: '"L\'aigua estava una mica freda" - The water was a bit cold.',
      },
    ],
  },
  {
    id: 'a2-sant-jordi',
    title: 'Sant Jordi Day',
    titleCatalan: 'La Diada de Sant Jordi',
    level: 'A2',
    category: 'culture',
    icon: '🌹',
    estimatedMinutes: 6,
    description: 'Learn about Catalonia\'s most romantic tradition',
    xpReward: 60,
    paragraphs: [
      {
        catalan: 'El 23 d\'abril és la Diada de Sant Jordi. És el dia més romàntic de Catalunya!',
        english: 'April 23rd is Sant Jordi Day. It is the most romantic day in Catalonia!',
      },
      {
        catalan: 'Segons la llegenda, Sant Jordi va matar un drac per salvar una princesa.',
        english: 'According to legend, Sant Jordi killed a dragon to save a princess.',
      },
      {
        catalan: 'De la sang del drac va néixer una rosa vermella.',
        english: 'From the dragon\'s blood, a red rose was born.',
      },
      {
        catalan: 'Tradicionalment, els homes regalen roses a les dones. Les dones regalen llibres als homes.',
        english: 'Traditionally, men give roses to women. Women give books to men.',
      },
      {
        catalan: 'Els carrers s\'omplen de parades de roses i llibres. És com un gran festival!',
        english: 'The streets fill with rose and book stalls. It\'s like a big festival!',
      },
      {
        catalan: 'Avui dia, tothom regala roses i llibres. És una festa per a tots!',
        english: 'Nowadays, everyone gives roses and books. It\'s a celebration for everyone!',
      },
    ],
    vocabulary: [
      { word: 'diada', translation: 'day/celebration', partOfSpeech: 'noun' },
      { word: 'romàntic', translation: 'romantic', partOfSpeech: 'adjective' },
      { word: 'llegenda', translation: 'legend', partOfSpeech: 'noun' },
      { word: 'va matar', translation: 'killed', partOfSpeech: 'verb' },
      { word: 'drac', translation: 'dragon', partOfSpeech: 'noun' },
      { word: 'princesa', translation: 'princess', partOfSpeech: 'noun' },
      { word: 'sang', translation: 'blood', partOfSpeech: 'noun' },
      { word: 'rosa', translation: 'rose', partOfSpeech: 'noun' },
      { word: 'regalen', translation: 'give (as gift)', partOfSpeech: 'verb' },
      { word: 'parades', translation: 'stalls/stands', partOfSpeech: 'noun' },
      { word: 'tothom', translation: 'everyone', partOfSpeech: 'noun' },
    ],
    questions: [
      {
        id: 'q1',
        question: 'Quan és la Diada de Sant Jordi?',
        questionEnglish: 'When is Sant Jordi Day?',
        options: ['El 23 de març', 'El 23 d\'abril', 'El 23 de maig', 'El 23 de juny'],
        correctIndex: 1,
        explanation: '"El 23 d\'abril és la Diada de Sant Jordi" - April 23rd is Sant Jordi Day.',
      },
      {
        id: 'q2',
        question: 'Què va matar Sant Jordi?',
        questionEnglish: 'What did Sant Jordi kill?',
        options: ['Un lleó', 'Un drac', 'Un gegant', 'Un llop'],
        correctIndex: 1,
        explanation: '"Sant Jordi va matar un drac" - Sant Jordi killed a dragon.',
      },
      {
        id: 'q3',
        question: 'Què regalen tradicionalment els homes?',
        questionEnglish: 'What do men traditionally give?',
        options: ['Llibres', 'Xocolata', 'Roses', 'Flors'],
        correctIndex: 2,
        explanation: '"Els homes regalen roses a les dones" - Men give roses to women.',
      },
    ],
  },

  // B1 Level Stories - More complex grammar, abstract concepts
  {
    id: 'b1-job-interview',
    title: 'The Job Interview',
    titleCatalan: 'L\'entrevista de feina',
    level: 'B1',
    category: 'daily-life',
    icon: '💼',
    estimatedMinutes: 8,
    description: 'A story about preparing for and going to a job interview',
    xpReward: 75,
    paragraphs: [
      {
        catalan: 'La setmana passada, vaig rebre una trucada molt important. M\'havien convocat per a una entrevista de feina!',
        english: 'Last week, I received a very important call. They had called me for a job interview!',
      },
      {
        catalan: 'Estava molt nerviós perquè era la feina dels meus somnis: treballar com a dissenyador gràfic en una empresa de tecnologia.',
        english: 'I was very nervous because it was my dream job: working as a graphic designer in a technology company.',
      },
      {
        catalan: 'Vaig passar tot el cap de setmana preparant-me. Vaig investigar l\'empresa i vaig practicar possibles preguntes.',
        english: 'I spent the whole weekend preparing. I researched the company and practiced possible questions.',
      },
      {
        catalan: 'El dia de l\'entrevista, em vaig llevar d\'hora i em vaig vestir de manera formal. Volia causar una bona impressió.',
        english: 'On the day of the interview, I got up early and dressed formally. I wanted to make a good impression.',
      },
      {
        catalan: 'L\'entrevista va durar una hora. Em van preguntar sobre la meva experiència i els meus objectius professionals.',
        english: 'The interview lasted an hour. They asked me about my experience and my professional goals.',
      },
      {
        catalan: 'Crec que va anar bé. L\'entrevistadora semblava interessada en el meu portfoli.',
        english: 'I think it went well. The interviewer seemed interested in my portfolio.',
      },
      {
        catalan: 'Ara estic esperant la seva resposta. Espero que em truquin aviat!',
        english: 'Now I\'m waiting for their answer. I hope they call me soon!',
      },
    ],
    vocabulary: [
      { word: 'vaig rebre', translation: 'I received', partOfSpeech: 'verb' },
      { word: 'trucada', translation: 'call', partOfSpeech: 'noun' },
      { word: 'm\'havien convocat', translation: 'they had called me', partOfSpeech: 'phrase' },
      { word: 'nerviós', translation: 'nervous', partOfSpeech: 'adjective' },
      { word: 'somnis', translation: 'dreams', partOfSpeech: 'noun' },
      { word: 'dissenyador gràfic', translation: 'graphic designer', partOfSpeech: 'noun' },
      { word: 'vaig investigar', translation: 'I researched', partOfSpeech: 'verb' },
      { word: 'em vaig llevar', translation: 'I got up', partOfSpeech: 'verb' },
      { word: 'causar una bona impressió', translation: 'make a good impression', partOfSpeech: 'phrase' },
      { word: 'va durar', translation: 'lasted', partOfSpeech: 'verb' },
      { word: 'objectius', translation: 'goals/objectives', partOfSpeech: 'noun' },
      { word: 'espero', translation: 'I hope', partOfSpeech: 'verb' },
    ],
    questions: [
      {
        id: 'q1',
        question: 'Per quina posició era l\'entrevista?',
        questionEnglish: 'What position was the interview for?',
        options: ['Professor', 'Dissenyador gràfic', 'Enginyer', 'Metge'],
        correctIndex: 1,
        explanation: '"Treballar com a dissenyador gràfic" - Working as a graphic designer.',
      },
      {
        id: 'q2',
        question: 'Què va fer durant el cap de setmana?',
        questionEnglish: 'What did he/she do during the weekend?',
        options: ['Descansar', 'Preparar-se per l\'entrevista', 'Viatjar', 'Treballar'],
        correctIndex: 1,
        explanation: '"Vaig passar tot el cap de setmana preparant-me" - I spent the whole weekend preparing.',
      },
      {
        id: 'q3',
        question: 'Quant va durar l\'entrevista?',
        questionEnglish: 'How long did the interview last?',
        options: ['Mitja hora', 'Una hora', 'Dues hores', 'Tot el dia'],
        correctIndex: 1,
        explanation: '"L\'entrevista va durar una hora" - The interview lasted an hour.',
      },
      {
        id: 'q4',
        question: 'Com se sent ara el protagonista?',
        questionEnglish: 'How does the protagonist feel now?',
        options: ['Trist', 'Enfadat', 'Esperançat', 'Indiferent'],
        correctIndex: 2,
        explanation: '"Espero que em truquin aviat!" shows hope - I hope they call me soon!',
      },
    ],
  },

  // B2 Level Stories - Complex grammar, idioms, nuanced topics
  {
    id: 'b2-climate-change',
    title: 'Thinking About the Future',
    titleCatalan: 'Pensant en el futur',
    level: 'B2',
    category: 'culture',
    icon: '🌍',
    estimatedMinutes: 10,
    description: 'A reflection on climate change and sustainability in Catalonia',
    xpReward: 90,
    paragraphs: [
      {
        catalan: 'Cada vegada que llegeixo les notícies sobre el canvi climàtic, em pregunto quin món deixarem als nostres fills.',
        english: 'Every time I read the news about climate change, I wonder what world we will leave for our children.',
      },
      {
        catalan: 'A Catalunya, ja estem notant els efectes: estius més calorosos, sequeres més llargues i tempestes més violentes.',
        english: 'In Catalonia, we are already noticing the effects: hotter summers, longer droughts, and more violent storms.',
      },
      {
        catalan: 'Però també veig motius per a l\'esperança. Molts pobles catalans s\'han compromès a ser neutres en carboni abans del 2030.',
        english: 'But I also see reasons for hope. Many Catalan towns have committed to being carbon neutral before 2030.',
      },
      {
        catalan: 'Si cadascú de nosaltres fes petits canvis en el dia a dia, l\'impacte seria enorme.',
        english: 'If each of us made small changes in daily life, the impact would be enormous.',
      },
      {
        catalan: 'Per exemple, si anéssim més en transport públic o compréssim productes locals, reduiríem molt la nostra petjada de carboni.',
        english: 'For example, if we used public transport more or bought local products, we would greatly reduce our carbon footprint.',
      },
      {
        catalan: 'No podem esperar que els governs ho solucionin tot. La responsabilitat és de tots.',
        english: 'We cannot wait for governments to solve everything. The responsibility belongs to everyone.',
      },
      {
        catalan: 'M\'agradaria que les generacions futures poguessin gaudir de la nostra terra tan meravellosa com l\'hem coneguda nosaltres.',
        english: 'I would like future generations to be able to enjoy our land as wonderful as we have known it.',
      },
    ],
    vocabulary: [
      { word: 'canvi climàtic', translation: 'climate change', partOfSpeech: 'noun' },
      { word: 'em pregunto', translation: 'I wonder', partOfSpeech: 'verb' },
      { word: 'sequeres', translation: 'droughts', partOfSpeech: 'noun' },
      { word: 'tempestes', translation: 'storms', partOfSpeech: 'noun' },
      { word: 's\'han compromès', translation: 'have committed', partOfSpeech: 'verb' },
      { word: 'neutre en carboni', translation: 'carbon neutral', partOfSpeech: 'phrase' },
      { word: 'si cadascú fes', translation: 'if each person did', partOfSpeech: 'phrase' },
      { word: 'petjada de carboni', translation: 'carbon footprint', partOfSpeech: 'noun' },
      { word: 'governs', translation: 'governments', partOfSpeech: 'noun' },
      { word: 'responsabilitat', translation: 'responsibility', partOfSpeech: 'noun' },
      { word: 'generacions futures', translation: 'future generations', partOfSpeech: 'noun' },
      { word: 'gaudir', translation: 'to enjoy', partOfSpeech: 'verb' },
    ],
    questions: [
      {
        id: 'q1',
        question: 'Quins efectes del canvi climàtic es noten a Catalunya?',
        questionEnglish: 'What effects of climate change are noticed in Catalonia?',
        options: [
          'Hiverns més freds',
          'Estius més calorosos i sequeres',
          'Més neu a les muntanyes',
          'Temperatures estables',
        ],
        correctIndex: 1,
        explanation: '"Estius més calorosos, sequeres més llargues i tempestes més violentes" - Hotter summers, longer droughts, and more violent storms.',
      },
      {
        id: 'q2',
        question: 'Quin compromís han pres molts pobles catalans?',
        questionEnglish: 'What commitment have many Catalan towns made?',
        options: [
          'Construir més fàbriques',
          'Ser neutres en carboni abans del 2030',
          'Eliminar el transport públic',
          'Augmentar el consum d\'energia',
        ],
        correctIndex: 1,
        explanation: '"S\'han compromès a ser neutres en carboni abans del 2030" - They have committed to being carbon neutral before 2030.',
      },
      {
        id: 'q3',
        question: 'Segons l\'autor, qui té la responsabilitat de solucionar el problema?',
        questionEnglish: 'According to the author, who has the responsibility to solve the problem?',
        options: [
          'Només els governs',
          'Només les empreses',
          'Tothom',
          'Ningú',
        ],
        correctIndex: 2,
        explanation: '"La responsabilitat és de tots" - The responsibility belongs to everyone.',
      },
    ],
  },
];

// Helper functions
export function getStoriesByLevel(level: StoryLevel): Story[] {
  return STORIES.filter(s => s.level === level);
}

export function getStoriesByCategory(category: StoryCategory): Story[] {
  return STORIES.filter(s => s.category === category);
}

export function getStoryById(id: string): Story | undefined {
  return STORIES.find(s => s.id === id);
}

export function getTotalStories(): number {
  return STORIES.length;
}
