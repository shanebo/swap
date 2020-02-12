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


const fireRoutes = (when, to, from, method = 'get') => {
  const event = buildEvent(when, to, from, method);
  routes[when].forEach((route) => {
    const found = findRoute(event, route);
    if (found) {
      route.handle({...event, ...{ route }});
    }
  });
}


const buildEvent = (when, to, from, method) => {
  return {
    to: getUrl(to),
    from: getUrl(from),
    when,
    method
  };
}


export {
  listener,
  fireElements,
  fireRoutes
};
