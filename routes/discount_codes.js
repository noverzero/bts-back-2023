'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex.js')



//List (get all of the resource)
router.get('/', function(req, res, next){
knex('discount_codes')
.select('id', 'discountCode', 'percentage', 'expiresOn', 'issuedOn', 'issuedTo', 'issuedBy', 'issuedBecause', 'timesUsed', 'type', 'remainingUses', 'usesPerEvent')
.then((data) => {
res.status(200).json(data)
  })
})


//VVVVVpractice joinVVVVV
// router.get('/', function(req, res, next){
//   knex('discount_codes')
//   .join('discount_codes_events', 'discount_codes.id', 'discount_codes_events.discountCodeId')
//   .join('events', 'discount_codes_events.eventsId', 'events.id')
//   .select('*')
//   .then((results) => {
//     console.log('results', results)
//     res.status(200).json(results)
//   })
//
// })

//Read (get one of the resource)
// Get One
router.get('/:id', function(req, res, next){
knex('discount_codes')
.select('id', 'discountCode', 'percentage', 'expiresOn', 'issuedOn', 'issuedTo', 'issuedBy', 'issuedBecause', 'timesUsed', 'type', 'remainingUses', 'usesPerEvent')
.where('id', req.params.id)
.then((data) => {
  res.status(200).json(data[0])
})
})

//Create (create one of the resource)
router.post('/', function(req, res, next){
// use req.body
knex('discount_codes')
.insert(req.body)
.returning(['id', 'discountCode', 'percentage', 'expiresOn', 'issuedOn', 'issuedTo', 'issuedBy', 'issuedBecause', 'timesUsed', 'type', 'remainingUses', 'usesPerEvent'])
.then((data) => {
  res.status(200).json(data[0])
})
})




//if discount code is added to cart
//for each discount code:
//1) check to see if discount code exists in discount_codes
      //if no, return error message
      //if yes, go to step 2..
//2) check if expiration date is earlier than today (expired)
      //if no, return error message
      // if yes, go to step 3
//3) check number of remaining uses and store in accumulator variable.
//4) check percentage discounted and store as variable

// for each reservation

///5) check to see if discount code is associated with event id (discountCode_event)
      // if yes, go to step 5.
//6) get base price before processing fee, then multiply price by (100 - percentage) mutliply result by 1.1 (processing fee)  and store in accumulator variable newPrice
//7) decrement number of remaining uses.


//return newTotal.
//return number of remaining uses.


// router.patch('/', function(req, res, next){
// knex('pickup_parties')
// .where({'pickupLocationId': req.body.pickupLocationId, 'eventId': req.body.eventId})
// .increment('inCart', req.body.ticketQuantity)
// .returning(['id', 'pickupLocationId', 'eventId', 'eventDate', 'eventVenue', 'lastBusDeparts', 'orderId', 'ordersReservationId', 'ordersWillCallName', 'checkedInPasscode', 'sold', 'capacity', 'inCart'])
// .then((data) => {
//   res.status(200).json(data[0])
// })
// })


//

router.patch('/:discountCode', function(req, res, next){
  let discountCode = req.params.discountCode
knex('discount_codes')
.join('discount_codes_events', 'discount_codes.id', 'discount_codes_events.discountCodeId')
.join('events', 'discount_codes_events.eventsId', 'events.id')
.select('*')
.where('discountCode', discountCode)
.then((match) => {
  if(!match){
    next({status:400, message: 'Code not found.'})
  }

  let chicken = []
  match.forEach( (matchElement, i) => {
    let isExpired
    if(matchElement.expiresOn.toLocaleString('en-US') < new Date().toLocaleString('en-US', {timeZone: 'America/Denver'})){
      return "this code has expired"
    }
     let newObject={}
      newObject.percentage=matchElement.percentage
      newObject.remainingUses=matchElement.remainingUses

      chicken.push(newObject)

  })

console.log('chicken:::::', chicken)



})
// .update(req.body)
// .returning(['id', 'discountCode', 'percentage', 'expiresOn', 'issuedOn', 'issuedTo', 'issuedBy', 'issuedBecause', 'timesUsed', 'type', 'remainingUses', 'usesPerEvent'])
// .then((data) => {
//   res.status(200).json(data[0])
// })
})

//Delete (delete one of the resource)
router.delete('/:id', function(req, res, next){
knex('discount_codes')
.where('id', req.params.id)
.del('*')
.returning(['id', 'discountCode', 'percentage', 'expiresOn', 'issuedOn', 'issuedTo', 'issuedBy', 'issuedBecause', 'timesUsed', 'type', 'remainingUses', 'usesPerEvent'])
.then((data) => {
  res.status(200).json(data[0])
})
})
module.exports = router;
