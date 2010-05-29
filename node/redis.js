var sys = require('sys');
var redis = require('./lib/redis-client').createClient();

redis.info(function (err, info) {
        if (err) throw new Error(err);
        sys.puts("Redis Version is: " + info.redis_version);
});

setInterval(function() {
        sys.puts('test');
        redis.get('abc',function(err, val) {
            sys.puts(val)
            });
    },1000);

