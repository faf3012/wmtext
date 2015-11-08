var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var twilio = require('twilio');

var mongojs = require('mongojs');
var ObjectId = require('mongojs').ObjectId;
var uri = 'mongodb://wmtext.user:bananariddle@ds035573.mongolab.com:35573/wmtext'
var collections = ['contacts', 'groups', 'group_members', 'messages', 'message_recipients'];
var db = mongojs(uri, collections, {authMechanism: 'ScramSHA1'});

// create a new twilio REST API client with SID and Token
var twilioClient = new twilio('ACf1118a95c89de45aea33c4c6e2818a96', '9aa8fff23356e56db8e925705c398908');

var routes = require('./routes/index');
var contacts = require('./routes/contacts');
var groups = require('./routes/groups');
var messages = require('./routes/messages');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
var handlebars = require('hbs');

// load handlebars helpers
var hbs_helpers = require('./public/javascripts/hbs_helpers');
hbs_helpers.registerHelpers( handlebars );

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false,
  force: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Make stuff accessible to our router
app.use(function(req,res,next){
    req.db = db;
    req.ObjectId = ObjectId;
    req.twilioClient = twilioClient;
    next();
});

app.use('/', routes);
app.use('/contacts', contacts);
app.use('/groups', groups);
app.use('/messages', messages);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
