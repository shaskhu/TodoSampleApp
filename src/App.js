import React from "react";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card, Form } from 'react-bootstrap';
import { DataStore } from 'aws-amplify';
import { Todo } from "./models";
import * as uuid from 'uuid';


function TodoItem({ todo, index, markTodo, removeTodo }) {
  return (
    <div
      className="todo">
      <span style={{ textDecoration: todo.isDone ? "line-through" : "" }}>{todo.text}</span>
      <div>
        <Button variant="outline-success" onClick={() => markTodo(index)}>✓</Button>{' '}
        <Button variant="outline-danger" onClick={() => removeTodo(index)}>✕</Button>
      </div>
    </div>
  );
}



function FormTodo({ addTodo }) {
  const [value, setValue] = React.useState();



  const handleSubmit = e => {
    e.preventDefault();
    if (!value) return;
    console.log("in submit; adding: " + value);
    addTodo(value);
    setValue("");
  };



  return (
    <Form onSubmit={handleSubmit}> 
    <Form.Group>
      <Form.Label><b>Add Todo</b></Form.Label>
      <Form.Control type="text" className="input" value={value} onChange={e => 
setValue(e.target.value)} placeholder="Add new item"/>
    </Form.Group>
    <Button variant="primary mb-3" type="submit">
      Submit
    </Button>
  </Form>
  );
}

function App() {



  const [todos, setTodos] = React.useState([]);


  React.useEffect(() => {
    console.log("in use effect");
    getItems();
    const subscription = DataStore.observe(Todo).subscribe(() =>
    getItems());
    return () => subscription.unsubscribe();
  }, []);


  async function getItems() {
    const items = null;
    console.log(" in get items");
    try{
      const items = await DataStore.query(Todo);
    } catch(e){
      console.log("query failed");
    }    
    if(!items) {
      console.log("Datastore empty");
      return;
    }
    console.log("querying: " + items[0].text);
    setTodos(items);
  }





  async function saveDB(temp){
    console.log("in save;" + temp.text + " with ID: " + temp.id);
    try{
      await DataStore.save(temp); // getting stuck here??
    } 
    catch(e){
        console.log("save failed ");
    }
    console.log("After saving .. yay!");
    getItems();
  }

  // async function delDB(){
  //   await DataStore.delete(todos);
  // }


  const addTodo = text => {
    const temp = new Todo({
      id: uuid.v4(),
      text: text,
      isDone: false
    })
    const newTodos = [temp, ...todos];
    console.log("in add; adding: " + newTodos[0].text + " with ID: " + temp.id);
    saveDB(temp);
    setTodos(newTodos);
    
  }

  const markTodo = index => {
    const newTodos = [...todos];
    newTodos[index].isDone = true;
    setTodos(newTodos);
  };

  const removeTodo = index => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    // delDB();
    setTodos(newTodos);
  };





  return (
    <div className="app">
      <div className="container"> 
        <h1 className="text-center mb-4">Todo List</h1>
        <FormTodo addTodo={addTodo}/>
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
