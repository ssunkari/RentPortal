module.exports = function (io) {
    var numUsers = 0;
    io.sockets.on('connection', function (socket) {
        var addedUser = false;
        //socket.emit('message', 'You are connected!');
        // When the server receives a “user added” type signal from the client
        socket.on('add user', function (username) {
            if (addedUser) {
                return;
            }
            socket.username = username;
            addedUser = true;
            ++numUsers;
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', {
                username: socket.username,
                numUsers: numUsers
            });
        });
    });
};