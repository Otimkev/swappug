const jwt = require('jsonwebtoken');
const db = require('./db/db');

var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on('connection', socket => {
    //Get the chatID of the user and join in a room of the same chatID
    var channel = socket.handshake.query.channel;
    var token = socket.handshake.query.token;


    //console.log('token ' + token);

    if (verifyToken(token)) {
        socket.join(channel);
        console.log('Joined ' + channel);
    } else {
        //console.log('Token invalid disconnected!');
        socket.disconnect();
        return;
    }

    //Leave the room if the user closes the socket
    socket.on('disconnect', () => {
        socket.leave(channel);
    });

    //Send message to only a particular user
    socket.on('send_message', data => {
        //var message = JSON.parse(data);

        receiverId = data.receiver_id;
        senderId = data.sender_id;
        message = data.message;
        //console.log('Got message ' + message + ' from ' + senderId + ' to ' + channel);

        // Insert message into database
        db.query(
            "INSERT INTO messages "
            + "SET sender_id = ?, "
            + "    receiver_id = ?, "
            + "    message = ?", [senderId, receiverId, message], (error, result, fields) => {
                if (error) console.log('error insert message ' + error);


            });

        //Send message to only that particular room
        socket.to(receiverId + '-' + senderId).emit('receive_message', {
            message: message,
            sender_id: senderId,
            receiver_id: receiverId,
        });
    });
    socket.on('start_typing', data => {
        io.to(data).emit('start_typing', {
            typing: true,
        });
    });
    socket.on('stop_typing', data => {
        io.to(data).emit('stop_typing', {
            typing: false,
        });
    });
});

socketApi.sendNotification = function () {
    io.sockets.emit('hello', { msg: 'Hello World!' });
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if (decoded.id != undefined) return true;
        else return false;
    } catch (error) {
        return false;
    }
}

module.exports = socketApi;