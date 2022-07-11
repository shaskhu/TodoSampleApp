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
/*
Note: There are still some issues, a lot of which would be caught with TypeScript - 
and you’ll need to use TypeScript with your project, so I would convert your app to a 
TS project once you get this working. See the section on adding to an existing project:
https://create-react-app.dev/docs/adding-typescript/
*/
import React, { useEffect, useState } from "react";
import "./App.css";
import { DataStore } from "aws-amplify";
// TODO: import amplify ui components from UI library
// see: https://ui.docs.amplify.aws/
import { Todo } from "./models";

// Not used
// const initialState = { text: "", isDone: false };

function TodoItem({ todo, index, markTodo, removeTodo }) {
  return (
    <div className="todo">
      <span style={{ textDecoration: todo.isDone ? "line-through" : "" }}>
        {todo.text}
      </span>
      <div>
        <button variant="outline-success" onClick={() => markTodo(index)}>
          ✓
        </button>{" "}
        <button variant="outline-danger" onClick={() => removeTodo(index)}>
          ✕
        </button>
      </div>
    </div>
  );
}

function App() {
  const [todos, setTodos] = useState([]);
  const [formState, setFormState] = useState("");

  // Not used:
  // const [value, setValue] = useState("");

  useEffect(() => {
    console.log("in use effect");
    getItems();
    const subscription = DataStore.observe(Todo).subscribe((msg) => {
      // TODO: do something with observe message (i.e. add to component state)
      console.log("msg", msg);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function getItems() {
    const items = await DataStore.query(Todo);
    console.log("result of query", items);
    setTodos(items);
  }

  async function addTodo() {
    try {
      const todo = await DataStore.save(
        new Todo({
          text: formState,
          isDone: false,
        })
      );
      console.log("result of DS save: ", todo);
      setTodos((todos) => [...todos, todo]);
    } catch (e) {
      console.log("save failed", e);
    }
  }

  const markTodo = (index) => {
    const newTodos = [...todos];
    // TODO: use DS save to update
    newTodos[index].isDone = true;
    setTodos(newTodos);
  };

  const removeTodo = (index) => {
    const newTodos = [...todos];
    // TODO: use DS delete to remove
    newTodos.splice(index, 1);
    setTodos(newTodos);
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="text-center mb-4">Todo List</h1>
        <input
          onChange={(event) => setFormState(event.target.value)}
          value={formState}
          placeholder="Add new item"
        />
        <button onClick={addTodo}>Submit</button>
        <div>
          {todos.map((todo, index) => (
            <div>
              <TodoItem
                key={index}
                index={index}
                todo={todo}
                markTodo={markTodo}
                removeTodo={removeTodo}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
