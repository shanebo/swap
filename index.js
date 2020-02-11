const loader = require('./lib/loader');
const { $html, renderTitle, extractNewAssets, renderAssets, renderBody } = require('./lib/dom');
const { talk, buildPaneClickRequest, buildSubmitRequest } = require('./lib/request');
const { pushState, replaceState } = require('./lib/history');
const { listener, fireElements, fireRoutes, delegateHandle } = require('./lib/events');
const { prevPane, samePane, openPane, nextPane, resetPane } = require('./lib/pane');
const { buildUrl, shouldSwap, getUrl, getSelectors, parseQuery, bypassKeyPressed } = require('./lib/utils');


window.swap = {
  metaKeyOn: false,
  paneUrl: false,
  paneHistory: [],
  before: listener.bind(window.swap, 'before'),
  on: listener.bind(window.swap, 'on'),
  off: listener.bind(window.swap, 'off')
};




swap.to = (html, sels, inline) => {
  fireElements('off');

  const dom = typeof html === 'string'
    ? new DOMParser().parseFromString(html, 'text/html')
    : html;

  const selectors = sels.map(sel => sel.split(/\s*->\s*/));
  const links = extractNewAssets(dom, 'link');
  const scripts = extractNewAssets(dom, 'script');

  renderBody(dom, selectors);
  if (!inline) renderTitle(dom);
  renderAssets(links);
  renderAssets(scripts);

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
    const wasRedirected = url.replace(/#.*$/, '') !== xhr.responseURL;
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
        buildPaneClickRequest(link.pathname), // we probably need to handle query string use case here
        sels,
        $html.getAttribute(swap.pane.activeAttribute)
          ? nextPane
          : openPane
      );
    } else if (link.dataset.swapInline) {
      swap.inline(link.href, sels);
    } else {
      swap.with(link.href, sels);
    }
  }
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


swap.submit = function(e, selectors) {
  const form = e.target;

  if (!shouldSwap(getUrl(form.action))) return;
  if (!swap.formValidator(e)) return;

  e.preventDefault();
  const sels = selectors || getSelectors(form);
  const req = buildSubmitRequest(form);

  if (form.dataset.swapInline) {
    swap.inline(req, sels);
  } else if ($html.getAttribute(swap.pane.activeAttribute)) {
    swap.with(req, sels, samePane);
  } else {
    swap.with(req, sels);
  }
}


swap.backPane = (e) => {
  swap.paneHistory.pop();
  const url = swap.paneHistory[swap.paneHistory.length - 1];
  // if (previous pane is NOT edited && current pane was saved) {
  // THEN RELOAD PREV PANE
    swap.with(
      buildPaneClickRequest(url),
      swap.pane.selectors,
      prevPane
    );
  // }
}


swap.closePane = () => {
  resetPane();
  pushState(location.href.replace(/#.*$/, ''));
}









const loaded = (e) => {
  if (location.hash) {
    const params = parseQuery(location.hash.substr(1));
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

  replaceState(location.href);
}


const openPage = ({ method, html, selectors, finalMethod, finalUrl }) => {
  resetPane();
  fireRoutes('off', location.href, method);
  swap.to(html, selectors);
  pushState(finalUrl);
  fireRoutes('on', finalUrl, finalMethod);
}


const popstate = (e) => {
  /*
    - check to if headers determine it should be cached or not
    - if not cached then ajax request
    - if cached then return state
    - check headers on whether to cache or not
  */

  // if (!e.state || location.hash) return;
  if (!e.state) return;

  const { href } = location;
  const { html, selectors } = e.state;

  fireRoutes('off', href);

  const dom = new DOMParser().parseFromString(html, 'text/html');

  swap.to(dom, selectors);

  // getstateofourpanehistoryatthistime

  // this block feels like it should go in swap.to maybe
  const paneIsActive = dom.documentElement.getAttribute(swap.pane.activeAttribute);
  if (paneIsActive) {
    $html.setAttribute(swap.pane.activeAttribute, 'true');
  } else {
    $html.removeAttribute(swap.pane.activeAttribute);
  }

  fireRoutes('on', href);
}






module.exports = function (opts = {}) {
  loader(opts);

  swap.formValidator = opts.formValidator || ((e) => true);

  const paneDefaults = {
    selector: '.Pane',
    selectors: ['.Main -> .PaneContent', '.PaneHeader'],
    closeButton: '.PaneCloseBtn',
    mask: '.PaneMask',
    panels: '.PanesHolder > div',
    activePanelName: 'PaneContent',
    backButton: '.PaneBackBtn',
    activeAttribute: 'swap-pane-is-active',
    open: () => {},
    back: () => {},
    close: () => {}
  };

  swap.pane = {
    ...paneDefaults,
    ...opts.pane
  };

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

  window.addEventListener('click', delegateHandle('a:not([target="_blank"]):not([data-swap="false"])', swap.click));
  window.addEventListener('submit', delegateHandle('form:not([data-swap="false"])', swap.submit));

  swap.event('click', swap.pane.backButton, swap.backPane);
  swap.event('click', swap.pane.closeButton, swap.closePane);
  swap.event('click', '[swap-pane-is-active]', (e) => {
    if (!e.target.closest(swap.pane.selector)) {
      swap.closePane();
    }
  });
}
