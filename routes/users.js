'use strict';

const express = require('express');
const { password } = require('pg/lib/defaults.js');
const router = express.Router();
const knex = require('../knex.js')
const ORIGIN_URL = process.env.ORIGIN_URL
const JWT_KEY = process.env.JWT_KEY
const verifyToken = require('./api').verifyToken
const whitelist = process.env.ORIGIN_URL.split(' ')
const parse = require("pg-connection-string").parse;
const pgconfig = parse(process.env.DATABASE_URL);
pgconfig.ssl = { rejectUnauthorized: false };
const Pool = require('pg').Pool
const pool = new Pool(pgconfig);
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;

//List (get all of the resource)
router.get('/', verifyToken, function(req, res, next){
(whitelist.indexOf(req.headers.origin) === -1)
    ?
    setTimeout(() => {
          res.sendStatus(404)
        }, 2000)
    :
  jwt.verify(req.token, JWT_KEY, (err, authData) => {
    if(err){
      res.sendStatus(403)
    } else {
      knex('users')
      .select('id', 'firstName', 'lastName', 'email', 'phone', 'isWaiverSigned', 'isStaff', 'isAdmin', 'isDriver', 'isDeactivated', 'hshPwd', 'preferredLocation')
      .then((data) => {
        res.status(200).json(data)
      })
    }
  })
})

//Read (get one of the resource)
// Get One
router.get('/:id', verifyToken, function(req, res, next){
  jwt.verify(req.token, JWT_KEY, (err, authData) => {
    if(err){
      res.sendStatus(403)
    } else {
      knex('users')
      .select('id', 'firstName', 'lastName', 'email', 'phone', 'isWaiverSigned', 'isStaff', 'isAdmin', 'isDriver', 'isDeactivated', 'hshPwd', 'preferredLocation')
      .where('id', req.params.id)
      .then((data) => {
        res.status(200).json(data[0])
      })
    }
  })
})

//Create (create one of the resource)
router.post('/', function(req, res, next){
  console.log('is this the register code? ')
  let email = req.body.email;
  let password = req.body.hshPwd;
  bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
    // returns hash
    req.body.hshPwd = hash.trim();
    });
  });
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

router.post('/login/', async (req, res) => {
  (whitelist.indexOf(req.headers.origin) === -1)
  ?
  setTimeout(() => {
    res.sendStatus(404)
  }, 2000)
  :
  console.log('req.body =====>  ', req.body)
  const {username, password} = req.body
  const { rows } = await pool.query(
    'SELECT  id, "firstName", "lastName", email, "isWaiverSigned", "isStaff", "isDriver", "isAdmin", "isDeactivated", "preferredLocation" FROM users WHERE email = $1',
    [username]
  );
  if (rows.length === 0) {
    return res.status(401).send('Invalid username or password!');
  }
  // Check if the password is correct
  const user = rows[0];
  await bcrypt.compare(password, user.hshPwd.trim(), (err, result)=>{
    if(err) console.error(err)
    if (!result) {
      return res.status(401).send('Invalid username or password');
    } else {
      console.log(' weeddidit! ')
      const payload = { username };

      // Sign the JWT using the secret key
      const token = jwt.sign(payload, JWT_KEY, { expiresIn: '72h' });
      console.log('is jwt working?????????? ', token)

      // Include the JWT in the user object
      // Return the user information
      return res.send({
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        token: token
      });
    }
  });
    
  });


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
