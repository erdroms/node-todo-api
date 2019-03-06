const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  tokens: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    }
  }]
});

// Overrides the default toJSON method
// Here we are only returning id, email instead of all properties
// This gets called automatically, it's not called manually in our files anywhere
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
}

// `methods` is used for instance methods (user.generateAuthToken)
// using function () here so `this` is bound
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString();

  user.tokens = user.tokens.concat([{ access, token }]);

  return user.save().then(() => {
    return token;
  })
}

UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    // finds any token that matches the passed token in the user's tokens array and removes it from the array
    $pull: {
      tokens: {
        token
      }
    }
  })
}

// `statics` is used for model methods (User.findByToken)
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id, // using quotes here because it's required when using dot notation, so we might as well be consistent
    'tokens.token': token,
    'tokens.access': 'auth'
  });
}

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({ email }).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
}

// pre() is a mongoose middleware
UserSchema.pre('save', function (next) {
  var user = this;

  // make sure the password has been updated to prevent re-hashing
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      })
    })
  } else {
    next();
  }
})

var User = mongoose.model('User', UserSchema);

module.exports = { User };
