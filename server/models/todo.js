var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null,
  },
  _creator: {  // using underscore here to show that it's an ObjectID (the id of the user that created the todo)
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  }
});

module.exports = { Todo };