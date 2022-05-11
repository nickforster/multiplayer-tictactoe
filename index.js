const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const rooms = {}

io.on('connection', (socket) => {
    socket.on('join-room', (room) => {
        if (rooms[room] == undefined) {
            rooms[room] = 1
            socket.join(room)
            socket.room = room
            socket.emit('joined-room', room)
        } else if (rooms[room] >= 2) {
            socket.emit('room-full', room, rooms)
        } else {
            rooms[room]++
            socket.join(room)
            socket.room = room
            socket.emit('joined-room', room)
        }

    })

    // client disconnects
    socket.on('disconnect', () => {
        rooms[socket.room]--
    })

    // a button is pressed
    socket.on('played', (tictactoeButtonsValues, i, id, room) => {
        tictactoeButtonsValues[i] = id;


        socket.to(room).emit('played', tictactoeButtonsValues, id)
    })

    socket.on('lost', (socketID) => {
        socket.to(socketID).emit('lost')
    })

    socket.on('draw', (room) => {
        socket.to(room).emit('draw')
    })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});