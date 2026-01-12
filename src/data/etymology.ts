// Etymology data for Catalan words - helping learners see language connections

export interface Etymology {
  word: string;
  origin: 'latin' | 'arabic' | 'greek' | 'germanic' | 'occitan' | 'spanish' | 'french' | 'unknown';
  rootWord?: string;
  meaning?: string;
  notes?: string;
}

export interface Cognate {
  catalan: string;
  english: string;
  spanish?: string;
  french?: string;
  italian?: string;
  similarity: 'identical' | 'similar' | 'related';
}

export interface FalseFriend {
  catalan: string;
  catalanMeaning: string;
  looksLike: string;
  actualMeaning: string;
  tip: string;
}

// Common Latin roots in Catalan
export const LATIN_ROOTS: Record<string, { meaning: string; examples: string[] }> = {
  'aqua': { meaning: 'water', examples: ['aigua', 'aigüera', 'aqüeducte'] },
  'terra': { meaning: 'earth/land', examples: ['terra', 'terrassa', 'territori'] },
  'focus': { meaning: 'fire/hearth', examples: ['foc', 'foguer', 'fogó'] },
  'manus': { meaning: 'hand', examples: ['mà', 'manual', 'manipular'] },
  'caput': { meaning: 'head', examples: ['cap', 'capità', 'capital'] },
  'corpus': { meaning: 'body', examples: ['cos', 'corporal', 'corsé'] },
  'oculus': { meaning: 'eye', examples: ['ull', 'ocular', 'ulleres'] },
  'auris': { meaning: 'ear', examples: ['orella', 'auricular'] },
  'pes/pedis': { meaning: 'foot', examples: ['peu', 'pedal', 'peató'] },
  'dies': { meaning: 'day', examples: ['dia', 'diari', 'quotidià'] },
  'nox/noctis': { meaning: 'night', examples: ['nit', 'nocturn', 'nocturnal'] },
  'annus': { meaning: 'year', examples: ['any', 'anual', 'aniversari'] },
  'tempus': { meaning: 'time', examples: ['temps', 'temporal', 'contemporani'] },
  'amor': { meaning: 'love', examples: ['amor', 'amorós', 'enamorar'] },
  'vita': { meaning: 'life', examples: ['vida', 'vital', 'vitalitat'] },
  'mors/mortis': { meaning: 'death', examples: ['mort', 'mortal', 'immortal'] },
  'bonus': { meaning: 'good', examples: ['bo/bona', 'bondat', 'bonificar'] },
  'malus': { meaning: 'bad', examples: ['mal', 'malalt', 'malícia'] },
  'magnus': { meaning: 'great/large', examples: ['gran', 'magnitud', 'magnífic'] },
  'parvus': { meaning: 'small', examples: ['petit', 'parvulari'] },
  'longus': { meaning: 'long', examples: ['llarg', 'longitude', 'allongar'] },
  'brevis': { meaning: 'short', examples: ['breu', 'abreviar', 'breviari'] },
  'altus': { meaning: 'high/deep', examples: ['alt', 'altura', 'altitud'] },
  'bassus': { meaning: 'low', examples: ['baix', 'baixar', 'abaixar'] },
  'novus': { meaning: 'new', examples: ['nou', 'novetat', 'innovar'] },
  'vetus': { meaning: 'old', examples: ['vell', 'veterà', 'vetust'] },
  'facere': { meaning: 'to make/do', examples: ['fer', 'fàbrica', 'fabricar'] },
  'dicere': { meaning: 'to say', examples: ['dir', 'dicció', 'diccionari'] },
  'scribere': { meaning: 'to write', examples: ['escriure', 'escriptor', 'inscripció'] },
  'legere': { meaning: 'to read', examples: ['llegir', 'lector', 'lectura'] },
  'videre': { meaning: 'to see', examples: ['veure', 'visió', 'visible'] },
  'audire': { meaning: 'to hear', examples: ['oir', 'audiència', 'auditiu'] },
};

// Arabic influences in Catalan (words often starting with 'al-')
export const ARABIC_ROOTS: Record<string, { meaning: string; examples: string[] }> = {
  'al-': {
    meaning: 'the (Arabic article)',
    examples: ['alfàbrega (basil)', 'algorisme', 'alcohol', 'almorzar', 'alfombra']
  },
  'sukkar': { meaning: 'sugar', examples: ['sucre'] },
  'naranj': { meaning: 'orange', examples: ['taronja'] },
  'qutun': { meaning: 'cotton', examples: ['cotó'] },
  'funduq': { meaning: 'inn', examples: ['fonda'] },
};

// Common cognates between Catalan and other Romance languages
export const COGNATES: Cognate[] = [
  { catalan: 'aigua', english: 'water (aqua-)', spanish: 'agua', french: 'eau', italian: 'acqua', similarity: 'related' },
  { catalan: 'foc', english: 'fire (focus)', spanish: 'fuego', french: 'feu', italian: 'fuoco', similarity: 'related' },
  { catalan: 'terra', english: 'terrain/earth', spanish: 'tierra', french: 'terre', italian: 'terra', similarity: 'identical' },
  { catalan: 'família', english: 'family', spanish: 'familia', french: 'famille', italian: 'famiglia', similarity: 'identical' },
  { catalan: 'important', english: 'important', spanish: 'importante', french: 'important', italian: 'importante', similarity: 'identical' },
  { catalan: 'diferent', english: 'different', spanish: 'diferente', french: 'différent', italian: 'differente', similarity: 'identical' },
  { catalan: 'natural', english: 'natural', spanish: 'natural', french: 'naturel', italian: 'naturale', similarity: 'identical' },
  { catalan: 'especial', english: 'special', spanish: 'especial', french: 'spécial', italian: 'speciale', similarity: 'identical' },
  { catalan: 'problema', english: 'problem', spanish: 'problema', french: 'problème', italian: 'problema', similarity: 'identical' },
  { catalan: 'possible', english: 'possible', spanish: 'posible', french: 'possible', italian: 'possibile', similarity: 'identical' },
  { catalan: 'necessari', english: 'necessary', spanish: 'necesario', french: 'nécessaire', italian: 'necessario', similarity: 'similar' },
  { catalan: 'hospital', english: 'hospital', spanish: 'hospital', french: 'hôpital', italian: 'ospedale', similarity: 'identical' },
  { catalan: 'restaurant', english: 'restaurant', spanish: 'restaurante', french: 'restaurant', italian: 'ristorante', similarity: 'identical' },
  { catalan: 'música', english: 'music', spanish: 'música', french: 'musique', italian: 'musica', similarity: 'identical' },
  { catalan: 'animal', english: 'animal', spanish: 'animal', french: 'animal', italian: 'animale', similarity: 'identical' },
];

// False friends - words that look similar but have different meanings
export const FALSE_FRIENDS: FalseFriend[] = [
  {
    catalan: 'embarassada',
    catalanMeaning: 'pregnant',
    looksLike: 'embarrassed',
    actualMeaning: 'pregnant',
    tip: 'In Catalan, "embarassada" means pregnant! Use "avergonyit/da" for embarrassed.',
  },
  {
    catalan: 'constipat',
    catalanMeaning: 'having a cold',
    looksLike: 'constipated',
    actualMeaning: 'having a cold/flu',
    tip: 'In Catalan, "constipat" means you have a cold, not a digestive issue!',
  },
  {
    catalan: 'assistir',
    catalanMeaning: 'to attend',
    looksLike: 'assist',
    actualMeaning: 'to attend/be present',
    tip: 'In Catalan, "assistir" means to attend. Use "ajudar" to assist someone.',
  },
  {
    catalan: 'carpeta',
    catalanMeaning: 'folder',
    looksLike: 'carpet',
    actualMeaning: 'folder/binder',
    tip: 'In Catalan, "carpeta" is a folder. Use "catifa" for carpet.',
  },
  {
    catalan: 'sensible',
    catalanMeaning: 'sensitive',
    looksLike: 'sensible',
    actualMeaning: 'sensitive',
    tip: 'In Catalan, "sensible" means sensitive! Use "sensat/da" for sensible.',
  },
  {
    catalan: 'actual',
    catalanMeaning: 'current/present',
    looksLike: 'actual',
    actualMeaning: 'current/present-day',
    tip: 'In Catalan, "actual" means current/nowadays. Use "real" or "veritable" for actual.',
  },
  {
    catalan: 'pretendre',
    catalanMeaning: 'to intend/aim for',
    looksLike: 'pretend',
    actualMeaning: 'to intend/aspire',
    tip: 'In Catalan, "pretendre" means to intend. Use "fingir" for pretend.',
  },
  {
    catalan: 'realizar',
    catalanMeaning: 'to carry out/accomplish',
    looksLike: 'realize',
    actualMeaning: 'to carry out/do',
    tip: 'In Catalan, "realizar" means to accomplish. Use "adonar-se" for realize.',
  },
  {
    catalan: 'exit',
    catalanMeaning: 'success',
    looksLike: 'exit',
    actualMeaning: 'success/hit',
    tip: 'In Catalan, "èxit" means success! Use "sortida" for exit.',
  },
  {
    catalan: 'recordar',
    catalanMeaning: 'to remember',
    looksLike: 'record',
    actualMeaning: 'to remember',
    tip: 'In Catalan, "recordar" means to remember. Use "gravar" for record.',
  },
];

// Memory hooks - phonetic similarities to help remember
export const PHONETIC_HOOKS: Record<string, string> = {
  'gat': 'Sounds like "got" - "I\'ve got a cat!"',
  'gos': 'Sounds like "ghost" - imagine a ghost dog',
  'casa': 'Same as Spanish, think "mi casa es su casa"',
  'taula': 'Sounds like "towel-a" - imagine a towel on a table',
  'cadira': 'Sounds like "cadre" - a frame/chair',
  'finestra': 'Think "fenestra" (Latin) - defenestration!',
  'porta': 'Think "portal" - a door is a portal',
  'llibre': 'Think "library" - full of books',
  'aigua': 'Think "aqua" - water',
  'menjar': 'Sounds like "manger" - where animals eat',
  'beure': 'Sounds like "beverage" - something to drink',
  'dormir': 'Think "dormant" - sleeping',
  'caminar': 'Think "camino" - the way/path you walk',
  'parlar': 'Think "parley" - to speak/negotiate',
  'treballar': 'Think "travail" - work/labor',
  'comprar': 'Think "compare prices" when shopping',
  'vendre': 'Think "vendor" - someone who sells',
  'obrir': 'Think "open" - same root',
  'tancar': 'Think "tank" - closed/sealed container',
  'ajudar': 'Think "aid" - to help',
  'entendre': 'Think "understand" - comprehend',
  'aprendre': 'Think "apprehend" - to grasp/learn',
  'escriure': 'Think "scribe" - one who writes',
  'llegir': 'Think "legible" - able to be read',
  'petit': 'Think "petite" - small',
  'gran': 'Think "grand" - large/great',
  'nou': 'Think "nouveau" - new',
  'vell': 'Think "veteran" - old/experienced',
  'bo': 'Think "bon" (French) - good',
  'dolent': 'Think "doloroso" - bad feeling',
  'feliç': 'Think "felicity" - happiness',
  'trist': 'Think "triste" - sad',
};

// Get etymology for a word
export function getEtymology(word: string): Etymology | null {
  const lowerWord = word.toLowerCase();

  // Check Latin roots
  for (const [root, data] of Object.entries(LATIN_ROOTS)) {
    if (data.examples.some(ex => ex.toLowerCase().includes(lowerWord) || lowerWord.includes(ex.toLowerCase().split(' ')[0]))) {
      return {
        word: lowerWord,
        origin: 'latin',
        rootWord: root,
        meaning: data.meaning,
        notes: `From Latin "${root}" meaning "${data.meaning}"`,
      };
    }
  }

  // Check Arabic roots
  for (const [root, data] of Object.entries(ARABIC_ROOTS)) {
    if (data.examples.some(ex => ex.toLowerCase().includes(lowerWord) || lowerWord.includes(ex.toLowerCase().split(' ')[0]))) {
      return {
        word: lowerWord,
        origin: 'arabic',
        rootWord: root,
        meaning: data.meaning,
        notes: `From Arabic, ${root === 'al-' ? 'with the Arabic article "al-"' : `from "${root}"`}`,
      };
    }
  }

  return null;
}

// Get cognates for a word
export function getCognates(word: string): Cognate | null {
  const lowerWord = word.toLowerCase();
  return COGNATES.find(c =>
    c.catalan.toLowerCase() === lowerWord ||
    c.english.toLowerCase().includes(lowerWord)
  ) || null;
}

// Get false friend warning if applicable
export function getFalseFriend(word: string): FalseFriend | null {
  const lowerWord = word.toLowerCase();
  return FALSE_FRIENDS.find(f => f.catalan.toLowerCase() === lowerWord) || null;
}

// Get phonetic memory hook
export function getPhoneticHook(word: string): string | null {
  const lowerWord = word.toLowerCase();
  return PHONETIC_HOOKS[lowerWord] || null;
}
