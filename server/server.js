const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
//Built-in module
const http = require('http');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
const {generateMessage, generateLocationMessage} = require('./utils/message');
//We choose http to build the server to be able to use & communitcate socket.io module
//( here we'll use http to build the server with help of express settings)
const server = http.createServer(app);
//creating the connection between the server using (http with help of express) & socket.io module
const io = socketIO(server);

app.use(express.static(publicPath));

//When the conncetion between the client & server start the callback will be fired (related to the server-side).
io.on('connection', (socket) => {

  //Emitting an event to a specific user who's connected or caused this event
  socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat.'));

  //Emitting an event to all the connected users except the connected user or the user who caused this event
  socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined the chat.'));

  socket.on('createMessage', (message, callback) => {

    io.emit('newMessage', message);

    callback();
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

  socket.on('createLocationMessage', (coordinates, callback) => {
    if (!coordinates) {
      return callback('Something error happended');
    }
    io.emit('newLocationMessage', generateLocationMessage('Admin', coordinates.latitude, coordinates.longitude));
  });
  socket.on('disconnect', () => {
    console.log('User disconnected!')
  });
});

//Use server instead of app to use the http module in creating the server
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
