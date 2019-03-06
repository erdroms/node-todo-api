const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

const user1Id = new ObjectID();
const user2Id = new ObjectID();

const users = [{
  _id: user1Id,
  email: 'erin@example.com',
  password: 'user1pass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: user1Id, access: 'auth' }, process.env.JWT_SECRET).toString(), //abc123 is our salt which is defined in user.js (generateAuthToken)
  }]
}, {
  _id: user2Id,
  email: 'erin2@example.com',
  password: 'user2pass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: user2Id, access: 'auth' }, process.env.JWT_SECRET).toString(), //abc123 is our salt which is defined in user.js (generateAuthToken)
  }]
}]

const todos = [
  {
    _id: new ObjectID(),
    text: 'first test todo',
    _creator: user1Id,
  },
  {
    _id: new ObjectID(),
    text: 'second test todo',
    completed: true,
    completedAt: 444,
    _creator: user2Id,
  }
];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos)
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save(); //returns a promise
    var userTwo = new User(users[1]).save(); //returns a promise

    // wait for userOne and userTwo to resolve
    // must return the promise so we can add .then to the end of this
    return Promise.all([userOne, userTwo]);
  }).then(() => done());
}

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
}