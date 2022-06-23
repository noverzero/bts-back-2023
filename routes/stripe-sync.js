'use strict';
const express = require('express');
const router = express.Router();
const whitelist = process.env.ORIGIN_URL.split(' ')
const stripeSecret = process.env.STRIPE_LIVESECRETKEY


const stripe = require('stripe')(stripeSecret);

router.get('/', (req, res, next) => {
    (whitelist.indexOf(req.headers.origin) === -1)
    ?
    setTimeout(() => {
          res.sendStatus(404)
        }, 2000)
    :
        // stripe.products.create({
        //     name: 'Starter Subscription',
        //     description: '$12/Month subscription'}
        // )
        // .then((products) => {
        //     console.log('fine then we will try it like this:::::::: ', products)
        // })
        console.log('stripe code is commented out :) ')
    })

    module.exports = router;
