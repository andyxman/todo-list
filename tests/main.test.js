// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY } from '../src/storage.js';

function createPage() {
  document.body.innerHTML = `
    <form id="todo-form">
      <input id="todo-input" name="todo" />
      <select id="priority-input" name="priority"><option value="normal">普通</option><option value="high">高</option></select>
      <input id="due-input" name="dueAt" type="datetime-local" />
      <button type="submit">添加任务</button>
    </form>
    <p id="form-error"></p>
    <p id="remaining-count"></p>
    <button id="clear-completed" type="button">清除已完成</button>
    <div>
      <button type="button" data-filter="all" aria-pressed="true">全部</button>
      <button type="button" data-filter="active" aria-pressed="false">未完成</button>
      <button type="button" data-filter="completed" aria-pressed="false">已完成</button>
    </div>
    <ul id="todo-list"></ul>
    <p id="empty-state">还没有任务。先添加一项吧。</p>
  `;
}

async function startApp(savedTodos) {
  createPage();

  if (savedTodos !== undefined) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTodos));
  }

  await import('../src/main.js');

  return {
    form: document.querySelector('#todo-form'),
    input: document.querySelector('#todo-input'),
    priorityInput: document.querySelector('#priority-input'),
    dueInput: document.querySelector('#due-input'),
    error: document.querySelector('#form-error'),
    list: document.querySelector('#todo-list'),
    emptyState: document.querySelector('#empty-state'),
    remainingCount: document.querySelector('#remaining-count'),
    clearCompletedButton: document.querySelector('#clear-completed'),
  };
}

function submit(form) {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
  vi.resetModules();
});

describe('todo page', () => {
  it('shows the empty state when no todos have been saved', async () => {
    const { list, emptyState } = await startApp();

    expect(list.children).toHaveLength(0);
    expect(emptyState.hidden).toBe(false);
  });

  it('adds a todo, clears the input, and saves the result', async () => {
    const { form, input, error, list, emptyState } = await startApp();
    input.value = '  购买牛奶  ';

    submit(form);

    expect(list.textContent).toContain('购买牛奶');
    expect(input.value).toBe('');
    expect(error.textContent).toBe('');
    expect(emptyState.hidden).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([
      expect.objectContaining({ title: '购买牛奶', completed: false }),
    ]);
  });

  it('adds a todo with priority and deadline, then displays both', async () => {
    const { form, input, priorityInput, dueInput, list } = await startApp();
    input.value = '提交报告';
    priorityInput.value = 'high';
    dueInput.value = '2030-02-03T09:30';

    submit(form);

    expect(list.textContent).toContain('高优先级');
    expect(list.textContent).toContain('截止');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0]).toEqual(expect.objectContaining({
      priority: 'high',
      dueAt: new Date('2030-02-03T09:30').toISOString(),
    }));
  });

  it('shows an error and does not save an empty todo', async () => {
    const { form, input, error, list } = await startApp();
    input.value = '   ';

    submit(form);

    expect(error.textContent).toContain('任务名称不能为空。');
    expect(list.children).toHaveLength(0);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('edits a todo, and cancelling a later edit leaves the saved title unchanged', async () => {
    const todo = { id: 'todo-id', title: '原始任务', completed: false };
    const { list } = await startApp([todo]);

    list.querySelector('[data-action="edit"]').click();
    const editForm = list.querySelector('.edit-form');
    const editInput = list.querySelector('.edit-input');
    editInput.value = '修改后的任务';
    submit(editForm);

    expect(list.textContent).toContain('修改后的任务');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0].title).toBe('修改后的任务');

    list.querySelector('[data-action="edit"]').click();
    list.querySelector('.edit-input').value = '不会保存的修改';
    list.querySelector('[data-action="cancel-edit"]').click();

    expect(list.textContent).toContain('修改后的任务');
    expect(list.textContent).not.toContain('不会保存的修改');
  });

  it('edits a todo priority and clears its deadline', async () => {
    const todo = {
      id: 'todo-id',
      title: '原始任务',
      completed: false,
      priority: 'normal',
      dueAt: '2030-02-03T09:30:00.000Z',
    };
    const { list } = await startApp([todo]);

    list.querySelector('[data-action="edit"]').click();
    const editForm = list.querySelector('.edit-form');
    editForm.elements.priority.value = 'high';
    editForm.elements.dueAt.value = '';
    submit(editForm);

    expect(list.textContent).toContain('高优先级');
    expect(list.textContent).not.toContain('截止');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0]).toEqual(expect.objectContaining({
      priority: 'high',
      dueAt: null,
    }));
  });

  it('toggles completion, saves it, then deletes the todo and restores the empty state', async () => {
    const todo = { id: 'todo-id', title: '完成并删除', completed: false };
    const { list, emptyState } = await startApp([todo]);
    const checkbox = list.querySelector('[data-action="toggle"]');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(list.querySelector('.todo-item').classList.contains('todo-item--completed')).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0].completed).toBe(true);

    list.querySelector('[data-action="delete"]').click();

    expect(list.children).toHaveLength(0);
    expect(emptyState.hidden).toBe(false);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([]);
  });

  it('restores saved todos and their completed state after the page starts again', async () => {
    const todos = [{ id: 'done-id', title: '刷新后仍存在', completed: true }];
    const { list } = await startApp(todos);

    expect(list.textContent).toContain('刷新后仍存在');
    expect(list.querySelector('[data-action="toggle"]').checked).toBe(true);
    expect(list.querySelector('.todo-item').classList.contains('todo-item--completed')).toBe(true);
  });

  it('filters todos and keeps the remaining count visible', async () => {
    const todos = [
      { id: 'active-id', title: '未完成任务', completed: false },
      { id: 'done-id', title: '已完成任务', completed: true },
    ];
    const { list, remainingCount } = await startApp(todos);

    expect(remainingCount.textContent).toBe('还有 1 项未完成');

    document.querySelector('[data-filter="active"]').click();
    expect(list.textContent).toContain('未完成任务');
    expect(list.textContent).not.toContain('已完成任务');

    document.querySelector('[data-filter="completed"]').click();
    expect(list.textContent).toContain('已完成任务');
    expect(list.textContent).not.toContain('未完成任务');
    expect(document.querySelector('[data-filter="completed"]').getAttribute('aria-pressed')).toBe('true');
  });

  it('clears completed todos and saves the remaining todos', async () => {
    const todos = [
      { id: 'active-id', title: '保留任务', completed: false },
      { id: 'done-id', title: '清除任务', completed: true },
    ];
    const { list, clearCompletedButton, remainingCount } = await startApp(todos);

    expect(clearCompletedButton.disabled).toBe(false);
    clearCompletedButton.click();

    expect(list.textContent).toContain('保留任务');
    expect(list.textContent).not.toContain('清除任务');
    expect(remainingCount.textContent).toBe('还有 1 项未完成');
    expect(clearCompletedButton.disabled).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([
      expect.objectContaining({ id: 'active-id', completed: false }),
    ]);
  });
});
