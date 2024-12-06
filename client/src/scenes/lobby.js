import io from 'socket.io-client';
import { useState } from 'react';
//emit or listen to events whenever 
const socket = io.connect('http://localhost:3001');

function Lobby() {
  const [room, setRoom] = useState("");
  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };
  return (
    <div className="App">
      <input placeholder="room number" onChange={(e) => {
        setRoom(e.target.value)
      }}/>
      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
}
   export default Lobby;
   