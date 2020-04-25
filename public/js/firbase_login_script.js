var socket         = io();
var game_time      = null;
var game_end_time  = null;
var user = null;
socket.on('game-timing', function(game_time_, game_end_time_){
    game_time = game_time_;
    game_end_time = game_end_time_;
});



socket.on("invalid-user", function(){
    console.log("You have already logged in");
    socket.close();
    window.location = "/end";
})


// TODO: Replace the following with your app's Firebase project configuration
var firebaseConfig = {
    // ...
    apiKey: "AIzaSyBMtJWyBxZ4kVlqbAAHCFuBspdxbRW0dOM",
     authDomain: "bingo-35ce9.firebaseapp.com",
     databaseURL: "https://bingo-35ce9.firebaseio.com",
     projectId: "bingo-35ce9",
     storageBucket: "bingo-35ce9.appspot.com",
     messagingSenderId: "564607526074",
     appId: "1:564607526074:web:8753262a2aac9036ad8e83",
     measurementId: "G-YDYDGBBZ9L"
 
  };
  // Initialize Firebase
 firebase.initializeApp(firebaseConfig);

 var phoneNumber = null;
 var code = null;
 var username = null;


 firebase.auth().onAuthStateChanged(function(userDetail) {
     if (userDetail) {
     user = userDetail;
     socket.emit('check-user-validity', user);
     socket.on("user-validated", function(){
        socket.emit("assign-current-user", userDetail);
        $('.logout').show();
        if(new Date > new Date(game_end_time)){
            $('.game').show();
            $('.game-ended').show();
        }
        else{
            socket.emit('payment-check', user);
        }
     });
     }
     else{
        $('.login').show();
        $('.logout').hide();
     }
 });

socket.on('payment-info', function(payment){
    if(payment){
        $('.homepage').hide();
        $('.game').show();
        if(new Date() <= new Date(game_time)){
            console.log("1")
            $('.wait').show();
            var eta_ms = new Date(game_time).getTime() - new Date().getTime();
            var timeout = setTimeout(function(){
                socket.emit('game-start');
                $('.wait').hide();
                $('.play').show();
            }, eta_ms);
        }
        else if(new Date <= new Date(game_end_time)){
            socket.emit('game-start');
            $('.play').show();
        }
        else{
            $('.game-ended').show();
        }
    }
    else{
        $('.login').hide();
        $('.homepage').show();
        console.log("Payment is not completed")
    }
})


 window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
     'size': 'invisible',
     'callback': function(response) { onSignInSubmit(); }
 });
 

 var appVerifier = window.recaptchaVerifier;
 
 firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
     })
     .catch(function(error) { console.log(error); }); 
 
 function submitPhone() {
     phoneNumber = $('#phone').val();
     username    = $('#username').val();
     firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier).then(function (confirmationResult) {
     // SMS sent. Prompt user to type the code from the message, then sign the
     // user in with confirmationResult.confirm(code).
     window.confirmationResult = confirmationResult;
     }).catch(function (error) {  console.log(error); });
 }
 
 
 function submitCode() {
     code = $('#code').val();
     confirmationResult.confirm(code).then(function (result) {
     user = result.user;
     socket.emit("assign-current-user", user);
     $('.login').hide();
     $('.logout').show();
     socket.on("user-validated", function(){
        socket.emit("assign-current-user", user);
        if(new Date > new Date(game_end_time)){
            $('.game').show();
            $('.game-ended').show();
         }
         else{
            socket.emit('payment-check', user);
         }
     })
     
     user.updateProfile({displayName: username}).then(function() {
        }).catch(function(error) { console.log(error) });
     }).catch(function (error) { console.log(error); });   
     //socket.emit('payment-check', user, game_time);
 }
 
 
 function signOut() {
     firebase.auth().signOut().then(function() {
     console.log("Signed Out");
     }).catch(function(error) { console.log(error); });
 }

 
$(".payBtn").click(function(){
    socket.emit('payment-process', user, username);
});

 


 



