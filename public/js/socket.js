var user = null;
var socket = io();
var original_ticket = null;
var ticket           = null,
    disclosedNumbers = null;
var game_time      = null;
var game_end_time  = null;
var game           = null;



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

 firebase.auth().onAuthStateChanged(function(userDetail) {
    if (userDetail) {
        user = userDetail;
        initiate(user);
    }
    else{
        console.log("no")
    }
 });

function initiate(user) {
    socket.emit('initialize-data', user);
}

socket.on('unauthorized-usage', (message) => {
    console.log(message);
    window.location = "/end";
})


socket.on('game-initialized', (t1, t2, current_game) => {
    game_time = t1;
    game_end_time = t2;
    game = current_game;
    if(new Date() > new Date(game_end_time)){
        $('.game-ended').show();
    }
    else if(new Date() < new Date(game_time)){
        showTimer(new Date(game_time).getTime());
        var eta_ms = new Date(game_time).getTime() - new Date().getTime();
        var timeout = setTimeout(function(){
            $('.wait').hide();
            gamestart();
        }, eta_ms);
        $('.wait').show();
    }
    else if(new Date() > new Date(game_time) && new Date() < new Date(game_end_time)){
        gamestart();
    }
    else{
        console.log("Unknown error");
    }
});

function gamestart() {
    socket.emit('game-start');
    $('.play').show();
}

socket.on('loadGameData', function(ticket, usedSequence){
    setClaimButtonState();
    createTicket(ticket);
    showEmittedNumbers(usedSequence);
});

function setClaimButtonState(){
    if(game.top_row)$('.top-row').attr('disabled', true);
    if(game.middle_row)$('.middle-row').attr('disabled', true);
    if(game.bottom_row)$('.bottom-row').attr('disabled', true);
    if(game.full_house)$('.full-house').attr('disabled', true);
    if(game.first_five)$('.first-five').attr('disabled', true);
}


function createTicket(data) {
    original_ticket = data;
    var c = 0;
    var r = 0;
    $("td").each(function() {
        if(c%9 == 0) c = 0;
        var value = data[r][c];
        if(value == 0){
            $(this).text();
            $(this).addClass('not-clickable');
        }
        else $(this).text(value);
        
        if(c == 8) r++;
        c++;
    });
}

socket.on('nextNumber', function( data, number){
    disclosedNumbers.push(number);
    $('.nextnumber').text(number);
    $('.marquee p').html($('.marquee p').html() + ", " + number);
});


function showEmittedNumbers(data){
    disclosedNumbers = data;
    data.forEach(x => {
        $('.marquee p').html($('.marquee p').html() + ", " + x);
    });
    //$('.timer').text(data[data.length - 1]);
}

socket.on('timer', function(data){
    $('.timer').text(data);
});  


$('.ticket td').click(function(){
    var td = this;
    console.log("RR")
    socket.emit('sendClickData', socket.id, $(this).text());
    socket.on('statusClick', function(data){
        console.log(data)
        if(data){
            $(td).addClass('clicked-cell');
        }
        else{
            $(td).addClass('wrong-clicked-cell');
        }
        td=null;
    });
});

$('.claim').click(function(){
    if($(this).hasClass('full-house'))emit = 'full-house';
    if($(this).hasClass('top-row'))emit = 'top-row';
    if($(this).hasClass('middle-row'))emit = 'middle-row';
    if($(this).hasClass('bottom-row'))emit = 'bottom-row';
    if($(this).hasClass('first-five'))emit = 'first-five';
    socket.emit(emit, emit);
});


// Game Control 
socket.on('wrong-claim', function(id){
    alert('Your id will be disconnected because of wrong claim');
    socket.disconnect();
    window.location = "/end";
});


// Claim Controls
socket.on('first-five-winner', function(message){
    console.log(message);
    $('.first-five').attr('disabled', true);
});

socket.on('top-row-winner', function(message){
    console.log(message);
    $('.top-row').attr('disabled', true);
});

socket.on('middle-row-winner', function(message){
    console.log(message);
    $('.middle-row').attr('disabled', true);
});

socket.on('bottom-row-winner', function(message){
    console.log(message);
    $('.bottom-row').attr('disabled', true);
});

socket.on('full-house-winner', function(message, game_end_time_){
    console.log(message);
    game_end_time = game_end_time_;
    $('.full-house').attr('disabled', true);
    socket.close();
    window.location = "/end";
});


function showTimer(time){
    var x = setInterval(function() {
        console.log(time)
        var now = new Date().getTime();

        var distance = time - now;
        
        // Time calculations for days, hours, minutes and seconds
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        var day = Math.floor(distance/(1000*60*60*24));
        // Output the result in an element with id="demo"
        var d = day + "D " + hours + "H " + minutes + "M " + seconds + "S ";
        $("#timer").html(d);

        console.log(d);
        
        // If the count down is over, write some text 
        if (distance < 0) {
        clearInterval(x);
        $("#timer").innerHTML = "EXPIRED";
        }
    }, 1000);
}

socket.on('error', (error) => {
    console.log("error")
  });

socket.on('reconnect', (attemptNumber) => {
    console.log("reconnected" + attemptNumber);
  });