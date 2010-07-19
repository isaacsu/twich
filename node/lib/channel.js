exports.channel = function(MESSAGE_BACKLOG, MESSAGE_TRUNCATE) {
    return (function() {
        var messages  = [],
            callbacks = [];

        return {
            appendMessage : function (nick, room, type, text) {
                
                if (type == 'msg' && text.length > MESSAGE_TRUNCATE) {
                    text = text.substr(0,MESSAGE_TRUNCATE) + "... (trunc.)";
                }
                
                var m = { 
                          nick: nick
                        , type: type // "msg", "join", "part"
                        , text: text
                        , room: room
                        , timestamp: (new Date()).getTime()
                };

                mlog(m);

                messages.push( m );

                while (callbacks.length > 0) {
                    callbacks.shift().callback([m]);
                }

                while (messages.length > MESSAGE_BACKLOG) {
                    messages.shift();
                }
            },

            query : function (room, since, callback) {
                var matching = [];
                for (var i = 0; i < messages.length; i++) {
                    var message = messages[i];
                    if (message.timestamp > since && room == message.room) {
                        matching.push(message)
                    }
                }

                if (matching.length != 0) {
                    callback(matching);
                } 
                else {
                    callbacks.push({ timestamp: new Date(), callback: callback });
                }
            },

            init : function() {
                // clear old callbacks older than 25 seconds (lowered from 30 seconds to get round rmit proxy server's 30sec timeout
                setInterval(function () {
                    var now = new Date();
                    while (callbacks.length > 0 && now - callbacks[0].timestamp > 25*1000) {
                        callbacks.shift().callback([]);
                    }
                }, 3000);
                return "hi";
            }
        }
    }());
}
