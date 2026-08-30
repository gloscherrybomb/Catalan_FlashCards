/**
 * Grapheme-to-phoneme transcription for Central (Barcelona) Catalan.
 *
 * WHAT THIS IS FOR
 * Comparing what the speech recogniser heard against what the learner was asked
 * to say. Comparing the raw strings is wrong in both directions:
 *
 *   - It punishes differences that are not differences. In Central Catalan `b`
 *     and `v` are the same sound, so "vi" heard as "bi" is a correct
 *     pronunciation and a spelling coincidence, not a mistake.
 *   - It ignores differences that matter. The previous scorer stripped
 *     diacritics before comparing, which made `cafè` and `cafe` identical -
 *     discarding precisely the open/closed vowel contrast that is one of the
 *     hardest and most meaningful things in Catalan (`sec` /e/ "dry" vs `sèc`
 *     /ɛ/ "crease").
 *
 * Transcribing both sides to phonemes first fixes both.
 *
 * WHAT THIS IS NOT
 * This does not measure acoustics. The recogniser returns real Catalan words,
 * so what we can actually measure is whether it heard the intended word - word
 * accuracy, not pronunciation quality. A learner with a strong English accent
 * whom the recogniser still understands will score well. The feedback wording
 * is chosen to reflect that rather than overclaim.
 *
 * SCOPE
 * Central Catalan only, and no stress assignment, so unstressed vowel reduction
 * (a/e to schwa, o to /u/) is not modelled. Adding it would need
 * syllabification and the Catalan stress rules; since both sides of the
 * comparison are transcribed identically, its absence does not bias the score.
 */

/** A phoneme, written with the IPA symbol for the Central Catalan sound. */
export type Phoneme = string;

const VOWELS = 'aeiouàèéíïòóúü';

function isVowel(ch: string | undefined): boolean {
  // The explicit length check matters: ''.includes('') is true, so an absent
  // neighbour would otherwise read as a vowel and voice a word-initial s.
  return ch !== undefined && ch.length === 1 && VOWELS.includes(ch.toLowerCase());
}

/** Graphemes that select the "soft" value of c and g. */
function isFrontVowel(ch: string | undefined): boolean {
  return ch !== undefined && 'eiéèíï'.includes(ch.toLowerCase());
}

/**
 * Transcribe one Catalan word to a phoneme sequence.
 *
 * Multi-character graphemes are matched before single ones, longest first -
 * `l·l` before `ll`, `ix` before `i`. Getting that order wrong silently
 * mis-transcribes the digraphs that carry most of Catalan's distinctive sounds.
 */
export function transcribeWord(word: string): Phoneme[] {
  const w = word.toLowerCase().normalize('NFC');
  const out: Phoneme[] = [];
  let i = 0;

  while (i < w.length) {
    const rest = w.slice(i);
    const ch = w[i];
    const next = w[i + 1];
    const prev = w[i - 1];
    const atEnd = i === w.length - 1;
    const atStart = i === 0;

    // --- Trigraphs and digraphs, longest first -----------------------------

    // l·l is a geminate /lː/, a different sound from ll /ʎ/.
    if (rest.startsWith('l·l') || rest.startsWith('l.l')) {
      out.push('lː');
      i += 3;
      continue;
    }
    if (rest.startsWith('ny')) { out.push('ɲ'); i += 2; continue; }
    if (rest.startsWith('ll')) { out.push('ʎ'); i += 2; continue; }
    if (rest.startsWith('rr')) { out.push('r'); i += 2; continue; }
    if (rest.startsWith('ss')) { out.push('s'); i += 2; continue; }
    if (rest.startsWith('tx')) { out.push('tʃ'); i += 2; continue; }
    if (rest.startsWith('tg') || rest.startsWith('tj')) { out.push('dʒ'); i += 2; continue; }
    if (rest.startsWith('tz')) { out.push('dz'); i += 2; continue; }

    // Word-final -ig is /tʃ/: maig, roig, puig.
    if (rest === 'ig') { out.push('tʃ'); i += 2; continue; }
    // ix is /ʃ/ (the i is a graphic marker, not a vowel): caixa, peix.
    if (rest.startsWith('ix') && !atStart) { out.push('ʃ'); i += 2; continue; }

    // qu/gu: the u is silent before a front vowel, /w/ otherwise.
    if (rest.startsWith('qu')) {
      out.push(...(isFrontVowel(w[i + 2]) ? ['k'] : ['k', 'w']));
      i += 2;
      continue;
    }
    if (rest.startsWith('gu')) {
      out.push(...(isFrontVowel(w[i + 2]) ? ['ɡ'] : ['ɡ', 'w']));
      i += 2;
      continue;
    }
    // The diaeresis forces the u to be pronounced: qüestió, aigües.
    if (rest.startsWith('qü')) { out.push('k', 'w'); i += 2; continue; }
    if (rest.startsWith('gü')) { out.push('ɡ', 'w'); i += 2; continue; }

    // --- Single graphemes ---------------------------------------------------

    switch (ch) {
      case 'h': // Always silent.
        break;

      case 'c':
        out.push(isFrontVowel(next) ? 's' : 'k');
        break;
      case 'ç':
        out.push('s');
        break;
      case 'q':
        out.push('k');
        break;
      case 'k':
        out.push('k');
        break;

      case 'g':
        // Word-final b/d/g devoice: fred -> [fret], amic/amig.
        out.push(isFrontVowel(next) ? 'ʒ' : atEnd ? 'k' : 'ɡ');
        break;
      case 'j':
        out.push('ʒ');
        break;

      case 'x':
        out.push('ʃ');
        break;

      case 'b':
      case 'v':
        // Central Catalan merges b and v. Distinguishing them would mark a
        // correct pronunciation wrong purely on spelling.
        out.push(atEnd ? 'p' : 'b');
        break;

      case 'd':
        out.push(atEnd ? 't' : 'd');
        break;

      case 's':
        // Intervocalic s is voiced: casa [ˈkazə], but sol [sɔl].
        out.push(isVowel(prev) && isVowel(next) ? 'z' : 's');
        break;
      case 'z':
        out.push('z');
        break;

      case 'r':
        // Trill word-initially, tap elsewhere. Final r is commonly dropped in
        // Central Catalan (cantar [kənˈta]), so it is transcribed as nothing:
        // a learner who pronounces it and one who does not both match.
        if (atStart) out.push('r');
        else if (!atEnd) out.push('ɾ');
        break;

      // Vowels. Accented forms carry the open/closed contrast, which is kept.
      case 'a': case 'à': out.push('a'); break;
      case 'e': case 'é': out.push('e'); break;
      case 'è': out.push('ɛ'); break;
      case 'i': case 'í': case 'ï': out.push('i'); break;
      case 'o': case 'ó': out.push('o'); break;
      case 'ò': out.push('ɔ'); break;
      case 'u': case 'ú': case 'ü': out.push('u'); break;

      default:
        // Letters with a one-to-one mapping (l, m, n, p, t, f) and anything
        // unrecognised, which is passed through so it still counts as a
        // difference rather than vanishing.
        if (/[a-zà-ÿ]/.test(ch)) out.push(ch);
    }
    i += 1;
  }

  return out;
}

/** Transcribe a phrase, word by word. */
export function transcribe(text: string): Phoneme[][] {
  return splitWords(text).map(transcribeWord);
}

/** Split into comparable words, discarding punctuation. */
export function splitWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFC')
    .split(/[^a-zà-ÿ·]+/i)
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Named confusions
// ---------------------------------------------------------------------------

interface PhonemeTip {
  /** Short label for the sound involved. */
  sound: string;
  /** What the learner should do differently, in one sentence. */
  tip: string;
}

/**
 * Advice keyed by the phoneme that was expected but missing.
 *
 * Deliberately limited to sounds where an English speaker predictably goes
 * wrong and where there is something concrete to do about it. Generic
 * encouragement ("focus on the sounds you're missing") tells a learner nothing,
 * which is what the previous feedback amounted to.
 */
const PHONEME_TIPS: Record<Phoneme, PhonemeTip> = {
  'ʎ': { sound: 'll', tip: 'll is one sound: the tongue flat against the roof of the mouth, not an English "l" plus "y".' },
  'ɲ': { sound: 'ny', tip: 'ny is a single palatal sound, like the ñ in Spanish "año".' },
  'lː': { sound: 'l·l', tip: 'l·l is a long l - hold it about twice as long as a single l.' },
  'ʒ': { sound: 'j / g', tip: 'Catalan j is the soft sound in "measure", not the hard English "j" in "jam".' },
  'dʒ': { sound: 'tg / tj', tip: 'tg and tj are the "j" of "judge" - harder than a plain j.' },
  'ʃ': { sound: 'x / ix', tip: 'x is usually "sh" as in "shoe".' },
  'tʃ': { sound: 'tx / -ig', tip: 'tx and word-final -ig are the "ch" of "church".' },
  'ɛ': { sound: 'è (open e)', tip: 'è is open, closer to the vowel in "bed". It contrasts with closed é - "sec" and "sèc" differ only here.' },
  'e': { sound: 'é (closed e)', tip: 'é is closed, nearer the vowel in French "été" than English "bed".' },
  'ɔ': { sound: 'ò (open o)', tip: 'ò is open, like the vowel in "north".' },
  'o': { sound: 'ó (closed o)', tip: 'ó is closed, nearer the vowel in "note" without the glide.' },
  'r': { sound: 'rr / initial r', tip: 'A double rr, or an r starting a word, is trilled.' },
  'ɾ': { sound: 'single r', tip: 'A single r between vowels is one quick tap, not a trill.' },
  'z': { sound: 's between vowels', tip: 'An s between two vowels is voiced, like the s in "rose".' },
  's': { sound: 'ç / c / ss', tip: 'ç is always "s", and so is c before e or i.' },
};

/** Advice for a specific expected-vs-heard substitution, where it beats the generic tip. */
const SUBSTITUTION_TIPS: Array<{ expected: Phoneme; heard: Phoneme; tip: string }> = [
  { expected: 'ɛ', heard: 'e', tip: 'You closed an open è. Open it towards the vowel in "bed".' },
  { expected: 'e', heard: 'ɛ', tip: 'You opened a closed é. Keep it tighter, nearer French "été".' },
  { expected: 'ɔ', heard: 'o', tip: 'You closed an open ò. Open it towards the vowel in "north".' },
  { expected: 'o', heard: 'ɔ', tip: 'You opened a closed ó. Keep it tighter.' },
  { expected: 'ʎ', heard: 'l', tip: 'll came out as a plain l - bring the tongue up to the palate.' },
  { expected: 'ɲ', heard: 'n', tip: 'ny came out as a plain n - it is one palatal sound, not n plus y.' },
  { expected: 'ʒ', heard: 'dʒ', tip: 'That j was too hard - soften it to the sound in "measure".' },
  { expected: 'r', heard: 'ɾ', tip: 'That r needs a trill, not a single tap.' },
  { expected: 'ɾ', heard: 'r', tip: 'That r is a single tap, not a trill.' },
];

/**
 * Explain the difference between an expected and a heard word.
 *
 * Returns at most one tip - the most specific that applies. Listing every
 * divergence at once produces a wall of corrections a learner will not read.
 */
export function diagnoseWord(expected: string, heard: string): PhonemeTip | null {
  const exp = transcribeWord(expected);
  const got = transcribeWord(heard);
  if (exp.join() === got.join()) return null;

  const ops = alignmentOps(exp, got);

  // A named substitution is the most useful thing we can say.
  for (const op of ops) {
    if (op.type !== 'substitute') continue;
    const match = SUBSTITUTION_TIPS.find(
      s => s.expected === op.expected && s.heard === op.heard
    );
    if (match) return { sound: PHONEME_TIPS[op.expected]?.sound ?? op.expected, tip: match.tip };
  }

  // Otherwise name the first expected sound that went missing or wrong.
  for (const op of ops) {
    if (op.type === 'match') continue;
    const expectedPhoneme = op.expected;
    if (expectedPhoneme && PHONEME_TIPS[expectedPhoneme]) {
      return PHONEME_TIPS[expectedPhoneme];
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Alignment
// ---------------------------------------------------------------------------

type AlignOp =
  | { type: 'match'; expected: Phoneme; heard: Phoneme }
  | { type: 'substitute'; expected: Phoneme; heard: Phoneme }
  | { type: 'delete'; expected: Phoneme; heard?: undefined }
  | { type: 'insert'; heard: Phoneme; expected?: undefined };

/**
 * Levenshtein alignment over phonemes rather than characters.
 *
 * Operating on phonemes is the point: `ny` is two characters but one sound, so
 * a character-level comparison counts a single mispronunciation twice and
 * scores short words far more harshly than long ones.
 */
export function alignmentOps(expected: Phoneme[], heard: Phoneme[]): AlignOp[] {
  const n = expected.length;
  const m = heard.length;
  const cost: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) cost[i][0] = i;
  for (let j = 0; j <= m; j++) cost[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const same = expected[i - 1] === heard[j - 1];
      cost[i][j] = Math.min(
        cost[i - 1][j - 1] + (same ? 0 : 1),
        cost[i - 1][j] + 1,
        cost[i][j - 1] + 1
      );
    }
  }

  // Walk back for the operation list.
  const ops: AlignOp[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const same = expected[i - 1] === heard[j - 1];
      if (cost[i][j] === cost[i - 1][j - 1] + (same ? 0 : 1)) {
        ops.push(
          same
            ? { type: 'match', expected: expected[i - 1], heard: heard[j - 1] }
            : { type: 'substitute', expected: expected[i - 1], heard: heard[j - 1] }
        );
        i--; j--;
        continue;
      }
    }
    if (i > 0 && cost[i][j] === cost[i - 1][j] + 1) {
      ops.push({ type: 'delete', expected: expected[i - 1] });
      i--;
      continue;
    }
    ops.push({ type: 'insert', heard: heard[j - 1] });
    j--;
  }

  return ops.reverse();
}

/** Phoneme-level edit distance between two words. */
export function phonemeDistance(a: string, b: string): number {
  const ops = alignmentOps(transcribeWord(a), transcribeWord(b));
  return ops.filter(op => op.type !== 'match').length;
}

/** Do these two spellings sound the same in Central Catalan? */
export function soundsAlike(a: string, b: string): boolean {
  return transcribeWord(a).join() === transcribeWord(b).join();
}
