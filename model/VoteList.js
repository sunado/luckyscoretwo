'use strict'
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var VoteList = new Schema({
    id: String,
    name: String,
    positiveUser: [{
        id: String,
        count: Number
    }],
    negativeUser: [{
        id: String,
        count: Number
    }]
})

module.exports = mongoose.model('VoteList',VoteList)