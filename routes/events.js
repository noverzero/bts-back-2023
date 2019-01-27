'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex.js')


//List (get all of the resource)
router.get('/', function(req, res, next){
knex('events')
.select('id', 'venue', 'headliner', 'date', 'startTime')
.then((data) => {
res.status(200).json(data)
  })
})

//Read (get one of the resource)
// Get One
router.get('/:id', function(req, res, next){
knex('events')
.select('id', 'venue', 'headliner', 'date', 'startTime')
.where('id', req.params.id)
.then((data) => {
  res.status(200).json(data[0])
})
})

//Create (create one of the resource)
router.post('/', function(req, res, next){
// use req.body
knex('events')
.insert(req.body)
.returning(['id', 'venue', 'headliner', 'date', 'startTime'])
.then((data) => {
  res.status(200).json(data[0])
})
})

router.patch('/:id', function(req, res, next){
knex('events')
.where('id', req.params.id)
.update(req.body)
.returning(['id', 'venue', 'headliner', 'date', 'startTime'])
.then((data) => {
  res.status(200).json(data[0])
})
})

//Delete (delete one of the resource)
router.delete('/:id', function(req, res, next){
knex('messages')
.where('id', req.params.id)
.del('*')
.returning(['id', 'venue', 'headliner', 'date', 'startTime'])
.then((data) => {
  res.status(200).json(data[0])
})
})
module.exports = router;