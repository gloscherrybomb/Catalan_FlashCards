# Catalan FlashCards - Comprehensive Functionality Review Report

**Review Date:** January 2026
**Reviewer:** Claude (End-User Perspective)

---

## Executive Summary

The Catalan FlashCards application is a well-designed, feature-rich language learning tool with a beautiful Miro-inspired UI. However, during this comprehensive review, I identified **9 functional issues** that affect the user experience, ranging from critical (features not working) to minor (cosmetic inconsistencies).

---

## Issues Found

### CRITICAL ISSUES

#### 1. Weekly Challenges Never Update
**Location:** `src/stores/sessionStore.ts:232-239` and `src/types/weeklyChallenges.ts:245-316`
**Severity:** Critical
**Description:**
Weekly challenges are displayed on the HomePage but their progress is never updated. The `updateWeeklyChallenges()` function exists but is never called from the session flow.

**Current Behavior:**
- User completes a study session
- `sessionStore.endSession()` calls `updateDailyChallenges()` (line 232)
- Weekly challenges remain at 0 progress forever

**Expected Behavior:**
- Weekly challenge progress should update after each session

**Fix Required:**
Add call to `updateWeeklyChallenges()` in `sessionStore.endSession()` after line 239.

---

#### 2. Challenge XP Rewards Not Applied
**Location:** `src/types/challenges.ts` and `src/types/weeklyChallenges.ts`
**Severity:** Critical
**Description:**
Both daily and weekly challenges display XP rewards (e.g., "+50 XP", "+150 XP"), but the XP is never actually awarded to the user when challenges are completed.

**Current Behavior:**
- User completes a challenge
- Challenge shows as "completed"
- No XP is added to user's total

**Expected Behavior:**
- When `challenge.current >= challenge.target` for the first time, XP reward should be added via `userStore.addXP()`

**Fix Required:**
Add XP awarding logic in `updateDailyChallenges()` and `updateWeeklyChallenges()` functions.

---

#### 3. Weekly Completion Bonus (500 XP) Never Awarded
**Location:** `src/components/gamification/WeeklyChallenges.tsx:173-195`
**Severity:** Critical
**Description:**
The UI shows "You completed all weekly challenges! +500 bonus XP" but this bonus is never actually applied.

**Current Behavior:**
- User completes all 3 weekly challenges
- Celebration UI displays
- 500 XP bonus is not added

**Fix Required:**
Add logic to award 500 XP bonus when all weekly challenges are completed.

---

#### 4. Masculine/Feminine Word Forms Create Unplayable Games
**Location:** Multiple files using "word1 / word2" pattern
**Severity:** Critical
**Description:**
Words with both masculine and feminine forms (e.g., "vell / vella" for "old") are handled poorly across the platform. The entire string including the " / " separator is used, creating an unusable experience.

**Affected Components:**
1. **Word Scramble** (`src/components/games/WordScramble.tsx:47,51`) - User must unscramble "VELL / VELLA" including the slash and spaces
2. **Hangman** (`src/components/games/Hangman.tsx:38`) - User must guess "V E L L   /   V E L L A" including slash
3. **Memory Match** (`src/components/games/MemoryMatch.tsx:46`) - Shows full "vell / vella" on cards
4. **Type Answer** (`src/components/cards/TypeAnswer.tsx:33`) - Requires typing full "vell / vella"
5. **Typing Validator** (`src/services/typingValidator.ts`) - Doesn't accept either form as valid

**Current Behavior:**
- User sees "Old (M/F)" as the hint
- Must type/unscramble "vell / vella" exactly
- This is nearly impossible in Word Scramble and Hangman

**Expected Behavior:**
- Games should use only ONE form (preferably masculine as default)
- Type Answer should accept EITHER form as correct
- Memory cards should show single form

**Fix Required:**
1. Add `extractPrimaryForm()` utility to `src/utils/textUtils.ts` that extracts first form from "word1 / word2" patterns
2. Update all games to use single form
3. Update typing validator to accept either form

---

### HIGH PRIORITY ISSUES

#### 5. "Cards Mastered" Stat Always Shows 0 (renumbered from 4)
**Location:** `src/pages/StatsPage.tsx:141-145` and `src/stores/userStore.ts`
**Severity:** High
**Description:**
The StatsPage displays `progress.cardsLearned` which is initialized to 0 but never updated anywhere in the codebase.

**Current Behavior:**
- User masters cards (interval >= 21 days)
- "Cards Mastered" stat remains at 0

**Evidence:**
```typescript
// userStore.ts line 65
cardsLearned: 0,  // Never updated
```

**Fix Required:**
Update `cardsLearned` when cards reach mastery threshold in the SM2 calculation or session end.

---

#### 6. "Practice Weaknesses" Button Navigates to Invalid Route
**Location:** `src/components/analytics/MistakePatterns.tsx:91-96`
**Severity:** High
**Description:**
The "Practice Weaknesses" button navigates to `/study?mode=weakness`, but StudyPage doesn't recognize this mode.

**Current Behavior:**
```typescript
navigate('/study?mode=weakness');
```
- User clicks button
- StudyPage loads but ignores the mode parameter
- Shows normal mode selection instead of weakness deck

**Expected Behavior:**
- Should load a session pre-populated with weakness cards

**Fix Required:**
Add handling for `mode=weakness` in StudyPage that uses `getWeaknessDeck()`.

---

### MEDIUM PRIORITY ISSUES

#### 7. Charts Don't Update Until Page Refresh
**Location:** `src/pages/StatsPage.tsx` and `src/pages/AnalyticsPage.tsx`
**Severity:** Medium
**Description:**
The weekly activity chart and mastery distribution charts use `useMemo` with dependencies that may not trigger re-renders when underlying data changes during the session.

**Current Behavior:**
- User completes a study session
- Returns to Stats page
- Charts show stale data until full page refresh

**Recommendation:**
Ensure proper subscription to store updates or add key props to force re-mount.

---

#### 8. Session Composition Preview Not Always Accurate
**Location:** `src/pages/StudyPage.tsx:88-93`
**Severity:** Medium
**Description:**
The session composition preview (showing % new, learning, reviewing cards) is calculated once at mode selection but may become stale if the user views the screen for a while before starting.

**Minor Impact:** The actual session will still pull fresh data.

---

### LOW PRIORITY ISSUES

#### 9. Dark Mode Text Contrast Issues
**Location:** Various components
**Severity:** Low
**Description:**
Some text elements have reduced contrast in dark mode due to using `opacity` values rather than dedicated dark mode colors.

**Examples:**
- `text-miro-blue/60 dark:text-ink-light/60` - The 60% opacity may be hard to read
- Some chart axis labels don't adapt to dark mode

---

## Positive Findings

The review also identified many well-implemented features:

1. **SM2 Algorithm** - Correctly implemented with proper ease factor adjustments and interval calculations

2. **Streak System** - Properly tracks consecutive days with streak freeze protection

3. **XP Multipliers** - Correctly applied based on streak length in `userStore.addXP()`

4. **Card Progress Persistence** - Properly serializes/deserializes Date objects when restoring from localStorage

5. **Duplicate Detection** - Import CSV correctly prevents duplicate cards

6. **Study Mode Variety** - Multiple modes (flip, multiple choice, type, listening, dictation, speak) all work correctly

7. **Adaptive Learning Analysis** - Weak spot detection and confusion pair analysis work correctly

8. **Category Statistics** - Properly calculates mastery per category considering both directions

9. **Achievement System** - Checks achievements after each session and properly persists unlocked achievements

10. **Session Recovery** - Correctly detects and offers to resume interrupted sessions

---

## Recommendations Summary

### Must Fix (Before Release)
1. Add `updateWeeklyChallenges()` call to session end flow
2. Implement XP reward application for daily/weekly challenges
3. Add weekly completion bonus XP application
4. Fix masculine/feminine word form handling across platform
5. Update `cardsLearned` counter when cards reach mastery
6. Fix the "Practice Weaknesses" navigation

### Should Fix
7. Review chart re-render logic for real-time updates

### Nice to Have
8. Improve dark mode contrast for text
9. Add loading states for chart data

---

## Files Requiring Changes

| File | Issue # | Change Type |
|------|---------|-------------|
| `src/stores/sessionStore.ts` | 1 | Add function call |
| `src/types/challenges.ts` | 2 | Add XP awarding |
| `src/types/weeklyChallenges.ts` | 2, 3 | Add XP awarding |
| `src/utils/textUtils.ts` | 4 | Add extractPrimaryForm() and extractAllForms() |
| `src/components/games/WordScramble.tsx` | 4 | Use single form for scramble |
| `src/components/games/Hangman.tsx` | 4 | Use single form for guessing |
| `src/components/games/MemoryMatch.tsx` | 4 | Use single form on cards |
| `src/components/cards/TypeAnswer.tsx` | 4 | Accept either form |
| `src/services/typingValidator.ts` | 4 | Accept either M/F form as valid |
| `src/stores/userStore.ts` | 5 | Update cardsLearned |
| `src/pages/StudyPage.tsx` | 6 | Add weakness mode handling |
| `src/services/sm2Algorithm.ts` | 5 | Trigger mastery update |

---

## Test Scenarios for Fixes

### For Issue #1 (Weekly Challenges):
1. Start with fresh weekly challenges
2. Complete a study session with 10+ cards
3. Navigate to home page
4. Verify weekly challenge progress increased

### For Issue #2 (Challenge XP):
1. Start with a challenge at 19/20 progress
2. Complete a session reviewing 5 cards
3. Verify challenge completes AND XP increased by reward amount

### For Issue #4 (Masculine/Feminine Forms):
1. Import a card with "vell / vella" (old M/F) as Catalan translation
2. Play Word Scramble
3. Verify only "VELL" (or "VELLA") needs to be unscrambled, not both
4. Play Type Answer mode
5. Type "vell" as answer
6. Verify it's accepted as correct
7. Try again typing "vella"
8. Verify it's also accepted as correct

### For Issue #5 (Cards Mastered):
1. Note current "Cards Mastered" count
2. Review a card enough times to reach 21-day interval
3. Verify counter increments

### For Issue #6 (Practice Weaknesses):
1. Make some mistakes during study
2. Go to Analytics page
3. Click "Practice Weaknesses"
4. Verify session starts with weak cards loaded

---

*End of Report*
