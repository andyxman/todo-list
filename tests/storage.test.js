import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadTodos, saveTodos, STORAGE_KEY } from '../src/storage.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

function createStorage() {
  return {
    getItem: vi.fn(),
    setItem: vi.fn(),
  };
}

describe('loadTodos', () => {
  it('returns saved todos', () => {
    const todos = [{ id: 'todo-id', title: '已保存任务', completed: false }];
    const storage = createStorage();
    storage.getItem.mockReturnValue(JSON.stringify(todos));
    vi.stubGlobal('localStorage', storage);

    expect(loadTodos()).toEqual(todos);
    expect(storage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('returns an empty list when nothing has been saved', () => {
    const storage = createStorage();
    storage.getItem.mockReturnValue(null);
    vi.stubGlobal('localStorage', storage);

    expect(loadTodos()).toEqual([]);
  });

  it('returns an empty list for invalid saved data', () => {
    const storage = createStorage();
    storage.getItem.mockReturnValue('{not valid JSON');
    vi.stubGlobal('localStorage', storage);

    expect(loadTodos()).toEqual([]);
  });

  it('returns an empty list when saved JSON is not an array', () => {
    const storage = createStorage();
    storage.getItem.mockReturnValue(JSON.stringify({ title: '不是列表' }));
    vi.stubGlobal('localStorage', storage);

    expect(loadTodos()).toEqual([]);
  });
});

describe('saveTodos', () => {
  it('serializes todos and saves them using the application storage key', () => {
    const storage = createStorage();
    vi.stubGlobal('localStorage', storage);
    const todos = [{ id: 'todo-id', title: '要保存的任务', completed: true }];

    saveTodos(todos);

    expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(todos));
  });
});
