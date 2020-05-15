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


var players           = 0,
    sequence          = [],
    i                 = null,
    usedSequence      = [],
    time              = null,
    refreshIntervalId = null,
    timerID           = null;
var game_players = [];
var dibarred_user = [];

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
   res.render('test');
});

app.get('/end', (req, res) => {
   res.render('end')
});

app.get('/mygame-list', (req, res) => {
   res.render('invalid');
})

app.get('/mygame-list/:uid', (req, res) => {
   var nextGame = [];
   var upcommingGames = [];
   var pastUserGames = [];
   var flag = 0;
   admin.auth().getUser(req.params.uid)
  .then(function(userRecord) {
    // See the UserRecord reference doc for the contents of userRecord.
    Game.find({played : true}).then( pastgames => {
      Game.find({played : false}).sort({game_time : 1}).then(futuregames => {
         GameClient.find({user_id : req.params.uid}, (err, game_client) => {
            game_client.forEach(x => {
               if(x.game_id == futuregames[0]._id){
                  nextGame = { payment : true, data : futuregames[0] };
                  flag = 1;
               }
            });
            if(flag == 0){
               nextGame = { payment : false, data : futuregames[0] };
            }
   
            for (let i = 1; i < futuregames.length; i++) {
               upcommingGames.push(futuregames[i]);
            }

            game_client.forEach(x => {
               pastgames.forEach(y => {
                  if(x.game_id == y._id){
                     pastUserGames.push(y);
                  }
               });
            });
            res.render('gamelist', { nextGame, upcommingGames, pastUserGames, uid : req.params.uid });
         })
       });
    });
    
  })
  .catch(function(error) {
    console.log('Error fetching user data:', error);
    res.render('invalid');
  });

})

app.get('/game-start/:uid/:game_id', (req, res) => {
   admin.auth().getUser(req.params.uid)
  .then(function(userRecord) {
      Game.find({played : false}).sort({game_time : 1}).limit(1).then(game => {
         res.render('landing', {game : game, uid : req.params.uid});
      });
  })
  .catch(function(error) {
    console.log('Error fetching user data:', error);
    res.render('invalid');
  });
})

app.post('/end3', function(req, res) {
   Game.create({ game_time : (req.body.time1), game_end_time : (req.body.time2) }, (err, redd) =>{
      console.log(err);
      res.send("dd")
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
    
   socket.on('sendClickData', function(id, data){      
      var status = false;
      usedSequence.forEach(x => {
         if(x == data){
            status = true;
         }
      });
      for (let i = 0; i < 3; i++) {
         for (let j = 0; j < 9; j++) {
            var value = ticket[i][j];
            if(value == data){
               if(status){
                  ticket[i][j] = 100;
               }
               else{
                  ticket[i][j] = 101;
               }
            }         
         }      
      }
      io.sockets.to(id).emit('statusClick', status);
   });

   socket.on('full-house', function(emit){
      var flag = false;
      for (let i = 0; i < 3; i++) {
         for (let j = 0; j < 9; j++) {
            var value = ticket[i][j];
            if(value != 100 && value != 0){
               flag = true;
            }
         }      
      }
      var result = false;
      if(!flag){
         result = true;
      }
      if(result){
         Game.findOne({_id : current_game._id}, (err, game_data) =>{
            if(game_data && !game_data.full_house){
               Game.findOneAndUpdate({_id : current_game._id}, {$set : {full_house :  current_user.uid, played : true, game_end_time : new Date()}}, (err, result) => {
               socket.broadcast.emit('full-house-winner', current_user.phoneNumber+ ' has won full house', new Date());
               socket.emit('full-house-winner', 'Congrats you won full house', new Date()); 
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

   socket.on('top-row', function(emit){
      var flag = false;
      for (let j = 0; j < 9; j++) {
         var value = ticket[0][j];
         if(value != 100 && value != 0){
            flag = true;
         }
      }      
      var result = false;
      if(!flag){
         result = true;
      }
      if(result){
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

   socket.on('middle-row', function(emit){
      var flag = false;
      for (let j = 0; j < 9; j++) {
         var value = ticket[1][j];
         if(value != 100 && value != 0){
            flag = true;
         }
      }      
      var result = false;
      if(!flag){
         result = true;
      }
      if(result){
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

   socket.on('bottom-row', function(emit){
      var flag = false;
      for (let j = 0; j < 9; j++) {
         var value = ticket[2][j];
         if(value != 100 && value != 0){
            flag = true;
         }
      }      
      var result = false;
      if(!flag){
         result = true;
      }
      if(result){
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

   socket.on('first-five', function(emit){
      var flag = false;
      var count = 0;
      for (let i = 0; i < 3; i++) {
         for (let j = 0; j < 9; j++) {
            var value = ticket[i][j];
            if(value == 100){
               count ++;
            }
         }      
      }     
      var result = false;
      if(count == 5){
         result = true;
      }
      if(result){
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
   refreshIntervalId = setInterval(doStuff, 1000);
   /* timerID = setInterval(setTimer, 1000); */

   function doStuff() {
      usedSequence.push(sequence[i]);
      time = 10;
      io.sockets.emit('nextNumber', 'Your next number is '+ sequence[i], sequence[i]);
      i++;
      if(i==90){
         clearInterval(refreshIntervalId);
         /* clearInterval(timerID); */
      }
   }

/*    function setTimer(){
      io.sockets.emit('timer', time--);
   } */
}


http.listen(process.env.PORT || 3000, function() {
   console.log('listening on *:3000');
});





