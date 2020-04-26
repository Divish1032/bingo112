var ticket           = null,
    disclosedNumbers = null;

socket.on('onLoadGetGameData', function(game){
    console.log(game);
    if(game.top_row)$('.top-row').attr('disabled', true);
    if(game.middle_row)$('.middle-row').attr('disabled', true);
    if(game.bottom_row)$('.bottom-row').attr('disabled', true);
    if(game.full_house)$('.full-house').attr('disabled', true);
    if(game.first_five)$('.first-five').attr('disabled', true);
});

socket.on('send-ticket', function(data){
    createTicket(data);
});

function createTicket(data) {
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
    $('.shownNumber').append("<span>"+number+"</span>")
});

socket.on('showAllEmittedNumbers', function(data){
    showEmittedNumbers(data);
});

function showEmittedNumbers(data){
    disclosedNumbers = data;
    data.forEach(x => {
        $('.shownNumber').append("<span>"+x+"</span>")
    });
}

socket.on('timer', function(data){
    $('.timer').text(data);
})  


$('.ticket td').click(function(){
    var td = this;
    socket.emit('sendClickData', socket.id, $(this).text());
    socket.on('statusClick', function(data){
        if(data){
            $(td).addClass('clicked-cell');
        }
        else{
            $(td).addClass('wrong-clicked-cell');
        }
        td=null;
    })
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
