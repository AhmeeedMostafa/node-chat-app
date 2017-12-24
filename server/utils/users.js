class Users {
  constructor () {
    this.users = [];
  }

  addUser (id, name, room) {
    var user = {id, name, room}
    //Adding user object to the users array
    this.users.push(user);
    return user;
  }

  getUser (uid) {
    return this.users.filter((user) => user.id === uid)[0];
  }

  removeUser (uid) {
    var userWillRemoved = this.getUser(uid);

    if (userWillRemoved) {
      this.users = this.users.filter((user) => user.id !== uid);
    }

    return userWillRemoved;
  }

  getUsersList (room) {
    var filteredUsers = this.users.filter((user) => user.room === room);
    //.map returns an array of the specified field so, here an array of users names only will be returned
    return filteredUsers.map((user) => user.name);
  }

  isNameExists (user) {
    return this.users.filter((filteredUser) => filteredUser.name.toLowerCase() === user.name.toLowerCase() && filteredUser.room === user.room).length >= 1;
  }

  getRoomsList () {
    var roomsSet = new Set(this.users.map((user) => user.room));
    var rooms = [];
    roomsSet.forEach((room) => rooms.push(room));
    return rooms;
  }
}

module.exports = {Users}
