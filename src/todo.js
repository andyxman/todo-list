/**
 * Create a todo and return a new list without changing the supplied list.
 *
 * @param {Array<{id: string, title: string, completed: boolean, priority?: string, dueAt?: string | null}>} todos
 * @param {string} title
 * @param {string} [priority='normal']
 * @param {string} [dueAt='']
 * @returns {Array<{id: string, title: string, completed: boolean, priority: string, dueAt: string | null}>}
 */
export function addTodo(todos, title, priority = 'normal', dueAt = '') {
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';

  if (!trimmedTitle) {
    throw new Error('任务名称不能为空。');
  }

  return [
    ...todos,
    {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      completed: false,
      priority: normalizePriority(priority),
      dueAt: normalizeDueAt(dueAt),
    },
  ];
}

/**
 * Remove the todo identified by id and return a new list.
 *
 * @param {Array<{id: string, title: string, completed: boolean, priority?: string, dueAt?: string | null}>} todos
 * @param {string} id
 * @returns {Array<{id: string, title: string, completed: boolean}>}
 */
export function deleteTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}

/**
 * Change the title of the todo identified by id and return a new list.
 *
 * @param {Array<{id: string, title: string, completed: boolean, priority?: string, dueAt?: string | null}>} todos
 * @param {string} id
 * @param {string} title
 * @param {string} [priority='normal']
 * @param {string} [dueAt='']
 * @returns {Array<{id: string, title: string, completed: boolean, priority: string, dueAt: string | null}>}
 */
export function updateTodo(todos, id, title, priority = 'normal', dueAt = '') {
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';

  if (!trimmedTitle) {
    throw new Error('任务名称不能为空。');
  }

  return todos.map((todo) => (
    todo.id === id
      ? {
        ...todo,
        title: trimmedTitle,
        priority: normalizePriority(priority),
        dueAt: normalizeDueAt(dueAt),
      }
      : todo
  ));
}

/**
 * Switch the completed state of the todo identified by id and return a new list.
 *
 * @param {Array<{id: string, title: string, completed: boolean, priority?: string, dueAt?: string | null}>} todos
 * @param {string} id
 * @returns {Array<{id: string, title: string, completed: boolean}>}
 */
export function toggleTodo(todos, id) {
  return todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
}

const PRIORITIES = new Set(['low', 'normal', 'high']);

function normalizePriority(priority) {
  if (!PRIORITIES.has(priority)) {
    throw new Error('优先级无效。');
  }

  return priority;
}

function normalizeDueAt(dueAt) {
  if (dueAt === '' || dueAt === null || dueAt === undefined) {
    return null;
  }

  const date = new Date(dueAt);

  if (Number.isNaN(date.getTime())) {
    throw new Error('截止时间无效。');
  }

  return date.toISOString();
}

export function getTodoDueStatus(todo, now = new Date()) {
  if (!todo.dueAt || todo.completed) {
    return null;
  }

  const dueDate = new Date(todo.dueAt);

  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  const remainingMilliseconds = dueDate.getTime() - now.getTime();

  if (remainingMilliseconds < 0) {
    return 'overdue';
  }

  if (remainingMilliseconds <= 24 * 60 * 60 * 1000) {
    return 'due-soon';
  }

  return 'upcoming';
}
