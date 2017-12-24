const moment = require('moment');

const generateMessage = (from, text) => ({from, text, createdAt: moment.valueOf()});

const generateLocationMessage = (from, coords) => ({from, url: `https://google.com/maps?q=${coords.latitude},${coords.longitude}`, createdAt: moment.valueOf()});

const emitMessageToChat = (users, io, socketId, messageText, locationMessage) => {
  var user = users.getUser(socketId);

  if (user) {
    if (!locationMessage) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, messageText));
    } else {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, messageText));
    }

    return true;
  } else {
    return false;
  }
}

module.exports = {generateMessage, generateLocationMessage, emitMessageToChat};
