/* functions for general use */
/* returns value associated with whichParam on the URL */
function getURLParameters(whichParam)
{
    var pageURL = window.location.search.substring(1);
    var pageURLVariables = pageURL.split('&');
    for(var i = 0; i < pageURLVariables.length; i++){
        var parameterName = pageURLVariables[i].split('=');
        if(parameterName[0] == whichParam){
            return parameterName[1];
        } 
    }
}

var username = getURLParameters('username');
if('undefined' == typeof username || !username){
    username = 'Anonymous_'+Math.random();
}

var chat_room = getURLParameters('game_id');
if('undefined' == typeof chat_room || !chat_room){
    chat_room = 'lobby';
}

/* connect to socket server */
var socket = io.connect();

/* when server sends me log msg */
socket.on('log',function(array){
    console.log.apply(console,array);
});

/* when server responds that someone joined room */
socket.on('join_room_response',function(payload){
if(payload.result == 'fail'){
    alert(payload.message);
    return;
}

/* if we joined room, ignore */
if(payload.socket_id == socket.id) {
    return;
}

/* if someone joined, add new row to lobby table */
var dom_elements = $('.socket_'+payload.socket_id);

/* if we don't have entry for person */
if(dom_elements.length == 0){
    var nodeA = $('<div></div>');
    nodeA.addClass('socket_'+payload.socket_id);
    var nodeB = $('<div></div>');
    nodeB.addClass('socket_'+payload.socket_id);
    var nodeC = $('<div></div>');
    nodeC.addClass('socket_'+payload.socket_id);

    nodeA.addClass('w-100');
    nodeB.addClass('col-9 text-right');
    nodeB.append('<h4>'+payload.username+'</h4>');
    nodeC.addClass('col-3 text-left');
    var buttonC = makeInviteButton();
    nodeC.append(buttonC);

    nodeA.hide();
    nodeB.hide();
    nodeC.hide();
    $('#players').append(nodeA,nodeB,nodeC);
    nodeA.slideDown(1000);
    nodeB.slideDown(1000);
    nodeC.slideDown(1000);
}
else{
    var buttonC = makeInviteButton();
    $('.socket_'+payload.socket_id+' button').replaceWith(buttonC);
    dom_elements.slideDown(1000);
}

/* new player joined msg */
var newHTML = '<p>'+payload.username+' just entered the lobby</p>';
var newNode = $(newHTML);
newNode.hide();
$('#messages').append(newNode);
newNode.slideDown(1000);
});


/* when server responds that someone left room */
socket.on('player_disconnected',function(payload){
    if(payload.result == 'fail'){
        alert(payload.message);
        return;
    }
    
    /* if we left room, ignore */
    if(payload.socket_id == socket.id) {
        return;
    }
    
    /* if someone left, animate out their content */
    var dom_elements = $('.socket_'+payload.socket_id);
    
    /* if something exists */
    if(dom_elements.length != 0){
        dom_elements.slideUp(1000);
    }
    
    /* player left msg */
    var newHTML = '<p>'+payload.username+' has left the lobby</p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').append(newNode);
    newNode.slideDown(1000);
    });

socket.on('send_message_response',function(payload){
    if(payload.result == 'fail'){
        alert(payload.message);
        return;
    }
    $('#messages').append('<p><b>'+payload.username+' says:</b> '+payload.message+'</p>');
    });

function send_message(){
    var payload = {};
payload.room = chat_room;
payload.username = username;
payload.message = $('#send_message_holder').val();
console.log('*** Client Log Message: \'send_message\' payload: '+JSON.stringify(payload));
socket.emit('send_message',payload);
}

function makeInviteButton(){
    var newHTML = '<button type=\'button\' class =\'btn btn-outline-primary\'>Invite</button>';
    var newNode = $(newHTML);
    return(newNode);
}

$(function(){
var payload = {};
payload.room = chat_room;
payload.username = username;

console.log('*** Client Log Message: \'join_room\' payload: '+JSON.stringify(payload));
socket.emit('join_room',payload);
});