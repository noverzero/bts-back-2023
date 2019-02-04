'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex.js')

//List (get all of the resource)
router.get('/', function(req, res, next) {
  knex('discount_codes')
    .select('id', 'discountCode', 'percentage', 'expiresOn', 'issuedOn', 'issuedTo', 'issuedBy', 'issuedBecause', 'timesUsed', 'type', 'remainingUses', 'usesPerEvent')
    .then((data) => {
      res.status(200).json(data)
    })
})


//Read (get one of the resource)
// Get One
router.get('/:id', function(req, res, next) {
  knex('discount_codes')
    .select('id', 'discountCode', 'percentage', 'expiresOn', 'issuedOn', 'issuedTo', 'issuedBy', 'issuedBecause', 'timesUsed', 'type', 'remainingUses', 'usesPerEvent')
    .where('id', req.params.id)
    .then((data) => {
      res.status(200).json(data[0])
    })
})

//Create (create one of the resource)
router.post('/', function(req, res, next) {
  // use req.body
  knex('discount_codes')
    .insert(req.body)
    .returning(['id', 'discountCode', 'percentage', 'expiresOn', 'issuedOn', 'issuedTo', 'issuedBy', 'issuedBecause', 'timesUsed', 'type', 'remainingUses', 'usesPerEvent'])
    .then((data) => {
      res.status(200).json(data[0])
    })
})

//restore discount code remaining uses after timer expires on abandoned checkout.
router.patch('/return/:id', function(req, res, next){
  let id = req.params.id
  let timesUsed = req.body.timesUsed
  knex('discount_codes')
    .join('discount_codes_events', 'discount_codes.id', 'discount_codes_events.discountCodeId')
    .join('events', 'discount_codes_events.eventsId', 'events.id')
    .where('discount_codes.id', id)
    .select('*')
    .first()
    .then((match) => {
      console.log('heydy')
    })
})

//check user entered discount code against database then return code id, new price, and remaining uses.
router.patch('/:discountCode', function(req, res, next) {
  let discountCode = req.params.discountCode
  let totalPrice = req.body.totalPrice
  let ticketQuantity = req.body.ticketQuantity
  let afterDiscountObj={}
  console.log('req.it.ralph>>>', req.body, "<<<END")
  knex('discount_codes')
    .join('discount_codes_events', 'discount_codes.id', 'discount_codes_events.discountCodeId')
    .join('events', 'discount_codes_events.eventsId', 'events.id')
    .select('*')
    .where('discountCode', discountCode)
    .first()
    .then((match) => {
      if (!match) {
        console.log("no match return")
        return res.status(400).json({message: 'This code is not in our database.'})

      }

      afterDiscountObj = {
        'ticketQuantity': ticketQuantity,
        'newRemainingUses': match.remainingUses
      }
      console.log('totalPrice from req.body inside .then', totalPrice)
      if (match.expiresOn.toLocaleString('en-US') > new Date().toLocaleString('en-US', {
          timeZone: 'America/Denver'
        })) {
          console.log("expired return")
          console.log("coupon expiration date:", match.expiresOn.toLocaleString('en-US'))
          console.log("current date:", new Date().toLocaleString('en-US', {
              timeZone: 'America/Denver'
            }))

        return res.status(400).json({message: 'This code has expired.'})

      }
      if (match.remainingUses <= 0) {
        console.log("no more uses return")

        next(res.status(400).json({message: 'This code is all used up.'}))
        return
      }
      let priceWithoutFeesPerTicket = totalPrice * 10 / 11 / ticketQuantity
      console.log('priceWithoutFeesPerTicket', priceWithoutFeesPerTicket)
      let effectiveRate = (100 - match.percentage) / 100

      if (match.remainingUses >= ticketQuantity) {
        afterDiscountObj.timesUsed = ticketQuantity
        afterDiscountObj.totalPriceAfterDiscount = priceWithoutFeesPerTicket * ticketQuantity * effectiveRate * 1.10
        afterDiscountObj.newRemainingUses = match.remainingUses - ticketQuantity
        console.log('more codes than tickets (top one)')
        return (afterDiscountObj)
      }
      if (match.remainingUses < ticketQuantity) {
        afterDiscountObj.timesUsed = match.remainingUses
        afterDiscountObj.totalPriceAfterDiscount = (priceWithoutFeesPerTicket * (ticketQuantity - match.remainingUses) + priceWithoutFeesPerTicket * effectiveRate * match.remainingUses) * 1.10
        afterDiscountObj.newRemainingUses = 0
        console.log("more tickets than codes (bottom one)")
        return afterDiscountObj
      }
      // console.log('afterDiscountObj.newRemainingUses::', afterDiscountObj.newRemainingUses)
      // console.log('afterDiscountObj.totalPriceAfterDiscount::', afterDiscountObj.totalPriceAfterDiscount)
      // console.log('afterDiscountObj.ticketQuantity::', afterDiscountObj.ticketQuantity)
    })
    .then((afterDiscountObj) => {
      console.log("what's going on in here?", afterDiscountObj)
      console.log("afterdiscountobject", afterDiscountObj)

      if(afterDiscountObj.newRemainingUses && afterDiscountObj.totalPriceAfterDiscount && afterDiscountObj.timesUsed  ){
        knex('discount_codes')
          .select('*')
          .where('discountCode', discountCode)
          .update({
            remainingUses: afterDiscountObj.newRemainingUses,
            totalPriceAfterDiscount: afterDiscountObj.totalPriceAfterDiscount,
            timesUsed: afterDiscountObj.timesUsed
          })
          .returning(['id', 'remainingUses', 'totalPriceAfterDiscount', 'timesUsed'])
          .then((data) => {
            console.log('data', data)
            res.status(200).json(data)
          })
      }
      // if(afterDiscountObj.){
      // knex('discount_codes')
      //
      //   .select('*')
      //
      //   .returning(['id', 'remainingUses', 'totalPriceAfterDiscount', 'timesUsed'])
      //   .then((data) => {
      //     console.log('data', data)
      //     res.status(200).json(data)
      //   })
      // }
    })
})


//Delete (delete one of the resource)
router.delete('/:id', function(req, res, next) {
  knex('discount_codes')
    .where('id', req.params.id)
    .del('*')
    .returning(['id', 'discountCode', 'percentage', 'expiresOn', 'issuedOn', 'issuedTo', 'issuedBy', 'issuedBecause', 'timesUsed', 'type', 'remainingUses', 'usesPerEvent'])
    .then((data) => {
      res.status(200).json(data[0])
    })
})


module.exports = router;
