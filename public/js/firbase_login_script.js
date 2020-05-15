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
  // Initialize Firebase
 firebase.initializeApp(firebaseConfig);

 var phoneNumber = null;
 var code = null;
 var username = null;


 firebase.auth().onAuthStateChanged(function(userDetail) {
    if (userDetail) {
        $('.loader, .login').hide();
        $('.homepage').show();
        user = userDetail;
        console.log(user.uid)
    }
    else{
        $('.loader, .homepage').hide();
        $('.login').show();
    }
 });



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
    /* $.redirect('', {'arg1': 'value1', 'arg2': 'value2'}); */
    //$('window').redirect('/mygame-list', {'arg1': 'value1', 'arg2': 'value2'});
    window.location.href = "/mygame-list/" + user.uid; 

/*     var xhr = new XMLHttpRequest();
    var url = "/mygame-list";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            console.log(json);
        }
    };
    var data = JSON.stringify({"uid": user.uid});
    xhr.send(data); */
}


 




