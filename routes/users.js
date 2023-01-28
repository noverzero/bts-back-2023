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
const pool = new Pool(pgconfig)


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

router.post('/login/', async (req, res) => {
  const {username, password} = req.body
  // (whitelist.indexOf(req.headers.origin) === -1)
  //   ?
  //   setTimeout(() => {
  //         res.sendStatus(404)
  //       }, 2000)
  //   :
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [username]
  );
  console.log('req.body =====>  ', req.body,  'rows ====> ', rows)
  if (rows.length === 0) {
    return res.status(401).send('Invalid username or password!');
  }
  // Check if the password is correct
  const user = rows[0];
  const passwordIsValid = true
  // = await bcrypt.compare(password, user.password_hash);
  if (!passwordIsValid) {
    return res.status(401).send('Invalid username or password');
  }

  // Return the user information
  res.send({
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  });

}
)


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
