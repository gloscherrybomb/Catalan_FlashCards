/**
 * Light haptic feedback for answer results.
 *
 * `vibrationEnabled` existed in UserSettings and in every default profile, but
 * nothing in the app had ever read it and nothing vibrated - a stored
 * preference for a feature that did not exist.
 *
 * Kept deliberately small: a short tick on a correct answer, a double tick on a
 * wrong one. Long or elaborate patterns on a study app become irritating within
 * a session.
 */

let enabled = true;

/** Follow the user's setting. Called when the profile loads or changes. */
export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

function canVibrate(): boolean {
  return (
    enabled &&
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  );
}

function vibrate(pattern: number | number[]): void {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Unsupported or blocked by the browser; feedback is optional by nature.
  }
}

/** A single short tick. */
export function hapticCorrect(): void {
  vibrate(15);
}

/** Two short ticks, distinguishable from correct without being punitive. */
export function hapticIncorrect(): void {
  vibrate([12, 60, 12]);
}
