
var user = null;
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

$('.admin-d').hide();

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var phoneNumber = null;
var code = null;
var username = null;


firebase.auth().onAuthStateChanged(function(userDetail) {
    if (userDetail) {
        $('.loader, .login').hide();
        
        console.log(userDetail);
        $('.homepage').show();
        user = userDetail;
        if(user.uid == 'OF1Htn7eXfdY6PqbWSoUflD3uuH2' || user.uid == '58WDvEEwzlPZ65mtsNmuOiqj7d53' || user.uid == 'VpHA9D1wwgMrdNF7ikn32lPIq8B3' ){
            $('.admin-d').show(); 
        }
    }
    else{
        $('.loader, .homepage').hide();
        $('.login').show();
    }
});

firebase.auth().useDeviceLanguage();


window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible'
});
 

var appVerifier = window.recaptchaVerifier;
 
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(error) { console.log(error); }); 
 
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
        console.log(phoneNumber);
        $('.loader').show();
        firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier).then(function (confirmationResult) {
        $('.loader, .login-dialog').hide();
        $('.toast-message').text("OTP Sent...")
        $('.toast').toast('show');
        $('#otpModal').modal('show');
        window.confirmationResult = confirmationResult;
        }).catch(function (error) {  
        $('.loader').hide(); 
        $('.toast-message').text(error.message);
        $('.toast').toast('show');
        console.log(error);
        });
    }
    
}

$('#otpModal').on('hidden.bs.modal', function (e) {
    $('.login-dialog').show();
})
 
 
function submitCode() {
     code = $('#code').val();
     
     $('.loader').show();
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
        
        $('.loader').hide(); 
        $('#otpModal').modal('hide');
        $('.toast-message').text(error.message);
        $('.toast').toast('show');
    });   
}
 
function signOut() {
    $('.loader').show();
    firebase.auth().signOut().then(function() {
        $('.loader').hide();
    }).catch(function(error) { console.log(error); });   
}

function gamelist(){
    window.location.href = "/mygame-list/" + user.uid; 
}


function adminDashboard() {
    window.location.href = "/admin/" + user.uid; 
}



