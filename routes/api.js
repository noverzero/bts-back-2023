'use strict';

const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const JWT_KEY = process.env.JWT_KEY

router.get('/', function (req, res, next) {

//FORMAT OF TOKEN:
//Authorization: bearer <access token>
//verify token

  const user = req.user || {
    id: 1,
    userName: 'guest'
  }
  
  jwt.sign({user: user}, JWT_KEY, (err, token)=>{
    res.json({
      token: token
    })
  })
})

function verifyToken(req, res, next){
  //get auth header value
  //const bearerHeader = req.headers['authorization']
  const cookieToken = req.cookies['token']
  //check if value exists
  if(cookieToken){
    //set to req.token
    req.token = cookieToken
    //call the Next Middleware
    next()

  } else {
    //forbidden
    res.sendStatus('403')
  }
}



module.exports = {router, verifyToken};
