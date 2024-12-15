import io from "socket.io-client";
import { useEffect, useState } from "react";
//emit or listen to events whenever
const socket = io.connect("http://localhost:3001");

function Game() {
  const [gameStart, setGameStart] = useState(false);
  const [gameState, setGameState] = useState();
  const [dieOne, setDieOne] = useState(0);
  const [dieTwo, setDieTwo] = useState(0);
  const [dieThree, setDieThree] = useState(0);
  const [enemyDieOne, setEnemyDieOne] = useState(0);
  const [enemyDieTwo, setEnemyDieTwo] = useState(0);
  const [enemyDieThree, setEnemyDieThree] = useState(0);
  const [action, setAction] = useState("");
  const [melee, setMelee] = useState(0);
  const [magic, setMagic] = useState(0);
const [life, setLife] = useState(0);
const [enemyLife, setEnemyLife] = useState(0);
  const [playingNum, setPlayingNum] = useState(0);

  useEffect(() => {
    //Checks to see if this player is P1 or P2, if it's player 2, it starts the game.
    socket.on("playerAdded", (data) => {
      if (data === 2) {
        setGameStart(true);
        socket.emit("startGame", socket.id);
      }
    });
    socket.on("gameUpdate", (data) => {
      console.log(data.me);
      setLife(data.me.life);
      setDieOne(data.me.dieOne);
      setDieTwo(data.me.dieTwo);
      setDieThree(data.me.dieThree);
      setEnemyLife(data.enemy.life);      
      setEnemyDieOne(data.enemy.dieOne);
      setEnemyDieTwo(data.enemy.dieTwo);
      setEnemyDieThree(data.enemy.dieThree);
    });
    socket.on('finishTurn', (data) => {
      setLife(data.me.life);
      setEnemyLife(data.enemy.life);
    })
    //socket.on('gameUpdate', (data) => {
    //Game Updates
    //})
  });

  const startTurn = () => {
    socket.emit("startTurn", socket.id);
  };

  const chooseAction = (num) => {
    if (num === 2 || num === 4 || num === 6) {
      setAction("Attack");
    } else {
      setAction("Defend");
    }
  };

  const playTurn = () => {
    let gameStatus = {
        action: action,
        melee: melee,
        magic: magic,
        life: life,
    };
    socket.emit('playTurn', (gameStatus));
  }
  console.log(gameStart);


  return (
    <div className="App">
      <div>
        {gameStart ? (
          <div>
            <h1>Play!</h1>
            <button onClick={startTurn}>Start Turn</button>
            <div className="enemyInfo">
              <h1>Enemy Dice</h1>
              <h1>Life:{enemyLife}</h1>
              <p>Dice 1: {enemyDieOne}</p>
              <p>Dice 2: {enemyDieTwo}</p>
              <p>Dice 3: {enemyDieThree}</p>
            </div>
            <div className="playerInfo">
            <h1>Life:{life}</h1>
            <h1>Your Dice</h1>
            <button onClick={()=>{setPlayingNum(dieOne)}}>{dieOne}</button>
            <button onClick={() =>{setPlayingNum(dieTwo)}}>{dieTwo}</button>
              <button onClick={() =>{setPlayingNum(dieThree)}}>{dieThree}</button>
            <h1>Your Actions</h1>
            <p>Action</p>
            <button onClick={() => {chooseAction(playingNum)}}>{action}</button>
            <p>Melee</p>
            <button onClick={() =>{setMelee(playingNum)}}>{melee}</button>
            <p>Magic</p>
            <button onClick={() =>{setMagic(playingNum)}}>{magic}</button>
            
            <button onClick={playTurn}>Attack!</button>
          </div>
          </div>
        ) : (
          <h1>Waiting on Player 2!</h1>
        )}
      </div>
    </div>
  );
}

export default Game;
