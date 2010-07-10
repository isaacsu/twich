var CONFIG = { 
    debug:false,
    nick: "#",            // set in onConnect
    id: null,             // set in onConnect
    last_message_time: 1,
    focus: true,          //event listeners bound in onConnect
    unread: 0             //updated in the message-processing loop
};

var STATE = {
    entryfocused: true,
    logfocused: false,
    prevTime: '',
    prevNick: ''
};

var OEMBED = {};
var nicks = [];

//updates the users link to reflect the number of active users
function updateUsersLink () {
    var t = nicks.length.toString() + " user";
    if (nicks.length != 1) { t += "s"; }
    $("#usersLink").text(t);
}


//handles another person joining chat
function userJoin(nick, timestamp) {
    STATE.prevNick = '';
    STATE.prevTime = '';
    addMessage(nick, "joined", timestamp, "join");
    STATE.prevNick = '';
    STATE.prevTime = '';
    for (var i = 0; i < nicks.length; i++) {
        if (nicks[i] == nick) {return;}
    }
    nicks.push(nick);
    updateUsersLink();
}


//handles someone leaving
function userPart(nick, timestamp) {
    STATE.prevNick = '';
    STATE.prevTime = '';
    addMessage(nick, "left", timestamp, "part");
    STATE.prevNick = '';
    STATE.prevTime = '';
    for (var i = 0; i < nicks.length; i++) {
        if (nicks[i] == nick) {
            nicks.splice(i,1);
            break;
        }
    }
    updateUsersLink();
}


// utility functions
util = {
    urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g, 

    // html sanitizer 
    toStaticHTML: function(inputHtml) {
        inputHtml = inputHtml.toString();
        return inputHtml.replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;");
    }, 

    //pads n with zeros on the left,
    //digits is minimum length of output
    //zeroPad(3, 5); returns "005"
    //zeroPad(2, 500); returns "500"
    zeroPad: function (digits, n) {
        n = n.toString();
        while (n.length < digits) 
          n = '0' + n;
        return n;
    },

    //it is almost 8 o'clock PM here
    //timeString(new Date); returns "19:49"
    timeString: function (date) {
        var minutes = date.getMinutes().toString();
        var hours = date.getHours().toString();
        return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
    },

    //does the argument only contain whitespace?
    isBlank: function(text) {
        var blank = /^\s*$/;
        return (text.match(blank) !== null);
    },

    frHTMLEntities: function (str) {
      var ta=document.createElement("textarea");
      ta.innerHTML=str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
      return ta.value;
    },

    dupeCheck: function(str, prev) {
        if (str != prev) {
            return str;
        }
        return '';
    }
};


//used to keep the most recent messages visible
function scrollDown() {
    if (CONFIG.client == 'mobilesafari') {
        updateSizes();
        myScroll.scrollToMax('400ms');
    }
    else {
        $('#logwrap').scrollTo({top:'100%',left:'0%'});
    }
}

function oembed(id) {
    $('#'+id).empty().html("<img src='/img/loading-bar.gif' />");
    $('#'+id).oembed(OEMBED[id]);
    return false;
}

//inserts an event into the stream for display
//the event may be a msg, join or part type
//from is the user, text is the body and time is the timestamp, defaulting to now
//_class is a css class to apply to the message, usefull for system events
function addMessage (from, text, time, _class) {
    if (text === null) return;

    if (time == null) {
        // if the time is null or undefined, use the current time.
        time = new Date();
    } 
    else if ((time instanceof Date) === false) {
        // if it's a timestamp, interpret it
        time = new Date(time);
    }

    //every message you see is actually a table with 3 cols:
    //  the time,
    //  the person who caused the event,
    //  and the content
    var messageElement = $(document.createElement("table"));

    messageElement.addClass("message");
    if (_class) {
        messageElement.addClass(_class);
    }

    // sanitize
    text = util.toStaticHTML(text);

    // If the current user said this, add a special css class
    var nick_re = new RegExp(CONFIG.nick);
    if (nick_re.exec(text)) {
        messageElement.addClass("personal");
    }

    if (CONFIG.client != 'mobilesafari') {
        // replace URLs with links
        var rawlinks = text.match(/(\w+):\/\/([\w.]+)\/(\S*)/g);

        if (rawlinks != null && rawlinks.length > 0) {
            for (var rl = 0; rl < rawlinks.length; rl++) {
                rl_arr = util.frHTMLEntities(rawlinks[rl]).match(/(\w+):\/\/([\w.]+)\/(\S*)/);
                if (
                        rl_arr[2].toLowerCase().indexOf("youtube.com") != -1 ||
                        rl_arr[2].toLowerCase().indexOf("twitpic.com") != -1 
//                        rl_arr[2].toLowerCase().indexOf("yfrog.") != -1 
                    ) {
                    var d = new Date();
                    rl_id = rl_arr[2] + "-" + rl_arr[3];
                    rl_id = rl_id.replace(/(\.|\?|\=|\&)/g,'-')+"_"+d.getTime(); // function to generate rl_id
                    OEMBED[rl_id] = rawlinks[rl];
                    text = text.replace(rawlinks[rl], "<span id='" + rl_id + "'><a href=\"javascript:;\" onclick=\"oembed('" + rl_id +"');\">[expand " + rl_arr[2].toLowerCase() + "]</a></span>");
                }
            }
        }
    }
    //
    // 1. Find all instances of links string.match(/g);
    // 2. Filter each of the links to see if they are oEmbed compatible link[#].match(); push to array
    // 3. add wrapper around each link found string.replace
    // 4. dispatch oEmbed queries, callback replaces span with link to 'embed'
    //
    text = text.replace(util.urlRE, '<a target="_blank" href="$&">$&</a>');
    
    var curTime = util.timeString(time);
    var curNick = util.toStaticHTML(from);
    var hideTime = (curTime == STATE.prevTime) ? ' hide' : '';
    var hideNick = (curNick == STATE.prevNick) ? ' hide' : '';
    STATE.prevTime = curTime;
    STATE.prevNick = curNick;

    var content = '<tr>'
        + '  <td class="date' + hideTime + '">' + curTime + '</td>'
        + '  <td class="nick' + hideNick + '">' + curNick + '</td>'
        + '  <td class="msg-text">' + text  + '</td>'
        + '</tr>'
        ;
    messageElement.html(content);

    //the log is the stream that we view
    $("#log").append(messageElement);

    //always view the most recent message when it is added
    STATE.prevNick = util.toStaticHTML(from);
    STATE.prevTime = util.timeString(time);

    scrollDown();
}



var transmission_errors = 0;
var first_poll = true;


//process updates if we have any, request updates from the server,
// and call again with response. the last part is like recursion except the call
// is being made from the response handler, and not at some point during the
// function's execution.
function longPoll (data) {
    if (transmission_errors > 2) {
        showConnect();
        return;
    }

    // process any updates we may have
    // data will be null on the first call of longPoll
    if (data && data.messages) {
        var msgStart = 0;
        if (CONFIG.client=='mobilesafari' && data.messages.length > 15) {
            msgStart = data.messages.length - 15;
        }
        for (var i = msgStart; i < data.messages.length; i++) {
            var message = data.messages[i];

            //track oldest message so we only request newer messages from server
            if (message.timestamp > CONFIG.last_message_time)
                CONFIG.last_message_time = message.timestamp;

            //dispatch new messages to their appropriate handlers
            switch (message.type) {
                case "msg":
                    if(!CONFIG.focus){
                        CONFIG.unread++;
                    }
                addMessage(message.nick, message.text, message.timestamp);
                break;

                case "join":
                    userJoin(message.nick, message.timestamp);
                break;

                case "part":
                    userPart(message.nick, message.timestamp);
                break;
            }
        }
        //update the document title to include unread message count if blurred
        updateTitle();

        //only after the first request for messages do we want to show who is here
        if (first_poll) {
            first_poll = false;
            who();
        }
    }

    //make another request
    $.ajax({ 
        cache: false
        , type: "GET"
        , url: CONFIG.node_url + "/recv?jp=?"
        , dataType: "json"
        , data: { since: CONFIG.last_message_time, room: CONFIG.room, id: CONFIG.id }
        , error: function () {
            addMessage("", "long poll error. trying again...", new Date(), "error");
            transmission_errors += 1;
            //don't flood the servers on error, wait 10 seconds before retrying
            setTimeout(longPoll, 10*1000);
          }
        , success: function (data) {
            transmission_errors = 0;
            //if everything went well, begin another request immediately
            //the server will take a long time to respond
            //how long? well, it will wait until there is another message
            //and then it will return it to us and close the connection.
            //since the connection is closed when we get data, we longPoll again
            longPoll(data);
          }
    });
}



//submit a new message to the server
function send(msg) {
    if (CONFIG.debug === false) {
        // XXX should be POST
        // XXX should add to messages immediately
        jQuery.get(CONFIG.node_url + "/send?jp=?", {id: CONFIG.id, room: CONFIG.room, text: msg}, function (data) { }, "json");
    }
}


//Transition the page to the state that prompts the user for a nickname
function showConnect () {
    $("#connect").show();
    $("#loading").hide();
    $("#toolbar").hide();
    $("#nickInput").focus();
}



//transition the page to the loading screen
function showLoad () {
    $("#connect").hide();
    $("#loading").show();
    $("#toolbar").hide();
}


//transition the page to the main chat view, putting the cursor in the textfield
function showChat (nick) {
    $("#toolbar").show();
    $("#entry").focus();
    $("#connect").hide();
    $("#loading").hide();
    $('#logwrap').show();

    scrollDown();
}



function resizeLog() {
    var newHeight = $(window).height() - (45 + 26);//100;
    $('#logwrap').css('height',newHeight + "px");
    $('#entry').css('width', ($(window).width() - 30) + "px");
}



//we want to show a count of unread messages when the window does not have focus
function updateTitle() {
    if (CONFIG.unread) {
        document.title = "(" + CONFIG.unread.toString() + ") twich.me/"+CONFIG.room;
    } 
    else {
        document.title = "twich.me/"+CONFIG.room;
    }
}



//handle the server's response to our nickname and join request
function onConnect (session) {
    if (session.error) {
        alert("error connecting: " + session.error);
        showConnect();
        return;
    }
    longPoll();
    if (CONFIG.client =='mobilesafari') {
        document.addEventListener('touchmove', function(e){e.preventDefault();});
    }

    CONFIG.nick = session.nick;
    CONFIG.id   = session.id;

    //update the UI to show the chat
    showChat(CONFIG.nick);
    setTimeout(function() {if (nicks.length > 1) {addMessage('twich tip:', 'Create your own twich by just opening http://twich.me/' + CONFIG.nick,null,'notice')}},3000);
    //addMessage('twichEvent', 'Masterchef twich tonight at 7.30PM http://twich.me/masterchef',null,'notice');

    //listen for browser events so we know to update the document title
    $(window).bind("blur", function() {
            CONFIG.focus = false;
            updateTitle();
            });

    $(window).bind("focus", function() {
            CONFIG.focus = true;
            CONFIG.unread = 0;
            updateTitle();
            });
}



//add a list of present chat members to the stream
function outputUsers () {
    var nick_string = nicks.length > 0 ? nicks.join(", ") : "(none)";
    addMessage("users:", nick_string, new Date(), "notice");
    if (nicks.length == 1) {
        addMessage("twich tip:", 'Invite others to join by sharing this link http://twich.me/' + CONFIG.room,null, 'notice');
    }
    return false;
}



//get a list of the users presently in the room, and add it to the stream
function who () {
    jQuery.ajax({ cache: false
                , type: "GET"
                , dataType: "json"
                , url: CONFIG.node_url + "/who?jp=?"
                , data: {nick: CONFIG.nick, room: CONFIG.room}
                , success: function(session) {
                    nicks = session.nicks;
                    outputUsers();
                }
    });
}

function signin() {
    //lock the UI while waiting for a response
    showLoad();
    var nick = $("#nickInput").attr("value");

    //dont bother the backend if we fail easy validations
    if (nick.length < 3) {
        alert("Nick too short. 3 characters minimum.");
        showConnect();
        return false;
    }

    if (nick.length > 20) {
        alert("Nick too long. 20 character max.");
        showConnect();
        return false;
    }

    //more validations
    if (/[^\w_\-^!]/.exec(nick)) {
        alert("Bad character in nick. Can only have letters, numbers, and '_', '-', '^', '!'");
        showConnect();
        return false;
    }

    //make the actual join request to the server
    $.ajax({ cache: false
           , type: "GET" // XXX should be POST
           , dataType: "json"
           , url: CONFIG.node_url + "/join?jp=?"
           , data: { nick: nick , room: CONFIG.room}
           , error: function (session) {
               alert("error " + session.error);
               showConnect();
             }
           , success: onConnect
           });
    return false;
}

$(document).ready(function() {

    //submit new messages when the user hits enter if the message isnt blank
    $("#entry").keypress(function (e) {
        if (e.keyCode != 13 /* Return */) return;
        var msg = $("#entry").attr("value").replace("\n", "");
        if (!util.isBlank(msg)) send(msg);
        $("#entry").attr("value", ""); // clear the entry field.
    });

    $("#entry-btn").click(function () {
        var msg = $("#entry").attr("value").replace("\n", "");
        if (!util.isBlank(msg)) send(msg);
        $("#entry").attr("value", ""); // clear the entry field.
    });

    $("#usersLink").click(outputUsers);

    //try joining the chat when the user clicks the connect button
    $("#connectButton").click(function () {
        signin();
        return false;
    });

    $("#connectForm").submit(function () {
        signin();
        return false;
    });
    

    $("#nickInput").keypress(function (e) {
        if (e.keyCode != 13) {return;}
        signin();
        return false;
    });

    // update the clock every second
    setInterval(function () {
        var now = new Date();
        $("#currentTime").text(util.timeString(now));
    }, 1000);

    if (CONFIG.debug) {
        $("#loading").hide();
        $("#connect").hide();
        return;
    }

    // remove fixtures
    $("#log table").remove();

    jQuery.ajax({ cache: false
                , type: "GET"
                , dataType: "json"
                , url: CONFIG.node_url + "/who?jp=?"
                , data: {nick: CONFIG.nick, room: CONFIG.room}
                , success: function(session) {
                    nicks = session.nicks;
                    numusers = nicks.length.toString();
                    if (numusers > 0) {
                        $('#roomusercount').show();
                        var nick_string =  nicks.join(" ");
                        $('#roomuserlist').html(nick_string);
                        if (numusers == 1) {
                            $('#roomusercount .count').html(numusers + " user");
                        }
                        else {
                            $('#roomusercount .count').html(numusers + " users");
                        }
                    }
                }
    });

    //begin listening for updates right away
    //interestingly, we don't need to join a room to get its updates
    //we just don't show the chat stream to the user until we create a session
    //longPoll();

    showConnect();
    //showChat();



});

//if we can, notify the server that we're going away.
$(window).unload(function () {
    jQuery.get(CONFIG.node_url + "/part?jp=?", {id: CONFIG.id}, function (data) { }, "json");
});

