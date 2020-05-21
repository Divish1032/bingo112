var   express       = require('express'),
      app           = express(),
      bodyParser    = require('body-parser'),
      http          = require('http').Server(app),
      request       = require('request'),
      io            = require('socket.io')(http),
      tambola       = require('tambola-generator'),
      mongoose      = require('mongoose'),
      passport      = require('passport'),
      Razorpay      = require('razorpay')
      flash         = require('connect-flash'),
      cookieParser  = require('cookie-parser'),
      cookieSession = require('cookie-session'),
      middleware    = require('./middleware/index'),
      vault         = require('./middleware/vault'),
      Game          = require("./models/game"),
      GameClient    = require("./models/game_client");

var   refreshIntervalId = null,
      dibarred_user     = [],
      game_players      = [], 
      usedSequence      = [],
      game_next         = null,
      sequence          = [],
      players           = 0,
      timerID           = null,
      time              = null,
      i                 = null;

var   instance = new Razorpay({
   key_id: vault.razorpay.key_id,
   key_secret: vault.razorpay.key_secret
});

mongoose.connect(vault.mlab, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex : true }).then( response => {
   console.log("MongoDB Connected");
});

app.use(cookieSession({
   name: 'session',
   keys: ['SECRECT KEY'],
   maxAge: 30 * 24 * 60 * 60 * 1000
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

/* Set the Public folder to server*/
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.use(bodyParser.json());


app.get('/', function(req, res) {
   Game.findOne({played : false}).sort({game_time : 1}).limit(1).then(nextGame => {
      if(nextGame){
         res.render('landing', {game_time : nextGame.game_time});
      }
      else{
         res.render('landing', {game_time : null});
      }
   });
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

app.get('/mygame-list/:user_id', [middleware.ensureGameAvailable, middleware.ensureUserAuthentication], (req, res) => {
   var nextGameOnline = null;
   GameClient.findOne({user_id : req.params.user_id, game_id : res.locals.nextGame._id, payment : true}, (err, game_c) => {
      console.log(game_c)
      if(game_c){
         nextGameOnline = { payment : true, game : res.locals.nextGame };
      }
      else{
         nextGameOnline = { payment : false, game : res.locals.nextGame };
      }
      res.render('gamelist', { nextGameOnline, user_id : req.params.user_id });
   });
});

app.get('/payment/:user_id/:game_id', [middleware.ensureGameAuth, middleware.ensureUserAuthentication, middleware.checkPayment], (req, res) => {
   res.render('payment', {uid : req.params.user_id, game_id : req.params.game_id});
});

app.post('/payment-order-create', [middleware.ensureGameAuthRazorpay, middleware.ensureUserAuthenticationRazorpay, middleware.checkPaymentRazorpay], (req, res) => {
   var options = { amount: 2500, currency: "INR", receipt: "order_rcptid_11", payment_capture: '1' };
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
});

app.post('/payment-confirmation', [middleware.ensureGameAuthRazorpay, middleware.ensureUserAuthenticationRazorpay, middleware.checkPaymentRazorpay], (req, res) => {
   var payment_id = req.body.response.razorpay_payment_id;
   instance.payments.fetch(payment_id, (err, response) => {
      if(err){
         console.log(err);
         res.send({status : 3, message:"Fetch payment confirmation."});
      }
      else{
         console.log(response);
         if(response.status == 'authorized'){
            request({
               method: 'POST',
               url: 'https://'+ vault.razorpay.key_id +':'+ vault.razorpay.key_secret +'@api.razorpay.com/v1/payments/'+ payment_id +'/capture',
               form: {
                 amount: 2500,
                 currency: INR
               }
             }, function (error, response, body) {
               console.log('Status:', response.statusCode);
               console.log('Headers:', JSON.stringify(response.headers));
               console.log('Response:', body);
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
             });
         }
         else if(response.status == 'failed'){
            res.send({status : 0, message:"Transaction failed"});
         }
         else if(response.status == 'captured'){
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
         else{
            res.send({status : 2, message:"Some other problem occured for transaction."});
         }
      }
   })
});

app.get('/winners/:user_id/:game_id', middleware.ensureUserAuthentication, (req, res) => {
   var first_five = null;
   var top_row = null;
   var middle_row = null;
   var bottom_row = null;
   var full_house = null;
   Game.findOne({_id : req.params.game_id}).then(nextGame => {
      if(nextGame && nextGame.played){
         let promise1 = new Promise( (resolve, reject) => {
            if(nextGame.first_five){
               middleware.admin.auth().getUser(nextGame.first_five).then(function(userRecord) {
                  first_five = {user_id : userRecord.uid, name : userRecord.displayName};
                  resolve();
               });
            }
            else{
               first_five = {user_id : "None", name : "None"};
               resolve();
            }
         });
   
         let promise2 = new Promise( (resolve, reject) => {
            if(nextGame.top_row){
               middleware.admin.auth().getUser(nextGame.top_row).then(function(userRecord) {
                  top_row = {user_id : userRecord.uid, name : userRecord.displayName};
                  resolve();
               });
            }
            else{
               top_row = {user_id : "None", name : "None"};
               resolve();
            }
            
         });
   
         let promise3 = new Promise( (resolve, reject) => {
            if(nextGame.middle_row){
               middleware.admin.auth().getUser(nextGame.middle_row).then(function(userRecord) {
                  middle_row = {user_id : userRecord.uid, name : userRecord.displayName};
                  resolve();
               });
            }
            else{
               middle_row = {user_id : "None", name : "None"};
               resolve();
            }
         });
   
         let promise4 = new Promise( (resolve, reject) => {
            if(nextGame.bottom_row){
               middleware.admin.auth().getUser(nextGame.bottom_row).then(function(userRecord) {
                  bottom_row = {user_id : userRecord.uid, name : userRecord.displayName};
                  resolve();
               });
            }
            else{
               bottom_row = {user_id : "None", name : "None"};
               resolve();
            }
         });
   
         let promise5 = new Promise( (resolve, reject) => {
            if(nextGame.full_house){
               middleware.admin.auth().getUser(nextGame.full_house).then(function(userRecord) {
                  full_house = {user_id : userRecord.uid, name : userRecord.displayName};
                  resolve();
               });
            }
            else{
               full_house = {user_id : "None", name : "None"};
               resolve();
            }
         });
   
         Promise.all([promise1, promise2, promise3, promise4, promise5]).then(data => {
            res.render('winner', {status : 1, first_five, top_row, middle_row, bottom_row, full_house});
         });
      }
      else{
         res.render('winner', {status : 0, first_five, top_row, middle_row, bottom_row, full_house});
      }
   });  
})

app.get('/game-start/:user_id/:game_id', [middleware.ensureGameAuth, middleware.ensureUserAuthentication, middleware.ensurePaymentDone],  (req, res) => {
   res.render('game', {game : res.locals.nextGame, user_id : req.user.uid}); 
});

app.get('/add-game', function(req, res) {
   res.render('gameinput');
})

app.post('/add-game', function(req, res) {
   Game.create({ game_time : (req.body.time1), game_end_time : (req.body.time2) }, (err, redd) =>{
      res.send("Success")
   })
});


io.on('connection', function(socket) {
   players++;
   console.log(players + " connected. This one is " + socket.id);
   var current_game = null;
   var current_user = null;
   var game_end_time = null;
   var game_time = null;
   var ticket = null;
   console.log("Disbarred user");
   console.log(dibarred_user);

   socket.on('initialize-data', function(user){
      Game.find({played : false}).sort({game_time : 1}).limit(1).then(game => {
         current_game = game[0];
         game_time = new Date(current_game.game_time);
         game_end_time = new Date(current_game.game_end_time);
         var flag = 0;
         game_players.forEach(x => {
            if(x == user.uid){
               socket.emit("unauthorized-usage", "User has already playing in another device/tab");
               flag = 1;
            }
         });
         if(flag == 0){
            dibarred_user.forEach(x => {
               if(x == user.uid){
                  socket.emit("unauthorized-usage", "User has been debbared from the current game");
                  flag = 1;
               }
            });
            if(flag == 0){
               current_user = user;
               game_players.push(user.uid);
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

   socket.on('full-house', function(ticket_client, user, game){
      var claim = null;
      console.log(ticket_client);
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
               Game.findOneAndUpdate({_id : current_game._id}, {$set : {full_house :  user.uid, played : true, game_end_time : new Date()}}, (err, result) => {
               socket.broadcast.emit('full-house-winner', user.phoneNumber+ ' has won full house', game_data);
               socket.emit('full-house-winner-you', 'Congrats you won full house', game_data); 
               clearAllTimeouts();
               })
            }
            else{
               dibarred_user.push(user.uid);
               socket.emit('wrong-claim', user.phoneNumber);
            }
         })
      }
      else{
         dibarred_user.push(user.uid);
         socket.emit('wrong-claim', user.phoneNumber);
      }
   });

   socket.on('top-row', function(ticket_client, user, game){
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
               Game.findOneAndUpdate({_id : current_game._id}, {$set : { top_row : user.uid }}, (err, result) => {
               socket.broadcast.emit('top-row-winner', socket.id+ ' has won top row');
               socket.emit('top-row-winner', 'Congrats you won top row');
               })
            }
            else{
               dibarred_user.push(user.uid);
               socket.emit('wrong-claim', user.phoneNumber);
            }
         });
      }
      else{
         dibarred_user.push(user.uid);
         socket.emit('wrong-claim', user.phoneNumber);
      }
   });

   socket.on('middle-row', function(ticket_client, user, game){
      var claim = null;
      for (let i = 0; i < 9; i++) {
         var value = ticket_client[1][i];
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
            if(game_data && !game_data.middle_row){
               Game.findOneAndUpdate({_id : current_game._id}, {$set : { middle_row : user.uid }}, (err, result) => {
               socket.broadcast.emit('middle-row-winner', socket.id+ ' has won middle row');
               socket.emit('middle-row-winner', 'Congrats you won middle row');
               });
            }
            else{
               dibarred_user.push(user.uid);
               socket.emit('wrong-claim', user.phoneNumber);
            }
         });
      }
      else{
         dibarred_user.push(user.uid);
         socket.emit('wrong-claim', user.phoneNumber);
      }

      
   });

   socket.on('bottom-row', function(ticket_client, user, game){
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
               Game.findOneAndUpdate({_id : current_game._id}, {$set : { bottom_row : user.uid }}, (err, result) => {
               socket.broadcast.emit('bottom-row-winner', socket.id+ ' has won bottom row');
               socket.emit('bottom-row-winner', 'Congrats you won bottom row');
               })
            }
            else{
               dibarred_user.push(user.uid);
               socket.emit('wrong-claim', user.phoneNumber);
            }
         })
      }
      else{
         dibarred_user.push(user.uid);
         socket.emit('wrong-claim', user.phoneNumber);
      }

      
   });

   socket.on('first-five', function(ticket_client, user, game){
      var flag = 0;
      var claim = null;
      var count = 0;
      console.log(ticket_client);
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
               Game.findOneAndUpdate({_id : current_game._id}, {$set : { first_five : user.uid }}, (err, result) => {
                  socket.emit('first-five-winner', 'Congrats you won first-five');
                  socket.broadcast.emit('first-five-winner', socket.id+ ' has won first-five');
               });
            }
            else{
               dibarred_user.push(user.uid);
               socket.emit('wrong-claim', user.phoneNumber);
            }
         });
      }
      else{
         dibarred_user.push(user.uid);
         socket.emit('wrong-claim', user.phoneNumber);
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
         console.log("//")
         console.log(game_players)
      }
   });
});

initiationGame();

function initiationGame() {
   Game.findOne({played : false}).sort({game_time : 1, game_end_time: 1}).limit(1).then(gg => {
      game_next = gg;
      if(gg && new Date(gg.game_end_time) > new Date()){
         console.log(gg);
         var nextTime = new Date(gg.game_time).getTime() - new Date().getTime();
         console.log(nextTime);
         setTimeout(newGameStart, nextTime);
      }
      else{
         if(!gg){
            console.log("No game available");
         }
         else{
            gameFinished();
         }
      }
   });
}

function newGameStart() {
   sequence          = tambola.getDrawSequence(),
   i                 = 0,
   usedSequence      = [],
   time              = 6,
   refreshIntervalId = null,
   timerID           = null,
   game_players      = [],
   dibarred_user     = [];
   console.log(game_next);
   console.log("new game start");
   refreshIntervalId = setInterval(doStuff, 7000);
   timerID = setInterval(setTimer, 1000);
}

function setTimer(){
   io.sockets.emit('timer', time--);
}

function doStuff() {
   usedSequence.push(sequence[i]);
   time = 6;
   console.log("Word shwon");
   io.sockets.emit('nextNumber', 'Your next number is '+ sequence[i], sequence[i]);
   i++;
   if(i==90){
      clearInterval(refreshIntervalId);
      clearInterval(timerID);
      console.log("Last peiced shown");
      setTimeout(gameFinished, 20000);
   }
}

function gameFinished() {
   Game.updateOne({_id : game_next._id}, {$set : {played : true, game_end_time : new Date()}}, (err, result) => {
      io.sockets.emit('game-finished', game_next._id);
      console.log("Game ended by time");
      initiationGame();
   });
}

function clearAllTimeouts(){
   clearInterval(refreshIntervalId);
   clearInterval(timerID);
   clearTimeout(gameFinished);
   console.log("Game ended by player")
   initiationGame();
}


http.listen(process.env.PORT || 3000, function() {
   console.log('listening on *:3000');
});





