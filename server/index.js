//create the express server
const express = require("express");
//instance of the express library, used to create the backend server
const app = express();
//instance of http library to hookup the socket.io server
const http = require("http");
const { Server } = require("socket.io");

//set project to accept cors, by applying cors middleware
const cors = require("cors");
app.use(cors());
//create http server with express
const server = http.createServer(app);

//instantiate a new server with socket io, specify funtionalities for cors
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

//Constants
const PORT = process.env.PORT || 3001;

//Variables
let numOfPlayers = 0;
let p1 = "";
let p2 = "";
const players = [];
const ready = false;
let turn = [];
//get new Dice
const getNewDice = (lifep1, lifep2) => {
  players[p1] = {
    life: lifep1,
    dieOne: Math.floor(Math.random() * 6) + 1,
    dieTwo: Math.floor(Math.random() * 6) + 1,
    dieThree: Math.floor(Math.random() * 6) + 1,
    action: "",
    melee: 0,
    magic: 0,
  };

  players[p2] = {
    life: lifep2,
    dieOne: Math.floor(Math.random() * 6) + 1,
    dieTwo: Math.floor(Math.random() * 6) + 1,
    dieThree: Math.floor(Math.random() * 6) + 1,
    action: "",
    melee: 0,
    magic: 0,
  };
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  //Create user's player object profile and get first turn ready
  if (!p1) {
    p1 = socket.id;
    players[p1] = {
      life: 25,
      dieOne: Math.floor(Math.random() * 6) + 1,
      dieTwo: Math.floor(Math.random() * 6) + 1,
      dieThree: Math.floor(Math.random() * 6) + 1,
      action: "",
      melee: 0,
      magic: 0,
    };
  } else {
    p2 = socket.id;
    players[p2] = {
      life: 25,
      dieOne: Math.floor(Math.random() * 6) + 1,
      dieTwo: Math.floor(Math.random() * 6) + 1,
      dieThree: Math.floor(Math.random() * 6) + 1,
      action: "",
      melee: 0,
      magic: 0,
    };
  }
  numOfPlayers++;
  if (numOfPlayers <= 2) {
    socket.join("1");
  }
  io.emit("playerAdded", numOfPlayers);
  //readies the game information for the start of the game
  socket.on("startGame", (id) => {
    let gameInfo = {};
    if (p1 === socket.id) {
      gameInfo = {
        me: {
          life: players[p1].life,
          dieOne: players[p1].dieOne,
          dieTwo: players[p1].dieTwo,
          dieThree: players[p1].dieThree,
        },
        enemy: {
          life: players[p2].life,
          dieOne: players[p2].dieOne,
          dieTwo: players[p2].dieTwo,
          dieThree: players[p2].dieThree,
        },
      };
    } else {
      gameInfo = {
        me: {
          life: players[p2].life,
          dieOne: players[p2].dieOne,
          dieTwo: players[p2].dieTwo,
          dieThree: players[p2].dieThree,
        },
        enemy: {
          life: players[p1].life,
          dieOne: players[p1].dieOne,
          dieTwo: players[p1].dieTwo,
          dieThree: players[p1].dieThree,
        },
      };
    }
    socket.emit("gameUpdate", gameInfo);
  });
  socket.on("playTurn", (data) => {
    
    if (socket.id === p1) {
      turn[p1] = {
        id: socket.id,
        life: data.life,
        action: data.action,
        melee: data.melee,
        magic: data.magic,
      };
    } else if (socket.id === p2) {
      turn[p2] = {
        id: socket.id,
        life: data.life,
        action: data.action,
        melee: data.melee,
        magic: data.magic,
      };
    }
    console.log(turn[p1]);
    console.log(turn[p2]);
    if (turn[p1] && turn[p2]) {
      console.log("attacking");
      //both have same action
      if (turn[p1].action === turn[p2].action) {
        //both defend
        if (turn[p1].action === "Defend") {
          //finish turn
          if (socket.id === p1) {
            const turnOutcome = {
              me: { life: turn[p1].life },
              enemy: { life: turn[p2].life },
            };
            io.emit("finishTurn", turnOutcome);
          } else if (socket.if === p2) {
            const turnOutcome = {
              me: { life: turn[p2].life },
              enemy: { life: turn[p1].life },
            };
            io.emit("finishTurn", turnOutcome);
          }
        }
        //both attack
        if (turn[p1].action === "Attack") {
          let p1Life = turn[p1].life;
          let p2Life = turn[p2].life;
          p2Life -= turn[p1].melee;
          p2Life -= turn[p1].magic;
          p1Life -= turn[p2].melee;
          p1Life -= turn[p2].magic;
          if (socket.id === p1) {
            const turnOutcome = {
              me: { life: p1Life },
              enemy: { life: p2Life },
            };
            io.emit("finishTurn", turnOutcome);
          } else if (socket.if === p2) {
            const turnOutcome = {
              me: { life: p2Life },
              enemy: { life: p1Life },
            };
            io.emit("finishTurn", turnOutcome);
          }
        }
      }
      //one is defending
      if (turn[p1].action === "Defend" && turn[p2].action === "Attack") {
        const attackMelee = turn[p2].melee - turn[p1].melee;
        const attackMagic = turn[p2].magic - turn[p1].magic;
        let p1Life = turn[p1].life;
        let p2Life = turn[p2].life;
        p1Life -= attackMelee;
        p1Life -= attackMagic;
        if (socket.id === p1) {
          const turnOutcome = {
            me: { life: p1Life },
            enemy: { life: p2Life },
          };
          io.emit("finishTurn", turnOutcome);
        } else if (socket.if === p2) {
          const turnOutcome = {
            me: { life: p2Life },
            enemy: { life: p1Life },
          };
          io.emit("finishTurn", turnOutcome);
        }
      }
      if (turn[p1].action === "Defend" && turn[p2].action === "Attack") {
        const attackMelee = turn[p1].melee - turn[p2].melee;
        const attackMagic = turn[p1].magic - turn[p1].magic;
        let p1Life = turn[p1].life;
        let p2Life = turn[p2].life;
        p2Life -= attackMelee;
        p2Life -= attackMagic;
        if (socket.id === p1) {
          const turnOutcome = {
            me: { life: p1Life },
            enemy: { life: p2Life },
          };
          io.emit("finishTurn", turnOutcome);
        } else if (socket.if === p2) {
          const turnOutcome = {
            me: { life: p2Life },
            enemy: { life: p1Life },
          };
          io.emit("finishTurn", turnOutcome);
        }
      }
    }
  });
});
//listen on a port, create a server
server.listen(PORT, () => {
  console.log("SERVER IS RUNNING");
});
