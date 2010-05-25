var sys = require('sys');
var sint = Sherpa.interfaces = Sherpa.interfaces || {};
var interfaces = {};

["NodeJs", "Jsgi"].forEach(function(interface){
  sint.__defineGetter__(interface, function(){
    return loadInterfaceFor(interface)
  });
});

function loadInterfaceFor(type){
  if(!interfaces[type]){
    interfaces[type] = require("./interfaces/" + type)[type];
  }
  return interfaces[type];
}




