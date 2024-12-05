//create the express server
const express = require('express');
//instance of the express library, used to create the backend server
const app = express();
//instance of http library
const http = require('http');
const {Server} = require('socket.io');

//set project to accept cors, by applying cors middleware
const cors = require('cors');
app.use(cors());


//create http server with express
const server = http.createServer(app);

//instantiate a new server with socket io, specify funtionalities for cors
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET','POST'],
    },    
});

io.on('connection', (socket) => {
    //this will run when the server is first accessed
    console.log(`User connected: ${socket.id}`);

    //join a room
    socket.on("join_room", (data) => {
        socket.join(data);
    })

    socket.on("send_message", (data) => {
    //broadcast message to everyone but self
    //socket.broadcast.emit("receive_message", data);

    //send message to specific room
    socket.to(data.room).emit("receive_message", data);
    });
});

//listen on a port, create a server
server.listen(3001, () => {
    console.log('SERVER IS RUNNING');
});