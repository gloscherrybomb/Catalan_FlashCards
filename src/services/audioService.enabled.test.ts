import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('./firebase', () => ({
  isDemoMode: true,
  generateAudioFunction: vi.fn(),
}));

import { audioService } from './audioService';

/**
 * soundEnabled was stored in every profile and read by nothing, so turning
 * sound off had no effect anywhere.
 */
describe('audioService sound setting', () => {
  beforeEach(() => {
    audioService.setEnabled(true);
    vi.clearAllMocks();
  });

  it('is on by default', () => {
    expect(audioService.isEnabled).toBe(true);
  });

  it('reflects the setting', () => {
    audioService.setEnabled(false);
    expect(audioService.isEnabled).toBe(false);
  });

  it('does not speak when sound is off', async () => {
    const speak = vi.spyOn(window.speechSynthesis, 'speak');
    audioService.setEnabled(false);

    await audioService.speakCatalan('bon dia');

    expect(speak).not.toHaveBeenCalled();
  });

  it('stops anything already playing when sound is turned off', () => {
    const cancel = vi.spyOn(window.speechSynthesis, 'cancel');
    audioService.setEnabled(false);
    expect(cancel).toHaveBeenCalled();
  });
});
