'use strict';

const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser')
const knex = require('../knex.js')


//List (get all of the resource)
router.get('/', function(req, res, next){
  // Cookies that have not been signed
    console.log('Cookies: ', req.cookies)

    // Cookies that have been signed
    console.log('Signed Cookies: ', req.signedCookies)
  knex('events')
    .select('id', 'date', 'startTime', 'venue', 'headliner', 'support1', 'support2', 'support3', 'headlinerImgLink', 'headlinerBio', 'meetsCriteria', 'isDenied', 'external')
  .then((data) => {
    res.status(200).json(data)
  })
})

//Read (get one of the resource)
// Get One
router.get('/:id', function(req, res, next){
  knex('events')
    .select('id', 'date', 'startTime', 'venue', 'headliner', 'support1', 'support2', 'support3', 'headlinerImgLink', 'headlinerBio', 'meetsCriteria', 'isDenied', 'external')
    .where('id', req.params.id)
  .then((data) => {
    res.status(200).json(data[0])
  })
})

//Create (create one of the resource)
router.post('/', function(req, res, next){
  knex('events')
    .insert(req.body)
    .returning(['id', 'date', 'startTime', 'venue', 'headliner', 'support1', 'support2', 'support3', 'headlinerImgLink', 'headlinerBio', 'meetsCriteria', 'isDenied', 'external'])
  .then((data) => {
    res.status(200).json(data[0])
  })
})

router.patch('/:id', function(req, res, next){
  knex('events')
    .where('id', req.params.id)
    .update(req.body)
    .returning(['id', 'date', 'startTime', 'venue', 'headliner', 'support1', 'support2', 'support3', 'headlinerImgLink', 'headlinerBio', 'meetsCriteria', 'isDenied', 'external'])
  .then((data) => {
    res.status(200).json(data[0])
  })
})

//Delete (delete one of the resource)
// router.delete('/:id', function(req, res, next){
//   knex('users')
//     .where('id', req.params.id)
//     .del('*')
//     .returning(['id', 'date', 'startTime', 'venue', 'headliner', 'support1', 'support2', 'support3', 'headlinerImgLink', 'headlinerBio', 'meetsCriteria', 'isDenied', 'external'])
//   .then((data) => {
//     res.status(200).json(data[0])
//   })
// })
module.exports = router;
