var socket         = io();
var game_time      = null;
var game_end_time  = null;
var user = null;

$('.text-center').show();
$('.main').addClass('fadeb');



socket.on('game-timing', function(game_time_, game_end_time_){
    game_time = game_time_;
    game_end_time = game_end_time_;
});

socket.on("invalid-user", function(){
    console.log("You have already logged in");
    socket.close();
    window.location = "/end";
})

socket.on('disbarred-user', function(){
    console.log("You are a disbarred user for current game, so you cannot join it again for today");
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
        console.log(game_end_time)
        console.log(new Date() > new Date(game_end_time));
        console.log(new Date().getDate() < new Date(game_time).getDate());
        if(new Date() > new Date(game_end_time) || new Date().getDate() < new Date(game_time).getDate()){
            $('.main').removeClass('fadeb');
            $('.text-center').hide();
            $('.game-ended').show();
        }
        else{
            socket.emit('payment-check', user);
        }
     });
     }
     else{
        $('.main').removeClass('fadeb');
        $('.text-center').hide();
        $('.login').show();
        $('.logout').hide();
     }
 });

socket.on('payment-info', function(payment){
    $('.main').removeClass('fadeb');
    if(payment){
        $('.homepage, .text-center').hide();
        if(new Date() <= new Date(game_time)){
            var eta_ms = new Date(game_time).getTime() - new Date().getTime();
            showTimer(new Date(game_time).getTime());
            $('.wait').show();
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
    }
    else{
        $('.text-center, .login').hide();
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
    $('.main').addClass('fadeb');
    $('.text-center').show();
     phoneNumber = $('#phone').val();
     username    = $('#username').val();
     firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier).then(function (confirmationResult) {
     // SMS sent. Prompt user to type the code from the message, then sign the
     // user in with confirmationResult.confirm(code).
     $('.main').removeClass('fadeb');
     $('.text-center').hide();
     $('.toast').toast('show');
     window.confirmationResult = confirmationResult;
     }).catch(function (error) {  console.log(error); });
 }
 
 
 function submitCode() {
     code = $('#code').val();
     $('.main').addClass('fadeb');
     $('.text-center').show();
     confirmationResult.confirm(code).then(function (result) {
     user = result.user;
     socket.emit('check-user-validity', user);
     $('.login').hide();
     $('.logout').show();
     
     socket.on("user-validated", function(){
        socket.emit("assign-current-user", user);
        if(new Date > new Date(game_end_time) || new Date().getDate() < new Date(game_time).getDate()){
            $('.main').removeClass('fadeb');
            $('.text-center').hide();
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
    $('.main').addClass('fadeb');
    $('.text-center').show();
    socket.emit('logout-user', user);
    firebase.auth().signOut().then(function() {
        $('.game, .wait, .play, .homepage, .game-ended').hide();          
        console.log("Signed Out");
        $('.main').removeClass('fadeb');
        $('.text-center').hide();
    }).catch(function(error) { console.log(error); });   
 }

 
$(".payBtn").click(function(){
    $('.main').addClass('fadeb');
    $('.text-center').show();
    socket.emit('payment-process', user, username);
});

 

function showTimer(time){
    // Update the count down every 1 second
    console.log("ss")
var x = setInterval(function() {

    var now = new Date().getTime();

    var distance = time - now;
      
    // Time calculations for days, hours, minutes and seconds
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
    // Output the result in an element with id="demo"
    var d = hours + "h " + minutes + "m " + seconds + "s ";
    $("#timer").html(d)  ;
      
    // If the count down is over, write some text 
    if (distance < 0) {
      clearInterval(x);
      $("#timer").innerHTML = "EXPIRED";
    }
  }, 1000);
}



 



