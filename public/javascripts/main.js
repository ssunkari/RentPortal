$(function () {
    //Connect to server
    var socket = io();
    // Sets the client's username
    // Tell the server your username
    var user = $('.user').html();
    //initially emit New user added

    var $chatPanel = $('.chat-panel .panel-body');

    socket.on('message', function (message) {
        //Test connection
    });
    var $window = $(window);
    var $messages = $('.chat'); //Chat Area
    var $userInput = $('#btn-input'); // Input message input box
    var $currentInput = $userInput.focus();
    var username;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var TYPING_TIMER_LENGTH = 400; // ms
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var userSettings = {
        "Srinu": {
            "icon": "http://placehold.it/50/55C1E7/fff",
            "position": "left"

        },
        "Vikram": {
            "icon": "http://placehold.it/50/FA6F57/fff",
            "position": "right"

        }
    }
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];
    socket.emit('add user', user);
    username = user;
    connected = true;

    //Listen for newly added users and render
    socket.on('user joined', function (data) {
        connected = true;
        appendMessageToChatArea(data.username, 'Has joined');
    });

    //listen for start typing events
    $userInput.on('input', function () {
        updateTyping();
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
        addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
        removeChatTyping(data);
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
        addChatMessage(data);
    });

    // Keyboard events
    $window.keydown(function (event) {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                sendMessage();
                socket.emit('stop typing');
                typing = false;
            } else {
                alert('In Set username');
                setUsername();
            }
        }
    });

    $('#btn-chat').click(function () {
        if (username) {
            sendMessage();
            socket.emit('stop typing');
            typing = false;
        } else {
            setUsername();
        }
    });

    // Sets the client's username
    function setUsername() {
        username = user;

        // If the username is valid
        if (username) {
            $currentInput = $userInput.focus();

            // Tell the server your username
            socket.emit('add user', username);
        }
    }

    // Prevents input from having injected markup
    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }

    // Sends a chat message
    function sendMessage() {
        var message = $userInput.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) {
            $userInput.val('');
            addChatMessage({
                username: username,
                message: message
            });
            // tell server to execute 'new message' and send along one parameter
            socket.emit('new message', message);
        }
    }

    function appendMessageToChatArea(username, message) {
        $messages.append("<li class='left clearfix'> <span class='chat-img pull-left' > <img src='http://placehold.it/50/55C1E7/fff' alt='User Avatar'  class='img-circle' / > </span> <div class='chat-body clearfix' > <div class='header' > <strong class='primary-font'> " + username + " </strong > <small class='pull-right text-muted'> <i class='fa fa-clock-o fa-fw'> </i> 12 mins ago </small > </div > <p> " + message + " </p> </div> </li>")
            //Scroll to Bottom of the Chat, as and when messages are updated
        $chatPanel[0].scrollTop = $chatPanel[0].scrollHeight;
    };

    // Updates the typing event
    function updateTyping() {
        if (connected) {
            if (!typing) {
                typing = true;
                socket.emit('typing');
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(function () {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('stop typing');
                    typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    }

    // Adds the visual chat typing message
    function addChatTyping(data) {
        data.typing = true;
        data.message = 'is typing';
        addChatMessage(data);
    }

    // Adds the visual chat message to the message list
    function addChatMessage(data, options) {
        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        var $usernameDiv = $('<span class="username"/>')
            .text(data.username)
            .css('color', getUsernameColor(data.username));
        var $messageBodyDiv = $('<span class="messageBody">')
            .text(data.message);

        var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
            .data('username', data.username)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv);

        var $msgbody = $('<span class="chat-img pull-left" >')
            .append('<img src="http://placehold.it/50/55C1E7/fff" ' + 'alt = "User Avatar" ' + 'class = "img-circle" /> ')

        var $listDiv = $('<li>')
            .data('username', data.username)
            .addClass(userSettings[data.username.trim()].position + ' message clearfix')
            .addClass(typingClass)
            .append('<span class="chat-img pull-' + userSettings[data.username.trim()].position + '" ><img src="' + userSettings[data.username.trim()].icon + '" alt = "User Avatar" class="img-circle" /></span><div class="chat-body clearfix" > <div class="header" > <strong class="primary-font"> <span class="username">' + data.username + '</span></strong > <small class="pull-right text-muted"> <i class="fa fa-clock-o fa-fw"> ' + '</i> 12 mins ago </small > </div ><p> <span class="messageBody">' + cleanInput(data.message) + ' </span></p > </div>');

        addMessageElement($listDiv, options);
    }

    function addMessageElement(el, options) {
        var $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $chatPanel[0].scrollTop = $chatPanel[0].scrollHeight;
    }

    // Gets the 'X is typing' messages of a user
    function getTypingMessages(data) {
        return $('.typing.message').filter(function (i) {
            return $(this).data('username') === data.username;
        });
    }

    // Removes the visual chat typing message
    function removeChatTyping(data) {
        getTypingMessages(data).fadeOut(function () {
            $(this).remove();
        });
    }

    // Gets the color of a username through our hash function
    function getUsernameColor(username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

});