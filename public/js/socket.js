var user = null;
var socket = io();
var original_ticket = null;
var ticket           = null,
    ticket2          = null;
    disclosedNumbers = [];
var game_time      = null;
var game_end_time  = null;
var game           = null;
var counter        = 0;

var words = ['positive', 'joy', 'happy', 'zeal', 'smile', 'gain', 'nice', 'beautiful', 'profit', 'cheer', 'wonderful', 'good',
'better', 'best', 'bright', 'optimistic', 'strong', 'will', 'hope', 'certain', 'sure', 'accept', 'warm', 'appreciate', 'friendly', 'adore', 'support', 'respect', 'sympathy', 'advice', 'recommend', 'confident',
'assure', 'accomplish', 'jolly', 'carefree', 'elated', 'blessed', 'worship', 'glad', 'benefit',
'fortunate', 'laugh', 'love', 'win', 'comfort', 'safe', 'merry', 'success', 'healthy', 'mind', 'matters', 'body', 'paradise', 'okay', 'glory', 'enjoy', 'amazing', 'joke', 'cute', 'hug', 'tasty', 'achieve', 'praise', 'smart', 'pleasant', 'awesome', 'peace', 
'delight', 'kind', 'honest', 'trust', 'polite', 'generous', 'helping', 'guide', 'consistent', 'celebrate', 'faith', 'truth', 'firm', 'sunshine', 'light', 'promise', 'calm', 'asha', 'ease', 'mental', 'well-being', 'bliss', 'courage', 'cool', 'brave']
 words = words.sort();



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
        socket.emit('initialize-data', user);
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
    }
    else{
        console.log("Unknown error");
    }
});

socket.on('loadGameData', function(tic, usedSequence){
    var audio = document.getElementById("myAudio");
    audio.volume = 0.2;
    audio.play();
    ticket = tic;
    setClaimButtonState();
    $('.ticket td').addClass('not-clickable');
    createTicket(tic);
    showEmittedNumbers(usedSequence);
    $('.claim-btn').show();
    $('.nextnumber').text(words[disclosedNumbers[disclosedNumbers.length - 1]]);
    $('.timer').text("0");    

});

socket.on('nextNumber', function( usedSequence, number, index){
    disclosedNumbers = usedSequence
    $('.nextnumber').text(words[number]);
    buildEmittedWords();
    var msg = new SpeechSynthesisUtterance(words[number]);
    window.speechSynthesis.speak(msg);
}); 

// Game Control 
socket.on('wrong-claim', function(id){
    alert('Your id will be disconnected because of wrong claim, you wont be able to continue this game anymore');
    socket.disconnect();
    window.location = "/end";
});

socket.on('timer', function(data){
    if(data < 0 )
    $('.timer').text("0");
    else
    $('.timer').text(data);
}) 

// Claim Controls
socket.on('first-five-winner', function(message){
    $('.toast-message').text(message)
    $('.toast').toast('show');
    $('.first-five').attr('disabled', true);
});

socket.on('top-row-winner', function(message){
    $('.toast-message').text(message)
    $('.toast').toast('show');
    $('.first-column').attr('disabled', true);
});

socket.on('middle-row-winner', function(message){
    $('.toast-message').text(message)
    $('.toast').toast('show');
    $('.second-column').attr('disabled', true);
});

socket.on('bottom-row-winner', function(message){
    $('.toast-message').text(message)
    $('.toast').toast('show');
    $('.third-column').attr('disabled', true);
});

socket.on('full-house-winner', function(message, game){
    game_end_time = new Date();
    $('.full-house').attr('disabled', true);
    alert(message);
    socket.close();
    window.location = "/winners/" + user.uid + '/'  + game._id;
});

socket.on('full-house-winner-you', function(message, game){
    game_end_time = new Date();
    $('.full-house').attr('disabled', true);
    alert(message);
    socket.close();
    window.location = "/winners/" + user.uid + '/' + game._id;
});



$('#ticket .row div').click(function(){
    var ticket_id = null;
    $(this).toggleClass('clicked-cell');
    words.forEach((x,i) => {
        if(x == $(this).text()){
            ticket_id = i;
        }
    });
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
            var value = ticket[i][j];
            if(ticket_id == Math.abs(value)){
                ticket[i][j] = ticket[i][j] * -1;
            }
        }    
    }
});

$('.claim').click(function(){
    if($(this).hasClass('full-house'))emit = 'full-house';
    if($(this).hasClass('first-column'))emit = 'first-column';
    if($(this).hasClass('second-column'))emit = 'second-column';
    if($(this).hasClass('third-column'))emit = 'third-column';
    if($(this).hasClass('first-five'))emit = 'first-five';
    socket.emit(emit, ticket, user, game);
    socket.emit('save-game-checkpoint', ticket, user, game);
});

function showEmittedNumbers(data){
    disclosedNumbers = data;
    buildEmittedWords();
}

function buildEmittedWords(){
    $('#words-batch .row').html("");
    let count = 0;
    for (let i = disclosedNumbers.length - 1; i >= 0; i--) {
        const x = disclosedNumbers[i];
        if(count === 0){
            $('#words-batch .row').append("<span style='font-size:18px'>" + words[x] + "</span>");
        }
        else{
            $('#words-batch .row').append("<span>" + words[x] + "</span>")
        }

        count++;
    }
}

function setClaimButtonState(){
    if(game.top_row)$('.top-row').attr('disabled', true);
    if(game.middle_row)$('.middle-row').attr('disabled', true);
    if(game.bottom_row)$('.bottom-row').attr('disabled', true);
    if(game.full_house)$('.full-house').attr('disabled', true);
    if(game.first_five)$('.first-five').attr('disabled', true);
}

function createTicket(data) {
    $('.ticket td').removeClass('not-clickable');
    original_ticket = data;
    ticket = data;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
            let val = data[i][j];
            let word = null;
            if(i === 0)
               word = $(`#ticket .row1 div:nth-child(` + (j + 1) + `)`);
            else if(i === 1)
               word = $(`#ticket .row2 div:nth-child(` + (j + 1) + `)`);
            else if(i === 2)
               word = $(`#ticket .row3 div:nth-child(` + (j + 1) + `)`);
            else if(i === 3)
               word = $(`#ticket .row4 div:nth-child(` + (j + 1) + `)`);
            else if(i === 4)
               word = $(`#ticket .row5 div:nth-child(` + (j + 1) + `)`);
            else
               word = $(`#ticket .row6 div:nth-child(` + (j + 1) + `)`);  
            word.text(words[Math.abs(val)])
            if(val !== Math.abs(val)) word.addClass('clicked-cell')
        }      
    }
}

function gamestart() {
    socket.emit('game-start', user, game);
    $('.play').show();
}

function showTimer(time){
    var x = setInterval(function() {
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
        
        // If the count down is over, write some text 
        if (distance < 0) {
        clearInterval(x);
        $("#timer").innerHTML = "EXPIRED";
        }
    }, 1000);
}

socket.on('emit-used-sequence', function(data, number){
    showEmittedNumbers(data);
    $('.nextnumber').text(words[number]);
});

socket.on('last-word-shown', function (){
    $('.toast-message').text("Last word shown - you have 20s for the game to end");
    $('.toast').toast('show');
})



socket.on('reconnect', (attemptNumber) => {
    $('.toast-message').text("Game reconnected.")
    $('.toast').toast('show');
    socket.emit('get-showed-sequence');
});

socket.on('disconnect', (error) => {
    $('.toast-message').text("Network issue...");
    $('.toast').toast('show');
});



socket.on('reconnecting', (error) => {
    $('.toast-message').text("Game reconnecting...");
    $('.toast').toast('show');
});

socket.on('reconnect_error', (error) => {
    $('.toast-message').text("For any missed word check the last 12 words section, when connection resumes.");
    $('.toast').toast('show');
});






  socket.on('connect', () => {
    console.log(socket.disconnected); // false
  });