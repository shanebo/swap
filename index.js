const swap = {
  routes: [],
  elements: {
    before: [],
    on: [],
    off: []
  }
};

swap.listener = function(method, pattern, handle) {
  if (pattern.startsWith('/')) {
    if (pattern === '*') pattern = '.*';
    swap.routes.push(buildRoute(method, location.origin + pattern, handle));
  } else {
    swap.elements[method].push({ selector: pattern, handle });
  }
  return swap;
}

// ['before', 'off', 'on'].forEach(method => {
//   swap[method] = swap.listener.bind(swap, method);
// });

swap.before = swap.listener.bind(swap, 'before');
swap.on = swap.listener.bind(swap, 'on');
swap.off = swap.listener.bind(swap, 'off');

swap.with = (href, selectors = []) => {
  fetch(href)
    .then(res => res.text())
    .then(html => {
      swap.fire('off', location.href);
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
  const oldEls = selectors.map(sel => document.querySelector(sel)).filter(el => el);
  const fullSwap = (selectors.length === 0 || oldEls.length !== selectors.length);

  swap.elements.off.forEach(el => {
    if (document.querySelector(el.selector)) el.handle();
  });

  if (fullSwap) {
    document.body = dom.body;
  } else {
    selectors.forEach((sel, s) => {
      const oldEl = oldEls[s];
      const newEl = dom.querySelector(sel);
      oldEl.parentNode.replaceChild(newEl, oldEl);
    });
  }

  document.head = dom.head;
  document.title = dom.head.querySelector('title').innerText;
  return swap;
}

swap.fire = (method, url) => {
  if (method === 'before' || method === 'on') {
    swap.elements[method].forEach(el => {
      if (document.querySelector(el.selector)) {
        el.handle();
      }
    });
  }

  const req = buildRequest(method, url);
  swap.routes.forEach((route) => {
    const handle = findRoute(req, route);
    if (handle) return handle(req);
  });
  return swap;
}

swap.event = function(name, delegate, fn) {
  const e = {
    name,
    target: window,
    fn: arguments.length !== 3
      ? arguments[1]
      : delegateHandle(delegate, fn)
  };

  window.addEventListener(e.name, e.fn);
  return swap;
}



const findRoute = (req, route) => {
  if (route.method !== req.method) return false;
  if (route.pattern === req.pathname) return route.handle;

  const matches = req.pathname.match(route.regex);

  if (matches) {
    matches.shift();
    let i = 0;
    req.params = {};
    for (; i < route.params.length; i++) {
      req.params[route.params[i]] = matches[i];
    }
    return route.handle;
  }

  return false;
}

const buildRoute = (method, pattern, handle) => {
  const regex = patternRegex(pattern);
  const params = getParams(pattern, regex);
  return { method, pattern, regex, params, handle };
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

const buildRequest = (method, url) => {
  const link = document.createElement('a');
  link.setAttribute('href', url);
  return {
    method,
    pathname: link.origin + link.pathname,
    query: parseQuery(link.search)
  };
}

const parseQuery = (search) => decodeURIComponent(search).substr(1)
  .split('&')
  .reduce((params, keyval) => {
      const [ key, val ] = keyval.split('=');
      params[key] = val;
      return params;
    }, {});

let metaKeyOn = false;

const loaded = (e) => swap.fire('on', location.href);

const popstate = (e) => {
  const { href } = location;
  const { html, selectors } = e.state;
  swap.fire('off', href);
  swap.to(html, selectors);
  window.history.replaceState(e.state, '', href);
  swap.fire('on', href);
}

const keyDownUp = (e) => {
  if (e.metaKey || e.ctrlKey) {
    metaKeyOn = !metaKeyOn;
  }
}

const click = function(e) {
  const link = this;
  if (link.hostname !== location.hostname
    || link.protocol !== location.protocol) {
    return;
  }

  if ((link.pathname === location.pathname) && link.hash) {
    return;
  }

  if (!metaKeyOn) {
    e.preventDefault();
    const href = link.href;
    const selectors = (link.dataset.swap || '')
      .split(',')
      .filter(selector => selector.trim());
    swap.fire('before', href);
    swap.with(href, selectors);
  }
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

window.addEventListener('DOMContentLoaded', loaded);
window.addEventListener('popstate', popstate);
window.addEventListener('keydown', keyDownUp);
window.addEventListener('keyup', keyDownUp);
window.addEventListener('click', delegateHandle('a:not([target="_blank"]):not([data-swap="false"])', click));

window.swap = swap;





// routes
// - every route fires when it matches
// - every route fires off when page state change

// components
// - has checks run on every page transition
// - not fires if it was on previous page





// app.event('resize', fn);
// app.event('click', '.btn', fn);


// swap.on('*', () => {
//   let timeout = 0;
//   swap.event('input', '.ApjSearchInput', (e) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       const value = e.target.value;
//       const url = `${location.origin + location.pathname}?q=${value}`;
//       swap.with(url, ['.ApjResources']);
//     }, 10);
//   });
// });


// app.globalEvent('input', '.ApjSearchInput', (e) => {

// });


// swap.has('.ApjSearchInput', () => {
//   let timeout = 0;
//   swap.event('input', '.ApjSearchInput', (e) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       const value = e.target.value;
//       const url = `${location.origin + location.pathname}?q=${value}`;
//       swap.with(url, ['.ApjResources']);
//     }, 10);
//   });
// });

// const scroll = (e) => 'doin something';

// app.on('.btn', (e) => {
//   btn.addEventListener('scroll', scroll);
// });

// app.off('.btn', (e) => {
//   btn.removeEventListener('scroll', scroll);
// });

// app.on('/foo', (e) => {
//   btn.addEventListener('scroll', scroll);
//   window.addEventListener('resize', resize);
// });

// app.off('/foo', (e) => {
//   btn.removeEventListener('scroll', scroll);
// });

// app.on('/foo', (e) => {
//   btn.addEventListener('scroll', scroll);
//   app.event('resize', resize);
// });
