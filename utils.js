const talk = require('./talk');


const findRoute = (req, route) => {
  req.params = {}; // this needs to get returned somehow !!!!!!!!!!!!!!!!!!!

  if (route.when !== req.when) return false;
  if (route.method !== req.method) return false;
  if (route.pattern === req.to.pathname) return true;

  const matches = req.to.pathname.match(route.regex);

  if (matches) {
    matches.shift();
    let i = 0;
    for (; i < route.params.length; i++) {
      req.params[route.params[i]] = matches[i];
    }
    return true;
  }

  return false;
}


const buildRoute = (when, method, pattern, handle) => {
  const regex = patternRegex(pattern);
  const params = getParams(pattern, regex);
  method = method.toLowerCase();
  return { when, method, pattern, regex, params, handle };
}


const patternRegex = (pattern) =>
  new RegExp(`^${pattern.replace(/:[^\/\(\):.-]+/g, '([^/]+)')}$`);


const getParams = (pattern, regex) => {
  const regexChars = /\?|\(|\)/g;
  const matches = pattern.replace(regexChars, '').match(regex);
  if (matches) {
    matches.shift();
    return matches.map(item => item.replace(':', ''));
  }
  return [];
}


const getUrl = (url) => {
  const source = document.createElement('a');
  source.setAttribute('href', url);
  return buildUrl(source);
}


const buildEvent = (when, url, method) => {
  const to = getUrl(url);
  const from = buildUrl(location);

  return {
    when,
    method,
    to,
    from
  };
}


const shouldSwap = (destination) => {
  if (destination.hostname !== location.hostname
    || destination.protocol !== location.protocol) {
      alert('hostname protocol failed so hard refresh');
    return false;
  }

  if ((destination.pathname === location.pathname) && destination.hash) {
    return false;
  }

  return true;
}


const parseQuery = (search) => decodeURIComponent(search).substr(1)
  .split('&')
  .reduce((params, keyval) => {
      const [ key, val ] = keyval.split('=');
      params[key] = val;
      return params;
    }, {});


const delegateHandle = function(delegate, fn) {
  return function(e) {
    if (e.target.matches(delegate)) {
      return fn.apply(e.target, arguments);
    }

    const parent = e.target.closest(delegate);

    if (parent) {
      return fn.apply(parent, arguments);
    }
  }
}


const buildUrl = (source) => {
  const obj = {
    query: parseQuery(source.search)
  };

  [
    'href',
    'protocol',
    'host',
    'hostname',
    'port',
    'pathname',
    'search',
    'hash',
    'origin'
  ].forEach(prop => obj[prop] = source[prop]);

  return obj;
}


const getSelectors = (el) => (el.dataset.swap || el.dataset.swapPane || '').split(',').map(selector => selector.trim()).filter(selector => selector);
// const getSelectors = (el) => (el.dataset.swap || '').split(',').map(selector => selector.trim()).filter(selector => selector);


const getHeaders = (str) => {
  return str.trim().split('\n').map(line => {
    const splat = line.split(':');
    return {
      [splat[0].trim()]: splat[1].trim()
    };
  }).reduce(((r, c) => Object.assign(r, c)), {});
}


const removeEmptyProps = (obj) =>
  Object.fromEntries(
    Object.entries(obj)
      .filter(([k, v]) => v != null)
      .map(([k, v]) => (typeof v === 'object' ? [k, removeEmptyProps(v)] : [k, v]))
  );


const hashParams = (hash) => hash.substr(1).split('&').reduce((result, item) => {
  const [param, value] = item.split('=');
  result[param] = value;
  return result;
}, {});


export {
  talk,
  findRoute,
  buildRoute,
  buildEvent,
  getSelectors,
  parseQuery,
  buildUrl,
  getUrl,
  shouldSwap,
  delegateHandle,
  removeEmptyProps,
  getHeaders,
  hashParams
};