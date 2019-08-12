'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema 

var User = new Schema({
    id: String,
    name: String
})

module.exports = mongoose.model('User',User)