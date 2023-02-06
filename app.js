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
var eventsDashRouter = require('./routes/events-dash');
var ordersRouter = require('./routes/orders');
var pickupLocationsRouter = require('./routes/pickup_locations');
var pickupPartiesRouter = require('./routes/pickup_parties');
var managePartiesRouter = require('./routes/manage-parties');
var manageReservationsRouter = require('./routes/manage-reservations');

var eventDataHandler = require('./eventDataHandler');
var reminderEmails = require('./reminderEmails')
var reservationsRouter = require('./routes/reservations');
var usersRouter = require('./routes/users')
var apiRouter = require('./routes/api').router
const stripeSync = require('./routes/stripe-sync')
var app = express();
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://roomy-move.surge.sh/");
//   res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PATCH,PUT");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
var whitelist = process.env.ORIGIN_URL.split(' ')
//console.log('whitelist ===========> ', whitelist)
var corsOptions = {
  origin: function (origin, callback) {
    //console.log('origin --------------->>>> ', origin)
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(helmet())
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})
app.use(cors(corsOptions))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter)
app.use('/users', usersRouter);
app.use(`/discount_codes_events`, discountCodesEventsRouter);
app.use(`/discount_codes`, discountCodesRouter);
app.use(`/events`, eventsRouter);
app.use(`/events-dash`, eventsDashRouter);
app.use(`/orders`, ordersRouter);
app.use(`/pickup_locations`, pickupLocationsRouter);
app.use(`/pickup_parties`, pickupPartiesRouter);
app.use(`/manage-parties`, managePartiesRouter)
app.use(`/manage-reservations`, manageReservationsRouter)
app.use(`/reservations`, reservationsRouter);
app.use('/stripe-sync', stripeSync);

app.use(function(req, res) {
  console.log('next all the way to the end without finding anything req =====>', req.path)
  res.status(404).send('Not Found!');
});

apiDataFunction = async () => {
  const allShowsObj = await eventDataHandler.getApiData()
  //eventDataHandler.insertEventData(allShowsObj)
}

//apiDataFunction() // commented out until we go live

// let time = new Date()
cron.schedule('00 04 * * * *', async () => {
  //apiDataFunction()
})


cron.schedule('*/5 * * * *', () => {
  //sweepInCartsCall()
})

//reminderEmails.sendReminder()

cron.schedule('15 17 * * *', () => {
  if (process.env.NODE_ENV == 'production'){
    console.log('reminder email cron! ')
    reminderEmails.sendReminder()
  }
})

module.exports = app;

