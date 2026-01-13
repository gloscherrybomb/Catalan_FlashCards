// Vocabulary organized by the 20 units from "Colloquial Catalan" course
// Each unit builds progressively on previous knowledge

import type { Flashcard } from '../types/flashcard';

export interface UnitVocabulary {
  unitId: string;
  unitNumber: number;
  title: string;
  titleCatalan: string;
  description: string;
  words: VocabWord[];
}

export interface VocabWord {
  front: string;  // English
  back: string;   // Catalan
  category: string;
  gender?: 'masculine' | 'feminine';
  notes?: string;
}

// Generate a unique ID for vocabulary cards
function generateId(unitNumber: number, index: number): string {
  return `unit${unitNumber}_vocab_${index}`;
}

// Convert unit vocabulary to Flashcard objects
export function createFlashcardsFromUnit(unit: UnitVocabulary): Flashcard[] {
  return unit.words.map((word, index) => ({
    id: generateId(unit.unitNumber, index),
    front: word.front,
    back: word.back,
    category: word.category,
    gender: word.gender,
    notes: word.notes || '',
    iconKey: `unit${unit.unitNumber}_${word.front.toLowerCase().replace(/\s+/g, '-')}`,
    createdAt: new Date(),
  }));
}

// Unit 1: Welcome! (Benvinguda i benvingut!)
const UNIT_1: UnitVocabulary = {
  unitId: 'unit-1-welcome',
  unitNumber: 1,
  title: 'Welcome!',
  titleCatalan: 'Benvinguda i benvingut!',
  description: 'Essential greetings and basic introductions',
  words: [
    { front: 'hello', back: 'hola', category: 'Greetings' },
    { front: 'good morning', back: 'bon dia', category: 'Greetings', notes: 'Used until noon' },
    { front: 'good afternoon', back: 'bona tarda', category: 'Greetings', notes: 'Used after noon' },
    { front: 'good evening/night', back: 'bona nit', category: 'Greetings' },
    { front: 'goodbye', back: 'adéu', category: 'Greetings' },
    { front: 'see you later', back: 'fins després', category: 'Greetings' },
    { front: 'see you tomorrow', back: 'fins demà', category: 'Greetings' },
    { front: 'welcome (to a man)', back: 'benvingut', category: 'Greetings', gender: 'masculine' },
    { front: 'welcome (to a woman)', back: 'benvinguda', category: 'Greetings', gender: 'feminine' },
    { front: 'yes', back: 'sí', category: 'Basics' },
    { front: 'no', back: 'no', category: 'Basics' },
    { front: 'please', back: 'si us plau', category: 'Greetings', notes: 'Formal' },
    { front: 'please (informal)', back: 'sisplau', category: 'Greetings', notes: 'Informal contraction' },
    { front: 'thank you', back: 'gràcies', category: 'Greetings' },
    { front: "you're welcome", back: 'de res', category: 'Greetings' },
  ],
};

// Unit 2: What is your name? (Com es diu?)
const UNIT_2: UnitVocabulary = {
  unitId: 'unit-2-introductions',
  unitNumber: 2,
  title: 'What is your name?',
  titleCatalan: 'Com es diu?',
  description: 'Introducing yourself and asking about others',
  words: [
    { front: 'What is your name? (formal)', back: 'Com es diu?', category: 'Phrases' },
    { front: 'What is your name? (informal)', back: 'Com et dius?', category: 'Phrases' },
    { front: 'My name is...', back: 'Em dic...', category: 'Phrases' },
    { front: 'I am...', back: 'Sóc...', category: 'Phrases' },
    { front: 'Nice to meet you (masc)', back: 'encantat', category: 'Greetings', gender: 'masculine' },
    { front: 'Nice to meet you (fem)', back: 'encantada', category: 'Greetings', gender: 'feminine' },
    { front: 'How are you? (informal)', back: 'Com estàs?', category: 'Greetings' },
    { front: 'How are you? (formal)', back: 'Com està?', category: 'Greetings' },
    { front: "I'm fine", back: 'Estic bé', category: 'Phrases' },
    { front: 'very well', back: 'molt bé', category: 'Phrases' },
    { front: 'and you?', back: 'i tu?', category: 'Phrases', notes: 'Informal' },
    { front: 'and you? (formal)', back: 'i vostè?', category: 'Phrases' },
    { front: 'excuse me/sorry', back: 'perdó', category: 'Greetings' },
    { front: 'excuse me (formal)', back: 'perdoni', category: 'Greetings' },
    { front: "I don't understand", back: 'No entenc', category: 'Phrases' },
    { front: 'Do you speak English?', back: 'Parla anglès?', category: 'Phrases' },
  ],
};

// Unit 3: A coffee, please (Un cafè, sisplau)
const UNIT_3: UnitVocabulary = {
  unitId: 'unit-3-ordering',
  unitNumber: 3,
  title: 'A coffee, please',
  titleCatalan: 'Un cafè, sisplau',
  description: 'Ordering in a café or bar',
  words: [
    { front: 'coffee', back: 'cafè', category: 'Food & Drink', gender: 'masculine' },
    { front: 'tea', back: 'te', category: 'Food & Drink', gender: 'masculine' },
    { front: 'water', back: 'aigua', category: 'Food & Drink', gender: 'feminine' },
    { front: 'beer', back: 'cervesa', category: 'Food & Drink', gender: 'feminine' },
    { front: 'wine', back: 'vi', category: 'Food & Drink', gender: 'masculine' },
    { front: 'red wine', back: 'vi negre', category: 'Food & Drink', gender: 'masculine' },
    { front: 'white wine', back: 'vi blanc', category: 'Food & Drink', gender: 'masculine' },
    { front: 'orange juice', back: 'suc de taronja', category: 'Food & Drink', gender: 'masculine' },
    { front: 'apple juice', back: 'suc de poma', category: 'Food & Drink', gender: 'masculine' },
    { front: 'milk', back: 'llet', category: 'Food & Drink', gender: 'feminine' },
    { front: 'sugar', back: 'sucre', category: 'Food & Drink', gender: 'masculine' },
    { front: 'croissant', back: 'croissant', category: 'Food & Drink', gender: 'masculine' },
    { front: 'bread', back: 'pa', category: 'Food & Drink', gender: 'masculine' },
    { front: 'toast', back: 'torrada', category: 'Food & Drink', gender: 'feminine' },
    { front: 'the bill', back: 'el compte', category: 'Food & Drink', gender: 'masculine' },
    { front: 'waiter', back: 'cambrer', category: 'People', gender: 'masculine' },
    { front: 'waitress', back: 'cambrera', category: 'People', gender: 'feminine' },
    { front: 'I would like...', back: 'Voldria...', category: 'Phrases', notes: 'Polite form' },
    { front: 'Can I have...?', back: 'Puc tenir...?', category: 'Phrases' },
    { front: 'How much is it?', back: 'Quant és?', category: 'Phrases' },
    { front: 'with', back: 'amb', category: 'Basics' },
    { front: 'without', back: 'sense', category: 'Basics' },
    { front: 'hot', back: 'calent', category: 'Adjectives' },
    { front: 'cold', back: 'fred', category: 'Adjectives' },
    { front: 'glass', back: 'got', category: 'Objects', gender: 'masculine' },
    { front: 'cup', back: 'tassa', category: 'Objects', gender: 'feminine' },
    { front: 'bottle', back: 'ampolla', category: 'Objects', gender: 'feminine' },
  ],
};

// Unit 4: What would you like? (Què vols?)
const UNIT_4: UnitVocabulary = {
  unitId: 'unit-4-wants',
  unitNumber: 4,
  title: 'What would you like?',
  titleCatalan: 'Què vols?',
  description: 'Expressing wants and preferences',
  words: [
    { front: 'to want', back: 'voler', category: 'Verbs', notes: 'Jo vull, tu vols, ell vol' },
    { front: 'I want', back: 'vull', category: 'Verbs' },
    { front: 'you want (informal)', back: 'vols', category: 'Verbs' },
    { front: 'What do you want?', back: 'Què vols?', category: 'Phrases' },
    { front: 'to take/have', back: 'prendre', category: 'Verbs', notes: 'Used for drinks/food' },
    { front: 'something', back: 'alguna cosa', category: 'Basics' },
    { front: 'nothing', back: 'res', category: 'Basics' },
    { front: 'to eat', back: 'menjar', category: 'Verbs' },
    { front: 'to drink', back: 'beure', category: 'Verbs' },
    { front: 'sandwich', back: 'entrepà', category: 'Food & Drink', gender: 'masculine' },
    { front: 'olives', back: 'olives', category: 'Food & Drink', gender: 'feminine' },
    { front: 'squid', back: 'calamars', category: 'Food & Drink', gender: 'masculine' },
    { front: 'mineral water', back: 'aigua mineral', category: 'Food & Drink', gender: 'feminine' },
    { front: 'with gas', back: 'amb gas', category: 'Phrases' },
    { front: 'without gas', back: 'sense gas', category: 'Phrases' },
    { front: 'ham', back: 'pernil', category: 'Food & Drink', gender: 'masculine' },
    { front: 'cheese', back: 'formatge', category: 'Food & Drink', gender: 'masculine' },
    { front: 'salad', back: 'amanida', category: 'Food & Drink', gender: 'feminine' },
    { front: 'soup', back: 'sopa', category: 'Food & Drink', gender: 'feminine' },
    { front: 'meat', back: 'carn', category: 'Food & Drink', gender: 'feminine' },
    { front: 'fish', back: 'peix', category: 'Food & Drink', gender: 'masculine' },
    { front: 'chicken', back: 'pollastre', category: 'Food & Drink', gender: 'masculine' },
    { front: 'egg', back: 'ou', category: 'Food & Drink', gender: 'masculine' },
    { front: 'rice', back: 'arròs', category: 'Food & Drink', gender: 'masculine' },
    { front: 'potato', back: 'patata', category: 'Food & Drink', gender: 'feminine' },
    { front: 'tomato', back: 'tomàquet', category: 'Food & Drink', gender: 'masculine' },
    { front: 'onion', back: 'ceba', category: 'Food & Drink', gender: 'feminine' },
    { front: 'garlic', back: 'all', category: 'Food & Drink', gender: 'masculine' },
    { front: 'oil', back: 'oli', category: 'Food & Drink', gender: 'masculine' },
    { front: 'salt', back: 'sal', category: 'Food & Drink', gender: 'feminine' },
    { front: 'pepper', back: 'pebre', category: 'Food & Drink', gender: 'masculine' },
  ],
};

// Unit 5: Do you want my mobile? (Vols el meu mòbil?)
const UNIT_5: UnitVocabulary = {
  unitId: 'unit-5-possessives',
  unitNumber: 5,
  title: 'Do you want my mobile?',
  titleCatalan: 'Vols el meu mòbil?',
  description: 'Possessives and personal belongings',
  words: [
    { front: 'my (masc)', back: 'el meu', category: 'Possessives' },
    { front: 'my (fem)', back: 'la meva', category: 'Possessives' },
    { front: 'your (masc, informal)', back: 'el teu', category: 'Possessives' },
    { front: 'your (fem, informal)', back: 'la teva', category: 'Possessives' },
    { front: 'his/her (masc)', back: 'el seu', category: 'Possessives' },
    { front: 'his/her (fem)', back: 'la seva', category: 'Possessives' },
    { front: 'our (masc)', back: 'el nostre', category: 'Possessives' },
    { front: 'our (fem)', back: 'la nostra', category: 'Possessives' },
    { front: 'their (masc)', back: 'el seu', category: 'Possessives' },
    { front: 'mobile phone', back: 'mòbil', category: 'Objects', gender: 'masculine' },
    { front: 'telephone', back: 'telèfon', category: 'Objects', gender: 'masculine' },
    { front: 'computer', back: 'ordinador', category: 'Objects', gender: 'masculine' },
    { front: 'laptop', back: 'portàtil', category: 'Objects', gender: 'masculine' },
    { front: 'email', back: 'correu electrònic', category: 'Objects', gender: 'masculine' },
    { front: 'address', back: 'adreça', category: 'Objects', gender: 'feminine' },
    { front: 'key', back: 'clau', category: 'Objects', gender: 'feminine' },
    { front: 'wallet', back: 'cartera', category: 'Objects', gender: 'feminine' },
    { front: 'bag', back: 'bossa', category: 'Objects', gender: 'feminine' },
    { front: 'suitcase', back: 'maleta', category: 'Objects', gender: 'feminine' },
    { front: 'to have', back: 'tenir', category: 'Verbs', notes: 'Jo tinc, tu tens, ell té' },
    { front: 'I have', back: 'tinc', category: 'Verbs' },
    { front: 'to be able to', back: 'poder', category: 'Verbs', notes: 'Jo puc, tu pots, ell pot' },
    { front: 'there is/there are', back: 'hi ha', category: 'Phrases' },
    { front: 'book', back: 'llibre', category: 'Objects', gender: 'masculine' },
    { front: 'pen', back: 'bolígraf', category: 'Objects', gender: 'masculine' },
    { front: 'paper', back: 'paper', category: 'Objects', gender: 'masculine' },
  ],
};

// Unit 6: My family (La meva família)
const UNIT_6: UnitVocabulary = {
  unitId: 'unit-6-family',
  unitNumber: 6,
  title: 'My family',
  titleCatalan: 'La meva família',
  description: 'Family members and relationships',
  words: [
    { front: 'family', back: 'família', category: 'Family', gender: 'feminine' },
    { front: 'father', back: 'pare', category: 'Family', gender: 'masculine' },
    { front: 'mother', back: 'mare', category: 'Family', gender: 'feminine' },
    { front: 'parents', back: 'pares', category: 'Family', gender: 'masculine' },
    { front: 'brother', back: 'germà', category: 'Family', gender: 'masculine' },
    { front: 'sister', back: 'germana', category: 'Family', gender: 'feminine' },
    { front: 'son', back: 'fill', category: 'Family', gender: 'masculine' },
    { front: 'daughter', back: 'filla', category: 'Family', gender: 'feminine' },
    { front: 'children', back: 'fills', category: 'Family', gender: 'masculine' },
    { front: 'grandfather', back: 'avi', category: 'Family', gender: 'masculine' },
    { front: 'grandmother', back: 'àvia', category: 'Family', gender: 'feminine' },
    { front: 'grandparents', back: 'avis', category: 'Family', gender: 'masculine' },
    { front: 'grandson', back: 'nét', category: 'Family', gender: 'masculine' },
    { front: 'granddaughter', back: 'néta', category: 'Family', gender: 'feminine' },
    { front: 'husband', back: 'marit', category: 'Family', gender: 'masculine' },
    { front: 'wife', back: 'muller / dona', category: 'Family', gender: 'feminine' },
    { front: 'uncle', back: 'oncle', category: 'Family', gender: 'masculine' },
    { front: 'aunt', back: 'tieta', category: 'Family', gender: 'feminine' },
    { front: 'cousin (male)', back: 'cosí', category: 'Family', gender: 'masculine' },
    { front: 'cousin (female)', back: 'cosina', category: 'Family', gender: 'feminine' },
    { front: 'nephew', back: 'nebot', category: 'Family', gender: 'masculine' },
    { front: 'niece', back: 'neboda', category: 'Family', gender: 'feminine' },
    { front: 'boyfriend', back: 'xicot', category: 'Family', gender: 'masculine' },
    { front: 'girlfriend', back: 'xicota', category: 'Family', gender: 'feminine' },
    { front: 'friend (male)', back: 'amic', category: 'People', gender: 'masculine' },
    { front: 'friend (female)', back: 'amiga', category: 'People', gender: 'feminine' },
    { front: 'How old are you?', back: 'Quants anys tens?', category: 'Phrases' },
    { front: 'I am ... years old', back: 'Tinc ... anys', category: 'Phrases' },
    { front: 'young', back: 'jove', category: 'Adjectives' },
    { front: 'old (person)', back: 'vell / vella', category: 'Adjectives' },
    { front: 'married', back: 'casat / casada', category: 'Adjectives' },
    { front: 'single', back: 'solter / soltera', category: 'Adjectives' },
  ],
};

// Unit 7: Where is the hotel? (Perdoni, on és l'Hotel Miramar?)
const UNIT_7: UnitVocabulary = {
  unitId: 'unit-7-directions',
  unitNumber: 7,
  title: 'Where is the hotel?',
  titleCatalan: "Perdoni, on és l'Hotel Miramar?",
  description: 'Asking for and giving directions',
  words: [
    { front: 'Where is...?', back: 'On és...?', category: 'Phrases' },
    { front: 'street', back: 'carrer', category: 'Places', gender: 'masculine' },
    { front: 'square', back: 'plaça', category: 'Places', gender: 'feminine' },
    { front: 'avenue', back: 'avinguda', category: 'Places', gender: 'feminine' },
    { front: 'left', back: 'esquerra', category: 'Directions', gender: 'feminine' },
    { front: 'right', back: 'dreta', category: 'Directions', gender: 'feminine' },
    { front: 'straight ahead', back: 'tot recte', category: 'Directions' },
    { front: 'near', back: 'a prop', category: 'Directions' },
    { front: 'far', back: 'lluny', category: 'Directions' },
    { front: 'here', back: 'aquí', category: 'Directions' },
    { front: 'there', back: 'allà', category: 'Directions' },
    { front: 'in front of', back: 'davant de', category: 'Directions' },
    { front: 'behind', back: 'darrere de', category: 'Directions' },
    { front: 'next to', back: 'al costat de', category: 'Directions' },
    { front: 'between', back: 'entre', category: 'Directions' },
    { front: 'first', back: 'primer / primera', category: 'Numbers' },
    { front: 'second', back: 'segon / segona', category: 'Numbers' },
    { front: 'third', back: 'tercer / tercera', category: 'Numbers' },
    { front: 'corner', back: 'cantonada', category: 'Places', gender: 'feminine' },
    { front: 'hotel', back: 'hotel', category: 'Places', gender: 'masculine' },
    { front: 'bank', back: 'banc', category: 'Places', gender: 'masculine' },
    { front: 'pharmacy', back: 'farmàcia', category: 'Places', gender: 'feminine' },
    { front: 'hospital', back: 'hospital', category: 'Places', gender: 'masculine' },
    { front: 'supermarket', back: 'supermercat', category: 'Places', gender: 'masculine' },
    { front: 'restaurant', back: 'restaurant', category: 'Places', gender: 'masculine' },
    { front: 'church', back: 'església', category: 'Places', gender: 'feminine' },
    { front: 'museum', back: 'museu', category: 'Places', gender: 'masculine' },
    { front: 'park', back: 'parc', category: 'Places', gender: 'masculine' },
    { front: 'beach', back: 'platja', category: 'Places', gender: 'feminine' },
    { front: 'Do you know where...?', back: 'Sap on és...?', category: 'Phrases' },
    { front: 'How do I get to...?', back: 'Com puc arribar a...?', category: 'Phrases' },
  ],
};

// Unit 8: What is your address? (Quina és la teva adreça?)
const UNIT_8: UnitVocabulary = {
  unitId: 'unit-8-address',
  unitNumber: 8,
  title: 'What is your address?',
  titleCatalan: 'Quina és la teva adreça?',
  description: 'Numbers, addresses and contact information',
  words: [
    { front: 'one', back: 'un / una', category: 'Numbers' },
    { front: 'two', back: 'dos / dues', category: 'Numbers' },
    { front: 'three', back: 'tres', category: 'Numbers' },
    { front: 'four', back: 'quatre', category: 'Numbers' },
    { front: 'five', back: 'cinc', category: 'Numbers' },
    { front: 'six', back: 'sis', category: 'Numbers' },
    { front: 'seven', back: 'set', category: 'Numbers' },
    { front: 'eight', back: 'vuit', category: 'Numbers' },
    { front: 'nine', back: 'nou', category: 'Numbers' },
    { front: 'ten', back: 'deu', category: 'Numbers' },
    { front: 'eleven', back: 'onze', category: 'Numbers' },
    { front: 'twelve', back: 'dotze', category: 'Numbers' },
    { front: 'fifteen', back: 'quinze', category: 'Numbers' },
    { front: 'twenty', back: 'vint', category: 'Numbers' },
    { front: 'thirty', back: 'trenta', category: 'Numbers' },
    { front: 'forty', back: 'quaranta', category: 'Numbers' },
    { front: 'fifty', back: 'cinquanta', category: 'Numbers' },
    { front: 'one hundred', back: 'cent', category: 'Numbers' },
    { front: 'one thousand', back: 'mil', category: 'Numbers' },
    { front: 'floor/apartment', back: 'pis', category: 'Places', gender: 'masculine' },
    { front: 'door', back: 'porta', category: 'Places', gender: 'feminine' },
    { front: 'house', back: 'casa', category: 'Places', gender: 'feminine' },
    { front: 'apartment building', back: 'bloc', category: 'Places', gender: 'masculine' },
    { front: 'stairs', back: 'escales', category: 'Places', gender: 'feminine' },
    { front: 'elevator', back: 'ascensor', category: 'Places', gender: 'masculine' },
    { front: 'What is your phone number?', back: 'Quin és el teu telèfon?', category: 'Phrases' },
    { front: 'Where do you live?', back: 'On vius?', category: 'Phrases' },
    { front: 'I live in...', back: 'Visc a...', category: 'Phrases' },
  ],
};

// Unit 9: Walking down the Ramblas (Tot passejant per la Rambla)
const UNIT_9: UnitVocabulary = {
  unitId: 'unit-9-ramblas',
  unitNumber: 9,
  title: 'A walk down the Ramblas',
  titleCatalan: 'Tot passejant per la Rambla',
  description: 'Describing places and surroundings',
  words: [
    { front: 'to walk/stroll', back: 'passejar', category: 'Verbs' },
    { front: 'beautiful', back: 'bonic / bonica', category: 'Adjectives' },
    { front: 'interesting', back: 'interessant', category: 'Adjectives' },
    { front: 'famous', back: 'famós / famosa', category: 'Adjectives' },
    { front: 'old', back: 'antic / antiga', category: 'Adjectives' },
    { front: 'modern', back: 'modern / moderna', category: 'Adjectives' },
    { front: 'big', back: 'gran', category: 'Adjectives' },
    { front: 'small', back: 'petit / petita', category: 'Adjectives' },
    { front: 'city', back: 'ciutat', category: 'Places', gender: 'feminine' },
    { front: 'beach', back: 'platja', category: 'Places', gender: 'feminine' },
    { front: 'port/harbor', back: 'port', category: 'Places', gender: 'masculine' },
    { front: 'museum', back: 'museu', category: 'Places', gender: 'masculine' },
    { front: 'church', back: 'església', category: 'Places', gender: 'feminine' },
    { front: 'building', back: 'edifici', category: 'Places', gender: 'masculine' },
    { front: 'people', back: 'gent', category: 'General', gender: 'feminine' },
    { front: 'tourist', back: 'turista', category: 'General' },
    { front: 'I like', back: "m'agrada", category: 'Phrases' },
    { front: 'I love', back: "m'encanta", category: 'Phrases' },
    // Colors
    { front: 'red', back: 'vermell / vermella', category: 'Colors' },
    { front: 'blue', back: 'blau / blava', category: 'Colors' },
    { front: 'green', back: 'verd / verda', category: 'Colors' },
    { front: 'yellow', back: 'groc / groga', category: 'Colors' },
    { front: 'white', back: 'blanc / blanca', category: 'Colors' },
    { front: 'black', back: 'negre / negra', category: 'Colors' },
    { front: 'brown', back: 'marró', category: 'Colors' },
    { front: 'grey', back: 'gris', category: 'Colors' },
    { front: 'orange', back: 'taronja', category: 'Colors' },
    { front: 'pink', back: 'rosa', category: 'Colors' },
    { front: 'purple', back: 'lila / morat', category: 'Colors' },
  ],
};

// Unit 10: At the Boqueria market (Al Mercat de la Boqueria)
const UNIT_10: UnitVocabulary = {
  unitId: 'unit-10-market',
  unitNumber: 10,
  title: 'At the Boqueria market',
  titleCatalan: 'Al Mercat de la Boqueria',
  description: 'Shopping for food at the market',
  words: [
    { front: 'market', back: 'mercat', category: 'Places', gender: 'masculine' },
    { front: 'shop', back: 'botiga', category: 'Places', gender: 'feminine' },
    { front: 'fruit', back: 'fruita', category: 'Food & Drink', gender: 'feminine' },
    { front: 'vegetables', back: 'verdures', category: 'Food & Drink', gender: 'feminine' },
    { front: 'apple', back: 'poma', category: 'Food & Drink', gender: 'feminine' },
    { front: 'orange', back: 'taronja', category: 'Food & Drink', gender: 'feminine' },
    { front: 'banana', back: 'plàtan', category: 'Food & Drink', gender: 'masculine' },
    { front: 'strawberry', back: 'maduixa', category: 'Food & Drink', gender: 'feminine' },
    { front: 'grape', back: 'raïm', category: 'Food & Drink', gender: 'masculine' },
    { front: 'lemon', back: 'llimona', category: 'Food & Drink', gender: 'feminine' },
    { front: 'peach', back: 'préssec', category: 'Food & Drink', gender: 'masculine' },
    { front: 'pear', back: 'pera', category: 'Food & Drink', gender: 'feminine' },
    { front: 'tomato', back: 'tomàquet', category: 'Food & Drink', gender: 'masculine' },
    { front: 'lettuce', back: 'enciam', category: 'Food & Drink', gender: 'masculine' },
    { front: 'carrot', back: 'pastanaga', category: 'Food & Drink', gender: 'feminine' },
    { front: 'pepper (vegetable)', back: 'pebrot', category: 'Food & Drink', gender: 'masculine' },
    { front: 'fish', back: 'peix', category: 'Food & Drink', gender: 'masculine' },
    { front: 'meat', back: 'carn', category: 'Food & Drink', gender: 'feminine' },
    { front: 'cheese', back: 'formatge', category: 'Food & Drink', gender: 'masculine' },
    { front: 'bread', back: 'pa', category: 'Food & Drink', gender: 'masculine' },
    { front: 'kilogram', back: 'quilo', category: 'Shopping', gender: 'masculine' },
    { front: 'half a kilo', back: 'mig quilo', category: 'Shopping' },
    { front: 'gram', back: 'gram', category: 'Shopping', gender: 'masculine' },
    { front: 'price', back: 'preu', category: 'Shopping', gender: 'masculine' },
    { front: 'cheap', back: 'barat / barata', category: 'Adjectives' },
    { front: 'expensive', back: 'car / cara', category: 'Adjectives' },
    { front: 'How much does it cost?', back: 'Quant costa?', category: 'Phrases' },
    { front: 'to buy', back: 'comprar', category: 'Verbs' },
    { front: 'to pay', back: 'pagar', category: 'Verbs' },
    { front: 'to sell', back: 'vendre', category: 'Verbs' },
    { front: 'Can I have...?', back: 'Em posa...?', category: 'Phrases' },
    { front: 'Anything else?', back: 'Alguna cosa més?', category: 'Phrases' },
  ],
};

// Unit 11-20 (abbreviated for space - key vocabulary)
const UNIT_11: UnitVocabulary = {
  unitId: 'unit-11-preferences',
  unitNumber: 11,
  title: 'How would you like them?',
  titleCatalan: 'Com els vol?',
  description: 'Expressing preferences and opinions',
  words: [
    { front: 'I like it', back: "m'agrada", category: 'Phrases' },
    { front: 'I dont like it', back: "no m'agrada", category: 'Phrases' },
    { front: 'Do you like...?', back: "T'agrada...?", category: 'Phrases' },
    { front: 'to prefer', back: 'preferir', category: 'Verbs' },
    { front: 'better', back: 'millor', category: 'Adjectives' },
    { front: 'worse', back: 'pitjor', category: 'Adjectives' },
    { front: 'good', back: 'bo / bona', category: 'Adjectives' },
    { front: 'bad', back: 'dolent / dolenta', category: 'Adjectives' },
    { front: 'a lot', back: 'molt', category: 'Adverbs' },
    { front: 'a little', back: 'una mica', category: 'Adverbs' },
    { front: 'enough', back: 'prou', category: 'Adverbs' },
    { front: 'too much', back: 'massa', category: 'Adverbs' },
    { front: 'fresh', back: 'fresc / fresca', category: 'Adjectives' },
    { front: 'ripe', back: 'madur / madura', category: 'Adjectives' },
  ],
};

const UNIT_12: UnitVocabulary = {
  unitId: 'unit-12-restaurant',
  unitNumber: 12,
  title: 'At the restaurant',
  titleCatalan: 'Al restaurant Planelles',
  description: 'Dining at a restaurant',
  words: [
    { front: 'restaurant', back: 'restaurant', category: 'Places', gender: 'masculine' },
    { front: 'menu', back: 'carta / menú', category: 'Food & Drink', gender: 'feminine' },
    { front: 'starter', back: 'entrant', category: 'Food & Drink', gender: 'masculine' },
    { front: 'main course', back: 'plat principal', category: 'Food & Drink', gender: 'masculine' },
    { front: 'dessert', back: 'postres', category: 'Food & Drink', gender: 'feminine' },
    { front: 'salad', back: 'amanida', category: 'Food & Drink', gender: 'feminine' },
    { front: 'soup', back: 'sopa', category: 'Food & Drink', gender: 'feminine' },
    { front: 'chicken', back: 'pollastre', category: 'Food & Drink', gender: 'masculine' },
    { front: 'paella', back: 'paella', category: 'Food & Drink', gender: 'feminine' },
    { front: 'waiter', back: 'cambrer', category: 'People', gender: 'masculine' },
    { front: 'delicious', back: 'deliciós / deliciosa', category: 'Adjectives' },
    { front: 'What do you recommend?', back: 'Què recomana?', category: 'Phrases' },
    { front: 'The bill, please', back: 'El compte, sisplau', category: 'Phrases' },
  ],
};

const UNIT_13: UnitVocabulary = {
  unitId: 'unit-13-daily-life',
  unitNumber: 13,
  title: 'Daily life',
  titleCatalan: 'La vida diària',
  description: 'Daily routines and activities',
  words: [
    { front: 'to wake up', back: 'despertar-se', category: 'Verbs' },
    { front: 'to get up', back: 'llevar-se', category: 'Verbs' },
    { front: 'to shower', back: 'dutxar-se', category: 'Verbs' },
    { front: 'to have breakfast', back: 'esmorzar', category: 'Verbs' },
    { front: 'to work', back: 'treballar', category: 'Verbs' },
    { front: 'to have lunch', back: 'dinar', category: 'Verbs' },
    { front: 'to have dinner', back: 'sopar', category: 'Verbs' },
    { front: 'to sleep', back: 'dormir', category: 'Verbs' },
    { front: 'morning', back: 'matí', category: 'Time', gender: 'masculine' },
    { front: 'afternoon', back: 'tarda', category: 'Time', gender: 'feminine' },
    { front: 'evening/night', back: 'vespre / nit', category: 'Time', gender: 'masculine' },
    { front: 'What time is it?', back: 'Quina hora és?', category: 'Phrases' },
    { front: 'at what time?', back: 'a quina hora?', category: 'Phrases' },
    { front: 'early', back: 'aviat', category: 'Adverbs' },
    { front: 'late', back: 'tard', category: 'Adverbs' },
  ],
};

const UNIT_14: UnitVocabulary = {
  unitId: 'unit-14-present-perfect',
  unitNumber: 14,
  title: 'What have you done today?',
  titleCatalan: 'Què has fet avui?',
  description: 'Talking about recent past events',
  words: [
    { front: 'today', back: 'avui', category: 'Time' },
    { front: 'this morning', back: 'aquest matí', category: 'Time' },
    { front: 'this afternoon', back: 'aquesta tarda', category: 'Time' },
    { front: 'already', back: 'ja', category: 'Adverbs' },
    { front: 'yet / still', back: 'encara', category: 'Adverbs' },
    { front: 'I have done', back: 'he fet', category: 'Verbs' },
    { front: 'I have been', back: 'he estat', category: 'Verbs' },
    { front: 'I have eaten', back: 'he menjat', category: 'Verbs' },
    { front: 'I have seen', back: 'he vist', category: 'Verbs' },
    { front: 'to go out', back: 'sortir', category: 'Verbs' },
    { front: 'to arrive', back: 'arribar', category: 'Verbs' },
    { front: 'to visit', back: 'visitar', category: 'Verbs' },
    { front: 'ever', back: 'mai', category: 'Adverbs', notes: 'In questions' },
    { front: 'never', back: 'mai', category: 'Adverbs', notes: 'In negative sentences' },
  ],
};

const UNIT_15: UnitVocabulary = {
  unitId: 'unit-15-conversation',
  unitNumber: 15,
  title: 'After dinner talk',
  titleCatalan: 'La sobretaula',
  description: 'Casual conversation and opinions',
  words: [
    { front: 'to think', back: 'pensar', category: 'Verbs' },
    { front: 'to believe', back: 'creure', category: 'Verbs' },
    { front: 'I think that...', back: 'Penso que...', category: 'Phrases' },
    { front: 'in my opinion', back: 'segons jo', category: 'Phrases' },
    { front: 'I agree', back: "estic d'acord", category: 'Phrases' },
    { front: 'I disagree', back: "no estic d'acord", category: 'Phrases' },
    { front: 'perhaps', back: 'potser', category: 'Adverbs' },
    { front: 'of course', back: 'és clar', category: 'Phrases' },
    { front: 'really?', back: 'de veritat?', category: 'Phrases' },
    { front: 'interesting', back: 'interessant', category: 'Adjectives' },
    { front: 'boring', back: 'avorrit / avorrida', category: 'Adjectives' },
    { front: 'funny', back: 'divertit / divertida', category: 'Adjectives' },
  ],
};

const UNIT_16: UnitVocabulary = {
  unitId: 'unit-16-past',
  unitNumber: 16,
  title: 'What did you do?',
  titleCatalan: 'Què vas fer?',
  description: 'Talking about past events',
  words: [
    { front: 'yesterday', back: 'ahir', category: 'Time' },
    { front: 'last week', back: 'la setmana passada', category: 'Time' },
    { front: 'last month', back: 'el mes passat', category: 'Time' },
    { front: 'last year', back: "l'any passat", category: 'Time' },
    { front: 'I went', back: 'vaig anar', category: 'Verbs' },
    { front: 'I did/made', back: 'vaig fer', category: 'Verbs' },
    { front: 'I saw', back: 'vaig veure', category: 'Verbs' },
    { front: 'I ate', back: 'vaig menjar', category: 'Verbs' },
    { front: 'I was', back: 'vaig ser / estar', category: 'Verbs' },
    { front: 'ago', back: 'fa', category: 'Time', notes: 'fa dos dies = two days ago' },
    { front: 'during', back: 'durant', category: 'Time' },
    { front: 'then', back: 'llavors', category: 'Adverbs' },
  ],
};

const UNIT_17: UnitVocabulary = {
  unitId: 'unit-17-weather',
  unitNumber: 17,
  title: 'What will the weather be like?',
  titleCatalan: 'Quin temps farà?',
  description: 'Weather and future plans',
  words: [
    { front: 'weather', back: 'temps', category: 'Weather', gender: 'masculine' },
    { front: 'sun', back: 'sol', category: 'Weather', gender: 'masculine' },
    { front: 'rain', back: 'pluja', category: 'Weather', gender: 'feminine' },
    { front: 'wind', back: 'vent', category: 'Weather', gender: 'masculine' },
    { front: 'cloud', back: 'núvol', category: 'Weather', gender: 'masculine' },
    { front: 'it is hot', back: 'fa calor', category: 'Weather' },
    { front: 'it is cold', back: 'fa fred', category: 'Weather' },
    { front: 'it is sunny', back: 'fa sol', category: 'Weather' },
    { front: 'it is raining', back: 'plou', category: 'Weather' },
    { front: 'tomorrow', back: 'demà', category: 'Time' },
    { front: 'I will go', back: 'aniré', category: 'Verbs' },
    { front: 'I will do', back: 'faré', category: 'Verbs' },
    { front: 'season', back: 'estació', category: 'Weather', gender: 'feminine' },
    { front: 'summer', back: 'estiu', category: 'Weather', gender: 'masculine' },
    { front: 'winter', back: 'hivern', category: 'Weather', gender: 'masculine' },
  ],
};

const UNIT_18: UnitVocabulary = {
  unitId: 'unit-18-information',
  unitNumber: 18,
  title: 'Could you give me information?',
  titleCatalan: 'Em podria donar informació?',
  description: 'Asking for information politely',
  words: [
    { front: 'information', back: 'informació', category: 'General', gender: 'feminine' },
    { front: 'Could you...?', back: 'Podria...?', category: 'Phrases' },
    { front: 'help', back: 'ajuda', category: 'General', gender: 'feminine' },
    { front: 'to help', back: 'ajudar', category: 'Verbs' },
    { front: 'office', back: 'oficina', category: 'Places', gender: 'feminine' },
    { front: 'tourist office', back: 'oficina de turisme', category: 'Places' },
    { front: 'map', back: 'mapa', category: 'Objects', gender: 'masculine' },
    { front: 'guide', back: 'guia', category: 'Objects', gender: 'feminine' },
    { front: 'timetable', back: 'horari', category: 'Objects', gender: 'masculine' },
    { front: 'open', back: 'obert / oberta', category: 'Adjectives' },
    { front: 'closed', back: 'tancat / tancada', category: 'Adjectives' },
    { front: 'free (no cost)', back: 'gratuït / gratuïta', category: 'Adjectives' },
  ],
};

const UNIT_19: UnitVocabulary = {
  unitId: 'unit-19-transport',
  unitNumber: 19,
  title: 'Public transport',
  titleCatalan: 'El transport públic',
  description: 'Getting around by public transport',
  words: [
    { front: 'train', back: 'tren', category: 'Transport', gender: 'masculine' },
    { front: 'bus', back: 'autobús', category: 'Transport', gender: 'masculine' },
    { front: 'metro/underground', back: 'metro', category: 'Transport', gender: 'masculine' },
    { front: 'taxi', back: 'taxi', category: 'Transport', gender: 'masculine' },
    { front: 'station', back: 'estació', category: 'Places', gender: 'feminine' },
    { front: 'stop', back: 'parada', category: 'Places', gender: 'feminine' },
    { front: 'ticket', back: 'bitllet', category: 'Transport', gender: 'masculine' },
    { front: 'single (ticket)', back: "d'anada", category: 'Transport' },
    { front: 'return (ticket)', back: "d'anada i tornada", category: 'Transport' },
    { front: 'platform', back: 'andana', category: 'Places', gender: 'feminine' },
    { front: 'to get on', back: 'pujar', category: 'Verbs' },
    { front: 'to get off', back: 'baixar', category: 'Verbs' },
    { front: 'to arrive', back: 'arribar', category: 'Verbs' },
    { front: 'to leave/depart', back: 'sortir', category: 'Verbs' },
  ],
};

const UNIT_20: UnitVocabulary = {
  unitId: 'unit-20-festival',
  unitNumber: 20,
  title: 'Festival!',
  titleCatalan: 'Festa major!',
  description: 'Catalan culture and celebrations',
  words: [
    { front: 'festival', back: 'festa', category: 'Culture', gender: 'feminine' },
    { front: 'party', back: 'festa', category: 'Culture', gender: 'feminine' },
    { front: 'celebration', back: 'celebració', category: 'Culture', gender: 'feminine' },
    { front: 'tradition', back: 'tradició', category: 'Culture', gender: 'feminine' },
    { front: 'music', back: 'música', category: 'Culture', gender: 'feminine' },
    { front: 'dance', back: 'ball', category: 'Culture', gender: 'masculine' },
    { front: 'to dance', back: 'ballar', category: 'Verbs' },
    { front: 'to celebrate', back: 'celebrar', category: 'Verbs' },
    { front: 'to enjoy', back: 'gaudir', category: 'Verbs' },
    { front: 'fireworks', back: 'focs artificials', category: 'Culture', gender: 'masculine' },
    { front: 'human tower', back: 'castell', category: 'Culture', gender: 'masculine', notes: 'Traditional Catalan custom' },
    { front: 'sardana', back: 'sardana', category: 'Culture', gender: 'feminine', notes: 'Traditional Catalan dance' },
    { front: 'Congratulations!', back: 'Felicitats!', category: 'Phrases' },
    { front: 'Happy birthday!', back: 'Per molts anys!', category: 'Phrases' },
    { front: 'Merry Christmas!', back: 'Bon Nadal!', category: 'Phrases' },
  ],
};

// Export all units
export const COURSE_UNITS: UnitVocabulary[] = [
  UNIT_1, UNIT_2, UNIT_3, UNIT_4, UNIT_5,
  UNIT_6, UNIT_7, UNIT_8, UNIT_9, UNIT_10,
  UNIT_11, UNIT_12, UNIT_13, UNIT_14, UNIT_15,
  UNIT_16, UNIT_17, UNIT_18, UNIT_19, UNIT_20,
];

// Get total vocabulary count
export function getTotalVocabularyCount(): number {
  return COURSE_UNITS.reduce((sum, unit) => sum + unit.words.length, 0);
}

// Get vocabulary by unit number
export function getUnitVocabulary(unitNumber: number): UnitVocabulary | undefined {
  return COURSE_UNITS.find(u => u.unitNumber === unitNumber);
}

// Get all vocabulary as flashcards
export function getAllCourseFlashcards(): Flashcard[] {
  return COURSE_UNITS.flatMap(unit => createFlashcardsFromUnit(unit));
}

// Get flashcards for specific units
export function getFlashcardsForUnits(unitNumbers: number[]): Flashcard[] {
  return COURSE_UNITS
    .filter(unit => unitNumbers.includes(unit.unitNumber))
    .flatMap(unit => createFlashcardsFromUnit(unit));
}
