var 
    cfg  = require("./config").cfg(),
    ts   = require("./lib/timestamp"),
    sys  = require("sys"),
    url  = require("url"),
    http = require("http"),
    qs   = require("querystring"),
    ch   = require("./lib/channel").channel(cfg.msg_backlog, cfg.msg_truncate);

    require ('./lib/sherpa');
    require ('./lib/log');
    require ('./lib/simplejsonp');

    var sessions = {};
    ch.init();

function createSession (nick, room) {
    if (nick.length < 3 || nick.length > 20) return null;
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
            ch.appendMessage(session.nick,session.room, "part");
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

        if (now - session.timestamp > cfg.session_timeout) {
            session.destroy();
        }
    }
}, 1000);

http.createServer(new Sherpa.interfaces.NodeJs([
    ['/', 
        function (req,res) { 
            if (req.headers['referer']) {
                log(req.connection.remoteAddress + " / " + req.headers['referer']);
            } 
            else {
                log(req.connection.remoteAddress + " /");
            }
            res.writeHead(307, {'Location':'http://' + req.headers['host'] + '/default'});
            res.end();
        }
    ],

    ["/who", 
        function (req, res) {
            var nicks = [];
            var req_room = qs.parse(url.parse(req.url).query).room;
            var req_nick = qs.parse(url.parse(req.url).query).nick;
            for (var id in sessions) {
                if (!sessions.hasOwnProperty(id)) continue;
                var session = sessions[id];
                if (session.room != req_room) continue;
                nicks.push(session.nick);
            }

            log('who <' + req_room + '/' + req_nick + '> ' + nicks);
            SimpleJSONP(200, { nicks: nicks },res, req);
        }
    ],

    ["/join", 
        function (req, res) {
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
                SimpleJSONP(200, {error: "Nick in use"},res,req);
                return;
            }

            log('sjo <' + room + '/' + nick + '> ' + req.connection.remoteAddress);

            ch.appendMessage(session.nick, session.room, "join");
            SimpleJSONP(200, { id: session.id, nick: session.nick},res,req);
        }
    ],

    ["/part", 
        function (req, res) {
            var id = qs.parse(url.parse(req.url).query).id;
            var session;
            if (id && sessions[id]) {
                session = sessions[id];
                session.destroy();
            }
            SimpleJSONP(200, { },res,req);
        }
    ],

    ["/recv", 
        function (req, res) {
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

            ch.query(room, since, function (messages) {
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
        }
    ],

    ["/send", 
        function (req, res) {
            var id = qs.parse(url.parse(req.url).query).id;
            var text = qs.parse(url.parse(req.url).query).text;
            var room = qs.parse(url.parse(req.url).query).room;

            var session = sessions[id];
            if (!session || !text) {
                SimpleJSONP(200, { error: "No such session id" },res,req);
                return; 
            }

            session.poke();

            ch.appendMessage(session.nick,room, "msg", text);
            SimpleJSONP(200, {},res,req);
        }
    ]

]).listener()).listen(cfg.port);

log("Server running on port " + cfg.port);
