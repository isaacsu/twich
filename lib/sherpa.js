Sherpa = {
  SplitRegex: /([\/\.])/,
  Router: function(options) {
    this.root = new Sherpa.Node(null, '/');
    this.routes = {};
    this.requestKeys = options && options.requestKeys || ['method'];
  },
  Node: function(parent) {
    this.parent = parent;
    this.lookup = {};
    this.requestLookup = undefined;
    this.matchPartially = false;
    this.destination = undefined;
    this.value = undefined;
    this.shortcut = [];
    this.requestShortcut = [];
    this.requestNode = undefined;
    this.requestKey = undefined;
  },
  RequestNode: function(parent) {
    this.parent = parent;
    this.matchPartially = false;
    this.destination = undefined;
    this.requestLookup = undefined;
    this.requestKey = undefined;
    this.requestShortcut = [];
  },
  Variable: function(name) {
    this.name = name;
  },
  Route: function(routeSet, finalNode) {
    this.routeSet = routeSet;
    this.finalNode = finalNode;
  },
  RouteSet: function(router) {
    this.routes = [];
    this.router = router;
  },
  interfaces: { }
}

Sherpa.RouteSet.prototype = {
  to: function(destination) {
    for (var routeIndex = 0; routeIndex != this.routes.length; routeIndex++) {
      this.routes[routeIndex].finalNode.destination = destination;
    }
    return this;
  },
  name: function(name) {
    this.router.routes[name] = this;
    return this;
  },
  matchPartially: function(match) {
    for (var routeIndex = 0; routeIndex != this.routes.length; routeIndex++) {
      this.routes[routeIndex].finalNode.matchPartially = (match === undefined || match === true);
    }
  },
  matchingNode: function(params) {
    if (this.routes.length == 1) {
      return this.routes[0].finalNode;
    } else {
      var maximumMatchedRoute = undefined;
      var maximumMatchedParams = -1;
      for (var i = 0; i != this.routes.length; i++) {
        var route = this.routes[i];
        var node = route.finalNode;
        var paramCount = 0;
        while (node && node.value) {
          if (node.value.name !== undefined) {
            if ((params === undefined) || (params[node.value.name] === undefined)) {
              paramCount = -1;
              node = undefined;
            } else {
              paramCount += 1;
              node = node.parent;
            }
          } else {
            node = node.parent;
          }
        }
        if (paramCount != -1 && paramCount > maximumMatchedParams) {
          maximumMatchedParams = paramCount;
          maximumMatchedNode = route.finalNode;
        }
      }
      return maximumMatchedNode;
    }
  }
};

Sherpa.Router.prototype = {

  compareRequestKeys: function(k1, k2) {
    var i1 = this.requestKeys.indexOf(k1);
    var i2 = this.requestKeys.indexOf(k2);
    if (i1 < i2) {
      return -1;
    } else if (i2 < i1) {
      return 1;
    } else {
      return 0;
    }
  },

  add: function(uri, options) {
    var paths = [""];
    var chars = uri.split('');
    
    var startIndex = 0;
    var endIndex = 1;
    
    for (var charIndex in chars) {
      var c = chars[charIndex];
      if (c == '(') {
        // over current working set, double paths
        for (var pathIndex = startIndex; pathIndex != endIndex; pathIndex++) {
          paths.push(paths[pathIndex]);
        }
        // move working set to newly copied paths
        startIndex = endIndex;
        endIndex = paths.length;
      } else if (c == ')') {
        // expand working set scope
        startIndex -= (endIndex - startIndex);
      } else {
        for (var i = startIndex; i != endIndex; i++) {
          paths[i] += c;
        }
      }
    }
    
    var routeSet = new Sherpa.RouteSet(this);
    for (var pathIndex = 0; pathIndex != paths.length; pathIndex++) {
      routeSet.routes.push(this.addPath(routeSet, paths[pathIndex], options));
    }
    return routeSet;
  },

  addPath: function(routeSet, uri, options) {
    var splitUri = uri.split(Sherpa.SplitRegex);
    var node = this.root;
    for (var i in splitUri) {
      var part = splitUri[i];
      if (part != '') {
        var firstChar = part.substring(0,1)
        if (firstChar == ':') {
          var variableName = part.substring(1);
          if (options && options.matchesWith && options.matchesWith[variableName]) {
            node = node.add(options.matchesWith[variableName], new Sherpa.Variable(variableName));
            node.value.matchesWith = options.matchesWith[variableName];
            node.parent.shortcut.push([node.value.matchesWith, node]);
          } else {
            node = node.add(null, new Sherpa.Variable(variableName));
          }
        } else {
          node = node.add(part, part);
        }
      }
    }

    if ((options && options.conditions) || (node.requestKey && node.destination)) {

      var transplantedDestination = node.destination;
      var preRequestNode = node;
      node.destination = undefined;
      for (var requestKeyIndex = 0; requestKeyIndex < this.requestKeys.length; requestKeyIndex++) {
        var key = this.requestKeys[requestKeyIndex];

        // if it exists, we have to deal with it
        // the current requestKey is the same or undefined, lets just use it.
        if (node.requestLookup === undefined) node.requestLookup = {};

        if (node.requestKey === undefined || node.requestKey == key) {

          var conditionalValue = options && options.conditions[key];
          node.requestKey = key;

          if (typeof(conditionalValue) == 'function') {
            var newNode = new Sherpa.RequestNode(node)
            node.requestShortcut.push([conditionalValue, newNode])
            node = newNode;
          } else {
            var lookupValue = conditionalValue || null;
            delete options.conditions[key];
            if (!node.requestLookup[lookupValue]) {
              node.requestLookup[lookupValue] = new Sherpa.RequestNode(node);
            }
            node = node.requestLookup[lookupValue];
          }

        // the current requestKey mismatches the key we have ... either
        } else {
          switch(this.compareRequestKeys(node.requestKey, key)) {
            // before
            case -1:
              if (!node.requestLookup[null]) {
                node.requestKey = key;
                node.requestLookup[null] = new Sherpa.RequestNode(node);
              }
              node = node.requestLookup[null]
              break;
            // after
            case 1:
              if (node.requestLookup === undefined) node.requestLookup = {};
              var newNode = new Sherpa.RequestNode(node.parent);
              if (node.parent.requestLookup) {
                for (var parentLookupKey in node.parent.requestLookup) {
                  if (node.parent.requestLookup[parentLookupKey] === node) {
                    delete node.parent.requestLookup[parentLookupKey];
                    newNode.requestLookup[parentLookupKey] = node;
                  }
                }
              }
              if (node.parent.requestShortcut) {
                for (var parentShortcutIndex in node.parent.requestShortcut) {
                  if (node.parent.requestShortcut[parentShortcutIndex][1] === node) {
                    newNode.requestShortcut[parentLookupKey] = node.parent.requestShortcut[parentShortcutIndex];
                    delete node.parent.requestShortcut[parentLookupKey];
                  }
                }
              }
              node = newNode;
              requestKeyIndex--;
              break;
          }
        }
      }

      if (transplantedDestination) {
        while(preRequestNode.requestLookup) {
          if (!preRequestNode.requestLookup[null]) {
            preRequestNode.requestLookup[null] = new Sherpa.RequestNode(preRequestNode);
          }
          preRequestNode = preRequestNode.requestLookup[null];
        }
        preRequestNode.destination = transplantedDestination;
      }
    }
    var route = new Sherpa.Route(routeSet, node);
    return route;
  },
  recognize: function(uri, request) {
    var params = {};
    var position = 0;
    var splitUri = uri.split(Sherpa.SplitRegex);

    var node = this.root;
    while (uri.length > 0 && !node.matchPartially) {
      var position = splitUri.shift().length;
      var part = uri.substring(0, position);

      var paramName = undefined;
      var paramValue = undefined;

      var matched = false;

      if (node.shortcut.length != 0) {
        for (var shortcutIndex in node.shortcut) {
          if (match = uri.match(node.shortcut[shortcutIndex][0])) {
            uri = uri.substring(match[0].length);
            node = node.shortcut[shortcutIndex][1];
            if (node.value.name) {
              paramName = node.value.name;
              paramValue = match[0];
            }
            matched = true;
            splitUri = uri.split(Sherpa.SplitRegex);
            break;
          }
        }
      }

      if (!matched && part != '') {
        if (node.lookup[part] !== undefined) {
          node = node.lookup[part];
          uri = uri.substring(position);
          position = 0;
        } else if(node.lookup[null] !== undefined) {
          node = node.lookup[null];
          paramName = node.value.name;
          paramValue = part;
          uri = uri.substring(position);
          position = 0;
        } else {
          node = undefined;
        }
      }
      if (node === undefined) {
        return undefined;
      }

      if (paramName) {
        params[paramName] = paramValue;
      }
    }

    if (node.requestKey) {
      node = this.searchRequestNodes(node, request, 0);
    }

    if (node === undefined || node.destination === undefined) {
      return undefined;
    } else {
      return {'destination': node.destination, 'params': params};
    }
  },

  searchRequestNodes: function(node, request, index) {
    if (index >= this.requestKeys.length) {
      return node;
    } else {
      switch(this.compareRequestKeys(this.requestKeys[index], node.requestKey)) {
        case 1:
        if (nextNode = node.requestLookup[null]) {
          return this.searchRequestNodes(nextNode, request, index + 1);
        } else {
          return undefined;
        }
        case 0:
          if (node.requestShortcut.length != 0 && request[this.requestKeys[index]] !== undefined) {
            for (var requestShortcutIndex in node.requestShortcut) {
              if ((match = request[this.requestKeys[index]].match(node.requestShortcut[requestShortcutIndex][0])) && match[0] == request[this.requestKeys[index]]) {
                return node.requestShortcut[requestShortcutIndex][1];
              }
            }
          }

          if (nextNode = node.requestLookup[request[this.requestKeys[index]]]) {
            return this.searchRequestNodes(nextNode, request, index + 1);
          } else if (nextNode = node.requestLookup[null]) {
            return this.searchRequestNodes(nextNode, request, index + 1);
          } else {
            return undefined;
          }
        case -1:
          throw(new Error('omg, not good.'));
      }
    }
  },

  generate: function(name, params) {
    var pathParts = [];
    var routeSet = this.routes[name];
    var node = routeSet.matchingNode(params);
    
    if (!node) throw("matching route not found in "+name);

    while (node && node.value) {
      if (node.value.name !== undefined) {
        var variableValue = params[node.value.name];
        delete params[node.value.name];
        if (node.value.matchesWith) {
          if ((match = variableValue.match(node.value.matchesWith)) && match[0] == variableValue) {
            pathParts.push(variableValue);
          } else {
            return undefined;
          }
        } else {
          pathParts.push(variableValue);
        }
      } else {
        pathParts.push(node.value);
      }
      node = node.parent;
    }
    var path = '';
    for (var i in pathParts) {
      path += pathParts[pathParts.length - i - 1];
    }
    path = encodeURI(path);
    var query = '';
    for (var key in params) {
      query += (query == '' ? '?' : '&') + encodeURIComponent(key).replace(/%20/g, '+') + '=' + encodeURIComponent(params[key]).replace(/%20/g, '+');
    }
    return path + query;
  }

};

Sherpa.Route.prototype = {
}

Sherpa.Node.prototype = {
  add: function(part, value) {
    if (this.lookup[part] === undefined) {
      this.lookup[part] = new Sherpa.Node(this);
      this.lookup[part].value = value;
    }
    return this.lookup[part];
  }
};

// load the interfaces
require('./sherpa/interfaces')
