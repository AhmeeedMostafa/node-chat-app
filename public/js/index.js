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

  var msgBox = jQuery('[name=chat-message]');

  if (msgBox.val() !== '') {
    socket.emit('createMessage', {
      from: 'User',
      text: msgBox.val()
    }, function () {
      msgBox.val('');
    });
  }
});

socket.on('newMessage', function (message) {
  var time = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: time
  });

  jQuery('#messages-box').append(html);
});

var sendLocationBTN = jQuery('#send-location');
sendLocationBTN.on('click', function () {
  if (!navigator.geolocation) {
    return alert('Your browser doesn\'t support determining locations');
  }

  sendLocationBTN.attr('disabled', 'disabled').attr('style', 'cursor: not-allowed').text('Sending location ...');

  navigator.geolocation.getCurrentPosition(function (position) {
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, function (err) {
      alert(err);
    });

    sendLocationBTN.removeAttr('disabled').removeAttr('style').text('Send location');
  }, function () {
    alert('Unable to fetch your location.');
  });
});

socket.on('newLocationMessage', function (message) {
  var time = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#location-message-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: time
  });

  jQuery('#messages-box').append(html);
});
