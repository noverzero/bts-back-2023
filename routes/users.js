'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex.js')


//List (get all of the resource)
router.get('/', function(req, res, next){
  knex('users')
    .select('id', 'firstName', 'lastName', 'email', 'phone', 'isWaiverSigned', 'isStaff', 'isAdmin', 'isDriver', 'isDeactivated', 'hshPwd', 'preferredLocation')
  .then((data) => {
    res.status(200).json(data)
  })
})

//Read (get one of the resource)
// Get One
router.get('/:id', function(req, res, next){
  knex('users')
    .select('id', 'firstName', 'lastName', 'email', 'phone', 'isWaiverSigned', 'isStaff', 'isAdmin', 'isDriver', 'isDeactivated', 'hshPwd', 'preferredLocation')
    .where('id', req.params.id)
  .then((data) => {
    res.status(200).json(data[0])
  })
})



//Create (create one of the resource)
router.post('/', function(req, res, next){
  let email = req.body.email
  return knex('users')
    .select('id', 'firstName', 'lastName', 'email', 'phone', 'isWaiverSigned', 'isStaff', 'isAdmin', 'isDriver', 'isDeactivated', 'preferredLocation')
    .where('email', email)
  .then((rows) =>{
    if(rows.length===0){
      return knex('users')
        .insert(req.body)
        .returning(['id', 'firstName', 'lastName', 'email', 'phone', 'isWaiverSigned', 'isStaff', 'isAdmin', 'isDriver', 'isDeactivated', 'preferredLocation'])
      .then((data) => {
        res.status(200).json(data[0])
      })
    } else {
      console.log('if email already exists', rows[0])
      res.status(200).json(rows[0])
    }
  })
  .catch((err) => {
    next(err)
  })
})

// router.patch('/:id', function(req, res, next){
//   knex('users')
//     .where('id', req.params.id)
//     .update(req.body)
//     .returning(['id', 'firstName', 'lastName', 'email', 'isWaiverSigned', 'isStaff', 'isAdmin', 'isDriver', 'isDeactivated', 'hshPwd', 'preferredLocation'])
//   .then((data) => {
//     res.status(200).json(data[0])
//   })
// })

//Delete (delete one of the resource)
// router.delete('/:id', function(req, res, next){
//   knex('users')
//     .where('id', req.params.id)
//     .del('*')
//     .returning(['id', 'firstName', 'lastName', 'email', 'isWaiverSigned', 'isStaff', 'isAdmin', 'isDriver', 'isDeactivated', 'hshPwd', 'preferredLocation'])
//   .then((data) => {
//     res.status(200).json(data[0])
//   })
// })

module.exports = router;
