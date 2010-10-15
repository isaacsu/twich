var config = function () {
    return {
        host: null,
        port: 443,
        msg_backlog: 40,
        msg_truncate: 2000,
        session_timeout: 60 * 1000
    }
}

exports.cfg = config;
