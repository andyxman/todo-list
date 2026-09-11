export const STORAGE_KEY = 'todo-list.todos';

const PRIORITIES = new Set(['low', 'normal', 'high']);

function normalizeStoredTodo(todo) {
  const isBaseTodo = (
    typeof todo === 'object' &&
    todo !== null &&
    typeof todo.id === 'string' &&
    todo.id.length > 0 &&
    typeof todo.title === 'string' &&
    todo.title.trim().length > 0 &&
    typeof todo.completed === 'boolean'
  );

  if (!isBaseTodo) {
    return null;
  }

  const priority = todo.priority ?? 'normal';
  const dueAt = todo.dueAt ?? null;

  if (!PRIORITIES.has(priority) || (dueAt !== null && Number.isNaN(new Date(dueAt).getTime()))) {
    return null;
  }

  return { ...todo, priority, dueAt };
}

/**
 * Load saved todos from the current browser.
 * Invalid or missing saved data is treated as an empty list.
 *
 * @returns {Array<{id: string, title: string, completed: boolean, priority: string, dueAt: string | null}>}
 */
export function loadTodos() {
  const savedTodos = localStorage.getItem(STORAGE_KEY);

  if (!savedTodos) {
    return [];
  }

  try {
    const todos = JSON.parse(savedTodos);
    return Array.isArray(todos) ? todos.map(normalizeStoredTodo).filter(Boolean) : [];
  } catch {
    return [];
  }
}

/**
 * Save the current todo list in the browser.
 *
 * @param {Array<{id: string, title: string, completed: boolean, priority: string, dueAt: string | null}>} todos
 */
export function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
