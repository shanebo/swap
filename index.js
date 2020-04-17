const {
  talk,
  findRoute,
  buildRoute,
  buildEvent,
  buildUrl,
  shouldSwap,
  getUrl,
  delegateHandle,
  getSelectors,
  getHeaders,
  removeEmptyProps
} = require('./utils');


const swap = {
  routes: {
    before: [],
    on: [],
    off: []
  },
  elements: {
    before: [],
    on: [],
    off: []
  }
};


swap.listener = function(when, pattern, handle) {
  if (typeof pattern === 'string') {
    if (pattern.startsWith('/') || pattern === '*') {
      if (pattern === '*') pattern = '.*';
      swap.routes[when].push(buildRoute(when, 'get', pattern, handle));
    } else {
      swap.elements[when].push({ selector: pattern, handle });
    }
  } else {
    swap.routes[when].push(buildRoute(when, pattern.method, pattern.route, handle));
  }

  return swap;
}


swap.before = swap.listener.bind(swap, 'before');
swap.on = swap.listener.bind(swap, 'on');
swap.off = swap.listener.bind(swap, 'off');


swap.to = (html, sels) => {
  const selectors = sels.map(sel => sel.split(/\s*->\s*/));
  const dom = new DOMParser().parseFromString(html, 'text/html');
  const oldEls = selectors.map(sel => document.querySelector(sel[0])).filter(el => el);
  const newEls = selectors.map(sel => dom.querySelector(sel[1] || sel[0])).filter(el => el);
  const fullSwap = (selectors.length === 0 || oldEls.length !== selectors.length || newEls.length !== selectors.length);

  if (fullSwap) {
    document.body = dom.body;
  } else {
    selectors.forEach((sel, s) => {
      const oldEl = oldEls[s];
      const newEl = newEls[s];
      oldEl.parentNode.replaceChild(newEl, oldEl);
    });
  }

  document.head = dom.head;
  document.title = dom.head.querySelector('title').innerText;
  return swap;
}

// swap.to = (html, selectors) => {
//   const dom = new DOMParser().parseFromString(html, 'text/html');
//   const oldEls = selectors.map(sel => document.querySelector(sel)).filter(el => el);
//   const fullSwap = (selectors.length === 0 || oldEls.length !== selectors.length);

//   if (fullSwap) {
//     document.body = dom.body;
//   } else {
//     selectors.forEach((sel, s) => {
//       const oldEl = oldEls[s];
//       const newEl = dom.querySelector(sel);
//       oldEl.parentNode.replaceChild(newEl, oldEl);
//     });
//   }

//   document.head = dom.head;
//   document.title = dom.head.querySelector('title').innerText;
//   return swap;
// }


swap.with = (options, selectors = []) => {
  const opts = typeof options === 'string'
    ? { url: options, method: 'get' }
    : options;

  const { url, method } = opts;

  swap.fire('before', url, method); // before is the only when where method matters

  // console.log({ selectors });


  talk(opts, (xhr, res, html) => {
    const wasRedirected = url !== xhr.responseURL;
    const finalUrl = wasRedirected ? xhr.responseURL : url;
    const finalMethod = wasRedirected ? 'get' : method;
    const headers = getHeaders(xhr.getAllResponseHeaders());

    swap.fire('off', url, method); // confusing but accurate because url is the toUrl
    swap.to(html, selectors);
    history.pushState({ html, selectors, headers, method: finalMethod }, '', finalUrl);

    // make this smarter where it only scrolls to top on different urls?
    if (!selectors.length) window.scrollTo(0, 0);

    swap.fire('on', finalUrl, finalMethod);
  });

  return swap;
}


swap.fire = (when, url, method = 'get') => {
  const event = buildEvent(when, url, method);

  if (when !== 'before') {
    // we can never know before an element exists
    swap.elements[when].forEach((el) => {
      const target = document.querySelector(el.selector);
      if (target) {
        el.handle({...event, ...{ target }});
      }
    });
  }

  swap.routes[when].forEach((route) => {
    const found = findRoute(event, route);
    if (found) {
      route.handle({...event, ...{ route }});
    }
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


swap.click = function(e, selectors) {
  const link = this;

  if (!shouldSwap(buildUrl(link))) return;

  if (!metaKeyOn) {
    e.preventDefault();
    swap.with(link.href, selectors || getSelectors(link));
  }
}

/*
.Main -> .PaneContent
*/




swap.submit = function(e, selectors) {
  const form = e.target;
  const { action: url, method } = form;

  if (!shouldSwap(getUrl(url))) return;

  if (!swap.formValidator(e)) return;

  e.preventDefault();

  if (method.toLowerCase() === 'get') {
    // const obj = removeEmptyProps(new FormData(form));
    // const query = new URLSearchParams(obj).toString();
    // const search = query ? '?' + query : query;
    // const urlWithParams = `${url}${search}`;

    const query = new URLSearchParams(new FormData(form)).toString();
    // const cleanQuery = query.replace(/[^=&]+=(&|$)/g, '').replace(/&$/, '');
    const cleanQuery = decodeURIComponent(query).replace(/[^=&]+=(&|$)/g, '').replace(/&$/, '');
    const search = cleanQuery ? '?' + encodeURI(cleanQuery) : cleanQuery;
    const urlWithParams = `${url}${search}`;


    console.log({ urlWithParams });
    swap.with(urlWithParams, selectors || getSelectors(form));
  } else {
    swap.with({
      url,
      method,
      body: new URLSearchParams(new FormData(form)).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }, selectors || getSelectors(form));
  }
}


const loaded = (e) => swap.fire('on', location.href);

const popstate = (e) => {
  /*
    - check to if headers determine it should be cached or not
    - if not cached then ajax request
    - if cached then return state
    - check headers on whether to cache or not
  */

  if (location.hash) return;

  console.log(e.state.headers);


  const { href } = location;
  const { html, selectors } = e.state;

  swap.fire('off', href);
  swap.to(html, selectors);
  history.replaceState(e.state, '', href);
  swap.fire('on', href);
}

let metaKeyOn = false;

const keyDownUp = (e) => {
  if (e.metaKey || e.ctrlKey) {
    metaKeyOn = !metaKeyOn;
  }
}



window.swap = swap;
window.app = swap;


const loader = require('./loader');

module.exports = function (opts = {}) {
  loader(opts);

  swap.formValidator = opts.formValidator || ((e) => true);

  const clickSelector = opts.clickSelector || 'a:not([target="_blank"]):not([data-swap="false"])';
  const formSelector = opts.formSelector || 'form:not([data-swap="false"])';

  window.addEventListener('DOMContentLoaded', loaded);
  window.addEventListener('popstate', popstate);
  window.addEventListener('keydown', keyDownUp);
  window.addEventListener('keyup', keyDownUp);
  window.addEventListener('click', delegateHandle(clickSelector, swap.click));
  window.addEventListener('submit', delegateHandle(formSelector, swap.submit));
}


