const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
//Built-in module
const http = require('http');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
const {generateMessage, generateLocationMessage, emitMessageToChat} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

//We choose http to build the server to be able to use & communitcate socket.io module
//( here we'll use http to build the server with help of express settings)
const server = http.createServer(app);
//creating the connection between the server using (http with help of express) & socket.io module
const io = socketIO(server);
const users = new Users();

app.use(express.static(publicPath));

//When the conncetion between the client & server start the callback will be fired (related to the server-side).
io.on('connection', (socket) => {
  //Emitting an event to a specific user who's connected or caused this event
  // socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat.'));
  //
  //Emitting an event to all the connected users except the connected user or the user who caused this event
  // socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined the chat.'));
  socket.emit('existingRooms', users.getRoomsList());

  socket.on('createMessage', (message, callback) => {
    emitMessageToChat(users, io, socket.id, message.text) ? callback() : callback('Something went wrong, please reload the page & try again.');
    //Emitting an event to a specific user who's connected or caused this event
    // socket.emit('newMessage', {
    //   from: 'Admin',
    //   text: 'Welcome. User 1'
    // });

    //Emitting an event to all the connected users except the connected user or the user who caused this event
    // socket.broadcast.emit('newMessage', {
    //   from: 'Admin',
    //   text: 'User 1 has joined the chat.'
    // });

    //Here we emit event to only the user connected as we're using socket
    //socket.emit('newMessage', {message});
    //Instead we use IO to emit event to all the users connected
  });

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Please, Enter your name & chat room.');
    } else if (users.isNameExists(params) || params.name.toLowerCase() === 'admin') {
      return callback('Your name is taken, choose another one');
    }

    //Create & join a room with the specified name
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    //Emit an event listener to all the connected users to this specific room name
    io.to(params.room).emit('updateUsersList', users.getUsersList(params.room));

    socket.emit('newMessage', generateMessage('Admin', 'Welcome the chat room'));

    //Emit an event listener to all the connected users excpet the one who caused this emittion to this specific room name
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined the room.`));

    callback();
  });

  socket.on('createLocationMessage', (coordinates, callback) => {
    if (!coordinates) {
      return callback('Something error happended');
    }

    if (!emitMessageToChat(users, io, socket.id, coordinates, true))
      callback('Something went wrong, please reload the page & try again.');

  });
  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUsersList', users.getUsersList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the chat.`));
    }
  });

  socket.on('createWritingStatus', (status) => {
    var user = users.getUser(socket.id);
    if (status)
      socket.broadcast.to(user.room).emit('newWritingStatus', `${user.name} is ${status}`);
    else
      socket.broadcast.to(user.room).emit('newWritingStatus');
  });
});

//Use server instead of app to use the http module in creating the server
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
