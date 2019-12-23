require('dotenv').config()
const express = require("express")
const colors = require('colors');
const fs = require("fs");

const app = express()
const port = "8024"

app.use('/', express.static('./views', {
    extensions: ['html', 'htm'],
}))

app.use('/overlay', express.static('./overlays', {
    extensions: ['html', 'htm'],
}))

app.use('/api', require('./api/api'))

app.listen(port, () => {
    console.log("Let's Get Mental site up.".blue)
    console.log("STOP THE BUS".red)
})