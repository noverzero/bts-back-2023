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
router.get('/:id', function (req, res, next) {
  knex('orders')
    .select('id', 'pickupLocationId', 'eventId', 'reservationId', 'reservationWillCallName', 'discountCodeId', 'status')
    .where('id', req.params.id)
    .then((data) => {
      res.status(200).json(data[0])
    })
})

//Create (create one of the resource)
router.post('/', function (req, res, next) {
  // use req.body
  knex('orders')
    .insert(req.body)
    .returning(['id', 'pickupLocationId', 'eventId', 'reservationId', 'reservationWillCallName', 'discountCodeId', 'status'])
    .then((data) => {
      res.status(200).json(data[0])
    })
})

router.patch('/:id', function (req, res, next) {
  knex('orders')
    .where('id', req.params.id)
    .update(req.body)
    .returning(['id', 'pickupLocationId', 'eventId', 'reservationId', 'reservationWillCallName', 'discountCodeId', 'status'])
    .then((data) => {
      res.status(200).json(data[0])
    })
})

//Delete (delete one of the resource)
router.delete('/:id', function (req, res, next) {
  knex('orders')
    .where('id', req.params.id)
    .del('*')
    .returning(['id', 'pickupLocationId', 'eventId', 'reservationId', 'reservationWillCallName', 'discountCodeId', 'status'])
    .then((data) => {
      res.status(200).json(data[0])
    })
})


// router.post("/charge", async (req, res) => {
//   try {
//     // stripe.customers.create(JSON.stringify({
//     //   email: req.body.stripeEmail,
//     //   source: token
//     // })).then(customer => {
//       // return 
//       stripe.charges.create({
//         amount: req.body.totalCost,
//         currency: "usd",
//         description: "An example charge",
//         source: token
//       })
//     // })
//     .then(status => {
//       res.json({
//         ...status
//       })
//     })
//   } catch (err) {
//     res.status(500).end();
//   }
// });

router.post('/charge', async(req, res) => {
  const amount = 2500;
  console.log(req.body)
  stripe.customers.create({
    email: req.body.stripeEmail,
    source: req.body.stripeToken
  })
  .then(customer => stripe.charges.create({
    amount,
    description: 'example charge',
    currency: 'usd',
    customer: customer.id
  }))
  .then(charge => res.json(charge));
});

module.exports = router;