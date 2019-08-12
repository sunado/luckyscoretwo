'use strict'
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Admin = new Schema({
    username: String,
    passwd: String
})

module.exports = mongoose.model('Admin',Admin)
