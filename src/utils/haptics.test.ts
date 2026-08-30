import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setHapticsEnabled, hapticCorrect, hapticIncorrect } from './haptics';

describe('haptics', () => {
  let vibrate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vibrate = vi.fn();
    vi.stubGlobal('navigator', { vibrate });
    setHapticsEnabled(true);
  });

  it('buzzes on a correct answer', () => {
    hapticCorrect();
    expect(vibrate).toHaveBeenCalledOnce();
  });

  it('uses a distinguishable pattern for an incorrect answer', () => {
    hapticCorrect();
    const correctPattern = vibrate.mock.calls[0][0];
    vibrate.mockClear();

    hapticIncorrect();
    expect(vibrate.mock.calls[0][0]).not.toEqual(correctPattern);
  });

  /** The setting existed in every profile and nothing read it. */
  it('stays silent when the user has turned vibration off', () => {
    setHapticsEnabled(false);
    hapticCorrect();
    hapticIncorrect();
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('does nothing on a device without vibration support', () => {
    vi.stubGlobal('navigator', {});
    expect(() => hapticCorrect()).not.toThrow();
  });

  it('survives a browser that blocks the call', () => {
    vi.stubGlobal('navigator', {
      vibrate: () => {
        throw new Error('blocked');
      },
    });
    expect(() => hapticCorrect()).not.toThrow();
  });
});
