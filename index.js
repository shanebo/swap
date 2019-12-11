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

  // this should only run if it's not the pane scenario
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


  // if (pane) -> pane();
  // if (normal) -> normal();


  talk(opts, (xhr, res, html) => {
    // this is putting links inside pane that aren't pane links
    if (document.documentElement.classList.contains('ix-pane')) {
      updatePane(html, '.Main -> .PaneContent', method);
      swap.fire('on', url, method);
      return;
    }


    const wasRedirected = url !== xhr.responseURL;
    const finalUrl = wasRedirected ? xhr.responseURL : url;
    const finalMethod = wasRedirected ? 'get' : method;
    const headers = getHeaders(xhr.getAllResponseHeaders());

    swap.fire('off', url, method); // confusing but accurate because url is the toUrl
    swap.to(html, selectors);
    history.pushState({ html, selectors, headers, method: finalMethod }, '', finalUrl);

    // make this smarter where it only scrolls to top on different urls?
    console.log({ selectors });
    console.log('!selectors.length', !selectors.length);
    // window.scrollTo(0, 0);
    if (!selectors.length) {
      console.log('no selectors so scroll to top');
      window.scrollTo(0, 0);
    }

    swap.fire('on', finalUrl, finalMethod);
  });

  return swap;
}


swap.fire = (when, url, method = 'get') => {
  const event = url ? buildEvent(when, url, method) : {};
  // const event = buildEvent(when, url, method);

  if (when !== 'before') {
    // we can never know before an element exists
    swap.elements[when].forEach((el) => {
      const target = document.querySelector(el.selector);
      if (target) {
        el.handle({...event, ...{ target }});
      }
    });
  }

  if (url) {
    swap.routes[when].forEach((route) => {
      const found = findRoute(event, route);
      if (found) {
        route.handle({...event, ...{ route }});
      }
    });
  }

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

    if (link.dataset.swapPane) {
      swap.pane(link.pathname, link.dataset.swapPane);
      // swap.pane(link.href, link.dataset.swapPane);
    } else {
      swap.with(link.href, selectors || getSelectors(link));
    }
  }
}





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
        'Content-Type': 'application/x-www-form-urlencoded',
        ...paneUrl && { 'pane-url': paneUrl }
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





// link has a pane flag
// swap ajax requests url in href
// swap puts element that matches selector from pane flag in pane element
// url/state/history/etc doesn't changes

let paneUrl;

swap.pane = (url, selector) => {
  // PANE SELECTORS SHOULD BE ABLE TO HANDLE MULTIPLE SELECTORS
  //

  const opts = {
    url,
    method: 'get',
    headers: {
      'x-requested-with': 'xmlhttprequest',
      'pane-url': paneUrl
    }
  };

  console.log({ url });


  // const pathname = getUrl(url).pathname;
  // const pathname = new URL(url, location.href.replac url).pathname;
  const pathname = new URL(url, location.href.replace(url, '')).pathname;

  console.log({ pathname });

  paneUrl = url;

  location.hash = `#pane=${pathname}`;

  talk(opts, (xhr, res, html) => {
    updatePane(html, selector, opts.method);
    swap.fire('on', paneUrl, opts.method);
    // const selectors = selector.split(/\s*->\s*/);
    // const dom = new DOMParser().parseFromString(html, 'text/html');
    // document.querySelector(selectors[1]).innerHTML = dom.querySelector(selectors[0]).innerHTML;

    // const oldPaneHeader = document.querySelector('.PaneHeader');
    // oldPaneHeader.parentNode.replaceChild(dom.querySelector('.PaneHeader'), oldPaneHeader);

    // document.documentElement.classList.add('ix-pane');
  });

  return swap;
}



const updatePane = (html, selector = '.Main -> .PaneContent', method) => {
  const selectors = selector.split(/\s*->\s*/);
  const dom = new DOMParser().parseFromString(html, 'text/html');
  document.querySelector(selectors[1]).innerHTML = dom.querySelector(selectors[0]).innerHTML;
  const oldPaneHeader = document.querySelector('.PaneHeader');
  oldPaneHeader.parentNode.replaceChild(dom.querySelector('.PaneHeader'), oldPaneHeader);

  if (method === 'get') {
    document.querySelector('.Pane').scrollTop = 0;
  }

  document.documentElement.classList.add('ix-pane');
}



const hashParams = (hash) => hash.substr(1).split('&').reduce(function (result, item) {
    var parts = item.split('=');
    result[parts[0]] = parts[1];
    return result;
}, {});


document.addEventListener('DOMContentLoaded', function() {
  if (location.hash) {
    const params = hashParams(location.hash);
    if (params.pane) {
      console.log('params.pane', params.pane);
      swap.pane(params.pane, '.Main -> .PaneContent');
    }
  }
});









swap.using = (html, selectors = []) => {
  console.log('swap.using');
  // swap.fire('before');
  swap.fire('off');
  swap.to(html, selectors);
  // make this smarter where it only scrolls to top on different urls?
  if (!selectors.length) window.scrollTo(0, 0);
  swap.fire('on');
  return swap;
}


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
// swap.pane(url, selectors); // ajax
// swap.to(html, selectors);
// swap.using(html, selectors);
