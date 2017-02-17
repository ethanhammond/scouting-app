var bodyParser = require('body-parser');
var express = require('express');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var moment = require('moment');
var nib = require('nib');
var path = require('path');
var stylus = require('stylus');

var api = require('./routes/api');
var index = require('./routes/index');

var app = express();

function compile(str, path) {
  return stylus(str).set('filename', path).use(nib());
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(stylus.middleware({src: __dirname + '/public', compile: compile}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
   var err = new Error('Not Found');
   err.status = 404;
   next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
