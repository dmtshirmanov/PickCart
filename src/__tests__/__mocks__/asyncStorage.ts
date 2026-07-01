const store = new Map<string, string>();

export default {
  getItem: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    store.set(key, value);
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    store.delete(key);
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    store.clear();
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve([...store.keys()])),
  multiGet: jest.fn((keys: Array<string>) =>
    Promise.resolve(keys.map(key => [key, store.get(key) ?? null])),
  ),
  multiSet: jest.fn((entries: Array<[string, string]>) => {
    entries.forEach(([key, value]) => {
      store.set(key, value);
    });
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys: Array<string>) => {
    keys.forEach(key => {
      store.delete(key);
    });
    return Promise.resolve();
  }),
};
