// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"KyaV":[function(require,module,exports) {
module.exports = function (opts) {
  return "\n  html {\n    --swap-loader-color: ".concat(opts.color || '#5BDF8F', ";\n  }\n\n  html::before,\n  .Pane.is-active::before {\n    content: '';\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 3px;\n    z-index: 10000;\n    transform: translateX(-100%);\n    background-color: var(--swap-loader-color);\n  }\n\n  html.swap-is-loading:not(.swap-pane-is-open)::before,\n  html.swap-is-loading .Pane.is-active::before {\n    animation-timing-function: ease-in-out;\n    animation-name: swap-loader;\n    animation-duration: 1s;\n    animation-iteration-count: infinite;\n  }\n\n  @keyframes swap-loader {\n    0% { transform: translateX(-100%); }\n    50% { transform: translateX(0%); }\n    100% { transform: translateX(100%); }\n  }\n\n  .Pane {\n    position: fixed;\n    top: 0;\n    right: 0;\n    overflow-x: hidden;\n    overflow-y: scroll;\n    min-width: 320px;\n    height: 100vh;\n    transform: translateX(100%);\n    z-index: 2000;\n  }\n\n  .Pane.is-visible {\n    transform: translateX(0%);\n  }\n").replace(/\s+/g, ' ').trim();
};
},{}],"aMpx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bypassKeyPressed = exports.parseQuery = exports.shouldSwap = exports.getPath = exports.getUrl = exports.buildUrl = exports.getFormData = exports.getSelectors = exports.htmlToElement = exports.$html = exports.qsa = exports.qs = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var qs = document.querySelector.bind(document);
exports.qs = qs;
var qsa = document.querySelectorAll.bind(document);
exports.qsa = qsa;
var $html = document.documentElement;
exports.$html = $html;

var getUrl = function getUrl(url) {
  var source = document.createElement('a');
  source.setAttribute('href', url);
  return buildUrl(source);
};

exports.getUrl = getUrl;

var getPath = function getPath(original) {
  var url = getUrl(original);
  return url.pathname + url.search;
};

exports.getPath = getPath;

var parseQuery = function parseQuery(search) {
  return decodeURIComponent(search).split('&').reduce(function (params, keyval) {
    var _keyval$split = keyval.split('='),
        _keyval$split2 = _slicedToArray(_keyval$split, 2),
        key = _keyval$split2[0],
        val = _keyval$split2[1];

    params[key] = val;
    return params;
  }, {});
};

exports.parseQuery = parseQuery;

var buildUrl = function buildUrl(source) {
  var obj = {
    query: parseQuery(source.search.substr(1))
  };
  ['href', 'protocol', 'host', 'hostname', 'port', 'pathname', 'search', 'hash', 'origin'].forEach(function (prop) {
    return obj[prop] = source[prop];
  });
  return obj;
};

exports.buildUrl = buildUrl;

var shouldSwap = function shouldSwap(destination) {
  if (destination.hostname !== location.hostname || destination.protocol !== location.protocol) {
    alert('hostname protocol failed so hard refresh');
    return false;
  }

  if (destination.pathname === location.pathname && destination.hash) {
    return false;
  }

  return true;
};

exports.shouldSwap = shouldSwap;

var cleanSelectors = function cleanSelectors(str) {
  return str.split(',').map(function (selector) {
    return selector.trim();
  }).filter(function (selector) {
    return selector;
  });
};

var renderOperators = ['>>', '->'];

var getPaneSelectors = function getPaneSelectors(str) {
  return cleanSelectors(str).map(function (sel) {
    return renderOperators.includes(sel) ? "".concat(sel, " ").concat(swap.qs.paneContent) : "".concat(sel, " ").concat(swap.qs.paneDefaultRenderType, " ").concat(swap.qs.paneContent);
  });
};

var getSelectors = function getSelectors(el) {
  return el.dataset.hasOwnProperty('swapPane') ? el.dataset.swapPane !== '' ? getPaneSelectors(el.dataset.swapPane) : swap.paneSelectors : cleanSelectors(el.dataset.swap || el.dataset.swapInline || '');
};

exports.getSelectors = getSelectors;

var bypassKeyPressed = function bypassKeyPressed(key) {
  return ['Alt', 'Control', 'Meta'].includes(key);
};

exports.bypassKeyPressed = bypassKeyPressed;

var getFormData = function getFormData(form) {
  return new URLSearchParams(new FormData(form)).toString();
};

exports.getFormData = getFormData;

var htmlToElement = function htmlToElement(html) {
  var template = document.createElement('template');
  template.innerHTML = html.trim(); // Never return a text node of whitespace as the result

  return template.content.firstChild;
}; // const getHeaders = (str) => {
//   return str.trim().split('\n').map(line => {
//     const splat = line.split(':');
//     return {
//       [splat[0].trim()]: splat[1].trim()
//     };
//   }).reduce(((r, c) => Object.assign(r, c)), {});
// }
// const removeEmptyProps = (obj) =>
//   Object.fromEntries(
//     Object.entries(obj)
//       .filter(([k, v]) => v != null)
//       .map(([k, v]) => (typeof v === 'object' ? [k, removeEmptyProps(v)] : [k, v]))
//   );


exports.htmlToElement = htmlToElement;
},{}],"GeuA":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assetsChanged = exports.extractNewAssets = exports.renderTitle = exports.renderBody = exports.loadAssets = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var _require = require('./utils'),
    qs = _require.qs,
    getUrl = _require.getUrl;

var render = {
  replace: function replace(el, target) {
    target.parentNode.replaceChild(el, target);
  },
  innerHtml: function innerHtml(el, target) {
    target.innerHTML = el.innerHTML; // target.insertAdjacentHTML('beforeend', el.innerHTML);
  },
  append: function append(el, target) {
    target.appendChild(el);
  }
};

var renderBody = function renderBody(dom, selectors) {
  var matches = selectors.map(function (sel) {
    var innerHtmlPattern = sel.split(/\s*>>\s*/); // >> operator

    var appendPattern = sel.split(/\s*->\s*/); // -> operator

    if (innerHtmlPattern.length > 1) {
      return {
        type: 'innerHtml',
        el: dom.querySelector(innerHtmlPattern[0]),
        target: qs(innerHtmlPattern[1])
      };
    } else if (appendPattern.length > 1) {
      return {
        type: 'append',
        el: dom.querySelector(appendPattern[0]),
        target: qs(appendPattern[1])
      };
    }

    return {
      type: 'replace',
      el: dom.querySelector(sel),
      target: qs(sel)
    };
  }).map(function (sel) {
    var el = sel.el,
        target = sel.target,
        type = sel.type;
    return !el || !target ? null : render[type].bind(null, el, target);
  }).filter(function (el) {
    return el;
  });
  var fullSwap = !selectors.length || matches.length !== selectors.length;

  if (fullSwap) {
    document.body = dom.body;
  } else {
    matches.forEach(function (render) {
      return render();
    });
  }
};

exports.renderBody = renderBody;

var renderTitle = function renderTitle(dom) {
  document.title = dom.head.querySelector('title').innerText;
};

exports.renderTitle = renderTitle;

var loadAssets = function loadAssets(nodes, next) {
  if (!nodes.length) return next();
  var inlineScripts = nodes.filter(function (_ref) {
    var node = _ref.node;
    return !node.href && !node.src;
  });
  var headAssets = nodes.filter(function (_ref2) {
    var node = _ref2.node;
    return node.href || node.src;
  });
  var remaining = headAssets.length;

  var loadedFile = function loadedFile() {
    remaining -= 1;

    if (!remaining) {
      completed();
    }
  };

  var appendAssets = function appendAssets(arr) {
    arr.forEach(function (_ref3) {
      var parent = _ref3.parent,
          node = _ref3.node;
      var newNode = createAsset(node);

      if (newNode.href || newNode.src) {
        newNode.onload = loadedFile;
        newNode.onerror = loadedFile;
      }

      document[parent].appendChild(newNode);
    });
  };

  var completed = function completed() {
    remaining = 0;
    appendAssets(inlineScripts);
    next();
  };

  if (!remaining) {
    completed();
    return;
  }

  appendAssets(headAssets);
};

exports.loadAssets = loadAssets;

var filterAssets = function filterAssets(attr, vnode, nodes) {
  return !nodes.some(function (node) {
    return vnode[attr] && node[attr] === vnode[attr];
  });
};

var extractNewAssets = function extractNewAssets(dom, selector) {
  var nodes = _toConsumableArray(document.querySelectorAll(selector));

  var vnodes = _toConsumableArray(dom.querySelectorAll(selector)).filter(function (node) {
    return filterAssets(selector === 'script' ? 'src' : 'href', node, nodes);
  }).map(function (node) {
    var parent = node.closest('body') ? 'body' : 'head';
    node.parentNode.removeChild(node);
    return {
      parent: parent,
      node: node
    };
  });

  return vnodes;
};

exports.extractNewAssets = extractNewAssets;
var assetPartsRegex = /(\/[^\.]+)(?:(?:[\-_\.])([^\.\-_]+))\.(.+)$/;

var buildAssetMap = function buildAssetMap(el, selector) {
  return _toConsumableArray(el.querySelectorAll(selector)).map(function (node) {
    return node[selector == 'script' ? 'src' : 'href'];
  }).filter(function (url) {
    return url;
  }).map(function (url) {
    var _getUrl = getUrl(url),
        host = _getUrl.host,
        pathname = _getUrl.pathname,
        search = _getUrl.search;

    var _pathname$match = pathname.match(assetPartsRegex),
        _pathname$match2 = _slicedToArray(_pathname$match, 4),
        _ = _pathname$match2[0],
        name = _pathname$match2[1],
        hash = _pathname$match2[2],
        extension = _pathname$match2[3];

    return {
      name: "".concat(host, "/").concat(name, ".").concat(extension).concat(search),
      url: url,
      hash: hash
    };
  });
};

var assetsChanged = function assetsChanged(dom) {
  var existingAssets = ['link', 'script'].map(function (selector) {
    return buildAssetMap(document, selector);
  }).flat();
  var incomingAssets = ['link', 'script'].map(function (selector) {
    return buildAssetMap(dom, selector);
  }).flat();
  return incomingAssets.some(function (incomingAsset) {
    var existingAsset = existingAssets.find(function (a) {
      return a.name === incomingAsset.name;
    });
    return existingAsset && existingAsset.hash !== incomingAsset.hash;
  });
};

exports.assetsChanged = assetsChanged;

var createAsset = function createAsset(vnode) {
  var type = vnode.tagName.toLowerCase();
  var node = document.createElement(type);
  node.dataset.flag = Date.now();
  node.innerHTML = vnode.innerHTML;
  ['rel', 'href', 'src', 'defer'].forEach(function (attr) {
    if (vnode[attr]) {
      node[attr] = vnode[attr];
    }
  });
  return node;
};
},{"./utils":"aMpx"}],"jE14":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildRequest = exports.ajax = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('./utils'),
    getFormData = _require.getFormData,
    $html = _require.$html;

var isElement = function isElement(item) {
  return item instanceof Element || item instanceof HTMLDocument;
};

var baseRequest = function baseRequest(url) {
  var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'get';
  return {
    url: url,
    method: method,
    headers: _objectSpread({
      'x-requested-with': 'xmlhttprequest'
    }, swap.paneUrl && {
      'pane-url': swap.paneUrl
    })
  };
};

var formGetRequest = function formGetRequest(form) {
  var data = getFormData(form);
  var cleanQuery = decodeURIComponent(data).replace(/[^=&]+=(&|$)/g, '').replace(/&$/, '');
  var search = cleanQuery ? "?".concat(encodeURI(cleanQuery)) : cleanQuery;
  return baseRequest("".concat(form.action).concat(search));
};

var formPostRequest = function formPostRequest(form) {
  var req = baseRequest(form.action, form.method);
  req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  req.body = getFormData(form);
  return req;
};

var requestMapper = {
  a: function a(link) {
    return baseRequest(link.href);
  },
  url: function url(_url) {
    return baseRequest(_url);
  },
  object: function object(obj) {
    return obj;
  },
  form: function form(_form) {
    return _form.method.toLowerCase() === 'get' ? formGetRequest(_form) : formPostRequest(_form);
  }
};

var buildRequest = function buildRequest(arg) {
  var type = typeof arg === 'string' ? 'url' : isElement(arg) ? arg.tagName.toLowerCase() : 'object';
  return requestMapper[type](arg);
};

exports.buildRequest = buildRequest;

var ajax = function ajax(_ref, callback) {
  var method = _ref.method,
      url = _ref.url,
      headers = _ref.headers,
      _ref$body = _ref.body,
      body = _ref$body === void 0 ? null : _ref$body;
  var xhr = new XMLHttpRequest();

  if (swap.request) {
    swap.request.abort();
  }

  swap.request = xhr;
  $html.classList.add('swap-is-loading');
  xhr.open(method, url, true);

  if (headers) {
    Object.keys(headers).forEach(function (header) {
      xhr.setRequestHeader(header, headers[header]);
    });
  } // xhr.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
  // xhr.setRequestHeader('cache-control', 'max-age=0');
  // xhr.setRequestHeader('expires', '0');
  // xhr.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
  // xhr.setRequestHeader('pragma', 'no-cache');


  xhr.onload = function () {
    $html.classList.remove('swap-is-loading');

    if (xhr.status !== 200) {
      alert('Error: ' + xhr.status);
      return;
    }

    var wasRedirected = url.replace(/#.*$/, '') !== xhr.responseURL;
    swap.responseUrl = wasRedirected ? xhr.responseURL : url;
    callback(xhr, xhr.response, xhr.responseText);
    swap.request = false;
    swap.responseUrl = false;
  };

  xhr.onerror = function (e) {
    alert('Error: handle non-HTTP error (e.g. network down)');
    swap.request = false;
  };

  xhr.send(body);
};

exports.ajax = ajax;
},{"./utils":"aMpx"}],"KRaB":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPaneState = exports.updateHistory = exports.pushSessionState = exports.updateSessionState = exports.getPaneFormsData = exports.replaceState = exports.pushState = exports.session = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var _require = require('./utils'),
    qsa = _require.qsa,
    getPath = _require.getPath,
    getFormData = _require.getFormData;

var session = {
  set: function set(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
    return session;
  },
  get: function get(key) {
    return JSON.parse(sessionStorage.getItem(key));
  },
  remove: function remove(key) {
    sessionStorage.removeItem(key);
    return session;
  }
};
exports.session = session;

var pushState = function pushState(url) {
  pushSessionState(url);
  history.pushState({
    id: swap.stateId
  }, '', url);
};

exports.pushState = pushState;

var replaceState = function replaceState(url) {
  history.replaceState({
    id: swap.stateId
  }, '', url);
};

exports.replaceState = replaceState;

var pushSessionState = function pushSessionState(url) {
  swap.stateId += 1;
  var stateIds = session.get('stateIds').filter(function (id, i) {
    var keep = id < swap.stateId;

    if (!keep) {
      session.remove(id);
    }

    return keep;
  });
  stateIds.push(swap.stateId);

  if (stateIds.length > 20) {
    // given the browser history doesn't have a limit, should we even do this?
    session.remove(stateIds.unshift());
  }

  session.set('stateIds', stateIds);
  updateSessionState(url);
};

exports.pushSessionState = pushSessionState;

var updateSessionState = function updateSessionState(url) {
  session.set(swap.stateId, {
    expires: Date.now() + window.swap.sessionExpiration,
    html: document.documentElement.outerHTML,
    paneHistory: _toConsumableArray(swap.paneHistory),
    id: swap.stateId,
    selectors: [],
    url: url
  });
}; // const pushPaneState = (url, selectors) => {
//   swap.paneHistory.push({
//     selectors,
//     url: getUrl(url).pathname,
//     edited: false,
//     formsData: getPaneFormsData()
//   });
// }


exports.updateSessionState = updateSessionState;

var getPaneState = function getPaneState() {
  return swap.paneHistory[swap.paneHistory.length - 1];
};

exports.getPaneState = getPaneState;

var getPaneFormsData = function getPaneFormsData() {
  return _toConsumableArray(qsa(swap.qs.paneForms)).map(getFormData).toString();
};

exports.getPaneFormsData = getPaneFormsData;

var updateHistory = function updateHistory(url) {
  var pane = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (Object.keys(pane).length) {
    var path = getPath(url);

    if (pane.bypass) {
      updateSessionState(location.href);
    } else if (pane.reset) {
      swap.paneHistory = [];
      swap.paneUrl = false;
      swap.paneSaved = false;
      pushState(url);
    } else {
      if (pane.go === -1) {
        swap.paneHistory.pop();
      } else if (pane.go === 1) {
        swap.paneHistory.push({
          selectors: pane.selectors,
          url: path,
          edited: false,
          formsData: getPaneFormsData()
        });
      } else {
        swap.paneHistory[swap.paneHistory.length - 1].url = path;
      }

      location.hash = "#pane=".concat(path);
      swap.paneUrl = path;
      pushSessionState(location.href);
      replaceState(location.href);
    }
  } else {
    if (location.href === url) {
      updateSessionState(url);
    } else {
      pushState(url);
    }
  }
};

exports.updateHistory = updateHistory;
},{"./utils":"aMpx"}],"kIAT":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildRoute = exports.findRoute = void 0;

var buildRoute = function buildRoute(when, method, pattern, handle) {
  var regex = patternRegex(pattern);
  var params = getParams(pattern, regex);
  method = method.toLowerCase();
  return {
    when: when,
    method: method,
    pattern: pattern,
    regex: regex,
    params: params,
    handle: handle
  };
};

exports.buildRoute = buildRoute;

var findRoute = function findRoute(req, route) {
  var which = req.when === 'off' ? 'from' : 'to';
  var url = req[which];
  if (url === null) return false;
  var pathname = url.pathname;
  req.params = {};
  if (route.when !== req.when) return false;
  if (route.method !== req.method) return false;
  if (route.pattern === pathname) return true;
  var matches = pathname.match(route.regex);

  if (matches) {
    matches.shift();
    var i = 0;

    for (; i < route.params.length; i++) {
      req.params[route.params[i]] = matches[i];
    }

    return true;
  }

  return false;
};

exports.findRoute = findRoute;

var patternRegex = function patternRegex(pattern) {
  return new RegExp("^".concat(pattern.replace(/:[^\/\(\):.-]+/g, '([^/]+)'), "$"));
};

var getParams = function getParams(pattern, regex) {
  var regexChars = /\?|\(|\)/g;
  var matches = pattern.replace(regexChars, '').match(regex);

  if (matches) {
    matches.shift();
    return matches.map(function (item) {
      return item.replace(':', '');
    });
  }

  return [];
};
},{}],"zVRJ":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.delegateHandle = exports.fireRoutes = exports.fireElements = exports.listener = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('./utils.js'),
    qs = _require.qs,
    getUrl = _require.getUrl;

var _require2 = require('./router'),
    buildRoute = _require2.buildRoute,
    findRoute = _require2.findRoute;

var routes = {
  before: [],
  on: [],
  off: []
};
var elements = {
  on: [],
  off: []
};

var listener = function listener(when, pattern, handle) {
  if (typeof pattern === 'string') {
    if (pattern.startsWith('/') || pattern === '*') {
      if (pattern === '*') pattern = '.*';
      routes[when].push(buildRoute(when, 'get', pattern, handle));
    } else {
      elements[when].push({
        selector: pattern,
        handle: handle
      });
    }
  } else {
    routes[when].push(buildRoute(when, pattern.method, pattern.route, handle));
  }

  return swap;
};

exports.listener = listener;

var fireElements = function fireElements(when) {
  elements[when].forEach(function (el) {
    var target = qs(el.selector);

    if (target) {
      el.handle({
        target: target
      });
    }
  });
};

exports.fireElements = fireElements;

var fireRoutes = function fireRoutes(when, to, from) {
  var method = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'get';
  var event = buildEvent(when, to, from, method);
  routes[when].forEach(function (route) {
    var found = findRoute(event, route);

    if (found) {
      route.handle(_objectSpread({}, event, {}, {
        route: route
      }));
    }
  });
};

exports.fireRoutes = fireRoutes;

var buildEvent = function buildEvent(when, to, from, method) {
  return {
    to: getUrl(to),
    from: from ? getUrl(from) : null,
    when: when,
    method: method
  };
};

var delegateHandle = function delegateHandle(delegate, fn) {
  return function (e) {
    if (e.target.matches(delegate)) {
      return fn.apply(e.target, arguments);
    }

    var parent = e.target.closest(delegate);

    if (parent) {
      return fn.apply(parent, arguments);
    }
  };
};

exports.delegateHandle = delegateHandle;
},{"./utils.js":"aMpx","./router":"kIAT"}],"rIlB":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.closePanes = exports.removePane = exports.continuePane = exports.prevPane = exports.samePane = exports.addPane = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var _require = require('./utils'),
    $html = _require.$html,
    htmlToElement = _require.htmlToElement,
    qs = _require.qs;

var _require2 = require('./history'),
    getPaneState = _require2.getPaneState,
    updateSessionState = _require2.updateSessionState,
    updateHistory = _require2.updateHistory;

var addPane = function addPane(_ref) {
  var html = _ref.html,
      finalUrl = _ref.finalUrl,
      selectors = _ref.selectors;
  var bypass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  updateSessionState(location.href);
  $html.classList.add(swap.qs.paneIsOpen);
  var pane = htmlToElement(swap.paneTemplate); // pane.style.backgroundColor = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);

  document.body.appendChild(pane);
  var oldPane = qs('.Pane.is-active');

  if (oldPane) {
    oldPane.classList.remove('is-active');
  }

  setTimeout(function () {
    pane.querySelector('.Pane-expandBtn').href = finalUrl;
    pane.classList.add('is-visible', 'is-active');
    swap.to(html, selectors, true);
    updateHistory(finalUrl, {
      selectors: selectors,
      go: 1,
      bypass: bypass
    });
  }, 10);
};

exports.addPane = addPane;

var samePane = function samePane(_ref2) {
  var html = _ref2.html,
      finalUrl = _ref2.finalUrl;
  updateSessionState(location.href);
  swap.paneSaved = true;
  var paneState = getPaneState();
  paneState.edited = false;
  swap.to(html, paneState.selectors, true);
  updateHistory(finalUrl, {
    selectors: paneState.selectors
  });
};

exports.samePane = samePane;

var prevPane = function prevPane(url, html, selectors) {
  updateSessionState(location.href);
  var oldPane = qs('.Pane.is-active');
  var pane = oldPane.previousElementSibling;
  oldPane.classList.remove('is-active');
  pane.classList.add('is-active');

  if (html) {
    swap.to(html, selectors, true);
  }

  removePane(oldPane);
  updateHistory(url, {
    selectors: selectors,
    go: -1
  });
};

exports.prevPane = prevPane;

var continuePane = function continuePane(obj) {
  // handle error use cases
  var xhr = obj.xhr;

  if (xhr.status === 200) {
    swap.paneSaved = true;
    swap.closePane(obj);
  } else if (xhr.status >= 500) {
    samePane(obj);
  }
};

exports.continuePane = continuePane;

var closePanes = function closePanes() {
  $html.classList.remove(swap.qs.paneIsOpen);

  _toConsumableArray(document.querySelectorAll(swap.qs.pane)).forEach(removePane);

  updateHistory(location.href.replace(/#.*$/, ''), {
    reset: true
  });
};

exports.closePanes = closePanes;

var removePane = function removePane(pane) {
  pane.classList.remove('is-visible');
  setTimeout(function () {
    pane.remove();
  }, swap.paneDuration);
};

exports.removePane = removePane;
},{"./utils":"aMpx","./history":"KRaB"}],"NCdG":[function(require,module,exports) {
var css = require('./lib/css');

var _require = require('./lib/render'),
    renderTitle = _require.renderTitle,
    extractNewAssets = _require.extractNewAssets,
    assetsChanged = _require.assetsChanged,
    loadAssets = _require.loadAssets,
    renderBody = _require.renderBody;

var _require2 = require('./lib/request'),
    ajax = _require2.ajax,
    buildRequest = _require2.buildRequest;

var _require3 = require('./lib/history'),
    getPaneFormsData = _require3.getPaneFormsData,
    replaceState = _require3.replaceState,
    updateSessionState = _require3.updateSessionState,
    pushSessionState = _require3.pushSessionState,
    session = _require3.session,
    getPaneState = _require3.getPaneState,
    updateHistory = _require3.updateHistory;

var _require4 = require('./lib/events'),
    listener = _require4.listener,
    fireElements = _require4.fireElements,
    fireRoutes = _require4.fireRoutes,
    delegateHandle = _require4.delegateHandle;

var _require5 = require('./lib/pane'),
    prevPane = _require5.prevPane,
    continuePane = _require5.continuePane,
    samePane = _require5.samePane,
    addPane = _require5.addPane,
    closePanes = _require5.closePanes;

var _require6 = require('./lib/utils'),
    $html = _require6.$html,
    buildUrl = _require6.buildUrl,
    shouldSwap = _require6.shouldSwap,
    getUrl = _require6.getUrl,
    getPath = _require6.getPath,
    getSelectors = _require6.getSelectors,
    parseQuery = _require6.parseQuery,
    bypassKeyPressed = _require6.bypassKeyPressed;

window.swap = {
  sessionExpiration: 5000,
  request: false,
  metaKeyOn: false,
  paneUrl: false,
  paneHistory: [],
  paneSaved: false,
  before: listener.bind(window.swap, 'before'),
  on: listener.bind(window.swap, 'on'),
  off: listener.bind(window.swap, 'off'),
  stateId: -1,
  responseUrl: false
};

swap.to = function (html, selectors, inline, callback) {
  fireElements('off');
  var dom = typeof html === 'string' ? new DOMParser().parseFromString(html, 'text/html') : html;

  if (swap.responseUrl && assetsChanged(dom)) {
    location.href = swap.responseUrl;
  }

  var links = extractNewAssets(dom, 'link');
  var scripts = extractNewAssets(dom, 'script');
  if (!inline) renderTitle(dom);
  renderBody(dom, selectors);
  loadAssets(scripts.concat(links), function () {
    fireElements('on');
    if (callback) callback(); // if (!selectors.length) {
    //   // make this smarter where it only scrolls to top on different urls?
    //   window.scrollTo(0, 0);
    // }
  });
  return swap;
};

swap.with = function (options) {
  var selectors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : openPage;
  var req = buildRequest(options);
  var url = req.url,
      method = req.method;
  fireRoutes('before', url, location, method);
  ajax(req, function (xhr, res, html) {
    var wasRedirected = url.replace(/#.*$/, '') !== xhr.responseURL;
    var finalUrl = wasRedirected ? xhr.responseURL : url;
    var finalMethod = wasRedirected ? 'get' : method;
    callback({
      xhr: xhr,
      url: url,
      method: method,
      html: html,
      selectors: selectors,
      finalMethod: finalMethod,
      finalUrl: finalUrl
    });
  });
};

swap.event = function (name, delegate, fn) {
  var e = {
    name: name,
    target: window,
    fn: arguments.length !== 3 ? arguments[1] : delegateHandle(delegate, fn)
  };
  window.addEventListener(e.name, e.fn);
  return swap;
};

swap.click = function (e, selectors) {
  var link = this;
  if (!link.href || !shouldSwap(buildUrl(link))) return;

  if (!swap.metaKeyOn) {
    e.preventDefault();
    var sels = selectors || getSelectors(link);
    console.log({
      sels: sels
    });
    var swapInline = link.dataset.swapInline;

    if (swapInline) {
      swap.inline(link, sels);
    } else {
      swap.with(link, sels, link.dataset.hasOwnProperty('swapPane') ? addPane : openPage);
    }
  }
};

swap.inline = function (options) {
  var selectors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var req = buildRequest(options);
  ajax(req, function (xhr, res, html) {
    swap.to(html, selectors, true);
  });
};

swap.submit = function (e, selectors) {
  var form = e.target;
  if (!shouldSwap(getUrl(form.action))) return;
  if (!swap.formValidator(e)) return;
  e.preventDefault();
  var sels = selectors || getSelectors(form);
  var _form$dataset = form.dataset,
      swapInline = _form$dataset.swapInline,
      swapContinue = _form$dataset.swapContinue;

  if (swapInline) {
    swap.inline(form, sels);
  } else {
    var callback = swapContinue ? continuePane : $html.classList.contains(swap.qs.paneIsOpen) ? samePane : openPage;
    swap.with(form, sels, callback);
  }
};

swap.closePane = function () {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      html = _ref.html,
      finalUrl = _ref.finalUrl;

  if (swap.paneHistory.length >= 2) {
    var _swap$paneHistory = swap.paneHistory[swap.paneHistory.length - 2],
        url = _swap$paneHistory.url,
        edited = _swap$paneHistory.edited,
        selectors = _swap$paneHistory.selectors;

    if (!swap.paneSaved || edited) {
      prevPane(url, false, selectors);
    } else if (url === getPath(finalUrl)) {
      prevPane(url, html, selectors);
    } else {
      swap.with(url, selectors, function (_ref2) {
        var html = _ref2.html,
            finalUrl = _ref2.finalUrl,
            selectors = _ref2.selectors;
        return prevPane(finalUrl, html, selectors);
      });
    }
  } else {
    closePanes();
  }
};

var loadPane = function loadPane() {
  var bypass = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var params = parseQuery(location.hash.substr(1));

  if (params.pane) {
    swap.paneUrl = params.pane;
    swap.with(params.pane, swap.paneSelectors, function (obj) {
      return addPane(obj, bypass);
    });
  }
};

var loaded = function loaded(e) {
  if (!session.get('stateIds')) {
    session.set('stateIds', []);
    swap.stateId = -1;
  } else {
    var stateIds = session.get('stateIds');
    swap.stateId = stateIds[stateIds.length - 1];
  }

  if (location.hash) {
    loadPane();
  } else {
    fireElements('on');
    fireRoutes('on', location.href, null);
    pushSessionState(location.href);
    replaceState(location.href);
  }
};

var openPage = function openPage(_ref3) {
  var method = _ref3.method,
      html = _ref3.html,
      selectors = _ref3.selectors,
      finalMethod = _ref3.finalMethod,
      finalUrl = _ref3.finalUrl;
  var from = location.href;
  updateSessionState(location.href);

  if ($html.classList.contains(swap.qs.paneIsOpen)) {
    closePanes();
  }

  fireRoutes('off', finalUrl, from, method);
  swap.to(html, selectors, false, function () {
    updateHistory(finalUrl);
    fireRoutes('on', finalUrl, from, finalMethod);
  });
};

var popstate = function popstate(e) {
  /*
    - check if headers determine it should be cached or not
    - if not cached then ajax request
    - if cached then return state
    - check headers on whether to cache or not
  */
  if (!e.state) return;
  var pageState = session.get(e.state.id);
  if (!pageState) return reloadCurrentPage();
  var html = pageState.html,
      selectors = pageState.selectors,
      paneHistory = pageState.paneHistory,
      expires = pageState.expires,
      id = pageState.id;
  var forward = id > swap.stateId;
  var stateIds = session.get('stateIds');
  var justAtId = stateIds[stateIds.indexOf(id) + (forward ? -1 : 1)];
  var justAt = justAtId ? session.get(justAtId).url : null;
  if (justAt) updateSessionState(justAt);
  swap.stateId = id;
  swap.paneHistory = paneHistory;
  fireRoutes('off', location.href, justAt);

  if (expires < Date.now()) {
    console.log('reloading...');
    reloadCurrentPage(selectors);
  } else {
    var dom = new DOMParser().parseFromString(html, 'text/html');
    swap.to(dom, selectors, false, function () {
      $html.className = dom.documentElement.className;
      fireRoutes('on', location.href, justAt);
      updateSessionState(location.href);

      if (location.hash) {
        var params = parseQuery(location.hash.substr(1));
        if (params.pane) swap.paneUrl = params.pane;
      }
    });
  }
};

var reloadCurrentPage = function reloadCurrentPage() {
  var selectors = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var opts = {
    url: location.href,
    method: 'get'
  };
  ajax(opts, function (xhr, res, html) {
    var dom = new DOMParser().parseFromString(html, 'text/html');
    swap.to(dom, selectors, false, function () {
      $html.className = dom.documentElement.className;

      if (location.hash) {
        loadPane(true);
      } else {
        fireRoutes('on', location.href, null);
      }

      updateSessionState(location.href);
    });
  });
}; // const popstate = (e) => {
//   /*
//     - check if headers determine it should be cached or not
//     - if not cached then ajax request
//     - if cached then return state
//     - check headers on whether to cache or not
//   */
//   if (!e.state) return;
//   const { html, selectors, paneHistory, expires, id } = session.get(e.state.id);
//   const forward = id > swap.stateId;
//   const justAtId = session.get('stateIds').indexOf(id) + (forward ? -1 : 1);
//   console.log({justAtId});
//   const justAt = session.get(justAtId).url;
//   updateSessionState(justAt);
//   swap.stateId = id;
//   swap.paneHistory = paneHistory;
//   fireRoutes('off', location.href, justAt);
//   if (expires < Date.now()) {
//     console.log('reloading...');
//     const opts = { url: location.href, method: 'get' };
//     ajax(opts, (xhr, res, html) => {
//       const dom = new DOMParser().parseFromString(html, 'text/html');
//       swap.to(dom, selectors, false, () => {
//         $html.className = dom.documentElement.className;
//         if (location.hash) {
//           loadPane();
//         } else {
//           fireRoutes('on', location.href, null);
//         }
//       });
//     });
//   } else {
//     const dom = new DOMParser().parseFromString(html, 'text/html');
//     swap.to(dom, selectors, false, () => {
//       $html.className = dom.documentElement.className;
//       fireRoutes('on', location.href, justAt);
//     });
//   }
// if (expires < Date.now()) {
//   console.log('reloading...');
//   const opts = { url: location.href, method: 'get' };
//   ajax(opts, (xhr, res, html) => {
//     const dom = new DOMParser().parseFromString(html, 'text/html');
//     swap.to(dom, selectors, false, () => {
//       $html.className = dom.documentElement.className;
//       if (location.hash) {
//         loadPane();
//       } else {
//         fireRoutes('on', location.href, null);
//       }
//     });
//   });
// } else {
//   const dom = new DOMParser().parseFromString(html, 'text/html');
//   swap.to(dom, selectors, false, () => {
//     $html.className = dom.documentElement.className;
//     fireRoutes('on', location.href, justAt);
//   });
// }


module.exports = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  swap.qs = {};
  swap.qs.link = 'a:not([target="_blank"]):not([data-swap-ignore])';
  swap.qs.form = 'form:not([data-swap-ignore])';
  swap.qs.continue = '[data-swap-continue]';
  swap.qs.pane = '.Pane';
  swap.qs.paneActive = '.Pane.is-active';
  swap.qs.paneForms = "".concat(swap.qs.paneActive, " ").concat(swap.qs.form);
  swap.qs.paneContent = "".concat(swap.qs.paneActive, " .Pane-content");
  swap.qs.paneCloseBtn = '.Pane-closeBtn';
  swap.qs.paneIsOpen = 'swap-pane-is-open';
  swap.qs.paneDefaultEl = opts.paneDefaultEl || '.Main';
  swap.qs.paneDefaultRenderType = '>>';
  swap.paneTemplate = "\n    <div class=\"Pane ".concat(opts.paneClass, "\">\n      <button class=\"Pane-closeBtn\"></button>\n      <a class=\"Pane-expandBtn\"></a>\n      <div class=\"Pane-content\"></div>\n    </div>\n  ");
  swap.paneDuration = opts.paneDuration || 700;
  swap.paneSelectors = ["".concat(swap.qs.paneDefaultEl, " ").concat(swap.qs.paneDefaultRenderType, " ").concat(swap.qs.paneContent)];

  swap.formValidator = opts.formValidator || function (e) {
    return true;
  };

  swap.sessionExpiration = opts.sessionExpiration || 5000;
  swap.event('DOMContentLoaded', function () {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css(opts)));
    document.head.appendChild(style);
    loaded();
  });
  swap.event('popstate', popstate);
  swap.event('keydown', function (e) {
    if (bypassKeyPressed(e.key)) {
      swap.metaKeyOn = true;
    }
  });
  swap.event('keyup', function (e) {
    if (bypassKeyPressed(e.key)) {
      swap.metaKeyOn = false;
    }
  });
  swap.event('click', swap.qs.link, swap.click);
  swap.event('click', swap.qs.continue, function (e) {
    e.target.closest('form').dataset.swapContinue = 'true';
  });
  swap.event('input', swap.qs.paneForms, function (e) {
    var formsData = getPaneFormsData();
    var pane = getPaneState();

    if (pane) {
      pane.edited = formsData !== pane.formsData;
    }
  });
  swap.event('submit', swap.qs.form, swap.submit);
  swap.event('click', swap.qs.paneCloseBtn, function () {
    swap.closePane();
  });
  swap.event('keyup', function (e) {
    if (e.key === 'Escape') {
      swap.closePane();
    }
  });
  swap.event('click', ".".concat(swap.qs.paneIsOpen), function (e) {
    if (!e.target.closest(swap.qs.pane)) {
      updateSessionState(location.href);
      closePanes();
    }
  });
};
},{"./lib/css":"KyaV","./lib/render":"GeuA","./lib/request":"jE14","./lib/history":"KRaB","./lib/events":"zVRJ","./lib/pane":"rIlB","./lib/utils":"aMpx"}],"LJu5":[function(require,module,exports) {
"use strict";

var _index = _interopRequireDefault(require("../../index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _index.default)({
  color: '#c6000e',
  paneDuration: 300,
  sessionExpiration: 500
});
swap.on('.arrive', function (e) {
  alert('Arrived');
});
swap.off('.leave', function (e) {
  alert('Left');
});
swap.on('/route-on', function (e) {
  alert('On a route');
});
swap.off('/route-off', function (e) {
  alert('Off a route');
});
swap.before('/events', function (e) {
  alert("Before from: ".concat(e.from.href, ", to: ").concat(e.to.href));
});
swap.on('/events', function (e) {
  alert("On from: ".concat(e.from ? e.from.href : 'null', ", to: ").concat(e.to.href));
});
swap.off('/events', function (e) {
  alert("Off from: ".concat(e.from.href, ", to: ").concat(e.to.href));
});
},{"../../index.js":"NCdG"}]},{},["LJu5"], null)