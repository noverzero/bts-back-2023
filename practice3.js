'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex.js')


//List (get all of the resource)
router.get('/', function(req, res, next){
knex('orders')
.select('id', 'orderedByFirstName', 'orderedByLastName', 'orderedByEmail')
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
// use req.body
const {pickupLocationId, eventId, firstName, lastName, willCallFirstName, willCallLastName, email, orderId, pickupPartiesId, discountCodeId, status, ticketQuantity, totalPrice}= req.body
// const insertOrder={firstName, lastName, email}
// const insertReservation={orderId, pickupPartiesId, willCallFirstName, willCallLastName, status, discountCodeId }
let currentPickupPartyId
let newOrderId
let currentDiscountCode

const currentEventId=Number.parseInt(req.body.eventId)
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
.then((data) => {
  res.status(200).json(data[0])
  newOrderId=data[0].id
  knex ('pickup_parties')
  .insert({
    eventId: eventId,
    pickupLocationId: pickupLocationId,
    inCart: ticketQuantity
  })
  .returning(['id', 'eventId', 'pickupLocationId', 'inCart', 'capacity'])
  .then((data)=>{
    res.status(200).json(data[0])
    currentPickupPartyId=data[0].id
    knex('discount_codes_events')
    .where('currentEventId', eventsId)
    .then((data)=>{
      currentDiscountCode=data[0].discountCodeId
      knex('reservations')
      .insert({
        orderId: newOrderId,
        pickupPartiesId: currentPickupPartyId,
        willCallFirstName: req.body.willCallFirstName,
        willCallLastName: req.body.willCallLastName,
        // status:,
        discountCodeId: currentDiscountCode
        })
      .returning(['id', 'pickupPartiesId', 'willCallFirstName', 'willCallLastName', 'status', 'discountCodeId'])
      .then((data)=>{
        res.status(200).json(data[0])
        
      })
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
module.exports = router;
