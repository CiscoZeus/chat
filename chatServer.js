
// Author: Sergio Castaño Arteaga
// Email: sergio.castano.arteaga@gmail.com

// ***************************************************************************
// General
// ***************************************************************************

var conf = {
    port: 8889,
    debug: false,
    dbPort: 6379,
    dbHost: '127.0.0.1',
    dbOptions: {},
    mainroom: 'MainRoom'
};

// External dependencies
var express = require('express'),
    http = require('http'),
    events = require('events'),
    _ = require('underscore'),
    sanitize = require('validator').sanitize;
var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream('/var/log/chatserver.log', {flags : 'w'});
// HTTP Server configuration & launch
var app = express(),
    server = http.createServer(app);
    server.listen(conf.port);
var totalUsers = 0;
var totalRooms = 0;
// Express app configuration
app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/static'));
});

var io = require('socket.io')(server);
var redis = require('socket.io-redis');
io.adapter(redis({ host: conf.dbHost, port: conf.dbPort }));

var db = require('redis').createClient(conf.dbPort,conf.dbHost);

// Logger configuration
var logger = new events.EventEmitter();
logger.on('newEvent', function(event, data) {
    // Console log
    var date = new Date();
    data["time"] = date.toISOString() + " UTC"
    data["event"] = event
    outstr = JSON.stringify(data);
    console.log('%s', outstr);
    log_file.write(outstr + '\n');
});

// ***************************************************************************
// Express routes helpers
// ***************************************************************************

// Only authenticated users should be able to use protected methods
var requireAuthentication = function(req, res, next) {
    // TODO
    next();
};

// Sanitize message to avoid security problems
var sanitizeMessage = function(req, res, next) {
    if (req.body.msg) {
        req.sanitizedMessage = sanitize(req.body.msg).xss();
        next();
    } else {
        res.send(400, "No message provided");
    }
};

// Send a message to all active rooms
var sendBroadcast = function(text) {
    _.each(io.nsps['/'].adapter.rooms, function(room) {
        if (room) {
            var message = {'room':room, 'username':'ServerBot', 'msg':text, 'date':new Date()};
            io.to(room).emit('newMessage', message);
        }
    });
    logger.emit('newEvent', 'newBroadcastMessage', {'room':room, 'username':'ServerBot', 'msg':text});
};

// ***************************************************************************
// Express routes
// ***************************************************************************

// Welcome message
app.get('/', function(req, res) {
    res.send(200, "Welcome to chat server");
});

// Broadcast message to all connected users
app.post('/api/broadcast/', requireAuthentication, sanitizeMessage, function(req, res) {
    sendBroadcast(req.sanitizedMessage);
    res.send(201, "Message sent to all rooms");
}); 
var usernames = [
  "Sudie",
  "Drusilla",
  "Marylee",
  "Jordan",
  "Tania",
  "Laquita",
  "Tiffiny",
  "Anibal",
  "Emma",
  "Geraldo",
  "Stacy",
  "Myesha",
  "Caridad",
  "Sharonda",
  "Tobi",
  "Hans",
  "Sara",
  "Erick",
  "Howard",
  "Marion",
  "Garfield",
  "Kevin",
  "Kimbra",
  "Meryl",
  "Oretha",
  "Melodie",
  "Elia",
  "Hang",
  "Georgene",
  "Gale"
]
// ***************************************************************************
// Socket.io events
// ***************************************************************************

io.sockets.on('connection', function(socket) {

    // Welcome message on connection
    socket.emit('connected', 'Welcome to the chat server');
    totalUsers += 1;
    logger.emit('newEvent', 'userConnected', {'socket':socket.id, 'client_address': socket.request.connection.remoteAddress, 'client_port': socket.request.connection.remotePort, 'totalUsers': totalUsers});

    // Store user data in db
    db.hset([socket.id, 'connectionDate', new Date()], redis.print);
    db.hset([socket.id, 'socketID', socket.id], redis.print);
    username = usernames[Math.floor(Math.random() * usernames.length)]
    db.hset([socket.id, 'username', username], redis.print);

    // Join user to 'MainRoom'
    socket.join(conf.mainroom);
    logger.emit('newEvent', 'userJoinsRoom', {'socket':socket.id, 'room':conf.mainroom, 'client_address': socket.request.connection.remoteAddress, 'client_port': socket.request.connection.remotePort, 'totalUsers': totalUsers});
    // Confirm subscription to user
    socket.emit('subscriptionConfirmed', {'room':conf.mainroom});
    // Notify subscription to all users in room
    var data = {'room':conf.mainroom, 'username':username, 'msg':'----- Joined the room -----', 'id':socket.id};
    io.to(conf.mainroom).emit('userJoinsRoom', data);

    // User wants to subscribe to [data.rooms]
    socket.on('subscribe', function(data) {
        // Get user info from db
        db.hget([socket.id, 'username'], function(err, username) {

            // Subscribe user to chosen rooms
            _.each(data.rooms, function(room) {
                room = room.replace(" ","");
                socket.join(room);
                logger.emit('newEvent', 'userJoinsRoom', {'socket':socket.id, 'username':username, 'room':room, 'client_address': socket.request.connection.remoteAddress, 'client_port': socket.request.connection.remotePort, 'totalRooms': data.rooms.length, 'totalUsers': totalUsers});

                // Confirm subscription to user
                socket.emit('subscriptionConfirmed', {'room': room});
        
                // Notify subscription to all users in room
                var message = {'room':room, 'username':username, 'msg':'----- Joined the room -----', 'id':socket.id};
                io.to(room).emit('userJoinsRoom', message);
            });
        });
    });

    // User wants to unsubscribe from [data.rooms]
    socket.on('unsubscribe', function(data) {
        // Get user info from db
        db.hget([socket.id, 'username'], function(err, username) {
        
            // Unsubscribe user from chosen rooms
            _.each(data.rooms, function(room) {
                if (room != conf.mainroom) {
                    socket.leave(room);
                    logger.emit('newEvent', 'userLeavesRoom', {'socket':socket.id, 'username':username, 'room':room, 'client_address': socket.request.connection.remoteAddress, 'client_port': socket.request.connection.remotePort, 'totalRooms': data.rooms.length, 'totalUsers': totalUsers});
                
                    // Confirm unsubscription to user
                    socket.emit('unsubscriptionConfirmed', {'room': room});
        
                    // Notify unsubscription to all users in room
                    var message = {'room':room, 'username':username, 'msg':'----- Left the room -----', 'id': socket.id};
                    io.to(room).emit('userLeavesRoom', message);
                }
            });
        });
    });

    // User wants to know what rooms he has joined
    socket.on('getRooms', function(data) {
        socket.emit('roomsReceived', socket.rooms);
        logger.emit('newEvent', 'userGetsRooms', {'socket':socket.id, 'client_address': socket.request.connection.remoteAddress, 'client_port': socket.request.connection.remotePort});
    });

    // Get users in given room
    socket.on('getUsersInRoom', function(data) {
        var usersInRoom = [];
        var socketsInRoom = _.keys(io.nsps['/'].adapter.rooms[data.room]);
        for (var i=0; i<socketsInRoom.length; i++) {
            db.hgetall(socketsInRoom[i], function(err, obj) {
                usersInRoom.push({'room':data.room, 'username':obj.username, 'id':obj.socketID});
                // When we've finished with the last one, notify user
                if (usersInRoom.length == socketsInRoom.length) {
                    socket.emit('usersInRoom', {'users':usersInRoom});
                }
            });
        }
    });

    // User wants to change his nickname
    socket.on('setNickname', function(data) {
        // Get user info from db
        db.hget([socket.id, 'username'], function(err, username) {

            // Store user data in db
            db.hset([socket.id, 'username', data.username], redis.print);
            logger.emit('newEvent', 'userSetsNickname', {'socket':socket.id, 'oldUsername':username, 'newUsername':data.username, 'client_address': socket.request.connection.remoteAddress, 'client_port': socket.request.connection.remotePort});

            // Notify all users who belong to the same rooms that this one
            _.each(socket.rooms, function(room) {
                if (room) {
                    var info = {'room':room, 'oldUsername':username, 'newUsername':data.username, 'id':socket.id};
                    io.to(room).emit('userNicknameUpdated', info);
                }
            });
        });
    });

    // New message sent to group
    socket.on('newMessage', function(data) {
        db.hgetall(socket.id, function(err, obj) {
            if (err) return logger.emit('newEvent', 'error', err);
            // Check if user is subscribed to room before sending his message
            if (_.contains(_.values(socket.rooms), data.room)) {
                var message = {'room':data.room, 'username':obj.username, 'msg':data.msg, 'date':new Date(), 'client_address': socket.request.connection.remoteAddress, 'client_port': socket.request.connection.remotePort, 'totalUsers': totalUsers};
                // Send message to room
                io.to(data.room).emit('newMessage', message);
                logger.emit('newEvent', 'newMessage', message);
            }
        });
    });

    // Clean up on disconnect
    socket.on('disconnect', function() {
        
        // Get current rooms of user
        var rooms = socket.rooms;
        
        // Get user info from db
        db.hgetall(socket.id, function(err, obj) {
            if (err) return logger.emit('newEvent', 'error', err);
            totalUsers -= 1;
            logger.emit('newEvent', 'userDisconnected', {'socket':socket.id, 'username':obj.username, 'client_address': socket.request.connection.remoteAddress, 'client_port': socket.request.connection.remotePort, 'totalUsers': totalUsers});

            // Notify all users who belong to the same rooms that this one
            _.each(rooms, function(room) {
                if (room) {
                    var message = {'room':room, 'username':obj.username, 'msg':'----- Left the room -----', 'id':obj.socketID};
                    io.to(room).emit('userLeavesRoom', message);
                }
            });
        });
    
        // Delete user from db
        db.del(socket.id, redis.print);
    });
});

// Automatic message generation (for testing purposes)
if (conf.debug) {
    setInterval(function() {
        var text = 'Testing rooms';
        sendBroadcast(text);
    }, 60000);
}

