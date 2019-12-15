const talk = require('./talk');

const {
  findRoute,
  buildRoute,
  buildEvent,
  buildUrl,
  shouldSwap,
  getUrl,
  delegateHandle,
  getSelectors,
  getHeaders,
  removeEmptyProps,
  hashParams
} = require('./utils');


let paneUrl;
let isFormSubmit;
let paneHistory = [];


const swap = {
  routes: {
    before: [],
    on: [],
    off: []
  },
  elements: {
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


const innerHtmlRender = (oldEl, newEl) => {
  oldEl.innerHTML = newEl.innerHTML;
}

const replaceRender = (oldEl, newEl) => {
  oldEl.parentNode.replaceChild(newEl, oldEl);
}


swap.to = (html, sels, inline) => {
  fireElements('off');

  const dom = new DOMParser().parseFromString(html, 'text/html');
  const selectors = sels.map(sel => sel.split(/\s*->\s*/));

  const changes = selectors.map(sel => {
    if (sel[1]) {
      // arrow use case
      const oldEl = document.querySelector(sel[1]);
      const newEl = dom.querySelector(sel[0]);
      return !oldEl || !newEl
        ? null
        : innerHtmlRender.bind(null, oldEl, newEl);
    } else {
      const oldEl = document.querySelector(sel[0]);
      const newEl = dom.querySelector(sel[0]);
      return !oldEl || !newEl
        ? null
        : replaceRender.bind(null, oldEl, newEl);
    }
  }).filter(el => el);

  const fullSwap = (!selectors.length || (changes.length !== selectors.length));

  if (fullSwap) {
    document.body = dom.body;
  } else {
    changes.forEach(render => render());
  }

  if (!inline) {
    document.head = dom.head;
    document.title = dom.head.querySelector('title').innerText;
  }

  if (!selectors.length) {
    // make this smarter where it only scrolls to top on different urls?
    console.log('no selectors so scroll to top');
    window.scrollTo(0, 0);
  }

  fireElements('on');

  return swap;
}


swap.with = (options, selectors = [], inline) => {
  const opts = typeof options === 'string'
    ? { url: options, method: 'get' }
    : options;

  const { url, method } = opts;

  fireRoutes('before', url, method);

  if (inline) {
    opts.headers = {
      'x-requested-with': 'xmlhttprequest',
      'pane-url': paneUrl
    }
  }

  talk(opts, (xhr, res, html) => {
    const wasRedirected = url !== xhr.responseURL;
    const finalUrl = wasRedirected ? xhr.responseURL : url;
    const finalMethod = wasRedirected ? 'get' : method;

    if (inline || (isFormSubmit && document.documentElement.getAttribute('swap-pane-is-active'))) {
      swap.openPane(html, finalUrl);
    } else {
      document.documentElement.removeAttribute('swap-pane-is-active');

      const headers = getHeaders(xhr.getAllResponseHeaders());
      fireRoutes('off', url, method); // confusing but accurate because url is the toUrl
      swap.to(html, selectors);
      history.pushState({ html, selectors, headers, method: finalMethod }, '', finalUrl);
      fireRoutes('on', finalUrl, finalMethod);
    }

    isFormSubmit = false;
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
    const sels = selectors || getSelectors(link);

    if (link.dataset.swapPane) {
      swap.with(link.pathname, sels, true);
    } else {
      swap.with(link.href, sels);
    }
  }
}


swap.submit = function(e, selectors) {
  const form = e.target;
  const { action: url, method } = form;

  console.log('submit fired');

  if (!shouldSwap(getUrl(url))) return;

  if (!swap.formValidator(e)) return;

  e.preventDefault();

  isFormSubmit = true;

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
        'Content-Type': 'application/x-www-form-urlencoded',
        ...paneUrl && { 'pane-url': paneUrl }
      }
    }, selectors || getSelectors(form));
  }
}


const loaded = (e) => {
  if (location.hash) {
    const params = hashParams(location.hash);
    if (params.pane) {
      swap.with(params.pane, swap.pane.selectors, true);
    }
  } else {
    fireElements('on');
    fireRoutes('on', location.href);
  }
}


const popstate = (e) => {
  /*
    - check to if headers determine it should be cached or not
    - if not cached then ajax request
    - if cached then return state
    - check headers on whether to cache or not
  */

  if (location.hash) return;

  const { href } = location;
  const { html, selectors } = e.state;

  fireRoutes('off', href);
  swap.to(html, selectors);
  history.replaceState(e.state, '', href);
  fireRoutes('on', href);
}


let metaKeyOn = false;


const keyDownUp = (e) => {
  if (e.metaKey || e.ctrlKey) {
    metaKeyOn = !metaKeyOn;
  }
}


const fireElements = (when) => {
  swap.elements[when].forEach((el) => {
    const target = document.querySelector(el.selector);
    if (target) {
      el.handle({ target });
    }
  });
}


const fireRoutes = (when, url, method = 'get') => {
  const event = buildEvent(when, url, method);

  swap.routes[when].forEach((route) => {
    const found = findRoute(event, route);
    if (found) {
      route.handle({...event, ...{ route }});
    }
  });
}


window.swap = swap;
window.app = swap;


const loader = require('./loader');




const compressArr = (arr = []) => arr.reduce((list, next) => list.slice(-1)[0] === next ? list : [...list, next], []);



module.exports = function (opts = {}) {
  loader(opts);

  swap.formValidator = opts.formValidator || ((e) => true);

  swap.pane = opts.pane || {
    selector: '.Pane',
    selectors: ['.Main -> .PaneContent', '.PaneHeader'],
    closeButton: '.PaneCloseBtn',
    backButton: '.PaneBackBtn',
    open: (shouldScroll) => {
      if (shouldScroll) {
        document.querySelector(swap.pane.selector).scrollTop = 0;
      }
    },
    back: (url) => {
      swap.with(url, '.Main -> .PaneContent', true);
    },
    close: () => {
      console.log('close pane');
      // document.documentElement.removeAttribute('swap-pane-is-active');
      // const noHashURL = location.href.replace(/#.*$/, '');
      // window.history.replaceState('', document.title, noHashURL);
      // paneHistory = [];
    }
  };

  swap.openPane = (html, url) => {
    document.documentElement.setAttribute('swap-pane-is-active', 'true');
    const shouldScroll = !isFormSubmit;
    const pathname = getUrl(url).pathname;
    paneUrl = url; // should this be pathname?
    location.hash = `#pane=${pathname}`;
    paneHistory.push(location.hash.replace('#pane=', ''));
    paneHistory = compressArr(paneHistory);

    swap.to(html, swap.pane.selectors, true);
    swap.pane.open(shouldScroll);
    document.querySelector(swap.pane.backButton).style.display = paneHistory.length > 1 ? 'inline' : 'none';
  }

  swap.backPane = () => {
    paneHistory.pop();
    const url = paneHistory.pop();
    swap.pane.back(url);
  }

  swap.closePane = () => {
    document.documentElement.removeAttribute('swap-pane-is-active');
    const noHashURL = location.href.replace(/#.*$/, '');
    window.history.replaceState('', document.title, noHashURL);
    paneHistory = [];
    swap.pane.close();
  }

  const clickSelector = opts.clickSelector || 'a:not([target="_blank"]):not([data-swap="false"])';
  const formSelector = opts.formSelector || 'form:not([data-swap="false"])';

  window.addEventListener('DOMContentLoaded', loaded);
  window.addEventListener('popstate', popstate);
  window.addEventListener('keydown', keyDownUp);
  window.addEventListener('keyup', keyDownUp);
  window.addEventListener('click', delegateHandle(clickSelector, swap.click));
  window.addEventListener('submit', delegateHandle(formSelector, swap.submit));

  swap.event('click', swap.pane.backButton, swap.backPane);
  swap.event('click', swap.pane.closeButton, swap.closePane);
  swap.event('click', '[swap-pane-is-active]', (e) => {
    if (!e.target.closest(swap.pane.selector)) {
      swap.closePane();
    }
  });
}


// link has a pane flag
// swap ajax requests url in href
// swap puts element that matches selector from pane flag in pane element
// url/state/history/etc doesn't changes

// before = the event that fires before the ajax request is sent
// ajax = gets new state in html
// off = after the new html is in hand but before the swap happens
// on is after the swapping has updated the page to the latest state
// fire (off/on/before) should only fire route things when ajax is used
// elements should fire (off/on/before) when ajax or render is used
// pane use case = all the ajax workflow but a different swapping function (which handles popstate and swapping differently)

// swap.click -> with / pane
// swap.submit -> with
// swap.with(opts, selectors); // ajax
// swap.to(html, selectors);
// swap.to = calling off, swapping, on;
