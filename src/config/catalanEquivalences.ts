/**
 * Catalan linguistic equivalences for answer validation.
 * These mappings allow the validator to accept alternative spellings,
 * synonyms, and grammatical variants as correct answers.
 */

/**
 * Phrase equivalences - different spellings of the same phrase.
 * Maps a normalized phrase to all valid alternative spellings.
 */
export const CATALAN_PHRASE_EQUIVALENCES: Record<string, string[]> = {
  // Please variants
  'si us plau': ['sisplau', 'siusplau'],
  'sisplau': ['si us plau', 'siusplau'],
  'siusplau': ['si us plau', 'sisplau'],

  // Apology/excuse me variants (formal/informal)
  'perdo': ['perdona', 'perdoni', 'disculpi', 'disculpa', 'disculpe'],
  'perdona': ['perdo', 'perdoni', 'disculpi', 'disculpa', 'disculpe'],
  'perdoni': ['perdo', 'perdona', 'disculpi', 'disculpa', 'disculpe'],
  'disculpi': ['perdo', 'perdona', 'perdoni', 'disculpa', 'disculpe'],
  'disculpa': ['perdo', 'perdona', 'perdoni', 'disculpi', 'disculpe'],
  'disculpe': ['perdo', 'perdona', 'perdoni', 'disculpi', 'disculpa'],

  // Welcome variants (gender)
  'benvingut': ['benvinguda'],
  'benvinguda': ['benvingut'],

  // Pleased to meet you variants (gender)
  'encantat': ['encantada'],
  'encantada': ['encantat'],

  // Thank you variants
  'gracies': ['moltes gracies', 'mercès', 'merci'],
  'moltes gracies': ['gracies', 'mercès'],

  // Goodbye variants
  'adeu': ['adeu-siau', 'a reveure'],
  'adeu-siau': ['adeu', 'a reveure'],
};

/**
 * Common synonyms - groups of words that can substitute for each other.
 * Each array contains words that mean the same thing in common usage.
 */
export const CATALAN_SYNONYMS: string[][] = [
  // Boy/child
  ['noi', 'nen', 'xicot', 'al·lot'],
  // Girl/child
  ['noia', 'nena', 'xicota', 'al·lota'],
  // Woman/wife
  ['muller', 'dona', 'esposa'],
  // Man/husband
  ['marit', 'home', 'espòs'],
  // House/home
  ['casa', 'llar'],
  // Car/automobile
  ['cotxe', 'auto', 'automòbil', 'vehicle'],
  // Computer
  ['ordinador', 'computador', 'computadora'],
  // Store/shop
  ['botiga', 'tenda'],
  // Big/large
  ['gran', 'gros'],
  // Small/little
  ['petit', 'menut'],
  // To speak/talk
  ['parlar', 'xerrar'],
  // To eat
  ['menjar', 'dinar'], // Note: dinar is specifically "to have lunch" but often used for eating
  // To walk
  ['caminar', 'passejar'],
  // Money
  ['diners', 'pasta', 'calés'],
  // Work/job
  ['feina', 'treball'],
  // Friend
  ['amic', 'company'],
  // Now
  ['ara', 'avui'], // avui means "today" but contextually similar
  // Very/much
  ['molt', 'força', 'ben'],
];

/**
 * Catalan contractions - contracted forms and their expansions.
 * Used to match when user types expanded form but answer is contracted (or vice versa).
 */
export const CATALAN_CONTRACTIONS: Record<string, string> = {
  // Preposition + definite article contractions
  'al': 'a el',
  'als': 'a els',
  'del': 'de el',
  'dels': 'de els',
  'pel': 'per el',
  'pels': 'per els',
  'cal': 'ca el',    // "at the house of"
  'can': 'ca en',    // "at the house of [name]"

  // Reverse mappings for bidirectional matching
  'a el': 'al',
  'a els': 'als',
  'de el': 'del',
  'de els': 'dels',
  'per el': 'pel',
  'per els': 'pels',
};

/**
 * Catalan articles - used for optional article stripping.
 * When matching, we can try stripping leading articles to allow
 * "gat" to match "el gat".
 */
export const CATALAN_ARTICLES: string[] = [
  // Definite articles
  'el', 'la', 'els', 'les',
  // Elided articles (before vowels)
  "l'",
  // Indefinite articles
  'un', 'una', 'uns', 'unes',
  // Personal articles (for names)
  'en', 'na',
  // Partitive
  "d'",
];

/**
 * Special Catalan characters that should be preserved in display
 * but normalized in comparison.
 */
export const CATALAN_SPECIAL_CHARS: string[] = [
  'à', 'é', 'è', 'í', 'ï', 'ó', 'ò', 'ú', 'ü', 'ç',
  'l·l', // ela geminada (geminated L)
];
