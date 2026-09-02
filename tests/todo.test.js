import { afterEach, describe, expect, it, vi } from 'vitest';
import { addTodo } from '../src/todo.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('addTodo', () => {
  it('adds a trimmed todo while preserving existing todos', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'todo-uuid-1' });
    const existingTodo = { id: 'existing-id', title: '已有任务', completed: false };
    const todos = [existingTodo];

    const result = addTodo(todos, '  购买牛奶  ');

    expect(result).toEqual([
      existingTodo,
      { id: 'todo-uuid-1', title: '购买牛奶', completed: false },
    ]);
  });

  it('does not mutate the supplied todo list', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'todo-uuid-1' });
    const todos = [{ id: 'existing-id', title: '已有任务', completed: false }];

    const result = addTodo(todos, '新任务');

    expect(result).not.toBe(todos);
    expect(todos).toEqual([{ id: 'existing-id', title: '已有任务', completed: false }]);
  });

  it.each(['', '   ', '\n\t'])('rejects an empty title', (title) => {
    expect(() => addTodo([], title)).toThrow('任务名称不能为空。');
  });
});
