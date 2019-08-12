'use strict'
var express = require('express')
var router = express.Router()
var controller = require('../controller/controller')

router.use(controller.filter);

router.get('/', controller.showVoteView)

router.get('/login', (req,res,next) => res.render('login'))

router.get('/logout', controller.logout)

router.get('/admin', (req,res,next) => res.render('admin/admin'))

router.get('/admin/users', controller.adminUsers)

router.get('/admin/dashboard', controller.adminDashboard)

router.get('/admin/dashboard/:num', controller.adminDashboard)

router.get('/admin/unattend', controller.adminUnattend)

router.get('/admin/unattend/:num', controller.adminUnattend)

router.get('/admin/status',controller.adminStatus)

router.get('/admin/votedata', controller.adminGetVoteData)

router.post('/vote', controller.onVote)

router.post('/login', controller.authenticate)

router.post('/addUser', controller.addUser)

router.post('/deleteUser', controller.deleteUser)

router.post('/admin/status',controller.adminUpdateStatus)

//create admin

router.post('/dhdcfklliljv3470dj',controller.adminCreate)

router.get('/toilatoikhongthichdaunhe', (req,res,next) => res.render('createadmin'))

//404
router.get('*', (req,res,next) => res.render('404'))
router.post('*', (req,res,next) => res.render('404'))
module.exports = router

