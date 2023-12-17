import swap from './swap.js';
import { getUrl } from './utils.js';
import { buildRoute, findRoute } from './router.js';


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
    const matches = [...document.querySelectorAll(el.selector)];
    if (matches.length) {
      el.handle({
        target: matches[0],
        targets: matches
      });
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


const buildEvent = (when, to, from, method) => ({
  to: getUrl(to),
  from: from ? getUrl(from) : null,
  when,
  method
});


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
