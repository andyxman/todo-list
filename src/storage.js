export const STORAGE_KEY = 'todo-list.todos';

/**
 * Load saved todos from the current browser.
 * Invalid or missing saved data is treated as an empty list.
 *
 * @returns {Array<{id: string, title: string, completed: boolean}>}
 */
export function loadTodos() {
  const savedTodos = localStorage.getItem(STORAGE_KEY);

  if (!savedTodos) {
    return [];
  }

  try {
    const todos = JSON.parse(savedTodos);
    return Array.isArray(todos) ? todos : [];
  } catch {
    return [];
  }
}

/**
 * Save the current todo list in the browser.
 *
 * @param {Array<{id: string, title: string, completed: boolean}>} todos
 */
export function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
