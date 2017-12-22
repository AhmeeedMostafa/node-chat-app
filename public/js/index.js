var socket = io();

socket.on('connect', function () {
  console.log('Connected to the server.');
});

socket.on('disconnect', function () {
  console.log('Disconnedted from the server!');
});

jQuery('#chat-form').on('submit', function (e) {
  //Prevent refereshing
  e.preventDefault();

  socket.emit('createMessage', {
    from: 'User',
    text: jQuery('[name=chat-message]').val()
  }, function (err) {
    console.log(err);
  });
});

socket.on('newMessage', function (message) {
  var li = jQuery('<li></li>');
  li.text(`${message.from}: ${message.text}`);
  jQuery('#messages-box').append(li);
});
