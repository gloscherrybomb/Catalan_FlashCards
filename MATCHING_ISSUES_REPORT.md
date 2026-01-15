# Flashcard Example Sentence Matching Issues Report

## Executive Summary

The vocabulary learning interface displays incorrect example sentences for vocabulary words due to a **substring matching bug** in the `findExampleSentence` function.

**Root Cause:** The function uses `catalanSentence.includes(catalanWord)` which matches substrings instead of complete words.

**Impact:** 25 unique vocabulary words are affected, with 56 total incorrect matches identified.

---

## Specific Issue Reported by User

**Vocabulary Word:** all (garlic)
**Incorrect Example:** "Treballo en una oficina" (I work in an office)
**Why it matched:** "Treballo" contains "all" as a substring

**Location:** src/components/cards/VocabularyIntro.tsx:47

```typescript
// Current buggy code:
const hasWord = words.some(w =>
  w.replace(/[.,!?;:]/g, '') === catalanWord ||
  catalanSentence.includes(catalanWord)  // ← SUBSTRING MATCH BUG
);
```

---

## Complete List of Affected Words

### 1. "all" (garlic)
**Matches:**
- Treballo en una oficina (I work in an office)

### 2. "at" (all gens - meaning "completely")
**Incorrect Matches:**
1. Parles **cat**alà molt bé!
2. Hi ha qu**at**re persones aquí.
3. He estudi**at** **cat**alà dur**at** dos anys.
4. Ja havia acab**at** quan vas arribar.
5. Demà aniré a la pl**at**ja.
6. Aquest estiu vi**at**jarem a Menorca.

### 3. "be" (together)
**Incorrect Matches:**
1. És millor que arri**bem** d'hora.

### 4. "cap" (head, any)
**Incorrect Matches:**
1. Els **cap**s de setmana surto amb amics.

### 5. "com" (how, like, as)
**Incorrect Matches:**
1. El **com**pte, si us plau.

### 6. "des" (from, since)
**Incorrect Matches:**
1. Faig esport tres vega**des** per setmana.

### 7. "dia" (day)
**Incorrect Matches:**
1. He estu**dia**t català durant dos anys.
2. Penso estu**dia**r medicina.

### 8. "fer" (to work as)
**Incorrect Matches:**
1. Pre**fer**eixo el cafè al te.

### 9. "ja" (no longer, already)
**Incorrect Matches:**
1. Demà aniré a la plat**ja**.
2. Aquest estiu viat**ja**rem a Menorca.

### 10. "mà" (hand)
**Incorrect Matches:**
1. Adéu, fins de**mà**!
2. De**mà** aniré a la platja.

### 11. "of" (use)
**Incorrect Matches:**
1. Treballo en una **of**icina.

### 12. "on" (where)
**Incorrect Matches:**
1. B**on** dia! Com estàs?
2. Encantada de c**on**èixer-te!
3. Sóc de Barcel**on**a.
4. Hi ha quatre pers**on**es aquí.
5. El meu número de telèf**on** és...
6. Pens**o** que és una b**on**a idea.
7. Quan era petit, vivia a Gir**on**a.
8. El c**on**cert va ser increïble!

### 13. "pa" (bread)
**Incorrect Matches:**
1. **Pa**rles català molt bé!
2. Tinc gana, anem a so**pa**r!

### 14. "plat" (plate, dish)
**Incorrect Matches:**
1. Demà aniré a la **plat**ja.

### 15. "port" (harbour, port)
**Incorrect Matches:**
1. Faig es**port** tres vegades per setmana.

### 16. "quan" (when)
**Incorrect Matches:**
1. Són tres euros amb cin**quan**ta.

### 17. "quant" (how much)
**Incorrect Matches:**
1. Són tres euros amb cin**quant**a.

### 18. "que" (that, which, who)
**Incorrect Matches:**
1. A**que**st estiu viatjarem a Menorca.
2. Si plou, ens **que**darem a casa.

### 19. "quedar" (to arrange to meet)
**Incorrect Matches:**
1. Si plou, ens **quedar**em a casa.

### 20. "qui" (who)
**Incorrect Matches:**
1. **Qui**na hora és?
2. A **qui**na hora obre la botiga?

### 21. "tard" (late)
**Incorrect Matches:**
1. Són les tres de la **tard**a.

### 22. "te" (tea)
**Incorrect Matches:**
1. Encantada de conèixer-**te**!
2. El meu número de **te**lèfon és...
3. El comp**te**, si us plau.
4. Segueix rec**te** fins al final.
5. Crec que **te**ns raó.
6. Si **ti**ngués **te**mps, aprendria a tocar guitarra.
7. Què faries si guanyessis la lo**te**ria?

### 23. "vi" (wine)
**Incorrect Matches:**
1. Tinc **vi**nt-i-cinc anys.
2. Quan era petit, **vi**via a Girona.
3. Ja ha**vi**a acabat quan vas arribar.
4. Aquest esti**u** **vi**atjarem a Menorca.
5. Hauria **vi**ngut si m'haguessis a**vi**sat.

### 24. "via" (platform/track)
**Incorrect Matches:**
1. Quan era petit, **via** a Girona.
2. Ja ha**via** acabat quan vas arribar.
3. Aquest estiu viatjarem a Menorca.

### 25. "vol" (flight)
**Incorrect Matches:**
1. Què **vol**eu per dinar?
2. **Vol**dria una amanida, si us plau.

---

## Technical Analysis

### The Bug
**File:** `src/components/cards/VocabularyIntro.tsx`
**Function:** `findExampleSentence` (lines 34-57)
**Problem Line:** Line 47

```typescript
// Current implementation (BUGGY):
const hasWord = words.some(w =>
  w.replace(/[.,!?;:]/g, '') === catalanWord ||
  catalanSentence.includes(catalanWord)  // Substring match!
);
```

### Why This Fails
The `includes()` method matches **any substring**, not just complete words:
- Looking for "all" → matches "Treb**all**o"
- Looking for "vi" → matches "**vi**atjarem", "ha**vi**a", "**vi**via"
- Looking for "te" → matches "comp**te**", "rec**te**", "conèixer-**te**"

### The Fix
Replace substring matching with **word boundary matching**:

```typescript
// Proposed fix:
const hasWord = words.some(w => {
  const cleaned = w.replace(/[.,!?;:'"]/g, '');
  return cleaned === catalanWord;
});

// Or use regex with word boundaries:
const wordRegex = new RegExp(`\\b${escapeRegex(catalanWord)}\\b`, 'i');
const hasWord = wordRegex.test(catalanSentence);
```

---

## Impact Assessment

### Severity: HIGH
- **25 unique words affected** (5.5% of 453 total vocabulary words)
- **56 incorrect matches** total
- **User experience:** Students see completely unrelated example sentences
- **Learning impact:** Confusing and potentially misleading for language learners

### Most Problematic Words
Words with **5+ incorrect matches:**
1. "on" (8 matches) - where
2. "te" (7 matches) - tea
3. "at" (6 matches) - completely
4. "vi" (5 matches) - wine

These short, common words appear as substrings in many longer words.

---

## Recommended Solution

### Option 1: Word Boundary Matching (Recommended)
Use regex with word boundaries to match complete words only.

**Pros:**
- Most accurate
- Handles contractions and hyphenated words
- Standard practice for word matching

**Cons:**
- Slightly more complex than string operations
- Need to escape special regex characters

### Option 2: Strict Word Array Matching (Simpler)
Remove the `includes()` fallback entirely, only match against split words.

**Pros:**
- Simpler code
- No false positives

**Cons:**
- May miss valid matches where word appears with different punctuation
- Less flexible

### Option 3: Minimum Word Length Threshold
Only use substring matching for words longer than 5 characters.

**Pros:**
- Quick fix
- Reduces false positives

**Cons:**
- Still has issues with medium-length words
- Arbitrary threshold
- Not a complete solution

---

## Additional Notes

### Data Sources
1. **Vocabulary:** `src/data/colloquialVocabulary.ts` (20 units, 453+ words)
2. **Example Sentences:** `src/data/exampleSentences.ts` (53 sentences)
3. **Cleaned Vocab:** `cleaned_vocab.json` (backup/alternative source)

### Testing Recommendations
After fixing the bug:
1. Test all 25 affected words to verify correct matching
2. Test that legitimate matches still work (e.g., "dia" should match "dia")
3. Add unit tests for edge cases:
   - Words with punctuation
   - Contractions (e.g., "conèixer-te")
   - Words at sentence boundaries
   - Short words (2-3 characters)

---

## Files to Modify
1. `src/components/cards/VocabularyIntro.tsx` - Fix the `findExampleSentence` function
2. (Optional) Add unit tests for word matching logic

---

*Report generated: 2026-01-15*
*Analysis script: `analyze_mismatches.js`*
