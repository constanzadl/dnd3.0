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

//Instance variables
const rooms = {};

//Will connect a socket to a specified room
const joinRoom = (socket, room) => {
  room.sockets.push(socket);
  socket.join(room.id, () => {
    //store the room id in the socket for further use
    socket.roomId = room.id;
    console.log(socket.id, "Joined", room.id);
  });
};

//Will make socket leave any rooms that it is a part of
const leaveRooms = (socket) => {
  const roomsToDelete = [];
  for (const id in rooms) {
    const room = rooms[id];
    //Check to see if the socket is in the current room
    if (room.sockets.includes(socket)) {
      socket.leave(id);
      //remove the socket from the room object
      room.sockets = room.sockets.filter((item) => item !== socket);
    }
    //Prepare to delete any rooms that are now empty
    if (room.sockets.length == 0) {
      roomsToDelete.push(room);
    }
  }
  //Delete all the empty rooms that we found earlier
  for (const room of roomsToDelete) {
    delete rooms[room.id];
  }
};

//Will check to see if we have a game winner for the room
const checkScore = (room, sendMessage = false) => {
  let loser = null;
  for (const client of room.sockets) {
    if (client.score === 0) {
      loser = client;
      break;
    }
  }
  if (loser) {
    if (sendMessage) {
      for (const client of room.sockets) {
        client.emit(
          "gameOver",
          client.id === loser.id ? "You lost the game :(" : "You won the game!"
        );
      }
    }
    return true;
  }
  return false;
};

//At the start of each round, each player will be given 3 randomized dice to choose from and play their turn

const beginRound = (socket, id) => {
  //Make sure this only runs once, maybe find another way to do it
  if (id && socket.id !== id) {
    return;
  }

  //Get the room
  const room = rooms[socket.roomId];
  if (!room) {
    return;
  }

  //Check if there is a winner, don't start a new round
  if (checkScore(room)) {
    return;
  }

  //Game logic
  //Give the user die and current life(score), the die are calculated randomly but the life is a live value
  let info = [{ a: 0, b: 0, c: 0, score: 10 }];
  //Wait for them to put their die in the respective slot and send the values back.
};

io.on("connection", (socket) => {
  //this will run when the server is first accessed
  console.log(`User connected: ${socket.id}`);
  //Give each socket an id to determine who they are


  //join a room
  socket.on("join_room", (data) => {
    const room = {
      id: data,
      sockets: [],
    };
    if (!rooms[room.data]) {
      rooms[room.id] = room;
    }
    joinRoom(socket, room);
  });

  socket.on("send_message", (data) => {
    //broadcast message to everyone but self
    //socket.broadcast.emit("receive_message", data);

    //send message to specific room
    socket.to(data.room).emit("receive_message", data);
  });

  //test for cb
  socket.on("changeNumber", (data, callback) => {
    const num = Math.floor(Math.random() * 6) + 1;
    callback(num);
  });
});

//listen on a port, create a server
server.listen(PORT, () => {
  console.log("SERVER IS RUNNING");
});
