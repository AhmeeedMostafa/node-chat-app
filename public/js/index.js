var socket = io();

socket.on('connect', function () {
  socket.on('existingRooms', function (rooms) {
    var roomsDatalist = document.getElementById('existing-rooms');
    rooms.forEach(function (room) {
      var option = document.createElement('option');
      option.value = room;
      
      roomsDatalist.appendChild(option);
    });
  });
});
