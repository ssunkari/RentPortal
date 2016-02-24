$(function () {
    //Connect to server
    var socket = io();
    // Sets the client's username
    // Tell the server your username
    var user = $('.user').html();
    //initially emit New user added
    socket.emit('add user', user);

    var $chatPanel = $('.chat-panel .panel-body');

    socket.on('message', function (message) {
        //Test connection
    });

    //Listen for newly added users and render
    socket.on('user joined', function (data) {
        appendMessageToChatArea(data.username + 'has joined');
    });

    var $messages = $('.chat');
    // appendMessageToChatArea(user);

    function appendMessageToChatArea(message) {
        $messages.append("<li class='left clearfix'> <span class='chat-img pull-left' > <img src='http://placehold.it/50/55C1E7/fff' alt='User Avatar'  class='img-circle' / > </span> <div class='chat-body clearfix' > <div class='header' > <strong class='primary-font'> " + message + " </strong > <small class='pull-right text-muted'> <i class='fa fa-clock-o fa-fw'> </i> 12 mins ago </small > </div > <p> Has joined </p> </div> </li>")
            //Scroll to Bottom of the Chat, as and when messages are updated
        $chatPanel[0].scrollTop = $chatPanel[0].scrollHeight;
    };

});