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
  //check if uri is in db
  //if not, save
  //var link = newlink
  //link.shorten
  //link.save then redirect
  var query = Link.where({ url: uri });


  query.findOne({url: uri}, function(err, found) {
    //need to shorten, and save link
    if (err) { throw err; }

    if (found) {
          // console.log('==============link', link)
          // console.log('================found', found)
      res.status(200).send(found);
    } else {
      // console.log('==============INSIDE ELSE!!!!')
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        var shortened = util.shorten(uri).toString();
        // console.log('==========SHORTENED', shortened)
        Link.create({
          url: uri,
          baseUrl: req.headers.origin,
          code: shortened,
          title: title 
        }, function(err, link) {
          // console.log('==========CREATED', link)
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

  new User({ username: username })
    .fetch()
    .then(function(user) {
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  new User({ username: username })
    .fetch()
    .then(function(user) {
      if (!user) {
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.save()
          .then(function(newUser) {
            Users.add(newUser);
            util.createSession(req, res, newUser);
          });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
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