'use strict';

const knex = require('../db/knex');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
const user = function() {};

function users() {
  return knex('users');
}

function account() {
  return knex('accounts');
}


user.authenticate = (user, callback) => {
  account().where({ username: user.username }).first().then( account => {
    if (!account) {
      let error = {
        details: "username does not exist"
      };
      return callback(error);
    }
    bcrypt.compare(user.password, account.password_digest, (err, isMatch) => {
      if (err || !isMatch) {
        let error = {
          details: "username and password don't match"
        };
        return callback(error);
      } else {
        users().where({ account_id: account.id }).first().then( user => {
          return callback(undefined, user);
        });
      }
    });
  });
}

user.createUser = (credentials, callback) => {
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) {
      callback(err);
    }

    bcrypt.hash(credentials.password, salt, (err, hash) => {
      if (err) {
        callback(err);
      }

      credentials.password_digest = hash;
      delete credentials.password;

      const avatarPaths = ['app/images/avatars/100.png', 'app/images/avatars/101.png', 'app/images/avatars/102.png', 'app/images/avatars/103.png', 'app/images/avatars/104.png', 'app/images/avatars/105.png', 'app/images/avatars/106.png', 'app/images/avatars/107.png', 'app/images/avatars/108.png', 'app/images/avatars/109.png'];

      const avatar = avatarPaths[Math.floor(Math.random() * 10)];

      account().insert(credentials, '*').then( account => {
        users()
          .insert({
            account_id: account[0].id,
            username: account[0].username,
            avatar: avatar
          },
          '*').then( newUser => {
            callback(undefined, newUser[0]);
          })
          .catch( error => {
            console.log(error);
            callback(error);
          });
        })
        .catch( error => {
          callback(error);
        });
    });
  });
}

user.getAll = callback => {
  users().select().then( users => {
    callback(undefined, users);
  })
  .catch( error => {
    callback(error);
  });
}

user.getById = (id, callback) => {
  users().where({ id: id }).then( user => {
    callback(undefined, user);
  })
  .catch( error => {
    callback(error);
  });
}

user.getByUsername = (username, callback) => {
  users().where({ username: username }).then( user => {
    callback(undefined, user);
  })
  .catch(error => {
    callback(error);
  });
}

user.updateUser = (id, userParam, callback) => {
  if (userParam.password) {
    bcrypt.hash(userParam.password, salt, (error, hash) => {
      if (error) {
        callback(error);
      }

      userParam.password_digest = hash;
      delete userParam.password;

      account()
        .where({ id: id })
        .update({ username: userParam.username, password_digest: userParam.password_digest }, '*')
        .then( user => {
          users().where()
          callback(undefined, user);
        })
        .catch( error => {
          callback(error);
        });
    });
  }
  else {
    users()
      .where({ id: id })
      .update({ username: userParam.username, avatar: userParam.avatar }, '*')
      .then( user => {
        callback(undefined, user);
      })
      .catch( error => {
        callback(error);
      });
  }
}

user.deleteUser = (id, callback) => {
  users().where({ id: id }).del().then( row => {
    callback(undefined, row);
  })
  .catch( error => {
    callback(error);
  });
}

module.exports = user;
