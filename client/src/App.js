import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import Game from "./scenes/game";
//emit or listen to events whenever
//const socket = io.connect("http://localhost:3001");

function App() {

  return (
    <div className="App">
      <Game />
      
    </div>
  );
}

export default App;
