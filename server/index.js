/**
 * Created by Solari on 21.04.2015.
 */
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
 
var connectedUsers = [];
var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var mysql = require("mysql");
var dbConn = mysql.createConnection({host: 'localhost', user : 'alexsolari', 
    password : '', database : 'ultrachat'});


var Messages = function() {
    this.tableName = 'messages';
    this.Add = function(row)
    {
        dbConn.query("INSERT INTO ?? SET ?", [this.tableName, row], function(err, result)
        {
            //console.log(err);
            //console.log(result);
        });
    }
}
var Users = function()
{
    this.tableName = 'users';
    this.isUserExist = function(row, socket) {
        var q = dbConn.query("SELECT * FROM ?? WHERE ?", [this.tableName, row], function(err, result)
        {
            //console.log(err);
            //console.log(result);
            //console.log(result.length == 0);
            socket.emit("loginValidation", result.length == 0 );
        });
        console.log(q.sql);
    }
    this.isUserDataCorrect = function(row, socket) {
        var q = dbConn.query("SELECT * FROM ?? WHERE login = ? AND pass = ?", [this.tableName, row.login, row.pass], function(err, result)
        {
            //console.log(err);
            //console.log(result);
            //console.log(result.length == 0);
            socket.emit("signInResult", result.length == 1 );
        });
        //console.log(q.sql);
    }
    this.addUser = function(row)
    {
        dbConn.query("INSERT INTO ?? SET ?", [this.tableName, row], function(err, result)
        {
            //console.log(err);
            //console.log(result);
        });
    }
    this.deleteUser = function(user)
    {
        var whereObj;
        if (typeof user == 'number')
            whereObj = {id : user};
        else
            whereObj = {login : user};
        dbConn.query("DELETE FROM ?? WHERE ?", [this.tableName, whereObj], function(err, result)
        {
            //console.log(err);
            //console.log(result);
        });
    }
}
var tmp = new Users();
var temp = new Messages();

app.listen(process.env.PORT);

function handler (req, res) {
  var url = '';
  if (req.url == '/') url = '/index.html';
  else url = req.url;
  fs.readFile('../client'+url,
  function (err, data) {
    if (err) {
      fs.readFile('../client/404.html', function(err, data2) {
          res.writeHead(200);
          return res.end(data2);
      });
      return;
    }

    res.writeHead(200);
    res.end(data);
  });
}
io.on("connection", function(socket){   
    var username = ""
    socket.on("succesfullyConnected", function(login){
        var container = {
            text : login + " connected.",
            login : "SERVER"
        };
        console.log(new Date().toLocaleTimeString() + " "+login+" connected");
        temp.Add({userFrom:container.login, message:container.text});
        io.emit("msg", container);
        socket.emit("sendConnectedUsers", connectedUsers);
        io.emit("userConnected", login);
        username = login;
        connectedUsers.push(username);
    });
    socket.on("send", function(container){
        console.log(new Date().toLocaleTimeString() + " " + container.login + " : " + container.text);
        temp.Add({userFrom:container.login, message:container.text});
        io.emit("msg", container);
    });
    socket.on('disconnect', function(){
        
        console.log(new Date().toLocaleTimeString() + " "+username+" disconnected");
        io.emit("userDisconnected", username);
        connectedUsers.remove(username);
    });
    socket.on("validateLogin", function(data) { tmp.isUserExist(data, socket); });
    socket.on("signInRequest", function(data) { tmp.isUserDataCorrect(data, socket); });
    socket.on("addUsetToDB", function(userdata) {
        tmp.addUser(userdata);
    });
});
