'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex.js')
const ORIGIN_URL = process.env.ORIGIN_URL


//List (get all of the resource)
router.get('/', function(req, res, next){
  req.headers.origin !== ORIGIN_URL
    ?
    setTimeout(() => {
          res.sendStatus(404)
        }, 2000)
    :
  knex('reservations')
    .select('id', 'orderId', 'pickupPartiesId', 'willCallFirstName', 'willCallLastName', 'status', 'discountCodeId')
  .then((data) => {
    res.status(200).json(data)
  })
})

//Read (get one of the resource)
// Get One
router.get('/:id', function(req, res, next){
  knex('reservations')
    .select('id', 'orderId', 'pickupPartiesId', 'willCallFirstName', 'willCallLastName', 'status', 'discountCodeId')
    .where('id', req.params.id)
  .then((data) => {
    res.status(200).json(data[0])
  })
})

//Create (create one of the resource)
router.post('/', function(req, res, next){
  knex('reservations')
    .insert(req.body)
    .returning(['id', 'orderId', 'pickupPartiesId', 'willCallFirstName', 'willCallLastName', 'status', 'discountCodeId'])
  .then((data) => {
    res.status(200).json(data[0])
  })
})

//Get all reservations for one pickup party id
router.patch('/findOrders', function(req, res, next){
  knex('reservations')
    .join('orders', 'orders.id', '=', 'reservations.orderId')
    .select('reservations.id', 'reservations.orderId', 'reservations.willCallFirstName', 'reservations.willCallLastName', 'orders.orderedByFirstName', 'orders.orderedByLastName', 'reservations.status', 'orders.orderedByEmail')
    .where('pickupPartiesId', req.body.pickupPartiesId)
  .then(data=>{
    if (data) return res.status(200).json(data)
    else return res.status(404).send('No reservations yet')
  })
})

router.patch('/:id', function(req, res, next){
  knex('reservations')
    .where('id', req.params.id)
    .update(req.body)
    .returning(['id', 'orderId', 'pickupPartiesId', 'willCallFirstName', 'willCallLastName', 'status', 'discountCodeId'])
  .then((data) => {
    res.status(200).json(data[0])
  })
})

//Delete (delete one of the resource)
router.delete('/:id', function(req, res, next){
  knex('reservations')
    .where('id', req.params.id)
    .del('*')
    .returning(['id', 'orderId', 'pickupPartiesId', 'willCallFirstName', 'willCallLastName', 'status', 'discountCodeId'])
  .then((data) => {
    res.status(200).json(data[0])
  })
})

module.exports = router;
