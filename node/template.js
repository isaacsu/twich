/*
 * node-template
 * http://github.com/graphnode/node-template/
 * by Diogo Gomes - MIT Licensed
 *
 * Based off of:
 * - Chad Etzel - http://github.com/jazzychad/template.node.js/
 * - John Resig - http://ejohn.org/blog/javascript-micro-templating/
 */

(function(){
    var fs = require("fs");

    var cache = {};
    
    var create = function(str, data, callback) {
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn;

        if (!/[\t\r\n% ]/.test(str))
            if (!callback)
                fn = create(fs.readFileSync(str));
            else {
                fs.readFile(str, function(err, contents) {
                    if (err) throw err;
                    create(contents, data, callback);
                });
                return;
            }    
        else {
            if (cache[str])
                fn = cache[str];
            else {
                // Generate a reusable function that will serve as a template
                // generator (and which will be cached).
                fn = new Function("obj",
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +
                    "obj=obj||{};" +
                    // Introduce the data as local variables using with(){}
                    "with(obj){p.push('" +

                    // Convert the template into pure JavaScript
                    str.split("'").join("\\'")
                        .split("\n").join("\\n")
                        .replace(/<%([\s\S]*?)%>/mg, function(m, t) { return '<%' + t.split("\\'").join("'").split("\\n").join("\n") + '%>'; })
                        .replace(/<%=(.+?)%>/g, "',$1,'")
                        .split("<%").join("');")
                        .split("%>").join("p.push('")
                        
                + "');}return p.join('');");
                
                cache[str] = fn;
            }
        }

        // Provide some "basic" currying to the user
        if (callback) callback(data ? fn( data ) : fn);
        else return data ? fn( data ) : fn;
    }

    /* exports */
    exports.create = create;
})();