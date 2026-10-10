const db = require("./db");
const Todo = require("../domain/Todo");

const listTodos = async (completed) => {
  let rows = db.todos.all();

  if (completed === "true") {
    rows = rows.filter((row) => row.completed);
  } else if (completed === "false") {
    rows = rows.filter((row) => !row.completed);
  }

  return rows.map(Todo.fromRow);
};

const getTodoById = async (id) => Todo.fromRow(db.todos.get(id));

// Case-insensitive "contains" match, like SQL's LIKE '%term%'
const searchTodos = async (term) => {
  const needle = term.toLowerCase();
  const rows = db.todos.all().filter((row) => row.title.toLowerCase().includes(needle));
  return rows.map(Todo.fromRow);
};

// Insert/update/delete return { lastID } / { changes } like the old SQLite helpers,
// so TodoService did not need to change.
const insertTodo = async (todo) => {
  const row = db.todos.insert(todo.toDbValues());
  return { lastID: row.id };
};

const updateTodo = async (id, todo) => {
  const { title, completed } = todo.toDbValues();
  const row = db.todos.update(id, { title, completed });
  return { changes: row ? 1 : 0 };
};

const deleteTodo = async (id) => ({ changes: db.todos.delete(id) ? 1 : 0 });

// Seed data so the API has something to show right after a (re)start
[
  new Todo({ title: "Buy milk", completed: true, createdAt: new Date().toISOString() }),
  new Todo({ title: "Call mom", completed: false, createdAt: new Date().toISOString() }),
].forEach(insertTodo);

module.exports = {
  listTodos,
  getTodoById,
  searchTodos,
  insertTodo,
  updateTodo,
  deleteTodo,
};
