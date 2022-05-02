'use strict';

require('dotenv').config();
const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser')
const knex = require('../knex.js')
const whitelist = process.env.ORIGIN_URL.split(' ')
// Parse the environment variable into an object
const parse = require("pg-connection-string").parse;
const pgconfig = parse(process.env.DATABASE_URL);
pgconfig.ssl = { rejectUnauthorized: false };
const Pool = require('pg').Pool
const pool = new Pool(pgconfig)

//List (get all of the resource)
router.get('/', (req, res, next) => {
    (whitelist.indexOf(req.headers.origin) === -1)
    ?
    setTimeout(() => {
          res.sendStatus(404)
        }, 2000)
    :
    pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        client.query(`
            SELECT * from upcoming_events_overview_mv
            ORDER BY sort_date;
        `, (err, result) => {
          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }
          res.status(200).json(result.rows)
        })
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
  if (!req.body.startTime) req.body.startTime = '18:00:00'
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
//   knex('events')
//     .where('id', req.params.id)
//     .del('*')
//     .returning(['id', 'date', 'startTime', 'venue', 'headliner', 'support1', 'support2', 'support3', 'headlinerImgLink', 'headlinerBio', 'meetsCriteria', 'isDenied', 'external'])
//   .then((data) => {
//     res.status(200).json(data[0])
//   })
// })
module.exports = router;
