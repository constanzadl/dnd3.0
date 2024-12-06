import './App.css';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';
//emit or listen to events whenever 
const socket = io.connect('http://localhost:3001');

function App() {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [num, setNum] = useState([]);
  const [messageReceived, setMessageReceived] = useState("");

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };

  const sendMessage = () => {
    socket.emit('send_message', {message, room});
  };

  const changeNumber = () => {
    socket.emit('changeNumber', room, (response) => {
      setNum(response)
    });
  }

  useEffect(() => {
socket.on("receive_message", (data) => {
setMessageReceived(data.message);
});
  }, [socket]);
  return (
    <div className="App">
      <input placeholder="room number" onChange={(e) => {
        setRoom(e.target.value)
      }}/>
      <button onClick={joinRoom}>Join Room</button>
     <input placeholder="message" onChange={(e) => {
      setMessage(e.target.value);
     }}/>
     <button onClick={sendMessage}>Send a Message</button>
     <h1>Message: {messageReceived}</h1>
     <button onClick={changeNumber}>Change Number</button>
     <h1>{num}</h1>
    </div>
  );
}

export default App;
