import './style.css';
import { loadTodos, saveTodos } from './storage.js';
import { addTodo, deleteTodo, toggleTodo, updateTodo } from './todo.js';

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const errorMessage = document.querySelector('#form-error');
const todoList = document.querySelector('#todo-list');
const emptyState = document.querySelector('#empty-state');
const remainingCount = document.querySelector('#remaining-count');
const clearCompletedButton = document.querySelector('#clear-completed');
const filterButtons = document.querySelectorAll('[data-filter]');

let todos = loadTodos();
let editingTodoId = null;
let currentFilter = 'all';

function getVisibleTodos() {
  if (currentFilter === 'active') {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function renderTodos() {
  todoList.replaceChildren();
  const visibleTodos = getVisibleTodos();
  const incompleteCount = todos.filter((todo) => !todo.completed).length;

  emptyState.hidden = visibleTodos.length > 0;
  emptyState.textContent = todos.length === 0
    ? '还没有任务。先添加一项吧。'
    : '没有符合当前筛选条件的任务。';
  remainingCount.textContent = incompleteCount === 0
    ? '全部完成，干得漂亮！'
    : `还有 ${incompleteCount} 项未完成`;
  clearCompletedButton.disabled = !todos.some((todo) => todo.completed);

  for (const button of filterButtons) {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle('filter-button--active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  }

  for (const todo of visibleTodos) {
    const item = document.createElement('li');
    item.className = 'todo-item';
    item.classList.toggle('todo-item--completed', todo.completed);
    item.dataset.todoId = todo.id;

    const completeCheckbox = document.createElement('input');
    completeCheckbox.className = 'complete-checkbox';
    completeCheckbox.type = 'checkbox';
    completeCheckbox.checked = todo.completed;
    completeCheckbox.dataset.action = 'toggle';
    completeCheckbox.setAttribute('aria-label', `将任务标记为${todo.completed ? '未完成' : '已完成'}：${todo.title}`);

    const content = document.createElement('div');
    content.className = 'todo-content';

    if (editingTodoId === todo.id) {
      const editForm = document.createElement('form');
      editForm.className = 'edit-form';
      editForm.dataset.action = 'save-edit';

      const editInput = document.createElement('input');
      editInput.className = 'edit-input';
      editInput.name = 'title';
      editInput.value = todo.title;
      editInput.setAttribute('aria-label', '修改任务名称');

      const saveButton = document.createElement('button');
      saveButton.className = 'save-button';
      saveButton.type = 'submit';
      saveButton.textContent = '保存';

      const cancelButton = document.createElement('button');
      cancelButton.className = 'cancel-button';
      cancelButton.type = 'button';
      cancelButton.dataset.action = 'cancel-edit';
      cancelButton.textContent = '取消';

      editForm.append(editInput, saveButton, cancelButton);
      content.append(editForm);
    } else {
      const title = document.createElement('span');
      title.className = 'todo-title';
      title.textContent = todo.title;
      content.append(title);
    }

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editButton = document.createElement('button');
    editButton.className = 'edit-button';
    editButton.type = 'button';
    editButton.dataset.action = 'edit';
    editButton.textContent = '编辑';
    editButton.setAttribute('aria-label', `编辑任务：${todo.title}`);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.dataset.action = 'delete';
    deleteButton.textContent = '删除';
    deleteButton.setAttribute('aria-label', `删除任务：${todo.title}`);

    actions.append(editButton, deleteButton);
    item.append(completeCheckbox, content, actions);
    todoList.append(item);
  }
}

function showError(message = '') {
  errorMessage.textContent = message;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  try {
    todos = addTodo(todos, input.value);
    saveTodos(todos);
    showError();
    input.value = '';
    renderTodos();
    input.focus();
  } catch (error) {
    showError(error.message);
    input.focus();
  }
});

todoList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');

  if (!button) {
    return;
  }

  const item = button.closest('.todo-item');

  if (button.dataset.action === 'delete') {
    todos = deleteTodo(todos, item.dataset.todoId);
    saveTodos(todos);
    editingTodoId = null;
    renderTodos();
  }

  if (button.dataset.action === 'edit') {
    editingTodoId = item.dataset.todoId;
    showError();
    renderTodos();
    todoList.querySelector('.edit-input')?.focus();
  }

  if (button.dataset.action === 'cancel-edit') {
    editingTodoId = null;
    showError();
    renderTodos();
  }
});

todoList.addEventListener('change', (event) => {
  if (!event.target.matches('[data-action="toggle"]')) {
    return;
  }

  const item = event.target.closest('.todo-item');
  todos = toggleTodo(todos, item.dataset.todoId);
  saveTodos(todos);
  renderTodos();
});

todoList.addEventListener('submit', (event) => {
  const editForm = event.target.closest('[data-action="save-edit"]');

  if (!editForm) {
    return;
  }

  event.preventDefault();
  const item = editForm.closest('.todo-item');
  const editInput = editForm.elements.title;

  try {
    todos = updateTodo(todos, item.dataset.todoId, editInput.value);
    saveTodos(todos);
    editingTodoId = null;
    showError();
    renderTodos();
  } catch (error) {
    showError(error.message);
    editInput.focus();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    editingTodoId = null;
    renderTodos();
  });
});

clearCompletedButton.addEventListener('click', () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos(todos);
  editingTodoId = null;
  renderTodos();
});

renderTodos();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}
