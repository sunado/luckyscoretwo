const express = require('express')

const UserModel = require('../model/User')
const AdminModel = require('../model/Admin')
const VoteList = require('../model/VoteList')
const jwt = require('jsonwebtoken')
const config = require('../config')

//
exports.filter = function (req, res, next) {
    if (req.url == '/login' || req.url == '/vote' || req.url == '/dhdcfklliljv3470dj' || req.url == '/toilatoikhongthichdaunhe' || req.url == '/') {
        next();
    } else {
        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (req.cookies) {
            //console.log(req.cookies)
            token = req.cookies.token || token
        }
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, req.app.settings.superSecret, function (err, decoded) {
                if (err) {
                    return res.redirect('login');
                } else {
                    // if everything is good, save to request for use in other routes
                    //console.log("Token valid");
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            // if there is no token
            // return an error
            return res.redirect('login');

        }
    }
}

//
exports.authenticate = async (req,res,next) => {
    try {
        let admin = await AdminModel.findOne({username:  req.body.username});
        if(!admin) {
            res.render('login',{error: "Username not found"})
        } else {
            if (admin.passwd === req.body.passwd) {
                let token = jwt.sign(admin.toJSON(), req.app.settings.superSecret, {
                    expiresIn: 604800 
                })
                
                res.cookie('token', token, { maxAge: 900000, httpOnly: true });
                res.render('admin/admin')
            } else {
                res.render('login',{error: err})
            }
        }
    }catch(e) {
        res.render('login',{error: e})
    }
}

//
exports.logout = function(req,res,next) {
    res.clearCookie('token');
    res.redirect('login')
}

//
exports.addUser = async (req,res,next) => {
    try {
        let user = await UserModel.findOne({id: req.body.id}).exec()

        if(user){
            res.send({error: "User exist. Please add other user."})
        } else {
            var n = new UserModel({
                id: req.body.id,
                name: req.body.name
            })

            await n.save()

            let users =  await UserModel.find().exec()

            res.render('admin/users',{users: users})
        }

    } catch(e) {
        res.send({error: e})
    }
}

//
exports.deleteUser = async (req,res,next) => {
    try {
        await UserModel.deleteOne({id: req.body.id})
        res.send(true)
    } catch(e) {
        res.send(null)
    }
}

//
exports.showAllUser = async(req,res,next) => {
    try{
        let users = await UserModel.find().exec()

        res.render('showUser',{users: users})

    }catch(e){
        res.render('showUser',{error: 'Cannot read database'})
    }
}

//
exports.showVoteView = async (req,res,next) => {
    try {
        var query = VoteList.find().limit(1).sort({$natural:-1})
        let votes =await query.exec()
    
        if(votes.length == 0 || votes[0].status == "stop"){
            res.render('404') 
        } else {
            let users = await UserModel.find()
            res.render('vote',{users: users,title: votes[0].name})
        }
    }catch(e){
        res.render('404')
    }
}

//TODO Update this function
exports.onVote = async (req,res,next) => {
    console.log(req.body.userid)
    var voteNum = parseInt(req.body.voteNum)
    let userid = req.body.userid
    
    if(voteNum != 1 && voteNum != 2) {

        res.send({error: "The data is invalid"})
    } else {

        try {
            let user = await UserModel.findOne({id: req.body.userid}).exec()
            let votes = await VoteList.find().limit(1).sort({$natural:-1}).exec()
            let vote = votes[0]
            if(voteNum == 1){
                let oldvoteIndex = vote.negativeUser.findIndex(x => x.id === userid);
                let lastCount = 0;
                
                if(oldvoteIndex > -1){
                    lastCount = vote.negativeUser[oldvoteIndex].count;
                    vote.negativeUser.splice(oldvoteIndex,1);
                }
                
                let checkvoteIndex = vote.positiveUser.findIndex(x => x.id === userid);

                if(checkvoteIndex != -1){
                    res.send({error: "Bạn đã chọn lựa chọn này rồi"})
                    return;
                }

                vote.positiveUser.push({
                    id: userid,
                    count: lastCount + 1
                })
                
            } else {
                let oldvoteIndex = vote.positiveUser.findIndex(x => x.id === userid);
                let lastCount = 0;
                
                if(oldvoteIndex > -1){
                    lastCount = vote.positiveUser[oldvoteIndex].count;
                    vote.positiveUser.splice(oldvoteIndex,1);
                }
                
                let checkvoteIndex = vote.negativeUser.findIndex(x => x.id === userid);
                
                if(checkvoteIndex != -1){
                    res.send({error: "Bạn đã chọn lựa chọn này rồi"})
                    return;
                }

                vote.negativeUser.push({
                    id: userid,
                    count: lastCount + 1
                })
            }


            await vote.save()

            res.send({success: "done"})
        }catch(e){
            console.log(e)
            res.send({error: "Bình chọn thất bại"})
        }
    }
}

//
exports.adminUsers = async (req,res,next) => {
    try {

        let users = await UserModel.find().exec()
        res.render('admin/users',{users: users})

    } catch(e){
        res.render('admin/users',{error: 'Cannot read database'})
    }
}

//
exports.adminDashboard = async (req,res,next) => {
    try {
        let votes = await VoteList.find().exec()
        var num = votes.length - 1

        if(req.params && req.params.num){
            num = parseInt(req.params.num)
        }
        //console.log(votes)
        if(votes.length <= num) {
            throw "Out of array"
        }

        if(votes.length == 0){
            res.render('admin/blank',{message: ""})
            return
        }

        let vote_ = votes[num]        
        let stastic 
        let user_votes
        res.render('admin/dashboard',{title: vote_.name, users: user_votes, dats: stastic, votes: votes})
        
    } catch (e) {
        console.log(e)
        res.render('admin/blank',{message: e})
    }
    
}

//TODO update this function
exports.adminGetVoteData = async (req,res,next) => {
    try {
        let vote_now = await VoteList.find().limit(1).sort({$natural:-1}).exec()
        if(vote_now.length == 0) {
            res.json({})
        } else {
            let vote = vote_now[0];
            var vote_data = {}
            vote_data.data = [vote.positiveUser.length, vote.negativeUser.length]
            console.log(vote_data)
            res.json(vote_data)
        }
    }catch(e){
        res.json({})
    }
}

//TODO update this function
exports.adminUnattend = async (req,res, next) => {
    try {

        let votes = await VoteList.find().exec()
        var num = votes.length - 1

        if(req.params && req.params.num){
            num = parseInt(req.params.num)
        }
        //console.log(votes)
        if(votes.length <= num) {
            throw "Out of array"
        }
        let vote = votes[num]
       // console.log(vote)
        let users = await UserModel.find().exec()

        let unattends = users.filter( user => {
            return vote.negativeUser.findIndex(x => x.id === user.id) == -1 
            && vote.positiveUser.findIndex(x => x.id === user.id) == -1 
        })

        //console.log(vote)
        //console.log("==================")
        res.render('admin/unattend',{users: unattends, votes: votes, title: vote.name})
    }catch(e) {
        console.log(e)
        res.render('admin/blank',{err: e})
    }
}

exports.adminAttend = async (req,res, next) => {
    try {

        //let allowDel = true
        let votes = await VoteList.find().exec()
        let num = votes.length - 1

        if(req.params && req.params.num){
            num = parseInt(req.params.num)
            //allowDel = false
        }
        //console.log(votes)
        if(votes.length <= num) {
            throw "Out of array"
        }
        let vote = votes[num]
       // console.log(vote)
        let users = await UserModel.find().exec()

        let attends = users.filter( user => {
            return vote.negativeUser.findIndex(x => x.id === user.id) != -1 
            || vote.positiveUser.findIndex(x => x.id === user.id) != -1 
        })

        //console.log(vote)
        //console.log("==================")
        res.render('admin/attend',{users: attends, votes: votes, title: vote.name})
    }catch(e) {
        console.log(e)
        res.render('admin/blank',{err: e})
    }
}

exports.removeVote = async(req,res,next) => {

    let userid = req.body.userid

    let votes = await VoteList.find().limit(1).sort({$natural:-1}).exec()
    if(votes.length == 0) {
        res.send({success: "OK"})
        return
    }
    let vote = votes[0]
    let voteIndex = vote.negativeUser.findIndex(x => x.id === userid);
    if(voteIndex != -1) {
        vote.negativeUser.splice(voteIndex,1);
    }
    
    voteIndex =  vote.positiveUser.findIndex(x => x.id === userid);
    
    if(voteIndex != -1 ){
        vote.positiveUser.splice(voteIndex,1);
    }

    await vote.save();
    
    res.send({success: "OK"})
}

//
exports.adminStatus = async(req,res,next) => {
    try {
        let vote = await VoteList.find().limit(1).sort({$natural:-1}).exec()

        if(vote.length == 0){
            //console.log("1")
            res.render('admin/status',{onStop: " "})
        } else if( vote[0].status == "run"){
            //console.log("2")
            res.render('admin/status', {onVote: vote[0].name})
        } else {
            //console.log("3")
            res.render('admin/status',{onStop: " "})
        }
    } catch (e) {
        res.render('admin/status',{onStop: " "})
    }
    

}

//
exports.adminUpdateStatus = async (req,res,next) => {
    try {
        let votes = await VoteList.find().limit(1).sort({$natural:-1}).exec()

        if(votes.length == 0){
            voteNew = new VoteList({
                id: 0,
                status: "run",
                name: req.body.name,
                startDate: Date.now(),
                dueDate: Date.now(),
                positiveUser: [],
                negativeUser: [],
            })

            await voteNew.save()

            res.render('admin/status',{onVote: req.body.name})

        } else if(votes[0].status == "stop"){

            voteNew = new VoteList({
                id: votes[0].id+1,
                status: "run",
                name: req.body.name,
                startDate: Date.now(),
                dueDate: Date.now(),
                positiveUser: [],
                negativeUser: [],
            })
            await voteNew.save( )

            res.render('admin/status',{onVote: req.body.name})
        } else {

            votes[0].dueDate = Date.now()
            votes[0].status = "stop"

            await votes[0].save( )

            res.render('admin/status',{onStop: " "})
        }
    } catch(e) {
        res.render('admin/status', {error: e})
    }
}

//
exports.adminCreate = async(req,res,next) => {
    try {
        let user = await AdminModel.findOne({id: req.body.username}).exec()

        if(user){
            res.render('createadmin',{error: "User exist. Please add other user."})
        } else {
            var n = new AdminModel({
                username: req.body.username,
                passwd: req.body.passwd
            })

            await n.save( )

            res.render('createadmin',{success: "Success! Addmin added. "})
        }
    } catch(e) {
        res.render('createadmin',{error: e})
    }
}

