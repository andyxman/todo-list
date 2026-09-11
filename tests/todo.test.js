import { afterEach, describe, expect, it, vi } from 'vitest';
import { addTodo, deleteTodo, getTodoDueStatus, toggleTodo, updateTodo } from '../src/todo.js';

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
      {
        id: 'todo-uuid-1',
        title: '购买牛奶',
        completed: false,
        priority: 'normal',
        dueAt: null,
      },
    ]);
  });

  it('adds priority and a deadline to a todo', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'todo-uuid-1' });

    const result = addTodo([], '提交报告', 'high', '2030-02-03T09:30');

    expect(result[0]).toEqual(expect.objectContaining({
      title: '提交报告',
      priority: 'high',
      dueAt: new Date('2030-02-03T09:30').toISOString(),
    }));
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

describe('updateTodo', () => {
  it('updates and trims only the todo with the supplied id', () => {
    const updatedTodo = { id: 'update-id', title: '修改前', completed: false };
    const otherTodo = { id: 'other-id', title: '保持不变', completed: true };
    const todos = [updatedTodo, otherTodo];

    expect(updateTodo(todos, 'update-id', '  修改后  ', 'high', '2030-02-03T09:30')).toEqual([
      {
        id: 'update-id',
        title: '修改后',
        completed: false,
        priority: 'high',
        dueAt: new Date('2030-02-03T09:30').toISOString(),
      },
      otherTodo,
    ]);
  });

  it('rejects an empty replacement title', () => {
    const todos = [{ id: 'update-id', title: '修改前', completed: false }];

    expect(() => updateTodo(todos, 'update-id', '   ')).toThrow('任务名称不能为空。');
  });

  it('does not mutate the supplied todo list', () => {
    const todos = [{ id: 'update-id', title: '修改前', completed: false }];

    const result = updateTodo(todos, 'update-id', '修改后');

    expect(result).not.toBe(todos);
    expect(todos).toEqual([{ id: 'update-id', title: '修改前', completed: false }]);
  });

  it('clears a todo deadline when an empty value is saved', () => {
    const todos = [{
      id: 'update-id',
      title: '修改前',
      completed: false,
      priority: 'high',
      dueAt: '2030-02-03T09:30:00.000Z',
    }];

    expect(updateTodo(todos, 'update-id', '修改后', 'low', '')).toEqual([
      expect.objectContaining({ priority: 'low', dueAt: null }),
    ]);
  });
});

describe('toggleTodo', () => {
  it('switches the completed state of only the supplied todo', () => {
    const toggledTodo = { id: 'toggle-id', title: '切换我', completed: false };
    const otherTodo = { id: 'other-id', title: '保持不变', completed: true };

    expect(toggleTodo([toggledTodo, otherTodo], 'toggle-id')).toEqual([
      { id: 'toggle-id', title: '切换我', completed: true },
      otherTodo,
    ]);
  });

  it('can switch a completed todo back to incomplete', () => {
    const todos = [{ id: 'toggle-id', title: '切换我', completed: true }];

    expect(toggleTodo(todos, 'toggle-id')).toEqual([
      { id: 'toggle-id', title: '切换我', completed: false },
    ]);
  });

  it('does not mutate the supplied todo list', () => {
    const todos = [{ id: 'toggle-id', title: '切换我', completed: false }];

    const result = toggleTodo(todos, 'toggle-id');

    expect(result).not.toBe(todos);
    expect(todos).toEqual([{ id: 'toggle-id', title: '切换我', completed: false }]);
  });
});

describe('getTodoDueStatus', () => {
  const now = new Date('2030-02-01T10:00:00.000Z');

  it('identifies overdue, due-soon, and upcoming todos', () => {
    expect(getTodoDueStatus({ completed: false, dueAt: '2030-02-01T09:59:00.000Z' }, now)).toBe('overdue');
    expect(getTodoDueStatus({ completed: false, dueAt: '2030-02-02T09:00:00.000Z' }, now)).toBe('due-soon');
    expect(getTodoDueStatus({ completed: false, dueAt: '2030-02-03T10:00:00.000Z' }, now)).toBe('upcoming');
  });

  it('does not flag completed or undated todos', () => {
    expect(getTodoDueStatus({ completed: true, dueAt: '2030-02-01T09:00:00.000Z' }, now)).toBeNull();
    expect(getTodoDueStatus({ completed: false, dueAt: null }, now)).toBeNull();
  });
});
