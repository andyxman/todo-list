# Technical Design

## 1. 技术栈

- HTML5
- CSS3
- JavaScript ES6+
- Vite
- Vitest
- localStorage

不使用：

- React
- Vue
- TypeScript
- 后端服务
- 数据库

## 2. 项目结构

todo-list/
├── index.html
├── src/
│   ├── main.js
│   ├── todo.js
│   ├── storage.js
│   └── style.css
├── tests/
│   ├── todo.test.js
│   └── storage.test.js
└── package.json

## 3. 模块职责

### todo.js

负责 Todo 的业务逻辑：

- addTodo
- updateTodo
- deleteTodo
- toggleTodo

尽量保持为纯函数。

### storage.js

负责浏览器数据持久化：

- loadTodos
- saveTodos

使用 localStorage。

### main.js

负责 UI：

- DOM 操作
- 用户事件
- 页面渲染
- 调用 todo.js
- 调用 storage.js