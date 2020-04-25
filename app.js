var express    = require('express'),
    app        = express(),
    bodyParser = require('body-parser'),
    http       = require('http').Server(app),
    io         = require('socket.io')(http),
    tambola    = require('tambola-generator'),
    schedule   = require('node-schedule'),
    mysqlConnection = require('./connection');

var players           = 0,
    sequence          = [],
    i                 = null,
    usedSequence      = [],
    time              = null,
    refreshIntervalId = null,
    timerID           = null;
var game_time         = null;
var game_end_time     = null;



/* Set the Public folder to server*/
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.use(bodyParser.json());


app.get('/', function(req, res) {
   res.render('landing');
});


app.get('/end1', function(req, res) {
   let sql = "CREATE TABLE game(game_id INT AUTO_INCREMENT PRIMARY KEY, played BOOLEAN DEFAULT FALSE, first_five VARCHAR(64), top_row VARCHAR(64), middle_row VARCHAR(64), bottom_row VARCHAR(64), full_house VARCHAR(64), game_time DATETIME, game_end_time DATETIME)"
    mysqlConnection.query(sql, (err, result) => {
      if(err){
        res.status(202).send({ error: err })
      }
      else{
        res.status(200).send(result);
      }
   });
});

app.get('/end2', function(req, res) {
   let sql = "CREATE TABLE game_client(game_id INT, user_id VARCHAR(64), payment BOOLEAN DEFAULT FALSE, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    mysqlConnection.query(sql, (err, result) => {
      if(err){
        res.status(202).send({ error: err })
      }
      else{
        res.status(200).send(result);
      }
   });
});

app.get('/end3', function(req, res) {
   let sql = "CREATE TABLE active_users( user_id VARCHAR(64), created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    mysqlConnection.query(sql, (err, result) => {
      if(err){
        res.status(202).send({ error: err })
      }
      else{
        res.status(200).send(result);
      }
   });
});

app.post('/end3', function(req, res) {
   
   var values = [[req.body.time1, req.body.time2]]
   let sql = "INSERT INTO game (game_time, game_end_time) VALUES ?"
    mysqlConnection.query(sql, [values], (err, result) => {
      if(err){
        res.status(202).send({ error: err })
      }
      else{
        res.status(200).send(result);
      }
   });
});





io.on('connection', function(socket) {
    players++;
    var current_user = null;
    var payment = false;
    var current_game = null;

    socket.on('assign-current-user', function(user){
       current_user = user;
    })

    socket.on('check-user-validity', function(user){
      mysqlConnection.query("SELECT * FROM active_users WHERE user_id = ?", [user.uid], (err, result) =>{
         if(result.length == 0){
            console.log("d")
            mysqlConnection.query("INSERT INTO active_users (user_id) VALUES (?)", [user.uid]);
            socket.emit("user-validated");
         }
         else{
            socket.emit("invalid-user");
         }
      })
    })

    mysqlConnection.query("SELECT * FROM game WHERE played = 0 ORDER BY game_time LIMIT 1", (err, game) => {
        current_game = JSON.parse(JSON.stringify(game))[0];
        game_time = new Date(current_game.game_time);
        game_end_time = new Date(current_game.game_end_time);
        socket.emit('game-timing', game_time.toLocaleString(), game_end_time.toLocaleString());
    });

    // Payment check of user
    socket.on('payment-check', function(user){
        let sql = "SELECT * FROM game_client WHERE user_id = ? AND game_id = ?"
        mysqlConnection.query(sql, [user.uid, current_game.game_id], (err, result) => {
            result = JSON.parse(JSON.stringify(result))[0];
            payment = (result && result.length != 0)? true : false;
            socket.emit('payment-info', payment);
        });
     });

     // Process a payment
     socket.on('payment-process', function(user, username){
        if(true){
           payment = true;
           let sql = "INSERT INTO game_client (game_id, user_id, payment) VALUES ?"
           var values = [[current_game.game_id, current_user.uid, 1]];
           mysqlConnection.query(sql, [values]);
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
            mysqlConnection.query("SELECT * FROM game WHERE game_date = ?", [getCurrentDate()], (err, game) => {
               current_game = JSON.parse(JSON.stringify(game))[0];
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
      mysqlConnection.query("SELECT * FROM game WHERE game_id = ?", [current_game.game_id], (err, game_data) =>{
         console.log(game_data)
         if(game_data && !game_data.full_house){
            mysqlConnection.query("UPDATE  game SET full_house = ?, played = 1, game_end_time = ? WHERE game_id = ?", [current_user.uid, new Date(), current_game.game_id]);
            socket.broadcast.emit('full-house-winner', current_user.username+ ' has won full house', new Date());
            socket.emit('full-house-winner', 'Congrats you won full house', new Date());
            
         }
         else{
            socket.emit('wrong-claim', socket.id);
         }
      });
   });

   socket.on('top-row', function(emit){
      console.log(ticket);
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
      mysqlConnection.query("SELECT * FROM game WHERE game_id = ?", [current_game.game_id], (err, game_data) =>{
         if(game_data && !game_data.top_row){
            mysqlConnection.query("UPDATE game SET top_row = ? WHERE game_id = ?", [current_user.uid, current_game.game_id]);
            socket.broadcast.emit('top-row-winner', socket.id+ ' has won top row');
            socket.emit('top-row-winner', 'Congrats you won top row');
         }
         else{
            socket.emit('wrong-claim', socket.id);
         }
      });
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
      mysqlConnection.query("SELECT * FROM game WHERE game_id = ?", [current_game.game_id], (err, game_data) =>{
         if(game_data && !game_data.middle_row){
            mysqlConnection.query("UPDATE game SET middle_row = ? WHERE game_id = ?", [current_user.uid, current_game.game_id]);
            socket.broadcast.emit('middle-row-winner', socket.id+ ' has won middle row');
            socket.emit('middle-row-winner', 'Congrats you won middle row');
         }
         else{
            socket.emit('wrong-claim', socket.id);
         }
      });
   });

   socket.on('bottom-row', function(emit){
      console.log(ticket);
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
      mysqlConnection.query("SELECT * FROM game WHERE game_id = ?", [current_game.game_id], (err, game_data) =>{
         if(game_data && !game_data.bottom_row){
            mysqlConnection.query("UPDATE game SET bottom_row = ? WHERE game_id = ?", [current_user.uid, current_game.game_id]);
            socket.broadcast.emit('bottom-row-winner', socket.id+ ' has won bottom row');
            socket.emit('bottom-row-winner', 'Congrats you won bottom row');
         }
         else{
            socket.emit('wrong-claim', socket.id);
         }
      })

      
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
      mysqlConnection.query("SELECT * FROM game WHERE game_id = ?", [current_game.game_id], (err, game_data) =>{
         console.log(game_data);
         if(game_data && !game_data.first_five){
            mysqlConnection.query("UPDATE game SET first_five = ? WHERE game_id = ?", [current_user.uid, current_game.game_id]);
            socket.emit('first-five-winner', 'Congrats you won first-five');
            socket.broadcast.emit('first-five-winner', socket.id+ ' has won first-five');
         }
         else{
            socket.emit('wrong-claim', socket.id);
         }
      });
   });

  

   socket.on('disconnect', function () {
      console.log("Disconnected");
      if(current_user)
      mysqlConnection.query("DELETE FROM active_users WHERE user_id = ?", [current_user.uid]);
   });
});

 function getCurrentDate(){
     
    return new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() ;
}

function newGameTimerStart() {
    sequence          = tambola.getDrawSequence(),
    i                 = 0,
    usedSequence      = [],
    time              = 15,
    refreshIntervalId = null,
    timerID           = null;
 
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
    rule.hour = [20];
    rule.minute = [ 30, 40, 50];


 var j = schedule.scheduleJob(rule, function(){
    console.log('The answer to life, the universe, and everything!');
    newGameTimerStart();
});
//newGameTimerStart();


http.listen(3000, function() {
   console.log('listening on *:3000');
});





