var socket = io();

socket.on('connect', function () {
  console.log('Connected to the server.');

  socket.emit('createMessage', {
    from: 'Ahmed Mostafa',
    text: 'Hello. socket.io'
  });

  socket.on('newMessage', function (message) {
    console.log('new message has been received to the chat', message);
  });
});

socket.on('disconnect', function () {
  console.log('Disconnedted from the server!');
});
