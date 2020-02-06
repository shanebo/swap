const { qs } = require('./dom');
const { getUrl, buildUrl } = require('./utils.js');
const { buildRoute, findRoute } = require('./router');


const routes = {
  before: [],
  on: [],
  off: []
};


const elements = {
  on: [],
  off: []
};


const listener = function(when, pattern, handle) {
  if (typeof pattern === 'string') {
    if (pattern.startsWith('/') || pattern === '*') {
      if (pattern === '*') pattern = '.*';
      routes[when].push(buildRoute(when, 'get', pattern, handle));
    } else {
      elements[when].push({ selector: pattern, handle });
    }
  } else {
    routes[when].push(buildRoute(when, pattern.method, pattern.route, handle));
  }

  return swap;
}


const fireElements = (when) => {
  elements[when].forEach((el) => {
    const target = qs(el.selector);
    if (target) {
      el.handle({ target });
    }
  });
}


const fireRoutes = (when, url, method = 'get') => {
  const event = buildEvent(when, url, method);
  routes[when].forEach((route) => {
    const found = findRoute(event, route);
    if (found) {
      route.handle({...event, ...{ route }});
    }
  });
}


const buildEvent = (when, url, method) => {
  const to = getUrl(url);
  const from = buildUrl(location); // if when is off I think this is right, but if it's on then I think it's wrong

  return {
    when,
    method,
    to,
    from
  };
}


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


export {
  listener,
  fireElements,
  fireRoutes,
  delegateHandle
};
