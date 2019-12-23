const express = require("express")
const btoa = require('btoa');
const fetch = require('node-fetch')
const fs = require("fs")

let router = express.Router()

const admins = ["359444812971245568", "577743466940071949"]
// const admins = ["359444812971245568"]

router.get('/', (req, res) => {
  res.send("Hi babes! o/ Get the frick out of my API!")
})

router.get('/login', (req, res) => {
    if(process.env.MODE === "production"){
      redirect = encodeURIComponent(req.protocol + '://' + "letsgetmental.site" + "/api/callback");
    }else{
      redirect = encodeURIComponent(req.protocol + '://' + req.get('host') + "/api/callback");
    }
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`);
});

router.get('/callback', async (req, res) => {

    if(process.env.MODE === "production"){
      redirect = encodeURIComponent(req.protocol + '://' + "letsgetmental.site" + "/api/callback");
    }else{
      redirect = encodeURIComponent(req.protocol + '://' + req.get('host') + "/api/callback");
    }
  
    if(!req.query.code && req.query.error){
      res.redirect(`/?denied=1`);
    } else {
      if (!req.query.code) return res.send("There was no token provided.")
      const code = req.query.code;
      const creds = btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`);
      const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${creds}`,
          },
        });
      const json = await response.json();
      console.log(json)
      if(json.error) return res.send("Whoops! There was an error. Your token is invalid.")
      // var req.session.cookie.maxAge = json.access_token;
      res.cookie('at', json.access_token, {maxAge: 1209600000});
      res.cookie('tt', json.token_type, {maxAge: 1209600000});
  
      res.redirect(`/?loggedin`);
    }
});

router.post('/setAmount', (req, res) => {
  fetch("https://discordapp.com/api/users/@me", {
    headers: {
      authorization: `Bearer ${req.get('Authorisation')}`
    }
  })
  .then(res => res.json())
  .then(user => {
      console.log("Got Response from Disc")
      if(user.message === "401: Unauthorised") {
        res.json({"code":"403"})
      } else if(user.id) {
        if(admins.includes(user.id)){
          function isNumeric(num){
            return !isNaN(num)
          }

          if(!isNumeric(req.query.amnt)){
            return res.json({"code":"notint"})
          }
          fs.writeFile('amount.txt', req.query.amnt, function (err) {
            if (err) throw err;
            console.log('Total Updated');
            res.json({"code":"200"})
          });
        } else {
          res.json({"code":"403"})
        }
      } else {
        res.status(500)
      }
  })
  .catch(err => {
    res.status(500)
    console.log(err)
  })
})

router.get('/getAmount', (req, res) => {
  fs.readFile('amount.txt', 'utf8', (err, contents) => {
    res.send(contents)
  });
})

module.exports = router
