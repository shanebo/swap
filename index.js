const addRoute = (when, pattern, handle) => {
  if (pattern === '*') pattern = '.*';
  swap._routes[when].push(buildRoute(location.origin + pattern, handle));
  return swap;
}

const swap = {};
swap._events = [];
swap._routes = { before: [], on: [] };
swap.on = addRoute.bind(null, 'on');
swap.before = addRoute.bind(null, 'before');

swap.with = (href, selectors = []) => {
  fetch(href)
    .then(res => res.text())
    .then(html => {
      swap.teardown();

      swap.to(html, selectors);
      window.history.pushState({ html, selectors }, '', href);
      if (!selectors.length) window.scrollTo(0, 0);
      swap.fire('on', href);
    })
    .catch(console.log);
  return swap;
}

swap.to = (html, selectors) => {
  const dom = new DOMParser().parseFromString(html, 'text/html');

  if (selectors.length) {
    // accounts for back/forward buttons where selectors no longer exist
    // in which cases we replace the entire page
    for (i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      const oldEl = document.querySelector(selector);
      if (!oldEl) {
        document.body = dom.body;
        break;
      }
      const newEl = dom.querySelector(selector);
      oldEl.parentNode.replaceChild(newEl, oldEl);
    }
  } else {
    document.body = dom.body;
  }

  document.head = dom.head;
  document.title = dom.head.querySelector('title').innerText;
  return swap;
}

swap.fire = (when, url) => {
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const pathname = link.origin + link.pathname;
  const query = parseQuery(link.search);

  swap._routes[when].forEach((route) => {
    if (route.pattern === pathname) {
      return route.handle({ params: {}, query });
    }

    const matches = pathname.match(route.regex);

    if (matches) {
      matches.shift();
      const e = { params: {}, query };
      let i = 0;
      for (; i < route.params.length; i++) {
        e.params[route.params[i]] = matches[i];
      }
      route.handle(e);
    }
  });
  return swap;
}

swap.teardown = () => {
  swap._events.forEach(e => e.target.removeEventListener(e.name, e.fn));
  swap._events = [];
  return swap;
}

swap.event = function (name, delegate, fn) {
  const e = {
    name,
    target: window,
    fn: arguments.length !== 3
      ? arguments[1]
      : function (e) {
          if (e.target.matches(delegate))
            return fn.apply(e.target, arguments);
        }
  };

  swap._events.push(e);
  window.addEventListener(e.name, e.fn);
  return swap;
}




const buildRoute = (pattern, handle) => {
  const regex = patternRegex(pattern);
  const params = getParams(pattern, regex);
  return {
    pattern,
    regex,
    params,
    handle
  }
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

const parseQuery = (search) => decodeURIComponent(search).substr(1)
  .split('&')
  .reduce((params, keyval) => {
      const [ key, val ] = keyval.split('=');
      params[key] = val;
      return params;
    }, {});



// HANDLES
let metaKeyOn = false;

const loaded = (e) => swap.fire('on', location.href);

const popstate = (e) => {
  const { html, selectors } = e.state;
  swap.to(html, selectors);
  window.history.replaceState({ html, selectors }, '', location.href);
  swap.fire('on', location.href);
}

const keyDownUp = (e) => {
  if (e.metaKey || e.ctrlKey) {
    metaKeyOn = !metaKeyOn;
  }
}

const click = (e) => {
  if (e.target.hostname !== location.hostname
    || e.target.protocol !== location.protocol) {
    return;
  }

  if (!metaKeyOn) {
    e.preventDefault();
    const href = e.target.href;
    const selectors = (e.target.dataset.swap || '')
      .split(',')
      .filter(selector => selector.trim());
    swap.fire('before', href);
    swap.with(href, selectors);
  }
}

// SETUP

// const EventDelegator = function(target, name, delegate, fn) {
//   return arguments.length !== 4
//     ? target.addEventListener(name, arguments[2])
//     : target.addEventListener(name, function(e) {
//         if (e.target.matches(delegate)) {
//           return fn.apply(e.target, arguments);
//         }
//       });
// }

// const EventDelegator = function(target, name, delegate, fn) {
//   return arguments.length !== 4
//     ? target.addEventListener(name, arguments[2])
//     : target.addEventListener(name, function(e) {
//         if (e.target.matches(delegate)) {
//           return fn.apply(e.target, arguments);
//         }
//       });
// }









// swap.event = EventDelegator;
// swap.event = delegator;


// swap.event(window, 'popstate', popstate);
// swap.event(window, 'keydown', keyDownUp);
// swap.event(window, 'keyup', keyDownUp);
// // swap.event('DOMContentLoaded', loaded);
// swap.event(window, 'click', 'a:not([target=_blank]):not([data-swap="false"])', click);

swap.event('DOMContentLoaded', loaded);

swap.on('*', (e) => {
  swap.event('DOMContentLoaded', loaded);
  swap.event('popstate', popstate);
  swap.event('keydown', keyDownUp);
  swap.event('keyup', keyDownUp);
  swap.event('click', 'a:not([target=_blank]):not([data-swap="false"])', click);
});

window.swap = swap;

