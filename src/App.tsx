
import React, { useEffect, useState } from "react";
import "./App.css";
import { DataStore } from "aws-amplify";
import { Button, withAuthenticator } from "@aws-amplify/ui-react";
import { Todo } from "./models";


function TodoItem({ todo, index, markTodo, removeTodo }: any) {
  return (
    <div className="todo">
      <span style={{ textDecoration: todo.isDone ? "line-through" : "" }}>
        {todo.text}
      </span>
      <div>
        <Button onClick={() => markTodo(index)}>
          ✓
        </Button>{" "}
        <Button onClick={() => removeTodo(index)}>
          ✕
        </Button>
      </div>
    </div>
  );
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [formState, setFormState] = useState("");


  useEffect(() => {
    console.log("in use effect");
    getItems();
    const subscription = DataStore.observe(Todo).subscribe((msg) => {
      // TODO: do something with observe message (i.e. add to component state)
      console.log("msg", msg);
      getItems();
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
      const todo : Todo = await DataStore.save(
        new Todo({
          text: formState,
          isDone: false,
        })
      );
      console.log("result of DS save: ", todo);
      setTodos((todos: Todo[]) => [...todos, todo]);
    } catch (e) {
      console.log("save failed", e);
    }
  }

  async function markTodo(index: any) {
    const newTodos = [...todos];
    try{
    const original = await DataStore.query(Todo);
    console.log("original: " + original[index].text);
    await DataStore.save(
    Todo.copyOf(original[index], updated => {
      updated.isDone = true
    })
    );
  } catch(e) {
    console.log("marking failed");
  }
    setTodos(newTodos);
  };

  async function removeTodo(index: any) {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    const original = await DataStore.query(Todo);
    await DataStore.delete(original[index]);
    setTodos(newTodos);
  };

  
  const handleFocus = (e: any) => e.target.select();

  return (
    <div className="app">
      <div className="container">
        <h1 className="text-center mb-4">Todo List</h1>
        <input
          onChange={(event) => setFormState(event.target.value)}
          value={formState}
          placeholder="Add new item"
          onFocus={handleFocus}
        />
        <Button onClick={addTodo}>Submit</Button>
        <div>
          {todos.map((todo: any, index: any) => (
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

export default withAuthenticator(App);