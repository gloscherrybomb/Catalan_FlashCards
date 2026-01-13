import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock import.meta.env for tests
Object.defineProperty(import.meta, 'env', {
  value: {
    PROD: false,
    DEV: true,
    MODE: 'test',
    BASE_URL: '/',
    VITE_UNSPLASH_ACCESS_KEY: undefined,
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock IndexedDB (simplified)
const indexedDBMock = {
  open: vi.fn(() => ({
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
    result: null,
  })),
};
Object.defineProperty(window, 'indexedDB', { value: indexedDBMock });

// Mock SpeechSynthesis
const speechSynthesisMock = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn(() => []),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};
Object.defineProperty(window, 'speechSynthesis', { value: speechSynthesisMock });

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});
