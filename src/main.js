import './style.css';
import { addTodo } from './todo.js';

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
    item.textContent = todo.title;
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

renderTodos();
