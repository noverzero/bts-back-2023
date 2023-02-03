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
const sendRegistrationConfirmationEmail = require('../registrationEmails').sendEmailConfirmation

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
  const payload = { username: req.body.email };
  // Sign the JWT using the secret key
  const token = jwt.sign(payload, JWT_KEY, { expiresIn: '72h' });
  const email = req.body.email;
  const password = req.body.hshPwd;
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
        console.log('we are ready to send that email', data)
        const emailSent = sendRegistrationConfirmationEmail(email, alreadyExists=false, token);
        emailSent ? res.status(200).json({'message': 'confirmation email sent'})
          : res.status(500).json({'message': 'error sending confimration email'})
        
      })
    } else {
      console.log('if email already exists', rows[0])
      res.status(200).json({
        'message': 'account already exists',
        'code': '202',
        'email': `${email}`
      }); 
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Failed to register user' });
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
  pool.connect( async (err, client, release) => {
    const {username, password} = req.body
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(
    'SELECT  id, "firstName", "lastName", email, "hshPwd", "isWaiverSigned", "isStaff", "isDriver", "isAdmin", "isDeactivated", "preferredLocation" FROM users WHERE email = $1',
    [username]
    
    , async (err, result) => {
      release()
      if (err) {
        return console.error('Error executing query', err.stack)
      }
      const { rows } = result
    
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
          const payload = { username };
    
          // Sign the JWT using the secret key
          const token = jwt.sign(payload, JWT_KEY, { expiresIn: '14 days' });
    
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
    })
  }) 
    
  });

  router.get('/confirm-email/:token', async (req, res) => {
    const token = req.params.token;
    let username = ''
    try {
      const decoded = jwt.verify(token, secret);
      console.log(decoded);
      username = decoded.username
      console.log('wow this is the best! ======>>>  ', decoded)

      const query = 'UPDATE users SET is_verified = true WHERE email = $1';
      pool.connect( async (err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        } 
        client.query(
          query,
          [username]
          , async (err, results) => {
            release()
            if(err) {
              console.error(err)
              res.status(500).json({
                'message': 'failed to insert verified user',
                'code': '500',
                'email': `${username}`
              });
            } else {
  
              console.log('it worked! ', results );
              res.status(200).json({
                'message': 'success',
                'code': '200',
                'email': `${username}`
              });
            }
          }
        )
      })
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error("Token has expired");
        res.status(200).json({
          'message': 'expired',
          'code': '203',
          'email': `${username}`
        });
      } else {
        console.error("Token is invalid");
        res.status(200).json({
          'message': 'invalid',
          'code': '203',
          'email': `${username}`
        });
      }
    }

          
          // if (err) {
          //   console.error(err);
          //   res.status(500).json({ error: 'Failed to verify email' });
          // } else if (results.length === 0) {
          //   // No user found with the provided token
          //   res.status(400).json({ error: 'Invalid token' });
          // } else {
          //   // User found with the provided token
          //   const user = results[0];
          //   const expirationDate = user.expiration_date;
          //   if (new Date() > expirationDate) {
          //     // Token has expired
          //     res.status(400).json({ error: 'Token has expired' });
          //   } else {
          //     // Token is valid, confirm the email
          //     const query = 'UPDATE users SET is_verified = true WHERE email = ?';
          //     pool.connect( async (err, client, release) => {
          //       client.query(
          //         query,
          //         [token]
          //         , async (err, result) => {
          //           release()
          //           if (err) {
          //             console.error(err);
          //             res.status(500).json({ error: 'Failed to confirm email' });
          //           } else if (result.length === 0) {
          //             // No user found with the provided token
          //             res.status(400).json({ error: 'Invalid token' });
          //           }
          //         }
          //       )
          //     })
          //   }
          // }

        }
      );


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
