const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUser = users.find(user => user.username === username)

  if (!findUser) {
    return response.status(404).send();
  }

  request.user = findUser;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const checkIfUserExists = users.find(user => user.username === username)

  if (checkIfUserExists) {
    return response.status(400).json({ error: "User already exists!" })
  }

  const newUser = {
    id: v4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const todos = user.todos;

  return response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline, created_at } = request.body;

  const todo = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const findTodo = user.todos.find(todo => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({ error: "Todo not found" })
  }

  findTodo.title = title
  findTodo.deadline = deadline

  return response.json(findTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodo = user.todos.find(todo => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({ error: "Todo not found!" })
  }

  findTodo.done = !findTodo.done;

  return response.json(findTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const checkIfTodoExists = user.todos.find(todo => todo.id === id);

  if (!checkIfTodoExists) {
    return response.status(404).json({ error: "Todo does not exists!" })
  }

  const filteredTodos = user.todos.filter(todo => todo.id !== id);

  user.todos = filteredTodos;

  return response.status(204).send();
});

module.exports = app;