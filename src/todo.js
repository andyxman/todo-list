/**
 * Create a todo and return a new list without changing the supplied list.
 *
 * @param {Array<{id: string, title: string, completed: boolean}>} todos
 * @param {string} title
 * @returns {Array<{id: string, title: string, completed: boolean}>}
 */
export function addTodo(todos, title) {
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
    },
  ];
}

/**
 * Remove the todo identified by id and return a new list.
 *
 * @param {Array<{id: string, title: string, completed: boolean}>} todos
 * @param {string} id
 * @returns {Array<{id: string, title: string, completed: boolean}>}
 */
export function deleteTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}
