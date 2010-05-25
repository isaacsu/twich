HOST = null; // localhost
PORT = 8001;
    
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

var log = function(msg) { sys.puts(ts.timeStamp() + " " + msg); }

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
                log("msg <" + room + "/" + nick + "> " + text);
            break;
            case "join":
                log("joi <" + room + "/" + nick + ">");
            break;
            case "part":
                log("lef <" + room + "/" + nick + ">");
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

var SimpleJSONP = function (code, obj, res,req) {
    var body = JSON.stringify(obj);
    var jpf = qs.parse(url.parse(req.url).query).jp;
    body = jpf + '(' + body + ');';
    
    res.writeHead(code, { "Content-Type": "text/json"
                      , "Content-Length": body.length
                      });
    res.end(body);
}

http.createServer(new Sherpa.interfaces.NodeJs([
    ['/', function (req,res) { 
        if (req.headers['referer']) {
            log(req.connection.remoteAddress + " / " + req.headers['referer']);
        } 
        else {
            log(req.connection.remoteAddress + " /");
        }
        res.writeHead(307, {'Location':'http://' + req.headers['host'] + '/default'});
        res.end();
        
    }],

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
        SimpleJSONP(200, { nicks: nicks },res, req);
    }],

    ["/join", function (req, res) {
        var nick = qs.parse(url.parse(req.url).query).nick;
        var room = qs.parse(url.parse(req.url).query).room;

        log('ajo <' + room + '/' + nick + '>');

        if (nick == null || nick.length == 0) {
            log('bad nick');
            SimpleJSONP(200, {error: "Bad nick."},res,req);
            return;
        }

        if (room== null || room.length == 0) {
            log('bad room');
            SimpleJSONP(200, {error: "Bad room."},res,req);
            return;
        }

        var session = createSession(nick,room);
        if (session == null) {
            log('nick in use');
            SimpleJSON(200, {error: "Nick in use"},res,req);
            return;
        }

        channel.appendMessage(session.nick, session.room, "join");
        SimpleJSONP(200, { id: session.id, nick: session.nick},res,req);
    }],

    ["/part", function (req, res) {
        var id = qs.parse(url.parse(req.url).query).id;
        var session;
        if (id && sessions[id]) {
            session = sessions[id];
            session.destroy();
        }
        SimpleJSONP(200, { },res,req);
    }],

    ["/recv", function (req, res) {
        if (!qs.parse(url.parse(req.url).query).since) {
            SimpleJSONP(200, { error: "Must supply since parameter" },res,req);
            return;
        }

        var id = qs.parse(url.parse(req.url).query).id;
        var session;
        var room = qs.parse(url.parse(req.url).query).room;
        if (id && sessions[id]) {
            session = sessions[id];
            session.poke();
            log('png <' + room + '/' + session.nick + '>');
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
            SimpleJSONP(200, { messages: matching},res,req);
        });
    }],

    ["/send", function (req, res) {
        var id = qs.parse(url.parse(req.url).query).id;
        var text = qs.parse(url.parse(req.url).query).text;
        var room = qs.parse(url.parse(req.url).query).room;

        var session = sessions[id];
        if (!session || !text) {
            SimpleJSONP(200, { error: "No such session id" },res,req);
            return; 
        }

        session.poke();

        channel.appendMessage(session.nick,room, "msg", text);
        SimpleJSONP(200, {},res,req);
    }],

    ["/:room", {matchesWith: {room: /^(?!entry|send|recv|part|join|who).*$/}}, function (req, res) {

        if (req.headers['referer']) {
            log(req.connection.remoteAddress + " /" + req.sherpaResponse.params['room'] + ' ' + req.headers['referer']);
        } else {
            log(req.connection.remoteAddress + " /" + req.sherpaResponse.params['room']);
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

log("Server running on port " + PORT);
