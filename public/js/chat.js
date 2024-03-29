var socket = io();

socket.on('connect', function () {
  var params = jQuery.deparam(window.location.search);
  params.room = (params.room).toLowerCase();

  socket.emit('join', params, function (err) {
    if (err) {
      alert(err);
      return window.location.href = '/index.html';
    }
  });
});

socket.on('disconnect', function () {
  console.log('Disconnected from the server!');
});

var writingStatusDiv = jQuery('#writing-status');
var statusSent = false;
var messageInput = jQuery('[name=chat-message]');
var writingTimer;

messageInput.keydown(function (e) {
  if (!statusSent && (e.keyCode === 8 || e.keyCode === 46)) {
    socket.emit('createWritingStatus', '<span style="color: red;">Erasing...</span>');
    statusSent = true;
    //.5 Second
    writingTimer = setTimeout(doneWriting, 500);
    if (messageInput.val().length === 0) {
      doneWriting();
    }
  }
});

messageInput.keypress(function () {
  clearTimeout(writingTimer);
  if (!statusSent) {
    socket.emit('createWritingStatus', '<span style="color: green;">Typing...</span>');
    statusSent = true;
  }
  //.5 Second
  writingTimer = setTimeout(doneWriting, 500);
});

socket.on('newWritingStatus', function (status) {
  if (status === undefined) {
    writingStatusDiv.html('');
  } else {
    if (writingStatusDiv.html() === '')
      writingStatusDiv.html(status);
    else
      writingStatusDiv.html(writingStatusDiv.html() + ', ' + status);
  }
});

jQuery('#chat-form').on('submit', function (e) {
  //Prevent refereshing
  e.preventDefault();

  var msgBox = jQuery('[name=chat-message]');

  if (msgBox.val() !== '') {
    doneWriting();

    socket.emit('createMessage', {
      text: msgBox.val()
    }, function (err) {
      if (err) {
        alert(err);
      } else {
        msgBox.val('');
      }
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
  scrollToBottom();
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
    sendLocationBTN.removeAttr('disabled').removeAttr('style').text('Send location');
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
  scrollToBottom();
});

socket.on('updateUsersList', function (users) {
  var ol = jQuery('<ol></ol>');

  users.forEach(function (user) {
    ol.append(jQuery('<li></li>').text(user));
  });

  jQuery('#users').html(ol);
});

function doneWriting() {
  clearTimeout(writingTimer);
  statusSent = false;
  socket.emit('createWritingStatus');
}

function scrollToBottom () {
  var messagesBox = jQuery('#messages-box');
  var newMessage = messagesBox.children('li:last-child');

  var scrollTopHeight = messagesBox.prop('scrollTop');
  var clientHeight = messagesBox.prop('clientHeight');
  var scrollHeight = messagesBox.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTopHeight + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messagesBox.scrollTop(scrollHeight);
  }
}
