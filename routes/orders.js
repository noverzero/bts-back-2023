'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex.js')
var stripeSecretKey = process.env.STRIPE_SECRETKEY;
var stripePublicKey = process.env.STRIPE_PUBLICKEY;
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
router.post('/', function(req, res, next){
const {pickupLocationId, eventId, firstName, lastName, willCallFirstName, willCallLastName, email, orderId, pickupPartiesId, discountCodeId, status, ticketQuantity, totalPrice, discountCode}= req.body
let newPickupPartyId
let newOrderId
const currentEventId=req.body.eventId
let userDiscountCode=req.body.discountCode
if(!firstName || !lastName || !email){
    return next({ status: 400, message: 'Please include first name, last name, and email!'})
}
knex('orders')
.insert({
  orderedByFirstName: firstName,
  orderedByLastName: lastName,
  orderedByEmail: email
})
.returning(['id', 'orderedByFirstName', 'orderedByLastName', 'orderedByEmail'])
.then((newOrder) => {
  // res.status(200).json(newOrder[0])
  newOrderId=newOrder[0].id
  // console.log(newOrder)
  return newOrderId
})
.then((newOrderId)=>{
  console.log('NEWORDERID', newOrderId)
  knex ('pickup_parties')
  .where({
    eventId: eventId,
    pickupLocationId: pickupLocationId,
  })
  .decrement("capacity", ticketQuantity)
  .returning(['id', 'eventId', 'pickupLocationId', 'inCart', 'capacity'])
  .then((newPickupParty)=>{
    console.log("NEWPICKUPPARTY", newPickupParty[0])
    newPickupPartyId=newPickupParty[0].id
    console.log('NEWPICKPUPARTYID', newPickupPartyId)
    let newObject=[newOrderId, newPickupPartyId]

    console.log("newobject", newObject)
    return (newObject)
  })
.then((newObject)=>{
    knex('reservations')
    .insert({
      orderId: newObject[0],
      pickupPartiesId: newObject[1],
      willCallFirstName: req.body.willCallFirstName,
      willCallLastName: req.body.willCallLastName,
      // status:,
      discountCodeId: userDiscountCode
      })
    .returning(['id', 'pickupPartiesId', 'willCallFirstName', 'willCallLastName', 'status', 'discountCodeId'])
    .then((newReservation)=>{
      res.status(200).json(newReservation[0])
      console.log(newReservation)
    })
  })
})

})



//POST ROUTE ORDERS
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


router.post("/charge", async (req, res) => {
  try {
    stripe.customers.create(JSON.stringify({
      email: req.body.stripeEmail,
      source: token
    })).then(customer => {
      return
      stripe.charges.create({
        amount: req.body.totalCost,
        currency: "usd",
        description: "You bought tickets to a thing",
        source: token
      })
    })
    .then(status => {
      res.json({
        ...status
      })
    })
  } catch (err) {
    res.status(500).end();
  }
});

// router.post('/charge', async(req, res) => {
//   const amount = 2500;
//   console.log(req.body)
//   stripe.customers.create({
//     email: req.body.stripeEmail,
//     source: req.body.stripeToken
//   })
//   .then(customer => stripe.charges.create({
//     amount,
//     description: 'example charge',
//     currency: 'usd',
//     customer: customer.id
//   }))
//   .then(charge => res.json(charge));
// });

module.exports = router;
