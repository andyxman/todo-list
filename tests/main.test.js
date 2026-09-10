// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY } from '../src/storage.js';

function createPage() {
  document.body.innerHTML = `
    <form id="todo-form">
      <input id="todo-input" name="todo" />
      <button type="submit">添加任务</button>
    </form>
    <p id="form-error"></p>
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
    error: document.querySelector('#form-error'),
    list: document.querySelector('#todo-list'),
    emptyState: document.querySelector('#empty-state'),
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
});
