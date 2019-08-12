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
                name: req.body.name,
                vote: []
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
            res.render('vote',{users: users,title: "Bình Chọn " + votes[0].name})
        }
    }catch(e){
        res.render('404')
    }
}

//
exports.onVote = async (req,res,next) => {
    console.log(req.body.userid);
    var sc1 = parseInt(req.body.sc1);
    var sc2 = parseInt(req.body.sc2);
    var sc3 = parseInt(req.body.sc3);
    var sc4 = parseInt(req.body.sc4);
    
    if(!validate(sc1)|| !validate(sc2) || !validate(sc3) || !validate(sc4)) {

        res.send({error: "The data is invalid"})
    } else {

        try {
            let user = await UserModel.findOne({id: req.body.userid}).exec()
            let votes = await VoteList.find().limit(1).sort({$natural:-1}).exec()

            if( user.votes.length > 0 && user.votes[user.votes.length-1].name == votes[0].id ){
                //TODO
                let lastVote = user.votes[user.votes.length-1]
                lastVote.TC1 = sc1
                lastVote.TC2 = sc2
                lastVote.TC3 = sc3
                lastVote.TC4 = sc4
                lastVote.count = lastVote.count + 1
                lastVote.data = Date.now()
            } else {
                user.votes.push({
                    name: votes[0].id,
                    TC1: sc1,
                    TC2: sc2,
                    TC3: sc3,
                    TC4: sc4,
                    count: 1,
                    date: Date.now()
                })
            }

            await user.save()

            res.send({success: "done"})
        }catch(e){
            console.log(e)
            res.send({error: "Cannot read database"})
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
        let vote_ = votes[num]        
        let result = await UserModel.find({votes: {$elemMatch: {name: vote_.id}}}).exec()
        var user_votes = []
        var stastic = [
            {name: "Trình bày (30%)", A: 0, B: 0, C: 0, D: 0, Sum: ''},
            {name: "Nội dung (35%)", A: 0, B: 0, C: 0, D: 0, Sum: ''},
            {name: "Hình thức (20%)", A: 0, B: 0, C: 0, D: 0, Sum: ''},
            {name: "Phản biện (15%)", A: 0, B: 0, C: 0, D: 0, Sum: ''},
            {name: "W Trung bình:", A: 0, B: 0, C: 0, D: 0, Sum: 0}
        ]

        result.forEach(element => {
            const vote = element.votes[element.votes.length-1]
            const user_vote = {
                id: element.id,
                TC1: score2String(vote.TC1),
                TC2: score2String(vote.TC2),
                TC3: score2String(vote.TC3),
                TC4: score2String(vote.TC4),
                count: vote.count
            }
            
            user_votes.push(user_vote)

            countHelper(0,vote.TC1,stastic)
            countHelper(1,vote.TC2,stastic)
            countHelper(2,vote.TC3,stastic)
            countHelper(3,vote.TC4,stastic)

        })
        
        calHelper(stastic)

        res.render('admin/dashboard',{title: vote_.name, users: user_votes, dats: stastic, votes: votes})
        
    } catch (e) {
        console.log(e)
        res.render('admin/blank',{message: e})
    }
    
}

//
exports.adminGetVoteData = async (req,res,next) => {
    try {
        let vote_now = await VoteList.find().limit(1).sort({$natural:-1}).exec()
        if(vote_now.length == 0) {
            res.json({})
        } else {
            let result = await UserModel.find({votes: {$elemMatch: {name: vote_now[0].id}}}).exec()
            var vote_data = {}
                    vote_data.TC1 = [0,0,0,0]
                    vote_data.TC2 = [0,0,0,0]
                    vote_data.TC3 = [0,0,0,0]
                    vote_data.TC4 = [0,0,0,0]

                    result.forEach(element => {
                        //console.log(element)
                        const vote= element.votes[element.votes.length - 1]
                        vote_data.TC1[4 - vote.TC1] +=1
                        vote_data.TC2[4 - vote.TC2] +=1
                        vote_data.TC3[4 - vote.TC3] +=1
                        vote_data.TC4[4 - vote.TC4] +=1
                    });
                    //console.log(vote_data)
                    res.json(vote_data)
        }
    }catch(e){
        res.json({})
    }
}

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
        let users = await UserModel.find({votes: {$not: {$elemMatch: {name:  vote.id }}}}).exec()
        //console.log(vote)
        //console.log("==================")
        res.render('admin/unattend',{users: users, votes: votes, title: vote.name})
    }catch(e) {
        console.log(e)
        res.render('admin/blank',{err: e})
    }
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
                id: 1,
                status: "run",
                name: req.body.name,
                startDate: Date.now(),
                dueDate: Date.now(),
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

/* Utils */
//
function validate(num){
    if(isNaN(num) || num > 4 || num < 1) {
        return false;
    } else {
        return true;
    }
}
//
function score2String(score) {
    switch(score) {
        case 4: return 'A'
        case 3: return 'B'
        case 2: return 'C'
        case 1: return 'D'
        default: return '?'
    }
}
//
function countHelper(index, score, stastic) {
    switch(score) {
        case 4:
            stastic[index].A = stastic[index].A + 1
            break
        case 3:
            stastic[index].B = stastic[index].B + 1
            break
        case 2: 
            stastic[index].C = stastic[index].C + 1
            break
        case 1: 
            stastic[index].D = stastic[index].D + 1
            break
    }
}
//
function calHelper(stastic) {
    const weights = [30 ,35 ,20 ,15]
    stastic[4].A = (stastic[0].A*weights[0] + stastic[1].A*weights[1] + stastic[2].A*weights[2] + stastic[3].A*weights[3])/100 
    stastic[4].B = (stastic[0].B*weights[0] + stastic[1].B*weights[1] + stastic[2].B*weights[2] + stastic[3].B*weights[3])/100 
    stastic[4].C = (stastic[0].C*weights[0] + stastic[1].C*weights[1] + stastic[2].C*weights[2] + stastic[3].C*weights[3])/100 
    stastic[4].D = (stastic[0].D*weights[0] + stastic[1].D*weights[1] + stastic[2].D*weights[2] + stastic[3].D*weights[3])/100 


    stastic.forEach(element => {
        element.Sum = element.A*4 + element.B*3 + element.C*2 + element.D
    })
}