/* TODO: install Prettier extension to format all files on save
TODO: view the dev tools console, there are many warnings - try to fix them.
My suggestion is to get the most basic DataStore operations working, not just locally,
but with persistence to the backend, and public auth (delete the auth category for now).
Work on addressing the remaining warnings in the console (I resolved one of them, as documented below).
Also, though this is a mattter of style, but perhaps try condensing everything into the `App` component for now,
as it isn't doing much, so there isn't much of a need to split out individual components yet, 
and it can be a bit confusing tracking what you are passing around and where.
As I mentioned before, try and stick as close to the amplify docs tutorials for now, as the documented happy 
path is there. You are running into issues with how you're using React and JavaScript (see comment on scope below), 
so best to work on one thing at a time. My suggestion is to stick as close to the docs as possible, and from there,
start to branch out. */
import React, { useEffect, useState } from "react";
import "./App.css";
// TODO: replace with Amplify UI
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Card, Form } from "react-bootstrap";
import { DataStore } from "aws-amplify";
import { Todo } from "./models";
// import * as uuid from "uuid";

function TodoItem({ todo, index, markTodo, removeTodo }) {
  return (
    <div className="todo">
      <span style={{ textDecoration: todo.isDone ? "line-through" : "" }}>
        {todo.text}
      </span>
      <div>
        <Button variant="outline-success" onClick={() => markTodo(index)}>
          ✓
        </Button>{" "}
        <Button variant="outline-danger" onClick={() => removeTodo(index)}>
          ✕
        </Button>
      </div>
    </div>
  );
}

function FormTodo({ addTodo }) {
  // There was a warning in the console (open dev tools to view)
  // https://stackoverflow.com/questions/47012169/a-component-is-changing-an-uncontrolled-input-of-type-text-to-be-controlled-erro
  // Need to provide initial state:
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value) return;
    console.log("in submit; adding: " + value);
    addTodo(value);
    setValue("");
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>
          <b>Add Todo</b>
        </Form.Label>
        <Form.Control
          type="text"
          className="input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add new item"
        />
      </Form.Group>
      <Button variant="primary mb-3" type="submit">
        Submit
      </Button>
    </Form>
  );
}

function App() {
  const [todos, setTodos] = useState([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    console.log("in use effect");
    getItems();
    const subscription = DataStore.observe(Todo).subscribe((msg) => {
      // TODO: do something with observe message:
      console.log("msg", msg);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value) return;
    console.log("in submit; adding: " + value);
    addTodo(value);
    setValue("");
  };

  async function getItems() {
    const items = null;
    console.log(" in get items");
    try {
      // TODO: worth reading a quick tutorial regarding scope in JS
      // i.e. `const` not needed here
      items = await DataStore.query(Todo);
      console.log("return of DS query", items);
    } catch (e) {
      console.log("query failed");
    }
    if (!items) {
      console.log("Datastore empty");
      return;
    }
    // console.log("querying: " + items[0].text);
    setTodos(items);
  }

  // async function saveDB(temp) {
  //   console.log("in save;" + temp.text + " with ID: " + temp.id);
  //   try {
  //     await DataStore.save(temp); // getting stuck here??
  //   } catch (e) {
  //     console.log("save failed ");
  //   }
  //   console.log("After saving .. yay!");
  //   getItems();
  // }

  // async function delDB(){
  //   await DataStore.delete(todos);
  // }

  async function addTodo(text) {
    // const temp = new Todo({
    //   id: uuid.v4(),
    //   text: text,
    //   isDone: false,
    // });
    // const newTodos = [temp, ...todos];
    // console.log("in add; adding: " + newTodos[0].text + " with ID: " + temp.id);
    try {
      const result = await DataStore.save(
        new Todo({
          text: text,
          isDone: false,
        })
      );
      console.log("result of DS save: " + result);
      // TODO:
      // setTodos(newTodos);
    } catch (e) {
      console.log("save failed", e);
    }
  }

  const markTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].isDone = true;
    setTodos(newTodos);
  };

  const removeTodo = (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    // delDB();
    setTodos(newTodos);
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="text-center mb-4">Todo List</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>
              <b>Add Todo</b>
            </Form.Label>
            <Form.Control
              type="text"
              className="input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Add new item"
            />
          </Form.Group>
          <Button variant="primary mb-3" type="submit">
            Submit
          </Button>
        </Form>
        <div>
          {todos.map((todo, index) => (
            <Card>
              <Card.Body>
                <TodoItem
                  key={index}
                  index={index}
                  todo={todo}
                  markTodo={markTodo}
                  removeTodo={removeTodo}
                />
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
