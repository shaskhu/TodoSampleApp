
import React, { useEffect, useState } from "react";
import "./App.css";
import { DataStore } from "aws-amplify";
import { Button, withAuthenticator, Text } from "@aws-amplify/ui-react";
import { Todo, Comment } from "./models";
import { JsxEmit } from "typescript";


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
  const [comments, setComments] = useState<JSX.Element[]>([]);
  const [formState, setFormState] = useState("");
  const [comment, setComment] = useState("");


  useEffect(() => {
    console.log("in use effect");
    getItems();
    
    const subscription = DataStore.observe(Todo).subscribe((msg) => {
      console.log("msg", msg);
      getItems();
    });
    getComms();
    const subscription2 = DataStore.observe(Comment).subscribe((msg) => {
      console.log("msg", msg);
      getComms();
    });

    return () => {
      subscription.unsubscribe();
      subscription2.unsubscribe();
    }
  }, []);



  async function getItems() {
    
    const items = await DataStore.query(Todo);
    console.log("result of query", items);
    setTodos(items);
  }

  async function getComms() {
    const comms = await DataStore.query(Comment);
    for(var i = 0; i < comms.length; i++) {
      comments.concat(<Text>{comms[i].content}</Text>);
    }
    setComments(comments);
    console.log("queried comments: ", comments);

  }

  async function addTodo() {
      const todo : Todo = await DataStore.save(
        new Todo({
          text: formState,
          isDone: false,
        })
      );
      console.log("result of DS save: ", todo);
      setTodos((todos: Todo[]) => [...todos, todo]);
      setFormState("");
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



  async function addComment(index: any) {
    const original = await DataStore.query(Todo);
    const comm: Comment = await DataStore.save(new Comment({
      todo: original[index],
      content: comment
    }));
    
    setComments(comments.concat(<Text>{comm.content}</Text>));
    console.log(comments);
    setComment("");


  }

  async function removeComment(index: any) {

    const original = await DataStore.query(Comment);
    await DataStore.delete(original[index]);

  }
  

  return (
    <div className="app">
      <div className="container">
        <h1 className="text-center mb-4">Todo List</h1>
        <input
          onChange={(event) => setFormState(event.target.value)}
          value={formState}
          placeholder="Add new item"
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
              <input
                onChange={(event) => setComment(event.target.value)}
                value={comment}
                placeholder="Add new comment"
              />
              <Button onClick={() => addComment(index)}>Add</Button>
              {comments}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(App);
