import { createJSONStorage, type StateStorage } from 'zustand/middleware';

const memoryStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function getLocalStorageIfAvailable(): StateStorage {
  try {
    const testKey = '__zustand_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return localStorage;
  } catch {
    return memoryStorage;
  }
}

export const getPersistStorage = () => createJSONStorage(() => getLocalStorageIfAvailable());
