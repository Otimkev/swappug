var createError = require('http-errors');
var express = require('express');
var timeout = require('connect-timeout');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var userRouter = require('./api/routes/user');

var app = express();
app.use(timeout('20s'));

global.admin = require('firebase-admin');
const serviceAccount = require('./api/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'YOUR_DB_URL'
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(haltOnTimedout);
app.use(cookieParser());
app.use(haltOnTimedout);
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next()
}

module.exports = app;
