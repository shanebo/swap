const qs = document.querySelector.bind(document);
const qsa = document.querySelectorAll.bind(document);
const loader = require('./loader');

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
  hashParams,
  bypassKeyPressed
} = require('./utils');

let _paneUrl;
let _paneHistory = [];

const swap = {
  metaKeyOn: false
};

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


swap.before = listener.bind(swap, 'before');
swap.on = listener.bind(swap, 'on');
swap.off = listener.bind(swap, 'off');






swap.to = (html, sels, inline) => {
  fireElements('off');

  const dom = new DOMParser().parseFromString(html, 'text/html');
  const selectors = sels.map(sel => sel.split(/\s*->\s*/));

  const changes = selectors.map(sel => {
    if (sel[1]) {
      // arrow use case
      const oldEl = qs(sel[1]);
      const newEl = dom.querySelector(sel[0]);
      return !oldEl || !newEl
        ? null
        : innerHtmlRender.bind(null, oldEl, newEl);
    } else {
      const oldEl = qs(sel[0]);
      const newEl = dom.querySelector(sel[0]);
      return !oldEl || !newEl
        ? null
        : replaceRender.bind(null, oldEl, newEl);
    }
  }).filter(el => el);

  const fullSwap = (!selectors.length || (changes.length !== selectors.length));

  if (fullSwap) {
    document.body = dom.body;


            // CLEAN THIS UP. THIS ALLOWS INLINE SCRIPTS TO RUN
            // get a list of all <script> tags in the new page
            var tmpScripts = document.getElementsByTagName('script');

            if (tmpScripts.length > 0) {
              // push all of the document's script tags into an array
              // (to prevent dom manipulation while iterating over dom nodes)
              var scripts = [];
              for (var i = 0; i < tmpScripts.length; i++) {
                  scripts.push(tmpScripts[i]);
              }

              // iterate over all script tags and create a duplicate tags for each
              for (var i = 0; i < scripts.length; i++) {
                var s = document.createElement('script');
                s.innerHTML = scripts[i].innerHTML;

                // add the new node to the page
                scripts[i].parentNode.appendChild(s);

                // remove the original (non-executing) node from the page
                scripts[i].parentNode.removeChild(scripts[i]);
              }
            }



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




swap.with = (options, selectors = [], callback = openPage) => {
  const opts = typeof options === 'string'
    ? { url: options, method: 'get' }
    : options;

  const { url, method } = opts;

  fireRoutes('before', url, method);

  talk(opts, (xhr, res, html) => {
    const wasRedirected = url !== xhr.responseURL;
    const finalUrl = wasRedirected ? xhr.responseURL : url;
    const finalMethod = wasRedirected ? 'get' : method;

    callback({
      opts,
      xhr,
      url,
      method,
      html,
      selectors,
      finalMethod,
      finalUrl
    });
  });

  return swap;
}

swap.inline = (options, selectors = []) => {
  const opts = typeof options === 'string'
    ? { url: options, method: 'get' }
    : options;

  talk(opts, (xhr, res, html) => {
    swap.to(html, selectors, true);
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

  if (!link.href || !shouldSwap(buildUrl(link))) return;

  if (!swap.metaKeyOn) {
    e.preventDefault();
    const sels = selectors || getSelectors(link);

    if (link.dataset.swapPane) {
      swap.with(
        buildPaneClickRequest(link.pathname),
        sels,
        swap.pane.isActive
          ? nextPane
          : openPane
      );
    } else {
      swap.with(link.href, sels);
    }
  }
}


swap.submit = function(e, selectors) {
  const form = e.target;
  const inline = form.dataset.swapInline;
  const { action: url, method } = form;

  if (!shouldSwap(getUrl(url))) return;
  if (!swap.formValidator(e)) return;

  e.preventDefault();
  const sels = selectors || getSelectors(form);

  if (method.toLowerCase() === 'get') {
    const query = new URLSearchParams(new FormData(form)).toString();
    const cleanQuery = decodeURIComponent(query).replace(/[^=&]+=(&|$)/g, '').replace(/&$/, '');
    const search = cleanQuery ? '?' + encodeURI(cleanQuery) : cleanQuery;
    const urlWithParams = `${url}${search}`;

    if (inline) {
      swap.inline(urlWithParams, sels);
    } else {
      swap.with(urlWithParams, sels);
    }
  } else {
    if (inline) {
      swap.inline(buildSubmitRequest(form), sels);
    } else if (swap.pane.isActive) {
      swap.with(buildSubmitRequest(form), sels, samePane);
    } else {
      swap.with(buildSubmitRequest(form), sels);
    }
  }
}

const loaded = (e) => {
  if (location.hash) {
    const params = hashParams(location.hash);
    if (params.pane) {
      swap.with(
        buildPaneClickRequest(params.pane),
        swap.pane.selectors,
        openPane
      );
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

  if (!e.state || location.hash) return;

  const { href } = location;
  const { html, selectors } = e.state;

  fireRoutes('off', href);
  swap.to(html, selectors);
  history.replaceState(e.state, '', href);
  fireRoutes('on', href);
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

const openPage = (state) => {
  const { opts, xhr, url, method, html, selectors, finalMethod, finalUrl } = state;
  closePane();
  const headers = getHeaders(xhr.getAllResponseHeaders());
  fireRoutes('off', location.href, method);
  swap.to(html, selectors);
  history.pushState({ html, selectors, headers, method: finalMethod }, '', finalUrl);
  fireRoutes('on', finalUrl, finalMethod);
}

const updatePane = (direction, html) => {
  if (direction) {
    const activePane = qs('.PaneContent');
    const activeIndex = [...qsa('.PanesHolder > div')].indexOf(activePane);
    const newIndex = activeIndex + direction;
    activePane.classList.remove('PaneContent');
    if (direction === -1) activePane.innerHTML = '';
    qs(`.PanesHolder > div:nth-child(${newIndex + 1})`).classList.add('PaneContent');
    const mask = qs('.PaneMask');
    mask.style.setProperty('--pane-x', - (newIndex * mask.offsetWidth) + 'px');
  }

  swap.to(html, swap.pane.selectors, true);
  qs(swap.pane.backButton).style.display = _paneHistory.length > 1 ? 'inline' : 'none';
}

const addPaneHistory = (url) => {
  const pathname = getUrl(url).pathname;
  _paneUrl = url; // consider whether to handle urls with multiple query strings
  location.hash = `#pane=${pathname}`;
  _paneHistory.push(location.hash.replace('#pane=', ''));
}

const openPane = (state) => {
  swap.pane.isActive = true;
  document.documentElement.setAttribute('swap-pane-is-active', 'true');
  addPaneHistory(state.finalUrl);
  updatePane(0, state.html);
  // swap.pane.open();
  // const shouldScroll = !_isFormSubmit;
  // if (shouldScroll) {
  //   // qs('.PaneContent').scrollTop = 0;
  //   // qs(swap.pane.selector).scrollTop = 0;
  // }
}

const nextPane = (state) => {
  addPaneHistory(state.finalUrl);
  updatePane(1, state.html);
}

const samePane = (state) => {
  _paneHistory.pop();
  addPaneHistory(state.finalUrl);
  updatePane(0, state.html);
}

const prevPane = (state) => {
  updatePane(-1, state.html);
  // swap.pane.back();
}

const backPane = (e) => {
  _paneHistory.pop();
  // if (previous pane is NOT edited && current pane was saved) {
  // THEN RELOAD PREV PANE
    swap.with(
      buildPaneClickRequest(_paneHistory[_paneHistory.length - 1]),
      swap.pane.selectors,
      prevPane
    );
  // }
}

const closePane = () => {
  setTimeout(() => {
    [...qsa('.PanesHolder > div')].forEach((div, d) => {
      div.classList.remove('PaneContent');
      div.innerHTML = '';
      qs('.PaneMask').style.setProperty('--pane-x', '0px');
      if (d === 0) {
        div.classList.add('PaneContent');
      }
    });
  }, 700);

  swap.pane.isActive = false;
  document.documentElement.removeAttribute('swap-pane-is-active');
  const noHashURL = location.href.replace(/#.*$/, '');
  window.history.replaceState('', document.title, noHashURL);
  _paneHistory = [];
  // swap.pane.close();
}

const innerHtmlRender = (oldEl, newEl) => {
  oldEl.innerHTML = newEl.innerHTML;
}

const replaceRender = (oldEl, newEl) => {
  oldEl.parentNode.replaceChild(newEl, oldEl);
}

const buildPaneClickRequest = (url) => ({
  url,
  method: 'get',
  headers: {
    'x-requested-with': 'xmlhttprequest',
    'pane-url': _paneUrl
  }
});

const buildSubmitRequest = (form) => ({
  url: form.action,
  method: form.method,
  body: new URLSearchParams(new FormData(form)).toString(),
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    ..._paneUrl && { 'pane-url': _paneUrl }
  }
});



window.swap = swap;
window.app = swap;



module.exports = function (opts = {}) {
  loader(opts);

  swap.formValidator = opts.formValidator || ((e) => true);

  swap.pane = opts.pane || {
    selector: '.Pane',
    selectors: ['.Main -> .PaneContent', '.PaneHeader'],
    closeButton: '.PaneCloseBtn',
    backButton: '.PaneBackBtn',
    open: () => {},
    back: () => {},
    close: () => {}
  };

  const clickSelector = opts.clickSelector || 'a:not([target="_blank"]):not([data-swap="false"])';
  const formSelector = opts.formSelector || 'form:not([data-swap="false"])';

  window.addEventListener('DOMContentLoaded', loaded);
  window.addEventListener('popstate', popstate);

  window.addEventListener('keydown', (e) => {
    if (bypassKeyPressed(e.key)) {
      swap.metaKeyOn = true;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (bypassKeyPressed(e.key)) {
      swap.metaKeyOn = false;
    }
  });

  window.addEventListener('click', delegateHandle(clickSelector, swap.click));
  window.addEventListener('submit', delegateHandle(formSelector, swap.submit));

  swap.event('click', swap.pane.backButton, backPane);
  swap.event('click', swap.pane.closeButton, closePane);
  swap.event('click', '[swap-pane-is-active]', (e) => {
    if (!e.target.closest(swap.pane.selector)) {
      closePane();
    }
  });
}
