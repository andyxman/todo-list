import './style.css';
import { addTodo, deleteTodo } from './todo.js';

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const errorMessage = document.querySelector('#form-error');
const todoList = document.querySelector('#todo-list');
const emptyState = document.querySelector('#empty-state');

let todos = [];

function renderTodos() {
  todoList.replaceChildren();
  emptyState.hidden = todos.length > 0;

  for (const todo of todos) {
    const item = document.createElement('li');
    item.className = 'todo-item';
    item.dataset.todoId = todo.id;

    const title = document.createElement('span');
    title.className = 'todo-title';
    title.textContent = todo.title;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.dataset.action = 'delete';
    deleteButton.textContent = '删除';
    deleteButton.setAttribute('aria-label', `删除任务：${todo.title}`);

    item.append(title, deleteButton);
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
  const deleteButton = event.target.closest('[data-action="delete"]');

  if (!deleteButton) {
    return;
  }

  const item = deleteButton.closest('.todo-item');
  todos = deleteTodo(todos, item.dataset.todoId);
  renderTodos();
});

renderTodos();
