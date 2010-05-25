var qs  = require('querystring'),
    url = require('url');

SimpleJSONP = function (code, obj, res,req) {
    var body = JSON.stringify(obj);
    var jpf = qs.parse(url.parse(req.url).query).jp;
    body = jpf + '(' + body + ');';
    
    res.writeHead(code, { "Content-Type": "text/json"
                      , "Content-Length": body.length
                      });
    res.end(body);
}
