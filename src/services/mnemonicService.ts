// Mnemonic generation service for Catalan vocabulary learning

import {
  getEtymology,
  getCognates,
  getFalseFriend,
  getPhoneticHook,
  type Etymology,
  type Cognate,
  type FalseFriend,
} from '../data/etymology';

export interface MnemonicData {
  word: string;
  translation: string;
  autoMnemonic?: string;
  etymology?: Etymology;
  cognate?: Cognate;
  falseFriend?: FalseFriend;
  phoneticHook?: string;
  similarWords?: string[];
}

// Generate automatic mnemonic based on word characteristics
export function generateAutoMnemonic(catalanWord: string, englishWord: string): string | null {
  const catLower = catalanWord.toLowerCase();
  const engLower = englishWord.toLowerCase();

  // Check for direct similarity
  if (catLower === engLower) {
    return `Same spelling in both languages!`;
  }

  // Check phonetic similarity
  const phoneticSimilarity = calculatePhoneticSimilarity(catLower, engLower);
  if (phoneticSimilarity > 0.6) {
    return `Sounds similar to "${englishWord}" in English`;
  }

  // Check for common endings
  const catalanEndings: Record<string, string> = {
    '-ció': '-tion',
    '-ment': '-ment',
    '-tat': '-ty',
    '-ble': '-ble',
    '-al': '-al',
    '-ant': '-ant',
    '-ent': '-ent',
    '-ós': '-ous',
    '-ic': '-ic',
    '-ista': '-ist',
  };

  for (const [catEnd, engEnd] of Object.entries(catalanEndings)) {
    if (catLower.endsWith(catEnd.slice(1)) && engLower.endsWith(engEnd.slice(1))) {
      return `Catalan "${catEnd}" = English "${engEnd}" ending pattern`;
    }
  }

  // Check for letter substitutions
  const substitutions = findLetterSubstitutions(catLower, engLower);
  if (substitutions) {
    return substitutions;
  }

  return null;
}

// Calculate phonetic similarity between two words
function calculatePhoneticSimilarity(word1: string, word2: string): number {
  const maxLen = Math.max(word1.length, word2.length);
  if (maxLen === 0) return 1;

  let matches = 0;
  const minLen = Math.min(word1.length, word2.length);

  for (let i = 0; i < minLen; i++) {
    if (word1[i] === word2[i]) {
      matches++;
    } else if (areSimilarSounds(word1[i], word2[i])) {
      matches += 0.5;
    }
  }

  return matches / maxLen;
}

// Check if two characters represent similar sounds
function areSimilarSounds(char1: string, char2: string): boolean {
  const similarGroups = [
    ['c', 'k', 'q'],
    ['f', 'ph'],
    ['i', 'y'],
    ['s', 'c', 'z'],
    ['j', 'g'],
    ['b', 'v'],
    ['ll', 'y', 'i'],
    ['ny', 'ñ', 'gn'],
  ];

  for (const group of similarGroups) {
    if (group.includes(char1) && group.includes(char2)) {
      return true;
    }
  }
  return false;
}

// Find letter substitution patterns
function findLetterSubstitutions(catalan: string, _english: string): string | null {
  const patterns: Array<{ cat: string; eng: string; description: string }> = [
    { cat: 'f', eng: 'ph', description: '"f" in Catalan often = "ph" in English' },
    { cat: 'qu', eng: 'c', description: '"qu" in Catalan often = "c" in English' },
    { cat: 'ny', eng: 'gn/ni', description: '"ny" in Catalan = "gn" or "ni" in English' },
    { cat: 'll', eng: 'l', description: 'Double "ll" is a single sound (like "y")' },
    { cat: 'ig', eng: 'y', description: '"ig" ending sounds like "y" or "tch"' },
    { cat: 'tx', eng: 'ch', description: '"tx" in Catalan = "ch" in English' },
    { cat: 'ss', eng: 's', description: 'Double "ss" = sharp "s" sound' },
  ];

  for (const pattern of patterns) {
    if (catalan.includes(pattern.cat)) {
      return pattern.description;
    }
  }

  return null;
}

// Get comprehensive mnemonic data for a word
export function getMnemonicData(catalanWord: string, englishWord: string): MnemonicData {
  const data: MnemonicData = {
    word: catalanWord,
    translation: englishWord,
  };

  // Try to get etymology
  const etymology = getEtymology(catalanWord);
  if (etymology) {
    data.etymology = etymology;
  }

  // Try to get cognate info
  const cognate = getCognates(catalanWord);
  if (cognate) {
    data.cognate = cognate;
  }

  // Check for false friends
  const falseFriend = getFalseFriend(catalanWord);
  if (falseFriend) {
    data.falseFriend = falseFriend;
  }

  // Get phonetic hook
  const phoneticHook = getPhoneticHook(catalanWord);
  if (phoneticHook) {
    data.phoneticHook = phoneticHook;
  }

  // Generate auto mnemonic if no other data found
  if (!data.etymology && !data.cognate && !data.phoneticHook) {
    data.autoMnemonic = generateAutoMnemonic(catalanWord, englishWord) || undefined;
  }

  return data;
}

// Generate a visual memory suggestion
export function suggestMemoryImage(englishWord: string): string {
  const wordLower = englishWord.toLowerCase();

  // Common image suggestions
  const imageSuggestions: Record<string, string> = {
    // Animals
    'cat': 'Picture a fluffy cat lounging in the sun',
    'dog': 'Imagine a loyal dog wagging its tail',
    'bird': 'Visualize a colorful bird singing in a tree',
    'fish': 'See a shimmering fish swimming in clear water',

    // Food
    'bread': 'Picture a warm, crusty loaf fresh from the oven',
    'water': 'Imagine a crystal-clear stream flowing',
    'wine': 'Visualize a glass of rich red wine',
    'apple': 'Picture a bright red apple with one perfect bite taken',

    // Places
    'house': 'Imagine a cozy cottage with smoke from the chimney',
    'city': 'Picture a bustling plaza full of people',
    'beach': 'Visualize golden sand meeting turquoise water',

    // People
    'family': 'Picture a group gathered around a dinner table',
    'friend': 'Imagine two people laughing together',

    // Time
    'day': 'Picture bright sunlight streaming through a window',
    'night': 'Imagine a sky full of twinkling stars',
    'morning': 'Visualize sunrise with golden light',

    // Body
    'hand': 'Picture a hand reaching out to help',
    'head': 'Imagine someone thinking deeply',
    'heart': 'Visualize a glowing red heart',
  };

  return imageSuggestions[wordLower] || `Create a vivid mental image of "${englishWord}"`;
}

// Get pronunciation tips for tricky Catalan sounds
export function getPronunciationTip(catalanWord: string): string | null {
  const wordLower = catalanWord.toLowerCase();

  // Check for tricky sounds
  if (wordLower.includes('ll')) {
    return '"ll" sounds like English "y" in "yes" or "million"';
  }
  if (wordLower.includes('ny')) {
    return '"ny" sounds like Spanish "ñ" or English "ni" in "onion"';
  }
  if (wordLower.includes('tx')) {
    return '"tx" sounds like English "ch" in "church"';
  }
  if (wordLower.includes('ig') && wordLower.endsWith('ig')) {
    return '"ig" at the end sounds like "tch" or soft "ch"';
  }
  if (wordLower.includes('ç')) {
    return '"ç" (c cedilla) sounds like "s" in "sun"';
  }
  if (wordLower.includes('j')) {
    return '"j" sounds like French "j" or "zh" - softer than Spanish';
  }
  if (wordLower.includes('x')) {
    return '"x" usually sounds like "sh" in "ship"';
  }
  if (wordLower.includes('r') && wordLower.startsWith('r')) {
    return 'Initial "r" is rolled/trilled in Catalan';
  }
  if (wordLower.includes('rr')) {
    return '"rr" is strongly rolled/trilled';
  }

  return null;
}

// Generate a complete memory package for a word
export function generateMemoryPackage(
  catalanWord: string,
  englishWord: string,
  userMnemonic?: string
): {
  mnemonic: MnemonicData;
  visualSuggestion: string;
  pronunciationTip: string | null;
  userNote?: string;
} {
  return {
    mnemonic: getMnemonicData(catalanWord, englishWord),
    visualSuggestion: suggestMemoryImage(englishWord),
    pronunciationTip: getPronunciationTip(catalanWord),
    userNote: userMnemonic,
  };
}
