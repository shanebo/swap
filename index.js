const loader = require('./lib/loader');
const { renderTitle, extractNewAssets, loadAssets, renderBody } = require('./lib/render');
const { ajax, buildPaneClickRequest, buildSubmitRequest } = require('./lib/request');
const { pushState, replaceState, updateOurState, session, getCurrentHistoryPane } = require('./lib/history');
const { listener, fireElements, fireRoutes, delegateHandle } = require('./lib/events');
const { loadPrevPane, prevPane, continuePane, samePane, openSheet, nextPane, resetSheet, renderPane, changePane, getPaneFormsData } = require('./lib/sheet');
const { $html, buildUrl, shouldSwap, getUrl, getSelectors, parseQuery, bypassKeyPressed } = require('./lib/utils');


window.swap = {
  metaKeyOn: false,
  paneUrl: false,
  sheetHistory: [],
  before: listener.bind(window.swap, 'before'),
  on: listener.bind(window.swap, 'on'),
  off: listener.bind(window.swap, 'off'),
  stateId: 0
};


swap.to = (html, sels, inline, callback) => {
  fireElements('off');

  const dom = typeof html === 'string'
    ? new DOMParser().parseFromString(html, 'text/html')
    : html;

  const selectors = sels.map(sel => sel.split(/\s*->\s*/));
  const links = extractNewAssets(dom, 'link');
  const scripts = extractNewAssets(dom, 'script');

  renderBody(dom, selectors);

  if (!inline) renderTitle(dom);

  const assets = scripts.concat(links);
  loadAssets(assets, () => {
    fireElements('on');
    if (callback) callback();
    if (!selectors.length) {
      // make this smarter where it only scrolls to top on different urls?
      window.scrollTo(0, 0);
    }
  });

  return swap;
}


swap.with = (options, selectors = [], callback = openPage) => {
  const opts = typeof options === 'string'
    ? { url: options, method: 'get' }
    : options;

  const { url, method } = opts;

  fireRoutes('before', url, location, method);

  ajax(opts, (xhr, res, html) => {
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
        $html.getAttribute(swap.qs.sheetOpen)
          ? nextPane
          : openSheet
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

  ajax(opts, (xhr, res, html) => {
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

  if (form.dataset.swapContinue) {
    swap.with(req, sels, continuePane);
  } else if (form.dataset.swapInline) {
    swap.inline(req, sels);
  } else if ($html.getAttribute(swap.qs.sheetOpen)) {
    swap.with(req, sels, samePane);
  } else {
    swap.with(req, sels);
  }
}


swap.backPane = ({ html, finalUrl } = {}) => {
  replaceState(location.href);
  swap.sheetHistory.pop();
  const { url, edited } = getCurrentHistoryPane();

  if (edited || (!edited && !html && !finalUrl)) {
    prevPane(url);
  } else if (url === getUrl(finalUrl).pathname) {
    changePane(-1);
    renderPane(html);
  } else {
    swap.with(
      buildPaneClickRequest(url),
      swap.sheetSelectors,
      loadPrevPane
    );
  }
}


swap.closePane = () => {
  replaceState(location.href);
  resetSheet();
  pushState(location.href.replace(/#.*$/, ''));
}


const loaded = (e) => {
  if (!session.get('stateIds')) {
    session.set('stateIds', [0]);
  }

  if (location.hash) {
    const params = parseQuery(location.hash.substr(1));
    if (params.pane) {
      swap.with(
        buildPaneClickRequest(params.pane),
        swap.sheetSelectors,
        openSheet
      );
    }
  } else {
    fireElements('on');
    fireRoutes('on', location.href, null);
  }

  replaceState(location.href);
}


const openPage = ({ method, html, selectors, finalMethod, finalUrl }) => {
  const from = location.href;

  replaceState(location.href);
  resetSheet();
  fireRoutes('off', finalUrl, from, method);

  swap.to(html, selectors, false, () => {
    pushState(finalUrl);
    fireRoutes('on', finalUrl, from, finalMethod);
  });
}


const popstate = (e) => {
  /*
    - check to if headers determine it should be cached or not
    - if not cached then ajax request
    - if cached then return state
    - check headers on whether to cache or not
  */

  if (!e.state) return;

  const { href } = location;
  const { html, selectors, sheetHistory, id } = session.get(e.state.id);
  const goForward = swap.stateId < id;
  const justAtId = session.get('stateIds').indexOf(e.state.id) + (goForward ? -1 : 1);
  const justAt = justAtId >= 0 ? session.get(justAtId).url : null;

  updateOurState(justAt);

  swap.stateId = id;
  swap.sheetHistory = sheetHistory;

  fireRoutes('off', href, justAt);

  const dom = new DOMParser().parseFromString(html, 'text/html');

  swap.to(dom, selectors, false, () => {
    // this block feels like it should go in swap.to maybe
    const paneIsActive = dom.documentElement.getAttribute(swap.qs.sheetOpen);
    if (paneIsActive) {
      $html.setAttribute(swap.qs.sheetOpen, 'true');
    } else {
      $html.removeAttribute(swap.qs.sheetOpen);
    }

    fireRoutes('on', href, justAt);
  });
}


module.exports = function (opts = {}) {
  loader(opts);

  swap.qs = {};
  swap.qs.link = 'a:not([target="_blank"]):not([data-swap="false"])';
  swap.qs.form = 'form:not([data-swap="false"])';
  swap.qs.continue = 'button[data-swap-continue]';
  swap.qs.sheet = '.Pane';
  swap.qs.sheetMask = '.PaneMask';
  swap.qs.sheetPanes = '.PanesHolder > div';
  swap.qs.pane = '.PaneContent';
  swap.qs.paneForms = '.PaneContent form:not([data-swap="false"])';
  swap.qs.sheetBackButton = '.PaneBackBtn';
  swap.qs.sheetCloseButton = '.PaneCloseBtn';
  swap.qs.sheetOpen = 'swap-pane-is-active';

  swap.paneName = swap.qs.pane.substring(1);
  swap.sheetSelectors = opts.sheetSelectors || ['.Main -> .PaneContent', '.PaneHeader'];
  swap.formValidator = opts.formValidator || ((e) => true);

  swap.event('DOMContentLoaded', loaded);
  swap.event('popstate', popstate);
  swap.event('keydown', (e) => {
    if (bypassKeyPressed(e.key)) {
      swap.metaKeyOn = true;
    }
  });
  swap.event('keyup', (e) => {
    if (bypassKeyPressed(e.key)) {
      swap.metaKeyOn = false;
    }
  });
  swap.event('click', swap.qs.link, swap.click);
  swap.event('click', swap.qs.continue, (e) => {
    const form = e.target.closest('form');
    form.dataset.swapContinue = 'true';
  });
  swap.event('submit', swap.qs.form, swap.submit);
  swap.event('click', swap.qs.sheetBackButton, () => {
    swap.backPane();
  });
  swap.event('click', swap.qs.sheetCloseButton, swap.closePane);
  swap.event('click', `[${swap.qs.sheetOpen}]`, (e) => {
    if (!e.target.closest(swap.qs.sheet)) {
      swap.closePane();
    }
  });

  swap.event('input', swap.qs.paneForms, (e) => {
    const formsData = getPaneFormsData();
    const pane = getCurrentHistoryPane();
    if (pane) {
      pane.edited = formsData !== pane.formsData;
    }
  });
}
