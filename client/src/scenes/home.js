import io from 'socket.io-client';
import {  useState } from 'react';
//emit or listen to events whenever 
const socket = io.connect('http://localhost:3001');

function Home() {
var name = "name";
  const createRoom = () => {
    socket.emit('createRoom', {name, room});
  };

  return (
    <div className="App">
      <button>Play</button>
      <button>Read Docs</button>
    </div>
  );
}
  export default Home;
  