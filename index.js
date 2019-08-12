const express = require('express')
const app = express()
const mongoose = require('mongoose')
const config = require('./config')
const path = require('path')
const route = require('./route/index')
const cookieParser = require('cookie-parser')
const body_parser = require('body-parser')

mongoose.connect(config.DATABASE,{
    socketTimeoutMS: 0,
    keepAlive: true,
    reconnectTries: 30,
    useNewUrlParser: true
})

app.set('views',path.join(__dirname,'view'))

app.set('view engine','hbs')

app.set('superSecret', config.SECRET);

app.use(express.static(path.join(__dirname,'public')))

app.use(cookieParser())

app.use(body_parser.json())

app.use(body_parser.urlencoded({extended: false}))

app.use('/',route)

const port = process.env.PORT || 8080
app.listen(port, () => console.log("App run on port " + port))

