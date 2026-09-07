import { afterEach, describe, expect, it, vi } from 'vitest';
import { addTodo, deleteTodo } from '../src/todo.js';

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

describe('deleteTodo', () => {
  it('removes only the todo with the supplied id', () => {
    const firstTodo = { id: 'first-id', title: '保留我', completed: false };
    const deletedTodo = { id: 'delete-id', title: '删除我', completed: false };
    const todos = [firstTodo, deletedTodo];

    expect(deleteTodo(todos, 'delete-id')).toEqual([firstTodo]);
  });

  it('does not mutate the supplied todo list', () => {
    const todos = [{ id: 'delete-id', title: '删除我', completed: false }];

    const result = deleteTodo(todos, 'delete-id');

    expect(result).not.toBe(todos);
    expect(todos).toEqual([{ id: 'delete-id', title: '删除我', completed: false }]);
  });

  it('leaves every todo when the id does not exist', () => {
    const todos = [{ id: 'first-id', title: '保留我', completed: false }];

    expect(deleteTodo(todos, 'missing-id')).toEqual(todos);
  });
});
