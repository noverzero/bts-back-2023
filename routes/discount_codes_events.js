'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex.js')

//List (get all of the resource)
router.get('/', function(req, res, next){
  knex('discount_codes_events')
    .select('id', 'eventsId', 'discountCodeId')
  .then((data) => {
    res.status(200).json(data)
  })
})

//Read (get one of the resource)
// Get One
router.get('/:id', function(req, res, next){
  knex('discount_codes_events')
    .select('id', 'eventsId', 'discountCodeId')
    .where('id', req.params.id)
  .then((data) => {
    res.status(200).json(data[0])
  })
})

//Create (create one of the resource)
router.post('/', function(req, res, next){
  // use req.body
  knex('discount_codes_events')
    .insert(req.body)
    .returning(['id', 'eventsId', 'discountCodeId'])
  .then((data) => {
    res.status(200).json(data[0])
  })
})

router.patch('/:id', function(req, res, next){
  knex('discount_codes_events')
    .where('id', req.params.id)
    .update(req.body)
    .returning(['id', 'eventsId', 'discountCodeId'])
  .then((data) => {
    res.status(200).json(data[0])
  })
})

//Delete (delete one of the resource)
router.delete('/:id', function(req, res, next){
  knex('discount_codes_events')
    .where('id', req.params.id)
    .del('*')
    .returning(['id', 'eventsId', 'discountCodeId'])
  .then((data) => {
    res.status(200).json(data[0])
  })
})
module.exports = router;
