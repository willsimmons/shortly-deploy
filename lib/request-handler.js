var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var mongoose = require('mongoose');
var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

mongoose.Promise = require('bluebird');


exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  var query = Link.where({ url: uri });


  query.findOne({url: uri}, function(err, found) {
    //need to shorten, and save link
    if (err) { throw err; }

    if (found) {

      res.status(200).send(found);
    } else {

      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        var shortened = util.shorten(uri).toString();

        Link.create({
          url: uri,
          baseUrl: req.headers.origin,
          code: shortened,
          title: title 
        }, function(err, link) {

          if (err) {
            //if the data doesn't come over
            return res.sendStatus(404);
          } else {
            //look in database
            res.status(200).send(link);
          }
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  
  var query = User.where({ username: username });

  query.find({username: username}, function(err, found) {
    if (err) { throw err; }

    if (found && found.length !== 0) {

      util.comparePassword(password, found[0].password, function(err, isCorrect) {
        if (!isCorrect) {

          res.redirect('/login');
        } else {
          res.sendStatus(302);

          util.createSession(req, res, user);
        }
      });
    } else {
      res.redirect('/login');
    }
  });

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       });
  //     }
  //   });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  
  var query = User.where({ username: username });


  query.findOne({username: username}, function(err, found) {

    if (err) { throw err; }

    if (found) {
      console.log('Account already exists!');
      res.redirect('/signup');
    } else {
      var hashedPassword = util.hashPassword(password).toString();

      User.create({
        username: username,
        password: hashedPassword
      }, function(err, user) {
        if (err) {
          res.sendStatus(404);
        } else {
          res.sendStatus(302);

          util.createSession(req, res, user);
        }
      });
    }
  });
};

exports.navToLink = function(req, res) {

  var query = Link.where({ code: req.params[0] });

  query.findOne({code: req.params[0]}, function(err, found) {
    //need to shorten, and save link
    if (err) { throw err; }

    if (found) {
      found.visits += 1;

      res.status(302).redirect(found.url);
    } else {
      res.redirect('/');
    }
  });


};