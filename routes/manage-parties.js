'use strict';
const express = require('express');
const router = express.Router();

const whitelist = process.env.ORIGIN_URL.split(' ')
// Parse the environment variable into an object
const parse = require("pg-connection-string").parse;
const pgconfig = parse(process.env.DATABASE_URL);
pgconfig.ssl = { rejectUnauthorized: false };
const Pool = require('pg').Pool
const pool = new Pool(pgconfig)

//List (get all of the parties with manage details)
router.get('/:id', (req, res, next) => {
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

    //     SELECT DISTINCT pp.id, pp."lastBusDepartureTime", pp."firstBusLoadTime", pp."partyPrice", pp."inCart", pp.capacity 
    //         ,  pl."locationName", pl."city"
    //         , COALESCE(
    //         (SELECT COUNT(reservations.id) FROM reservations 
    //         WHERE pp.id = reservations."pickupPartiesId" 
    //         AND  reservations.status IN (1, 2)), 0) AS reservations
    //     FROM  pickup_locations pl
    //     JOIN  pickup_parties pp ON pl.id = pp."pickupLocationId"
    //     WHERE pp."eventId" = ${req.params.id}
    // ;
        client.query(`
        WITH active AS (SELECT DISTINCT pp.id AS party_id, pp."lastBusDepartureTime", pp."firstBusLoadTime", pp."partyPrice", pp."inCart", pp.capacity 
            , pl.id AS loc_id
            , COALESCE(
            (SELECT COUNT(reservations.id) FROM reservations 
            WHERE pp.id = reservations."pickupPartiesId" 
            AND  reservations.status IN (1, 2)), 0) AS reservations
            , TRUE AS created

            FROM  pickup_locations pl
            right join  pickup_parties pp ON pl.id = pp."pickupLocationId"
            WHERE pp."eventId" = ${req.params.id})
        SELECT DISTINCT pl.id AS location_id, pl.city, pl."locationName", pl."type", ${req.params.id} AS eventId, active.*
        FROM pickup_locations pl
        FULL OUTER JOIN pickup_parties pp ON pl.id = pp."pickupLocationId"
        FULL OUTER JOIN active
        ON pl.id = active.loc_id
        WHERE pl."type" != 'unpublished'
        ORDER BY active.created, pl."type", pl.id
 
        `, (err, result) => {
          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }
          console.log(result.rows)
          res.status(200).json(result.rows)
        })
      })

  })


  router.patch('/:id', function(req, res, next){
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
            UPDATE pickup_parties
            SET capacity = ${req.body.capacity}
            WHERE id = ${req.params.id}
            RETURNING *
        ;
        `, (err, result) => {
          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }
          console.log(result.rows)
          res.status(200).json(result.rows)
        })
      })
  })

  router.put('/:id', function(req, res, next){
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
        // a : req.body.city,
        // a : req.body.locationName,
        // a : req.body.type,
        // a : req.body.reservations,
        // a : req.body.created


        const partyBody = {
            id: req.body.party_id,
            eventId: req.body.eventid,
            pickupLocationId: req.body.location_id,
            lastBusDepartureTime: req.body.lastBusDepartureTime,
            firstBusLoadTime: req.body.firstBusLoadTime,
            partyPrice: req.body.partyPrice,
            capacity: req.body.capacity,
          }
        const {id, eventId, pickupLocationId, lastBusDepartureTime, firstBusLoadTime, partyPrice, capacity, created_at, updated_at} = req.body
        const query = `
                    INSERT INTO pickup_parties(id, "eventId", "pickupLocationId", "lastBusDepartureTime", "firstBusLoadTime", "partyPrice", "capacity", created_at, updated_at)
                    VALUES(${partyBody.id}, ${partyBody.eventId}, ${partyBody.pickupLocationId}, '${partyBody.lastBusDepartureTime}', '${partyBody.firstBusLoadTime}', ${partyBody.partyPrice}, ${partyBody.capacity}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP )
                    ON CONFLICT (id)
                    DO 
                        UPDATE SET "lastBusDepartureTime" = '${partyBody.lastBusDepartureTime}',
                            "firstBusLoadTime" = '${partyBody.firstBusLoadTime}',
                            "partyPrice" = ${partyBody.partyPrice},
                            capacity = ${partyBody.capacity},
                            updated_at = CURRENT_TIMESTAMP
                    WHERE pickup_parties.id = ${partyBody.id}
                    AND pickup_parties."eventId" = ${partyBody.eventId}
                    AND pickup_parties."pickupLocationId" = ${partyBody.pickupLocationId}

                    RETURNING *
                ;`

                            console.log(' here is the query [[[[[[[[[[[[[============= ', query)
        client.query(`${query}`, (err, result) => {
          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }
          console.log(result.rows)
          res.status(200).json(result.rows)
        })

      })
  })


  module.exports = router;
