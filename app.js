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
    var ActiveUsers = require("./models/active_users");
    var DisbarredUsers = require("./models/disbarred_users");

var players           = 0,
    sequence          = [],
    i                 = null,
    usedSequence      = [],
    time              = null,
    refreshIntervalId = null,
    timerID           = null;
var game_time         = null;
var game_end_time     = null;

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
   res.render('landing');
});

app.get('/end', (req, res) => {
   res.render('end')
})


app.post('/end3', function(req, res) {
   
   Game.create({ game_time : (req.body.time1), game_end_time : (req.body.time2) }, (err, redd) =>{
      console.log(err);
      res.send("dd")
   })
});


/*  var j = schedule.scheduleJob(rule, function(){
    console.log('The answer to life, the universe, and everything!');
    newGameTimerStart();
}); */
newGameTimerStart();


io.on('connection', function(socket) {
    players++;
    var current_user = null;
    var payment = false;
    var current_game = null;

   socket.on('assign-current-user', function(user){
      current_user = user;
   });

   socket.on('check-user-validity', function(user){
      console.log(user.phoneNumber);
      Game.find({played : false}).sort({game_time : 1}).limit(1).then(game => {
         current_game = game[0];
         game_time = new Date(current_game.game_time);
         game_end_time = new Date(current_game.game_end_time);
         socket.emit('game-timing', game_time.toLocaleString(), game_end_time.toLocaleString());
         var flag = 0;
         game_players.forEach(x => {
            if(x == user.uid){
               socket.emit("invalid-user");
               flag = 1;
            }
         });
         if(flag == 0){
            dibarred_user.forEach(x => {
               if(x == user.uid){
                  socket.emit("disbarred-user");
                  flag = 1;
               }
            });
            if(flag == 0){
               game_players.push(user.uid);
               socket.emit("user-validated");
            }
         }
      }).catch(err => console.log(err));
   });

    // Payment check of user
   socket.on('payment-check', function(user){
      GameClient.find({user_id : user.uid, game_id : current_game._id}, (err, result) => {
         result = result[0];
         payment = (result && result.length != 0)? true : false;
         socket.emit('payment-info', payment);
      })
   });

   // Process a payment
   socket.on('payment-process', function(user, username){
      if(true){
         payment = true;
         GameClient.create({game_id : current_game._id, user_id : user.uid, payment : true});
      }
      else{
         payment = false;
      }
      socket.emit('payment-info', payment);
   });

    // Send user game data
   socket.on('game-start', function(){
      ticket = (tambola.getTickets(1))[0];
      if(current_game){
         socket.emit('onLoadGetGameData', current_game);
         socket.emit('send-ticket', ticket);
      }
      else{
         Game.findOne({played : false}).sort().limit(1).then(game => {
               current_game = game;
               console.log(current_game);
               socket.emit('onLoadGetGameData', current_game);
               socket.emit('send-ticket', ticket);
         });
      }
   }); 

   socket.emit('showAllEmittedNumbers', usedSequence);


    
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

  /*  socket.on('error', function(){
      if(current_user){
         ActiveUsers.findOneAndRemove({user_id : current_user.uid}, (err, resd) => {
            socket.emit('active-user-log-out');
         });
      }
   })

   socket.on('reconnect') */

   
   

   socket.on('disconnect', function () {
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

/*  function getCurrentDate(){
     
    return new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() ;
} */

function newGameTimerStart() {
    sequence          = tambola.getDrawSequence(),
    i                 = 0,
    usedSequence      = [],
    time              = 15,
    refreshIntervalId = null,
    timerID           = null,
    game_players      = [],
    dibarred_user     = [];
 
    refreshIntervalId = setInterval(doStuff, 1000);
    timerID = setInterval(setTimer, 1000);
 
    function doStuff() {
       usedSequence.push(sequence[i]);
       time = 15;
       io.sockets.emit('nextNumber', 'Your next number is '+ sequence[i], sequence[i]);
       i++;
       if(i==90){
          clearInterval(refreshIntervalId);
          clearInterval(timerID);
       }
    }
 
    function setTimer(){
       io.sockets.emit('timer', time--);
    }
 }

 var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0,1,2,3,4,5,6];
    rule.hour = [17];
    rule.minute = [0, 10, 15];





http.listen(process.env.PORT || 3000, function() {
   console.log('listening on *:3000');
});





