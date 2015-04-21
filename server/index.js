/**
 * Created by Solari on 21.04.2015.
 */
var io = require('socket.io')(80);
io.on("connection", function(socket){
    var username = "";
    socket.on("succesfullyConnected", function(login){
        var container = {
            text : login + " connected.",
            login : "SERVER: "
        };
        io.emit("msg", container);
        io.emit("userConnected", login);
        username = login;
    });
    socket.on("send", function(container){
        io.emit("msg", container);
    });
    socket.on('disconnect', function(){
        io.emit("userDisconnected", username);
    });
});
