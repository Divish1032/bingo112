var user = null;
var socket = io();
var original_ticket = null;
var ticket           = null,
    disclosedNumbers = [];
var game_time      = null;
var game_end_time  = null;
var game           = null;
var counter        = 0;

var words = ['positive', 'joy', 'happy', 'zeal', 'smile', 'gain', 'nice', 'beautiful', 'profit', 'cheer', 'wonderful', 'good',
'better', 'best', 'bright', 'optimistic', 'strong', 'will', 'hope', 'certain', 'sure', 'accept', 'warm', 'appreciate', 'friendly', 'adore', 'support', 'respect', 'sympathy', 'advice', 'recommend', 'clear', 'confident',
'assure', 'accomplish', 'optimist', 'content', 'jolly', 'carefree', 'delight', 'elated', 'blessed', 'worship', 'glad', 'benefit',
'fortunate', 'laugh', 'love', 'win', 'comfort', 'safe', 'merry', 'success', 'healthy', 'mind', 'matters', 'body', 'paradise', 'okay', 'glory', 'enjoy', 'amazing', 'joke', 'cute', 'hug', 'tasty', 'achieve', 'praise', 'optimist', 'smart', 'pleasant', 'awesome', 'peace', 
'delight', 'kind', 'honest', 'trust', 'polite', 'generous', 'helping', 'guide', 'consistent', 'celebrate', 'confident', 'faith', 'truth', 'firm', 'sunshine', 'light', 'promise', 'calm', 'asha', 'ease', 'mental', 'well-being', 'bliss', 'courage', 'pledge', 'cool', 'brave']



var firebaseConfig = {
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
        window.location = "/end";
    }
});

socket.on('unauthorized-usage', (message) => {
    alert(message);
    window.location = "/end";
});

socket.on('game-initialized', (t1, t2, current_game) => {
    game_time = t1;
    game_end_time = t2;
    game = current_game;
    if(new Date() > new Date(game_end_time)){
        $('.toast-message').text("Todays game has ended")
        $('.toast').toast('show');
        $('.game-ended').show();
    }
    else if(new Date() < new Date(game_time)){
        showTimer(new Date(game_time).getTime());
        var eta_ms = new Date(game_time).getTime() - new Date().getTime();
        var timeout = setTimeout(function(){
            $('.wait').hide();
            gamestart();
        }, eta_ms);
        $('.toast-message').text("Game has not started yet.")
        $('.toast').toast('show');
        $('.wait').show();
    }
    else if(new Date() > new Date(game_time) && new Date() < new Date(game_end_time)){
        $('.toast-message').text("Game Started")
        $('.toast').toast('show');
        gamestart();
        $('#my-canvas').show();
    }
    else{
        console.log("Unknown error");
    }
});

socket.on('loadGameData', function(ticket, usedSequence){
    setClaimButtonState();
    createTicket(ticket);
    showEmittedNumbers(usedSequence);
    $('.claim-btn').show();
    if(screen.width <= 550){
        $('.toast-message').text(screen.width)
        $('.toast').toast('show');
        rotate(window);
    }
    
});

socket.on('nextNumber', function( data, number){
    disclosedNumbers.push(number);
    $('.nextnumber').text(words[number]);
    $('.news-message').append("<p>" + words[number] + ", </p>");
    if(counter == 1){
        var duration = $('.news-message').css('animation-duration');
        duration = parseInt(duration.substr(0,2)) + 2.5; 
        $('.news-message').css('animation-duration', duration.toString() + 's');
    }
    console.log($('.news-message').css('animation-duration'));

});

socket.on('timer', function(data){
    $('.timer').text(data);
});  

// Game Control 
socket.on('wrong-claim', function(id){
    alert('Your id will be disconnected because of wrong claim, you wont be able to continue this game anymore');
    socket.disconnect();
    window.location = "/end";
});

// Claim Controls
socket.on('first-five-winner', function(message){
    $('.toast-message').text(message)
    $('.toast').toast('show');
    $('.first-five').attr('disabled', true);
});

socket.on('top-row-winner', function(message){
    $('.toast-message').text(message)
    $('.toast').toast('show');
    $('.top-row').attr('disabled', true);
});

socket.on('middle-row-winner', function(message){
    $('.toast-message').text(message)
    $('.toast').toast('show');
    $('.middle-row').attr('disabled', true);
});

socket.on('bottom-row-winner', function(message){
    $('.toast-message').text(message)
    $('.toast').toast('show');
    $('.bottom-row').attr('disabled', true);
});

socket.on('full-house-winner', function(message, game_end_time_){
    game_end_time = game_end_time_;
    $('.full-house').attr('disabled', true);
    alert(message);
    socket.close();
    window.location = "/end";
});

socket.on('full-house-winner-you', function(message, game_end_time_){
    game_end_time = game_end_time_;
    $('.full-house').attr('disabled', true);
    $('.toast-message').text(message)
    $('.toast').toast('show');
    socket.close();
});



$('.ticket td').click(function(){
    var td = this;
    console.log("RR");
    var ticket_id = null;
    words.forEach((x,i) => {
        if(x == $(this).text()){
            ticket_id = i;
        }
    });
    console.log(ticket_id);
    socket.emit('sendClickData', socket.id, ticket_id);
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

function showEmittedNumbers(data){
    disclosedNumbers = data;
    data.forEach(x => {
        $('.news-message').append("<p>" + words[x] + ", </p>");
    });
    $('.nextnumber').text(words[data[data.length - 1]]);
    var duration = $('.news-message').css('animation-duration');
    duration = parseInt(duration.substr(0,2)) + data.length * 2.5; 
    $('.news-message').css('animation-duration', duration.toString() + 's');
    counter = 1;
    console.log($('.news-message').css('animation-duration'));
    //$('.timer').text(data[data.length - 1]); 
}

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
        else $(this).text(words[value]);
        
        if(c == 8) r++;
        c++;
    });
}

function gamestart() {
    socket.emit('game-start', user);
    $('.play').show();
}

function initiate(user) {
    socket.emit('initialize-data', user);
}

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



function fullScreenCheck() {
    if (document.fullscreenElement) return;
    return document.documentElement.requestFullscreen();
}

function updateDetails(lockButton) {
    const buttonOrientation = getOppositeOrientation();
}

function getOppositeOrientation() {
    const { type } = screen.orientation;
    return type.startsWith("portrait") ? "landscape" : "portrait";
}

async function rotate(lockButton) {
    try {
        await fullScreenCheck();
    } catch (err) {
        console.error(err);
}
const newOrientation = getOppositeOrientation();
    await screen.orientation.lock(newOrientation);
    updateDetails(lockButton);
}

function show() {
    const { type, angle } = screen.orientation;
    console.log(`Orientation type is ${type} & angle is ${angle}.`);
}

screen.orientation.addEventListener("change", () => {
    show();
    updateDetails(document.getElementById("button"));
});

window.addEventListener("load", () => {
    show();
    updateDetails(document.getElementById("button"));
});
