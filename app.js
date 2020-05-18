var express    = require('express'),
    app        = express(),
    bodyParser = require('body-parser'),
    http       = require('http').Server(app),
    io         = require('socket.io')(http),
    tambola    = require('tambola-generator'),
    schedule   = require('node-schedule');
    const mongoose = require('mongoose');
    var Game = require("./models/game");
    var GameClient = require("./models/game_client");
    var admin = require('firebase-admin');
    admin.initializeApp(
       {
         credential: admin.credential.cert({
         type: "service_account",
         project_id: "bingo-35ce9",
         private_key_id: "aca67a037a79caaac437dcfacbe5dc5f96c624d9",
         private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDM+UG1ajpUjPLY\nEkU/bhDHX/tRsnSqRm7VR/a2i9F1R9y+YW97h4h+aukzTW1BmabSydwGqifigNxC\npt3nqkaX9BQcs8BQZ/+JfVBEIy2R2hLnhpvsZfE5c1HoDa70miDhD6ySxZ5tuuGv\nlKiMDsl3Au9kQKuqxn+tvFIjSj458jARZ9nrPuN+ZoAmsXkD5ZPFPACfih/ZUwpv\nBYrFssIFCnwawYoqKsZa04yuz8GUvy6BI+kVw4J8Fw4zcQRFk4j3qaHaNietBuBG\nFRTW870E9nrbLifdduv5Yv49HCO/+y/12ytC8HlqAp4+Hheduv8OU6LuNrPDPN6S\nnhnSYOSlAgMBAAECggEAB0RZB4kGG2RJ4c44BUkuMBtfiiR1DWpk2IvuG8e2O925\n3kgPD0adWLoKnYaDtp0vdG6yrcvPkTC3XmeTG3kGerGtGt1mlpMxVJsMQvYqUe70\n15+GnKl6lWpYv4zopIRoYQJQwH1gIgzLnpF7LkgB7YW9ngTK8UmLUkoIcXba4Ov8\nZmboQfhGTjv9ILbeto4l4gTSINE0S1Exnya0Uh5lIY+dYHeJEo/SsOh4ZoWBRYok\njrMI6iz5w5070mW1Nvzq0LbANkfltlMMBB3Xe2afrVd4SuMyHvNdHd0aGIZi2/58\ni5sGckqId+hFn/1JbeoF3JVOFNmjQGM3ed2CKjs4YQKBgQD73N0R8u0/55qKQ44b\noK6W6w4t7J3XJhIkudq2nHIr/ZxYCA1QO1FfyQEkhFy8P42SaEuEso1dMGlNu8Ah\naZsXCh3B+W9HdWdEr68Q2Q7HjsBeEzoCcquyuyBLOZEfSUoe4vajf6VqzyooSySO\nySOywlCMH2FdX0ua1oXKqyZTEQKBgQDQVzbq6QAhr/7EnXNOr9v8qypWElsqnnx0\noFzaWcMew/lNqA+PXaU0Bvqkp59j+Kc2+HFOttlhxhZfmypKZ9PjLVUfuRm7HiTG\ntFPhXnRK6LnQ8FXfqHDCchNTsgNKRmU0UiCghKiuJmpVaun0Axd14K4DWCWXZJtl\nOFKzVZJQVQKBgQDrRLZRRO5wKoXGsDI4BpHwMiQtrAEJb+u02NPAj0VraF06MlNV\nZgOuiRIDLY1+35L8d2ZLz4qTyVwkm8RusbqI/A8uGjXjt3y+wam0AD55FRUHC8i9\nbqaKr5gMDPtOEWUmkva3Zc58hoYn24GLy8IIAtHBArMtyI3UVp3l4phLMQKBgQCG\nctIA9M5d7wq1bXp9HCYWP4t5sizdKxvb06U4T9cIYqXfBIbOGTvEgIB9g6LrzAp1\nAg11I7DTVRcZKbQ4AhsOLzIQ384IICLRjIvZE7BuqxNHD+ILDNN/2Eg6qdVPuHAV\nPK7Lh/CnOilC6FUEYH5iVtVVWSwhMA7MWnWcP6vFZQKBgGeVWA8KxFIyEPuyhBuF\n3Ffp6modzBRHYg6F+CUWSonjWnBuZyli6WfB5y2KM1ycreOnUmg7VEfmA5BzZ+T3\nlKXoUhONUsYpEvRMVfnvXSBS96RreVqHo3DE1+Tp6pLtq11ZBVCb9uqB0OhSg69s\nioLUQeKqZH16cepfvaHEeI1b\n-----END PRIVATE KEY-----\n",
         client_email: "firebase-adminsdk-guq4p@bingo-35ce9.iam.gserviceaccount.com",
         client_id: "111255438836065627129",
         auth_uri: "https://accounts.google.com/o/oauth2/auth",
         token_uri: "https://oauth2.googleapis.com/token",
         auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
         client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-guq4p%40bingo-35ce9.iam.gserviceaccount.com"
  })
});

   var Razorpay = require('razorpay');

   var instance = new Razorpay({
      key_id: 'rzp_test_GJIdqc6kreFo02',
      key_secret: 'WLN7gLT7bkIj1XoJWLXKOuB9'
    });


var players           = 0,
    sequence          = [],
    i                 = null,
    usedSequence      = [],
    time              = null,
    refreshIntervalId = null,
    timerID           = null;
var game_players = [];
var dibarred_user = [];
var game_next = null;

mongoose
  .connect("mongodb://Divish:genius007@ds263928.mlab.com:63928/intern_test", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex : true }).then( response => {
     console.log("MongoDB Connected")
  });

/* Set the Public folder to server*/
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.use(bodyParser.json());



app.get('/', function(req, res) {
   res.render('landing');
});

app.get('/get-game-time', function(req, res) {
   Game.findOne({played : false}).sort({game_time : 1}).limit(1).then(nextGame => {
      if(nextGame){
         res.send( {game_time : nextGame.game_time});
      }
      else{
         res.send( {game_time : null});
      }
   });
});

app.get('/end', (req, res) => {
   res.render('end');
});

app.get('/mygame-list', (req, res) => {
   res.render('invalid', {message : "Invalid access to the game menu"});
})

app.get('/mygame-list/:uid', (req, res) => {
   var nextGameOnline = null;
   admin.auth().getUser(req.params.uid).then(function(userRecord) {
      Game.findOne({played : false}).sort({game_time : 1}).limit(1).then(nextGame => {
         if(nextGame){
            GameClient.findOne({user_id : req.params.uid, game_id : nextGame._id, payment : true}, (err, game_c) => {
               if(game_c){
                  nextGameOnline = { payment : true, game : nextGame };
               }
               else{
                  nextGameOnline = { payment : false, game : nextGame };
               }
               res.render('gamelist', { nextGameOnline, uid : req.params.uid });
            })
         }
         else{
            res.render('invalid', {message : "There is no next scheduled game"});
         }
         
      });
  })
  .catch(function(error) {
    console.log('Error fetching user data:', error);
    res.render('invalid',{ message: "User data is not present, unauthorized login"});
   });
});

app.get('/payment/:game_id/:user_id', (req, res) => {
   var payment = false;
   GameClient.findOne({user_id : req.params.user_id, game_id : req.params.game_id, payment : true}, (err, game_c) => {
      if(game_c){
         payment = true;
      }
      else{
         payment = false;
      }
      Game.findOne({played : false}).sort({game_time : 1}).limit(1).then(game => {
         if(game._id == req.params.game_id){
            res.render('payment', {uid : req.params.user_id, game_id : req.params.game_id, payment});
         }
         else{
            res.render('invalid', {message : "Invalid game access, this game is not the latest one."})
         }
      });
   })
   
})

app.post('/payment-order-create', (req, res) => {
   var options = {
      amount: 50000,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11",
      payment_capture: '1'
    };

   instance.orders.create(options, (err, response) => {
      if(err){
         console.log(err);
         res.send({status : 0, message : err});
      }
      else{
         console.log(response);
         res.send({ status : 1, message : response});
      }
   });
})

app.post('/payment-confirmation', (req, res) => {
   console.log(req.body);
   var payment_id = req.body.response.razorpay_payment_id;
   instance.payments.fetch(payment_id, (err, response) => {
      if(err){
         console.log(err);
         res.send({status : 3, message:"Fetch payment confirmation."});
      }
      else{
         if(response.status == 'authorized'){
            GameClient.create({ game_id : req.body.game_id, user_id : req.body.user_id, payment : true, payment_id : payment_id}, (err, game_c) => {
               if(err){
                  console.log(err);
                  res.send({status : 4, message:"Udating payment information error."});
               }
               else{
                  console.log(response);
                  res.send({status: 1 , message : "Payment Successfull."})
               }
            }); 
         }
         else if(response.status == 'failed'){
            res.send({status : 0, message:"Transaction failed"});
         }
         else{
            res.send({status : 2, message:"Some other problem occured for transaction."});
         }
      }
   })
});

app.get('/winners', (req, res) => {
   var first_five = null;
   var top_row = null;
   var middle_row = null;
   var bottom_row = null;
   var full_house = null;
/*    let userImportRecords = [
      {
        uid: 'uid1',
      },
      {
        uid: 'uid2',
        email: 'user2@example.com',
        passwordHash: Buffer.from('passwordHash2'),
        passwordSalt: Buffer.from('salt2')
      },
      //...
    ];
    

   Game.findOne({played : false}).sort({game_time : 1}).limit(1).then(nextGame => {
      admin.auth().getUser(nextGame.first_five).then(function(userRecord) {
            first_five = {user_id : userRecord.uid, name : userRecord.displayName};
            admin.auth().getUser(nextGame.top_row).then(function(userRecord) {
               top_row = {user_id : userRecord.uid, name : userRecord.displayName};
               admin.auth().getUser(nextGame.middle_row).then(function(userRecord) {
                  middle_row = {user_id : userRecord.uid, name : userRecord.displayName};
                  admin.auth().getUser(nextGame.bottom_row).then(function(userRecord) {
                     bottom_row = {user_id : userRecord.uid, name : userRecord.displayName};
                     admin.auth().getUser(nextGame.full_house).then(function(userRecord) {
                        full_house = {user_id : userRecord.uid, name : userRecord.displayName};
                        res.render('winner', {full_house, top_row, middle_row, bottom_row, first_five});
                  });
               });
            });
         });
      });
   }); */

      res.render('winner');
   
})

app.get('/game-start/:user_id/:game_id', (req, res) => {
   Game.findOne({_id: req.params.game_id, played : false}, (err4, game) => {
      if(game){
         GameClient.findOne({user_id : req.params.user_id, game_id : req.params.game_id, payment : true}, (err, game_c) => {
            if(!game_c){
               res.render('invalid', { message : "Unauthorized access, you have not done your payment for the game."})
            }
            else{
               admin.auth().getUser(req.params.user_id).then(function(userRecord) {
                  Game.find({played : false}).sort({game_time : 1}).limit(1).then(game => {
                     res.render('game', {game : game, uid : req.params.user_id});
                  });
               })
               .catch(function(error) {
                console.log('Error fetching user data:', error);
                res.render('invalid', { message: "User data is not present, unauthorized login"});
               });
            }
         })
      }
      else{
         res.render('invalid', { message: "This game is already over. Try playing a new game."});
      }
   })
});


io.on('connection', function(socket) {
   players++;
   console.log(players + " connected. This one is " + socket.id);
   var current_user = null; 
   var current_game = null;
   var game_end_time = null;
   var game_time = null;
   var ticket = null;

   socket.on('initialize-data', function(user){
      Game.find({played : false}).sort({game_time : 1}).limit(1).then(game => {
         current_game = game[0];

         game_time = new Date(current_game.game_time);
         game_end_time = new Date(current_game.game_end_time);
         var flag = 0;
         game_players.forEach(x => {
            if(x == user.uid){
               console.log("3333")
               socket.emit("unauthorized-usage", "User has already playing in another device/tab");
               flag = 1;
            }
         });
         if(flag == 0){
            dibarred_user.forEach(x => {
               if(x == user.uid){
                  console.log("2222")
                  socket.emit("unauthorized-usage", "User has been debbared from the current game");
                  flag = 1;
               }
            });
            if(flag == 0){
               game_players.push(user.uid);
               current_user = user;
               socket.emit("game-initialized", game_time, game_end_time, current_game);
            }
         }
      });
   });

    // Send user game data
   socket.on('game-start', function(user){
      if(current_game){
         GameClient.find({user_id : user.uid, game_id : current_game._id}, (err, client) => {
            if(client[0].ticket != null && client[0].ticket.length!=0){
               ticket = client[0].ticket;
               socket.emit('loadGameData', ticket, usedSequence);
            }
            else{
               ticket = tambola.getTickets(1)[0];
               GameClient.findOneAndUpdate({user_id : user.uid, game_id : current_game._id}, {$set : { ticket : ticket}}, (err, result) => {
                  socket.emit('loadGameData', ticket, usedSequence);
               });
            }
         })
      }
      else{
         socket.emit("unauthorized-usage", "An unauthorised access");
      }
   });

   socket.on('full-house', function(ticket_client){
      var claim = null;
      for (let i = 0; i < 3; i++) {
         for (let j = 0; j < 9; j++) {
             var value = ticket_client[i][j];
             var flag = 0;
             if(value != 0){
               usedSequence.forEach(x => {
                  if(x == Math.abs(value) && value != Math.abs(value)){
                     flag = 1;
                  }    
               });
               if(flag == 0){
                  claim = false
               }
             }
         }    
     }
     if(claim == null){
        claim = true;
     }
      if(claim){
         Game.findOne({_id : current_game._id}, (err, game_data) =>{
            if(game_data && !game_data.full_house){
               Game.findOneAndUpdate({_id : current_game._id}, {$set : {full_house :  current_user.uid, played : true, game_end_time : new Date()}}, (err, result) => {
               socket.broadcast.emit('full-house-winner', current_user.phoneNumber+ ' has won full house', new Date());
               socket.emit('full-house-winner-you', 'Congrats you won full house', new Date()); 
               clearInterval(refreshIntervalId);
               })
            }
            else{
               dibarred_user.push(current_user.uid);
               socket.emit('wrong-claim', current_user.phoneNumber);
            }
         })
      }
      else{
         dibarred_user.push(current_user.uid);
         socket.emit('wrong-claim', current_user.phoneNumber);
      }
      
   });

   socket.on('top-row', function(ticket_client){
      var claim = null;
      for (let i = 0; i < 9; i++) {
         var value = ticket_client[0][i];
         var flag = 0;
         if(value != 0){
            usedSequence.forEach(x => {
               if(x == Math.abs(value) && value != Math.abs(value)){
                  flag = 1;
               }    
            });
            if(flag == 0){
               claim = false
            }
         } 
      }
      if(claim == null){
         claim = true;
      }
      if(claim){
         Game.findOne({_id : current_game._id}, (err, game_data) =>{
            if(game_data && !game_data.top_row){
               Game.findOneAndUpdate({_id : current_game._id}, {$set : { top_row : current_user.uid }}, (err, result) => {
               socket.broadcast.emit('top-row-winner', socket.id+ ' has won top row');
               socket.emit('top-row-winner', 'Congrats you won top row');
               })
            }
            else{
               dibarred_user.push(current_user.uid);
               socket.emit('wrong-claim', current_user.phoneNumber);
            }
         });
      }
      else{
         dibarred_user.push(current_user.uid);
         socket.emit('wrong-claim', current_user.phoneNumber);
      }
   });

   socket.on('middle-row', function(ticket_client){
      var claim = null;
      for (let i = 0; i < 9; i++) {
         var value = ticket_client[1][i];
         var flag = 0;
         if(value != 0){
            console.log("tic" + value)
            usedSequence.forEach(x => {
               if(x == Math.abs(value) && value != Math.abs(value)){
                  flag = 1;
                  console.log("se" + x);
               }    
            });
            if(flag == 0){
               claim = false
            }
         } 
      }
      if(claim == null){
         claim = true;
      }
      if(claim){
         Game.findOne({_id : current_game._id}, (err, game_data) =>{
            if(game_data && !game_data.middle_row){
               Game.findOneAndUpdate({_id : current_game._id}, {$set : { middle_row : current_user.uid }}, (err, result) => {
               socket.broadcast.emit('middle-row-winner', socket.id+ ' has won middle row');
               socket.emit('middle-row-winner', 'Congrats you won middle row');
               });
            }
            else{
               dibarred_user.push(current_user.uid);
               socket.emit('wrong-claim', current_user.phoneNumber);
            }
         });
      }
      else{
         dibarred_user.push(current_user.uid);
         socket.emit('wrong-claim', current_user.phoneNumber);
      }

      
   });

   socket.on('bottom-row', function(ticket_client){
      var claim = null;
      for (let i = 0; i < 9; i++) {
         var value = ticket_client[2][i];
         var flag = 0;
         if(value != 0){
            usedSequence.forEach(x => {
               if(x == Math.abs(value) && value != Math.abs(value)){
                  flag = 1;
               }    
            });
            if(flag == 0){
               claim = false
            }
         } 
      }
      if(claim == null){
         claim = true;
      }
      if(claim){
         Game.findOne({_id : current_game._id}, (err, game_data) =>{
            if(game_data && !game_data.bottom_row){
               Game.findOneAndUpdate({_id : current_game._id}, {$set : { bottom_row : current_user.uid }}, (err, result) => {
               socket.broadcast.emit('bottom-row-winner', socket.id+ ' has won bottom row');
               socket.emit('bottom-row-winner', 'Congrats you won bottom row');
               })
            }
            else{
               dibarred_user.push(current_user.uid);
               socket.emit('wrong-claim', current_user.phoneNumber);
            }
         })
      }
      else{
         dibarred_user.push(current_user.uid);
         socket.emit('wrong-claim', current_user.phoneNumber);
      }

      
   });

   socket.on('first-five', function(ticket_client){
      var flag = 0;
      var claim = null;
      var count = 0;
      for (let i = 0; i < 3; i++) {
         for (let j = 0; j < 9; j++) {
            var value = ticket_client[i][j];
            if(value != Math.abs(value)){
               count ++;
               usedSequence.forEach(x => {
                  if(x == Math.abs(value)){
                     flag = 1;
                  }    
               });
               if(flag == 0){
                  claim = false
               }
            }
         }      
      }     
      if(count == 5 && claim != false){
         claim = true;
      }
      else{
         claim = false;
      }
      if(claim){
         Game.findOne({_id : current_game._id}, (err, game_data) =>{
            if(game_data && !game_data.first_five){
               Game.findOneAndUpdate({_id : current_game._id}, {$set : { first_five : current_user.uid }}, (err, result) => {
                  socket.emit('first-five-winner', 'Congrats you won first-five');
                  socket.broadcast.emit('first-five-winner', socket.id+ ' has won first-five');
               });
            }
            else{
               dibarred_user.push(current_user.uid);
               socket.emit('wrong-claim', current_user.phoneNumber);
            }
         });
      }
      else{
         dibarred_user.push(current_user.uid);
         socket.emit('wrong-claim', current_user.phoneNumber);
      }
      
   });

   socket.on('logout-user', function(user){
      var index = game_players.indexOf(user.uid);
      if (index > -1) {
         game_players.splice(index, 1);
      }
   });

   socket.on('disconnect', function () {
      players--;
      console.log("Disconnected");   
      if(current_user){
         var index = game_players.indexOf(current_user.uid);
         if (index > -1) {
            game_players.splice(index, 1);
         }
         console.log(game_players)
      }
   });
});

/* var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0,1,2,3,4,5,6];
rule.hour = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
rule.minute = [24,25,26,27,28];
 */

/*  var j = schedule.scheduleJob(rule, function(){
    console.log('The answer to life, the universe, and everything!');
    newGameTimerStart();
}); */
newGameTimerStart();

function newGameTimerStart() {
   sequence          = tambola.getDrawSequence(),
   i                 = 0,
   usedSequence      = [],/* 
   time              = 10, */
   refreshIntervalId = null,
   timerID           = null,
   game_players      = [],
   dibarred_user     = [];
   game_next = null;
   Game.findOne({played : false}).sort({game_time : 1}).limit(1).then(gg => {
      game_next = gg;
      console.log(game_next)
      refreshIntervalId = setInterval(doStuff, 12000);
      function doStuff() {
         usedSequence.push(sequence[i]);
         time = 10;
         io.sockets.emit('nextNumber', 'Your next number is '+ sequence[i], sequence[i]);
         i++;
         if(i==90){
            clearInterval(refreshIntervalId);
            var gameFin = setInterval(gameFinished, 2000000);
         }
      }
   });
}

function gameFinished() {
   Game.findOneAndUpdate({_id : game_next._id}, {$set : {played : true, game_end_time : new Date()}}, (err, result) => {
      io.sockets.emit('game-finished');
   });
}

app.post('/end3', function(req, res) {
   Game.create({ game_time : (req.body.time1), game_end_time : (req.body.time2) }, (err, redd) =>{
      console.log(err);
      res.send("dd")
   })
});


http.listen(process.env.PORT || 3000, function() {
   console.log('listening on *:3000');
});





