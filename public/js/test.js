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
        console.log(new Date(game_end_time))
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
     'callback': function(response) { onSignInSubmit(); 
    console.log(response)}
 });
 

 var appVerifier = window.recaptchaVerifier;
 
 firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
     })
     .catch(function(error) { console.log(error); }); 
 
 function submitPhone() {
    phoneNumber = "+91" + $('#phone').val();
    username    = $('#username').val();
    if(phoneNumber.length != 13){
        $('.toast-message').text("Invalid Phone Number")
        $('.toast').toast('show');
    }
    else if(username == ""){
        $('.toast-message').text("Username cannot be empty")
        $('.toast').toast('show');
    }
    else{
        $('.main').addClass('fadeb');
        $('.text-center').show();
         
        firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier).then(function (confirmationResult) {

        $('.main').removeClass('fadeb');
        $('.text-center, .login-dialog').hide();
        $('.toast-message').text("OTP Sent...")
        $('.toast').toast('show');
        $('#otpModal').modal('show');
        window.confirmationResult = confirmationResult;
        }).catch(function (error) {  
        $('.main').removeClass('fadeb');
        $('.text-center').hide(); 
        $('.toast-message').text(error.message);
        $('.toast').toast('show');
        });
    }
    
 }

 $('#otpModal').on('hidden.bs.modal', function (e) {
    $('.login-dialog').show();
  })
 
 
 function submitCode() {
     code = $('#code').val();
     $('.main').addClass('fadeb');
     $('.text-center').show();
     confirmationResult.confirm(code).then(function (result) {
     user = result.user;
     $('.login').hide();
     $('.logout').show();
     $('#otpModal').modal('hide');
     $('.toast-message').text("Logged In Successfully");
     $('.toast').toast('show');
     user.updateProfile({displayName: username}).then(function() {
    }).catch(function(error) { console.log(error) });    
     
     }).catch(function (error) { 
        $('.main').removeClass('fadeb');
        $('.text-center').hide(); 
        $('#otpModal').modal('hide');
        $('.toast-message').text(error.message);
        $('.toast').toast('show');
    });   
     //socket.emit('payment-check', user, game_time);
 }
 
 
 function signOut() {
    $('.main').addClass('fadeb');
    $('.text-center').show();
    socket.emit('logout-user', user);
    firebase.auth().signOut().then(function() {
        $('.game, .wait, .play, .homepage, .game-ended').hide();
        $('.main').removeClass('fadeb');
        $('.text-center').hide();
    }).catch(function(error) { console.log(error); });   
 }

 
$(".payBtn").click(function(){
    $('.main').addClass('fadeb');
    $('.text-center').show();
    socket.emit('payment-process', user, username);
});

 





 



