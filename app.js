if (process.env.NODE_ENV !== 'production'){
  require('dotenv').load();
}
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv').config()
var cron = require('node-cron')
var cors = require('cors');
var helmet = require('helmet')
const jwt = require('jsonwebtoken')

var discountCodesEventsRouter = require('./routes/discount_codes_events')
var discountCodesRouter = require('./routes/discount_codes');
var eventsRouter = require('./routes/events');
var ordersRouter = require('./routes/orders');
var pickupLocationsRouter = require('./routes/pickup_locations');
var pickupPartiesRouter = require('./routes/pickup_parties');
var eventDataHandler = require('./eventDataHandler')
var reservationsRouter = require('./routes/reservations')
var usersRouter = require('./routes/users')
var api = require('./routes/api')
var app = express();

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://roomy-move.surge.sh/");
//   res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PATCH,PUT");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

var corsOptions = {
  origin: 'http://localhost:5000',
  //origin: 'https://bustoshow.org',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(helmet())
app.use(cors(corsOptions))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', api)
app.use('/users', usersRouter);
app.use(`/discount_codes_events`, discountCodesEventsRouter);
app.use(`/discount_codes`, discountCodesRouter);
app.use(`/events`, eventsRouter);
app.use(`/orders`, ordersRouter);
app.use(`/pickup_locations`, pickupLocationsRouter);
app.use(`/pickup_parties`, pickupPartiesRouter);
app.use(`/reservations`, reservationsRouter);

app.use(function(req, res) {
  res.status(404).send('Not Found');
});

apiDataFunction = async () => {
  const allShowsObj = await eventDataHandler.getApiData()
  eventDataHandler.insertEventData(allShowsObj)
}

apiDataFunction() // commented out until we go live

// let time = new Date()
cron.schedule('00 04 * * * *', async () => {
  apiDataFunction()
})

sweepInCartsCall = () => {
  eventDataHandler.sweepInCarts()
}

cron.schedule('*/5 * * * *', () => {
  sweepInCartsCall()
})


module.exports = app;
