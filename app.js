
if (process.env.NODE_ENV !== 'production'){
  require('dotenv').load();
}

var stripeSecretKey = process.env.STRIPE_SECRETKEY;
var stripePublicKey = process.env.STRIPE_PUBLICKEY;
var stripe = require('stripe')(stripeSecretKey);
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv').config()
var schedule = require('node-schedule')

// var usersRouter = require('./routes/users');
var discountCodesEventsRouter = require('./routes/discount_codes_events')
var discountCodesRouter = require('./routes/discount_codes');
var eventsRouter = require('./routes/events');
var ordersRouter = require('./routes/orders');
var pickupLocationsRouter = require('./routes/pickup_locations');
var pickupPartiesRouter = require('./routes/pickup_parties');
var reservationsRouter = require('./routes/reservations')



var app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PATCH,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/users', usersRouter);
app.use('/discount_codes_events', discountCodesEventsRouter);
app.use('/discount_codes', discountCodesRouter);
app.use('/events', eventsRouter);
app.use('/orders', ordersRouter);
app.use('/pickup_locations', pickupLocationsRouter);
app.use('/pickup_parties', pickupPartiesRouter);
app.use('/reservations', reservationsRouter);



app.use(function(req, res) {
  res.status(404).send('Not Found');
});


module.exports = app;
