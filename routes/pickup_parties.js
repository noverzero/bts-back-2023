'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex.js')


//List (get all of the resource)
router.get('/', function(req, res, next){
knex('pickup_parties')
.select('id', 'eventId', 'pickupLocationId', 'inCart', 'capacity')
.then((data) => {
res.status(200).json(data)
  })
})

//Read (get one of the resource)
// Get One
router.get('/:id', function(req, res, next){
knex('pickup_parties')
.select('id', 'eventId', 'pickupLocationId', 'inCart', 'capacity')
.where('id', req.params.id)
.then((data) => {
  res.status(200).json(data[0])
})
})

//Create (create one of the resource)
router.post('/', function(req, res, next){
// use req.body
knex('pickup_parties')
.insert(req.body)
.returning(['id', 'eventId', 'pickupLocationId', 'inCart', 'capacity'])
.then((data) => {
  res.status(200).json(data[0])
})
})

router.post('/findId', function(req, res, next){
// use req.body
knex('pickup_parties')
.select('*')
.where({'eventId': req.body.eventId, 'pickupLocationId':req.body.pickupLocationId})
.then((data) => {
  if(data[0]){
  res.status(200).json(data[0])
} else {
  res.status(404).send("Pickup Party does not exist")
}
})
})

router.patch('/:id', function(req, res, next){
knex('pickup_parties')
.where('id', req.params.id)
.update(req.body)
.returning(['id', 'pickupLocationId', 'eventId', 'eventDate', 'eventVenue', 'lastBusDeparts', 'orderId', 'ordersReservationId', 'ordersWillCallName', 'checkedInPasscode', 'sold', 'capacity', 'inCart'])
.then((data) => {
  res.status(200).json(data[0])
})
})

router.patch('/', function(req, res, next){
console.log(req.body)
knex('pickup_parties')
.where({'pickupLocationId': req.body.pickupLocationId, 'eventId': req.body.eventId})
.increment('inCart', req.body.ticketQuantity)
.returning(['id', 'pickupLocationId', 'eventId', 'eventDate', 'eventVenue', 'lastBusDeparts', 'orderId', 'ordersReservationId', 'ordersWillCallName', 'checkedInPasscode', 'sold', 'capacity', 'inCart'])
.then((data) => {
  res.status(200).json(data[0])
})
})

//Delete (delete one of the resource)
router.delete('/:id', function(req, res, next){
knex('pickup_parties')
.where('id', req.params.id)
.del('*')
.returning(['id', 'eventId', 'pickupLocationId', 'inCart', 'capacity'])
.then((data) => {
  res.status(200).json(data[0])
})
})


module.exports = router;
