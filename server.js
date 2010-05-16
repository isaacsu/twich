HOST = null; // localhost
PORT = 80;

require ('./lib/sherpa');
var fu = require("./lib/fu"),
    sys = require("sys"),
    url = require("url"),
    http = require("http"),
    qs = require("querystring"),
    template = require("./lib/template");


var MESSAGE_BACKLOG = 200,
    SESSION_TIMEOUT = 60 * 1000;

var channel = new function () {
    var messages = [],
        callbacks = [];

    this.appendMessage = function (nick, room, type, text) {
        var m = { nick: nick
            , type: type // "msg", "join", "part"
                , text: text
                , room: room
                , timestamp: (new Date()).getTime()
        };

        switch (type) {
            case "msg":
                sys.puts("<" + nick + "> in " + room + " " + text);
            break;
            case "join":
                sys.puts(nick + " joined " + room);
            break;
            case "part":
                sys.puts(nick + " left " + room);
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
    sys.puts('tried this');
    var body = JSON.stringify(obj);
    res.writeHead(code, { "Content-Type": "text/json"
                      , "Content-Length": body.length
                      });
    res.end(body);
}

http.createServer(new Sherpa.interfaces.NodeJs([
    //['/', fu.staticHandler('index.html')],
    ['/', function (req,res) { 
        res.writeHead(307, {'Location':'http://twich.me/default'});
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
        sys.puts('join attempt');
        var nick = qs.parse(url.parse(req.url).query).nick;
        var room = qs.parse(url.parse(req.url).query).room;

        if (nick == null || nick.length == 0) {
            sys.puts('bad nick');
            SimpleJSON(400, {error: "Bad nick."},res);
        return;
        }

        if (room== null || room.length == 0) {
            sys.puts('bad room');
            SimpleJSON(400, {error: "Bad room."},res);
        return;
        }

        var session = createSession(nick,room);
        if (session == null) {
            sys.puts('nick in use');
            SimpleJSON(400, {error: "Nick in use"},res);
        return;
        }

        //sys.puts("connection: " + nick + "@" + res.connection.remoteAddress);

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
            SimpleJSON(400, { error: "Must supply since parameter" },res);
            return;
        }

        var id = qs.parse(url.parse(req.url).query).id;
        var session;
        var room = qs.parse(url.parse(req.url).query).room;
        if (id && sessions[id]) {
        session = sessions[id];
        session.poke();
        sys.puts (session.nick + " asked for messages in " + room);
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
            SimpleJSON(400, { error: "No such session id" },res);
            return; 
        }

        session.poke();

        channel.appendMessage(session.nick,room, "msg", text);
        SimpleJSON(200, {},res);
    }],

    ["/:room", {matchesWith: {room: /^(?!client.js|jquery-1.2.6.min.js|style.css|entry|send|recv|part|join|who).*$/}}, function (req, res) {
        sys.puts(':rooms ' + req.sherpaResponse.params['room']);
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

sys.puts("Server running on port " + PORT);



/*
fu.listen(PORT, HOST);


fu.get("/", fu.staticHandler("index.html"));
fu.get("/style.css", fu.staticHandler("style.css"));
fu.get("/client.js", fu.staticHandler("client.js"));
fu.get("/jquery-1.2.6.min.js", fu.staticHandler("jquery-1.2.6.min.js"));

fu.get("/entry", function (req, res) {
        // r = room
        var r = qs.parse(url.parse(req.url).query).r;
        var room;
        res.writeHead(200, {'Content-Type': 'text/html'});

        if (r == undefined || r == '') room = 'default'
        else room = r;

        var tmpl = template.create(require('fs').readFileSync('index.tmpl.html'),{room:room});
        res.end(tmpl);
        });


fu.get("/who", function (req, res) {
        var nicks = [];
        var room = qs.parse(url.parse(req.url).query).room;
        for (var id in sessions) {
        if (!sessions.hasOwnProperty(id)) continue;
        if (session.room == room) {
        var session = sessions[id];
        nicks.push(session.nick);
        }
        }
        res.SimpleJSON(200, { nicks: nicks });
        });

fu.get("/join", function (req, res) {
        var nick = qs.parse(url.parse(req.url).query).nick;
        var room = qs.parse(url.parse(req.url).query).room;
        if (nick == null || nick.length == 0) {
        res.SimpleJSON(400, {error: "Bad nick."});
        return;
        }
        if (room== null || room.length == 0) {
        res.SimpleJSON(400, {error: "Bad room."});
        return;
        }

        var session = createSession(nick,room);
        if (session == null) {
        res.SimpleJSON(400, {error: "Nick in use"});
        return;
        }

        //sys.puts("connection: " + nick + "@" + res.connection.remoteAddress);

        channel.appendMessage(session.nick, session.room, "join");
        res.SimpleJSON(200, { id: session.id, nick: session.nick});
});

fu.get("/part", function (req, res) {
        var id = qs.parse(url.parse(req.url).query).id;
        var session;
        if (id && sessions[id]) {
        session = sessions[id];
        session.destroy();
        }
        res.SimpleJSON(200, { });
        });

fu.get("/recv", function (req, res) {
        if (!qs.parse(url.parse(req.url).query).since) {
        res.SimpleJSON(400, { error: "Must supply since parameter" });
        return;
        }

        var id = qs.parse(url.parse(req.url).query).id;
        var session;
        var room = qs.parse(url.parse(req.url).query).room;
        if (id && sessions[id]) {
        session = sessions[id];
        session.poke();
        sys.puts (session.nick + " asked for messages in " + room);
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
            res.SimpleJSON(200, { messages: matching});
            });
});

fu.get("/send", function (req, res) {
        var id = qs.parse(url.parse(req.url).query).id;
        var text = qs.parse(url.parse(req.url).query).text;
        var room = qs.parse(url.parse(req.url).query).room;

        var session = sessions[id];
        if (!session || !text) {
        res.SimpleJSON(400, { error: "No such session id" });
        return; 
        }

        session.poke();

        channel.appendMessage(session.nick,room, "msg", text);
        res.SimpleJSON(200, {});
        });
*/
