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

let paneUrl;
let isFormSubmit;
let paneHistory = [];
let activePanelIndex = -1;
let panelDirection = 1;

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
      swap.with(link.pathname, sels, true);
    } else {
      swap.with(link.href, sels);
    }
  }
}


swap.submit = function(e, selectors) {
  const form = e.target;
  const { action: url, method } = form;


  const inline = form.dataset.swapInline;
  console.log({ inline });


  if (!shouldSwap(getUrl(url))) return;
  if (!swap.formValidator(e)) return;

  e.preventDefault();

  isFormSubmit = true;


  const sels = selectors || getSelectors(form);
  console.log({ sels });



  // might be no bueno
  panelDirection = 0;


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
      swap.inline({
        url,
        method,
        body: new URLSearchParams(new FormData(form)).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }, sels);

    } else {
      swap.with({
        url,
        method,
        body: new URLSearchParams(new FormData(form)).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...paneUrl && { 'pane-url': paneUrl }
        }
      }, sels);
    }
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
    const target = document.querySelector(el.selector);
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


window.swap = swap;
window.app = swap;


const loader = require('./loader');













module.exports = function (opts = {}) {
  loader(opts);

  const changePanelTo = (index) => {
    const oldPanel = document.querySelector('.PaneContent');

    if (oldPanel) {
      oldPanel.classList.remove('PaneContent');
      // oldPanel.innerHTML = '';
    }

    const newPanel = document.querySelector(`.PanesHolder > div:nth-child(${index + 1})`);
    newPanel.classList.add('PaneContent');

    // const mask = document.querySelector('.PaneMask');
    // mask.style.setProperty('--pane-x', - (index * mask.offsetWidth) + 'px');
  }

  swap.formValidator = opts.formValidator || ((e) => true);

  swap.pane = opts.pane || {
    selector: '.Pane',
    selectors: ['.Main -> .PaneContent', '.PaneHeader'],
    closeButton: '.PaneCloseBtn',
    backButton: '.PaneBackBtn',
    open: () => {
    },

    back: (index) => {
      const oldPanel = document.querySelector('.PaneContent');
      if (oldPanel) {
        oldPanel.innerHTML = '';
      }

      changePanelTo(index);
      // if current pane has been edited
      // hard refresh back, unless previous pane was edited
      panelDirection = -1;
      const url = paneHistory[index];
      paneHistory.splice(index, 1);
      swap.with(url, swap.pane.selectors, true);
      // swap.with(url, '.Main -> .PaneContent', true);
    },

    close: () => {
      console.log('close pane');
      activePanelIndex = -1;
    }
  };

  swap.openPane = (html, url) => {
    document.documentElement.setAttribute('swap-pane-is-active', 'true');
    const shouldScroll = !isFormSubmit;
    const pathname = getUrl(url).pathname;
    paneUrl = url; // should this be pathname?
    location.hash = `#pane=${pathname}`;
    paneHistory.push(location.hash.replace('#pane=', ''));
    console.log({ activePanelIndex });
    console.log({ panelDirection });
    activePanelIndex += panelDirection;
    changePanelTo(activePanelIndex);
    panelDirection = 1;
    swap.to(html, swap.pane.selectors, true);
    swap.pane.open(shouldScroll);

    if (shouldScroll) {
      // document.querySelector('.PaneContent').scrollTop = 0;
      // document.querySelector(swap.pane.selector).scrollTop = 0;
    }

    document.querySelector(swap.pane.backButton).style.display = paneHistory.length > 1 ? 'inline' : 'none';
  }




  swap.backPane = () => {
    paneHistory.pop();
    swap.pane.back(paneHistory.length - 1);
  }

  swap.closePane = () => {
    setTimeout(() => {
      [...document.querySelectorAll('.PanesHolder > div')].forEach((div, d) => {
        div.classList.remove('PaneContent');
        div.innerHTML = '';
        if (d === 0) {
          div.classList.add('PaneContent');
        }
      });
    }, 700);


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

  swap.event('click', swap.pane.backButton, swap.backPane);
  swap.event('click', swap.pane.closeButton, swap.closePane);
  swap.event('click', '[swap-pane-is-active]', (e) => {
    if (!e.target.closest(swap.pane.selector)) {
      swap.closePane();
    }
  });
}
