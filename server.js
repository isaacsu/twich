HOST = null; // localhost
PORT = 80;

    
var MESSAGE_BACKLOG = 200,
    SESSION_TIMEOUT = 60 * 1000;

var fu = require("./lib/fu"),
    ts = require("./lib/timestamp"),
    sys = require("sys"),
    url = require("url"),
    http = require("http"),
    qs = require("querystring"),
    template = require("./lib/template");

    require ('./lib/sherpa');

var log = function(msg) { sys.puts(ts.timeStamp() + msg); }

var channel = new function() {
    var messages = [],
        callbacks = [];

    this.appendMessage = function (nick, room, type, text) {
        var m = { 
                  nick: nick
                , type: type // "msg", "join", "part"
                , text: text
                , room: room
                , timestamp: (new Date()).getTime()
        };

        switch (type) {
            case "msg":
                log(" <" + nick + "> in " + room + " " + text);
            break;
            case "join":
                log(" " + nick + " joined " + room);
            break;
            case "part":
                log(" " + nick + " left " + room);
            break;
        }

        messages.push( m );

        while (callbacks.length > 0) {
            callbacks.shift().callback([m]);
        }

        while (messages.length > MESSAGE_BACKLOG)
            messages.shift();
    };

    this.query = function (room, since, callback) {
        var matching = [];
        for (var i = 0; i < messages.length; i++) {
            var message = messages[i];
            if (message.timestamp > since && room == message.room) {
                matching.push(message)
            }
        }

        if (matching.length != 0) {
            callback(matching);
        } else {
            callbacks.push({ timestamp: new Date(), callback: callback });
        }
    };

        // clear old callbacks
        // they can hang around for at most 30 seconds.
        setInterval(function () {
            var now = new Date();
            while (callbacks.length > 0 && now - callbacks[0].timestamp > 30*1000) {
                callbacks.shift().callback([]);
            }
        }, 3000);
};

var sessions = {};

function createSession (nick, room) {
    if (nick.length > 50) return null;
    if (/[^\w_\-^!]/.exec(nick)) return null;

    for (var i in sessions) {
        var session = sessions[i];
        if (session && session.nick === nick && session.room === room) return null;
    }

    var session = { 
        nick: nick, 
        room: room, 
        id: Math.floor(Math.random()*99999999999).toString(),
        timestamp: new Date(),

        poke: function () {
            session.timestamp = new Date();
        },

        destroy: function () {
            channel.appendMessage(session.nick,session.room, "part");
            delete sessions[session.id];
        }
    };

    sessions[session.id] = session;
    return session;
}

// interval to kill off old sessions
setInterval(function () {
    var now = new Date();
    for (var id in sessions) {
        if (!sessions.hasOwnProperty(id)) continue;
        var session = sessions[id];

        if (now - session.timestamp > SESSION_TIMEOUT) {
            session.destroy();
        }
    }
}, 1000);
var SimpleJSON = function (code, obj, res) {
    var body = JSON.stringify(obj);
    log(body);
    res.writeHead(code, { "Content-Type": "text/json"
                      , "Content-Length": body.length
                      });
    res.end(body);
}


http.createServer(new Sherpa.interfaces.NodeJs([
    ['/', function (req,res) { 
    if (req.headers['referer']) {
    	log(" Hello " + req.connection.remoteAddress + " " + req.headers['referer']);
    } else {
    	log(" " + req.connection.remoteAddress);
    }
        res.writeHead(307, {'Location':'http://' + req.headers['host'] + '/default'});
        res.end();
    
    }],
    ["/style.css", fu.staticHandler("style.css")],
    ["/client.js", fu.staticHandler("client.js")],
    ["/jquery-1.2.6.min.js", fu.staticHandler("jquery-1.2.6.min.js")],

    ["/entry", function (req, res) {
        // r = room
        var r = qs.parse(url.parse(req.url).query).r;
        var room;
        res.writeHead(200, {'Content-Type': 'text/html'});

        if (r == undefined || r == '') room = 'default'
        else room = r;

        var tmpl = template.create(require('fs').readFileSync('index.tmpl.html'),{room:room});
        res.end(tmpl);
    }],

    ["/who", function (req, res) {
        var nicks = [];
        var room = qs.parse(url.parse(req.url).query).room;
        for (var id in sessions) {
        if (!sessions.hasOwnProperty(id)) continue;
        if (session.room == room) {
        var session = sessions[id];
        nicks.push(session.nick);
        }
        }
        SimpleJSON(200, { nicks: nicks },res);
    }],

    ["/join", function (req, res) {
        var nick = qs.parse(url.parse(req.url).query).nick;
        var room = qs.parse(url.parse(req.url).query).room;

        log(" " + nick + ' attempts to join ' + room);

        if (nick == null || nick.length == 0) {
            log(" " + 'bad nick');
            SimpleJSON(200, {error: "Bad nick."},res);
        return;
        }

        if (room== null || room.length == 0) {
            log(" " + 'bad room');
            SimpleJSON(200, {error: "Bad room."},res);
        return;
        }

        var session = createSession(nick,room);
        if (session == null) {
            log(" " + 'nick in use');
            SimpleJSON(200, {error: "Nick in use"},res);
        return;
        }

       log(" connection: " + nick + "@" + res.connection.remoteAddress);

        channel.appendMessage(session.nick, session.room, "join");
        SimpleJSON(200, { id: session.id, nick: session.nick},res);
    }],

    ["/part", function (req, res) {
        var id = qs.parse(url.parse(req.url).query).id;
        var session;
        if (id && sessions[id]) {
        session = sessions[id];
        session.destroy();
        }
        SimpleJSON(200, { },res);
    }],

    ["/recv", function (req, res) {
        if (!qs.parse(url.parse(req.url).query).since) {
            SimpleJSON(200, { error: "Must supply since parameter" },res);
            return;
        }

        var id = qs.parse(url.parse(req.url).query).id;
        var session;
        var room = qs.parse(url.parse(req.url).query).room;
        if (id && sessions[id]) {
        session = sessions[id];
        session.poke();
        log(' ' + session.nick + " asked for messages in " + room);
        }

        var since = parseInt(qs.parse(url.parse(req.url).query).since, 10);

        channel.query(room, since, function (messages) {
            if (session) session.poke();
            var matching = [];

            for (var i = 0; i < messages.length; i++) {
            var message = messages[i];
            if (message.room == room) {
            matching.push(message)
            }
            }
            SimpleJSON(200, { messages: matching},res);
        });
    }],

    ["/send", function (req, res) {
        var id = qs.parse(url.parse(req.url).query).id;
        var text = qs.parse(url.parse(req.url).query).text;
        var room = qs.parse(url.parse(req.url).query).room;

        var session = sessions[id];
        if (!session || !text) {
            SimpleJSON(200, { error: "No such session id" },res);
            return; 
        }

        session.poke();

        channel.appendMessage(session.nick,room, "msg", text);
        SimpleJSON(200, {},res);
    }],

    ["/:room", {matchesWith: {room: /^(?!favicon.ico|client.js|jquery-1.2.6.min.js|style.css|entry|send|recv|part|join|who).*$/}}, function (req, res) {

        if (req.headers['referer']) {
            log(" :room " + req.sherpaResponse.params['room'] + ' ' + req.connection.remoteAddress + " " + req.headers['referer']);
        } else {
            log(" :room " + req.sherpaResponse.params['room'] + ' ' + req.connection.remoteAddress);
        }

        // r = room
        var r = req.sherpaResponse.params['room'];
        var room;
        res.writeHead(200, {'Content-Type': 'text/html'});

        if (r == undefined || r == '') room = 'default'
        else room = r;

        var tmpl = template.create(require('fs').readFileSync('index.tmpl.html'),{room:room});
        res.end(tmpl);
        /*
        res.sendHeader(200, {'Content-Type':'text/plain'});
        res.sendBody('Hello ' + req.sherpaResponse.params['room']);
        res.finish();
        */
    }]


]).listener()).listen(PORT);

log(" Server running on port " + PORT);
