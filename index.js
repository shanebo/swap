class Router {
  constructor() {
    this.stack = [];
    ['before', 'on'].forEach(method => {
      this[method] = this.create.bind(this, method);
    });
  }

  create(method, pattern, handle) {
    if (pattern === '*') pattern = '.*';
    this.stack.push(buildRoute(method, location.origin + pattern, handle));
    return this;
  }

  find(req, route) {
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







const router = new Router();
const swap = {};
swap._events = [];
swap._elements = [];
swap.on = router.on.bind(router);
swap.before = router.before.bind(router);

swap.has = (selector, handle) => {
  // THESE NEED TO BE CHECKED BEFORE PUSHING ONTO ARRAY
  // on second thought I don't think this is needed
  swap._elements.push({ selector, handle });
}

swap.with = (href, selectors = []) => {
  fetch(href)
    .then(res => res.text())
    .then(html => {
      // swap.teardown();
      swap.to(html, selectors);
      window.history.pushState({ html, selectors }, '', href);
      if (!selectors.length) window.scrollTo(0, 0);
      swap.fire('on', href);
    })
    .catch(console.log);
  return swap;
}

swap.to = (html, selectors) => {
  // refactor this
  const dom = new DOMParser().parseFromString(html, 'text/html');

  if (selectors.length) {
    // accounts for back/forward buttons where selectors no longer exist
    // in which cases we replace the entire page
    for (i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      const oldEl = document.querySelector(selector);
      if (!oldEl) {
        swap.teardown();
        document.body = dom.body;
        break;
      }
      const newEl = dom.querySelector(selector);
      oldEl.parentNode.replaceChild(newEl, oldEl);
    }

    let indexesToDelete = [];
    swap._events.forEach((e, i) => {
      if (e.delegate && !dom.querySelector(e.delegate)) {
        e.target.removeEventListener(e.name, e.fn);
        indexesToDelete.push(i);
      }
    });
    indexesToDelete.reverse().forEach(i => swap._events.splice(i, 1));
    // console.log('\n\n\n');
    // console.log({ indexesToDelete });
    // console.log('swap._events before', swap._events);
    // console.log('swap._events after', swap._events);
  } else {
    swap.teardown();
    document.body = dom.body;
  }

  document.head = dom.head;
  document.title = dom.head.querySelector('title').innerText;
  return swap;
}

swap.fire = (method, url) => {
  // should this be here?
  if (method === 'on') {
    swap._elements.forEach(el => {
      if (document.querySelector(el.selector)) {
        el.handle();
      }
    });
  }

  const req = buildRequest(method, url);
  router.stack.forEach((route) => {
    const handle = router.find(req, route);
    if (handle) return handle(req);
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
    delegate,
    target: window,
    origFn: (arguments.length !== 3 ? arguments[1] : fn).toString(),
    fn: arguments.length !== 3
      ? arguments[1]
      : delegateHandle(delegate, fn)
  };

  if (typeof delegate !== 'string') e.delegate = false;

  const exists = swap._events.some(ev =>
      ev.name === e.name
      && ev.delegate === e.delegate
      && ev.origFn === e.origFn);

  if (!exists) {
    console.log(e.delegate);
    swap._events.push(e);
    window.addEventListener(e.name, e.fn);
  }

  return swap;
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
  const { html, selectors } = e.state;
  swap.teardown();
  swap.to(html, selectors);
  window.history.replaceState(e.state, '', location.href);
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

const delegateHandle = function(delegate, fn) {
  return function(e) {
    if (e.target.matches(delegate))
      return fn.apply(e.target, arguments);
  }
}

window.addEventListener('DOMContentLoaded', loaded);
window.addEventListener('popstate', popstate);
window.addEventListener('keydown', keyDownUp);
window.addEventListener('keyup', keyDownUp);
window.addEventListener('click', delegateHandle('a:not([target=_blank]):not([data-swap="false"])', click));

window.swap = swap;







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

// app.has('.btn', (e) => {
//   btn.addEventListener('scroll', scroll);
// });

// app.not('.btn', (e) => {
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
