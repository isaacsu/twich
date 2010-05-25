var sys  = require("sys");
var ts   = require('./timestamp');

log  = function(msg) { sys.puts(ts.timeStamp() + " " + msg); }
mlog = function(m) {
    switch (m.type) {
        case "msg":
            log("msg <" + m.room + "/" + m.nick + "> " + m.text);
        break;
        case "join":
            log("joi <" + m.room + "/" + m.nick + ">");
        break;
        case "part":
            log("lef <" + m.room + "/" + m.nick + ">");
        break;
    }
}
