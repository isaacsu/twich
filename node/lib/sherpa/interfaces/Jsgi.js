exports.Jsgi = Jsgi;

/* An interface for jsgi for the Sherpa Router.
 *
 * The sherpa instance is made available as the "sherpa" attribute on the function.
 *
 * @params app - The application to use as the defualt application.  I.e. if no matches are found, this application will be used.
 * @params routerOrFunction - Can either be a Sherpa.Router, or a function that will receive the router as an argument.  Use this to set your routes.
 *
 * @example
 *   // Using a function to configure routes
 *
 *   new Sherpa.interfaces.jsgi(myApp, function(router){
 *     router.add("/foo"            ).to(aValidJsgiAppCalledFoo())
 *     router.add("/users/:username").to(userJsgiApp())
 *   });
 *
 * @example
 *  // Using a pre-built sherpa for the router
 *  // This application will fall back to a 404 "NOT FOUND" application
 *
 *  var router = new Sherpa.Router();
 *
 *  router.add("/foo"            ).to(aValidJsgiAppCalledFoo());
 *  router.add("/users/:username").to(userJsgiApp);
 *
 *  var app = new Sherpa.interfaces.jsgi(null, router);
 *
 *  app.sherpa // the actual sherpa router instance
 */
function Jsgi(app, routerOrFunction){
  var router;
  if(!app) app = notFound;

  // TODO: Work out a better way of checking if it's an instance of Sherpa.Router
  if(routerOrFunction instanceof Sherpa.Router){
    router = routerOrFunction;
  } else if( routerOrFunction instanceof Function ){
    router = new Sherpa.Router;
    routerOrFunction(router);
  }

  function jsgiSherpa(request){
    var result = router.recognize(request.url, request);
    if(result){
      request.env.router = result;
      return result.destination instanceof Function ?
        result.destination(request) : app(request);
    } else {
      return app(request);
    }
  }
  jsgiSherpa.router = router;
  return jsgiSherpa;
}

function notFound(request){
  var
    body = new request.jsgi.stream,
    msg  = "NOT FOUND";
  body.write(msg);
  body.close();
  return {
   status  : 404,
    headers : {"content-type" : "text/plain", "content-length" : msg.length},
    'body'  : body
  }
}


