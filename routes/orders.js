'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex.js')
const nodemailer = require('nodemailer')
const EMAIL_PASS = process.env.EMAIL_PASS
//var stripeSecretKey = process.env.STRIPE_SECRETKEY;
var stripeSecretKey = process.env.STRIPE_LIVESECRETKEY
//var stripeTestKey="pk_test_J0CdRMCGmBlrlOiGKnGgUEwT"
var stripePublicKey = 'pk_live_WZRwtpLAFcufugeQKbtwKobm'
const stripe = require('stripe')(stripeSecretKey);





//List (get all of the resource)
router.get('/', function (req, res, next) {
  knex('orders')
    .select('id', 'pickupLocationId', 'eventId', 'reservationId', 'reservationWillCallName', 'discountCodeId', 'status')
  .then((data) => {
    res.status(200).json(data)
  })
})

//Read (get one of the resource)
// Get One
router.get('/:id', function(req, res, next){
  knex('orders')
    .select('id', 'orderedByFirstName', 'orderedByLastName', 'orderedByEmail')
    .where('id', req.params.id)
  .then((data) => {
    res.status(200).json(data[0])
  })
})

//POST ROUTE ORDERS
router.post('/', function (req, res, next) {
  console.log('ORDERS REQ.BODY', req.body)
  const {
    pickupLocationId,
    eventId,
    firstName,
    lastName,
    willCallFirstName,
    willCallLastName,
    email,
    ticketQuantity,
    discountCode
  } = req.body

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'updates@bustoshow.org',
      pass: EMAIL_PASS
    }
  });

  const deets = {
  query: knex('pickup_parties')
  .join('events', 'events.id', '=', 'pickup_parties.eventId')
  .join('pickup_locations', 'pickup_locations.id', '=', 'pickup_parties.pickupLocationId')
  .where('eventId', eventId)
  .where('pickupLocationId', pickupLocationId)
  .select('events.date', 'events.headliner', 'events.venue', 'pickup_locations.locationName', 'pickup_locations.streetAddress', 'firstBusLoadTime', 'lastBusDepartureTime')
  .then((data)=>{
    return data[0]
    })
  }

  const mailOptions = {
    from: 'updates@bustoshow.org',
    to: email,
    subject: 'Your Bus to Show Order Confirmation',
    text: `Thank you for riding with Bus to Show!  You have reserved ${ticketQuantity} seat(s) from pick up location #: ${pickupLocationId} to event #: ${eventId}, which I know doesn't mean much to you, but don't worry...I will send you another email in a couple days with these numbers decoded. The most recently updated departure time ranges are always current on the website.  So when the event gets closer, please go to the website again and check the times.  We will never move last call times earlier, unless it is an  emergency, and if that happens, we will send lots of communication with lots of notice, and give you an opportunity to cancel. Otherwise, just bring your ID to check-in at the date and time and place you reserved for, and be ready to have a great time! ${console.log('deets-',deets)}`
  }

  let newPickupPartyId
  let newOrderId
  const currentEventId = req.body.eventId
  let userDiscountCode = req.body.discountCode ? req.body.discountCode : null
  if (!firstName || !lastName || !email) {
    res.status(404).send('Please include first name, last name, and email!')
    return null
  }
  if (!pickupLocationId || !eventId || !ticketQuantity) {
    res.status(404).send('Please include pickup location, event, and ticket quantity!')
    return null
  }
  knex('orders')
    .insert({
      orderedByFirstName: firstName,
      orderedByLastName: lastName,
      orderedByEmail: email
    })
    .returning('*')
    .then((newOrder) => {
      newOrderId = newOrder[0].id
      return newOrderId
    })
    .then((newOrderId) => {
      knex('pickup_parties')
        .where({
          eventId: eventId,
          pickupLocationId: pickupLocationId,
        })
        .decrement("capacity", ticketQuantity)
        .returning('*')
        .then((newPickupParty) => {
          newPickupPartyId = newPickupParty[0].id
          let newOrdersArr = [newOrderId, newPickupPartyId]
          return newOrdersArr
        })
        .then((ordersArr) => {
        	let ticketQuantity = req.body.ticketQuantity
        	let reservationsArr=[]
          for(let ii = 0; ii < ticketQuantity; ii++){
        		reservationsArr.push({
                  orderId: ordersArr[0],
                  pickupPartiesId: ordersArr[1],
                  willCallFirstName: req.body.willCallFirstName,
                  willCallLastName: req.body.willCallLastName,
                  discountCodeId: null
                })
          }
          knex('reservations')
            .insert(reservationsArr)
            .returning('*')
            .then((newReservation) => {
              res.status(200).json(newReservation[0])
            })
          })
        .catch(err => {
          res.status(400).json(err)
        })
        .then(transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        }))
      })
    })


//PATCH ROUTE ORDERS
router.patch('/:id', function(req, res, next){
  knex('orders')
    .where('id', req.params.id)
    .update(req.body)
    .returning(['id', 'orderedByFirstName', 'orderedByLastName', 'orderedByEmail'])
  .then((data) => {
    res.status(200).json(data[0])
  })
})

//Delete (delete one of the resource)
router.delete('/:id', function(req, res, next){
  knex('orders')
    .where('id', req.params.id)
    .del('*')
    .returning(['id', 'orderedByFirstName', 'orderedByLastName', 'orderedByEmail'])
  .then((data) => {
    res.status(200).json(data[0])
  })
})

router.post('/charge', async(req, res) => {
  stripe.customers.create({
    email: req.body.stripeEmail,
    source: req.body.stripeToken.id,
  })
  .then(customer =>{
    console.log('customeeeeer', customer)
    stripe.charges.create({
        amount: req.body.amount,
        description: req.body.eventId,
        currency: 'usd',
        customer: customer.id,
        metadata: req.body.metadata
      }, (err, charge) => {
        if (err) {
          console.log(err)
          return res.json(err)
        }

        return res.json(charge)
      }
    )
  })
})

module.exports = router;
