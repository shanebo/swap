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


const buildEvent = (when, toUrl, method) => {
  // const link = document.createElement('a');
  // link.setAttribute('href', toUrl);
  //   const to = buildUrl(link);
  const to = buildUrl(new URL(toUrl));
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
    return false;
  }

  if ((destination.pathname === location.pathname) && destination.hash) {
    return false;
  }

  return true;
}

const getUrl = (url) => {
  const source = document.createElement('a');
  source.setAttribute('href', url);
  return buildUrl(source);
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


const getSelectors = (el) => (el.dataset.swap || '').split(',').map(selector => selector.trim()).filter(selector => selector);


export {
  findRoute,
  buildRoute,
  buildEvent,
  getSelectors,
  parseQuery,
  buildUrl,
  getUrl,
  shouldSwap,
  delegateHandle
};
