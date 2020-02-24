const css = require('./lib/css');
const { renderTitle, extractNewAssets, loadAssets, renderBody } = require('./lib/render');
const { ajax, buildRequest } = require('./lib/request');
const { pushState, getPaneFormsData, replaceState, updateSessionState, session, getPaneState } = require('./lib/history');
const { listener, fireElements, fireRoutes, delegateHandle } = require('./lib/events');
const { prevPane, continuePane, samePane, addPane, closePanes } = require('./lib/pane');
const { $html, buildUrl, shouldSwap, getUrl, getSelectors, parseQuery, bypassKeyPressed } = require('./lib/utils');


window.swap = {
  request: false,
  metaKeyOn: false,
  paneUrl: false,
  paneHistory: [],
  paneSaved: false,
  before: listener.bind(window.swap, 'before'),
  on: listener.bind(window.swap, 'on'),
  off: listener.bind(window.swap, 'off'),
  stateId: 0,
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
  const req = buildRequest(options);
  const { url, method } = req;

  fireRoutes('before', url, location, method);

  ajax(req, (xhr, res, html) => {
    const wasRedirected = url.replace(/#.*$/, '') !== xhr.responseURL;
    const finalUrl = wasRedirected ? xhr.responseURL : url;
    const finalMethod = wasRedirected ? 'get' : method;

    callback({
      xhr,
      url,
      method,
      html,
      selectors,
      finalMethod,
      finalUrl
    });
  });
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
    const { swapInline, swapPane } = link.dataset;

    if (swapInline) {
      swap.inline(link, sels);
    } else {
      swap.with(link, sels, swapPane ? addPane : openPage);
    }
  }
}


swap.inline = (options, selectors = []) => {
  const req = buildRequest(options);
  ajax(req, (xhr, res, html) => {
    swap.to(html, selectors, true);
  });
}


swap.submit = function(e, selectors) {
  const form = e.target;

  if (!shouldSwap(getUrl(form.action))) return;
  if (!swap.formValidator(e)) return;

  e.preventDefault();
  const sels = selectors || getSelectors(form);
  const { swapInline, swapContinue } = form.dataset;

  if (swapInline) {
    swap.inline(form, sels);
  } else {
    const callback = swapContinue
      ? continuePane
      : $html.classList.contains(swap.qs.paneOpen)
        ? samePane
        : openPage;
    swap.with(form, sels, callback);
  }
}


swap.closePane = ({ html, finalUrl } = {}) => {
  updateSessionState(location.href);
  swap.paneHistory.pop();

  if (swap.paneHistory.length) {
    const { url, edited } = getPaneState();

    if (!swap.paneSaved || edited) {
      prevPane(url);
    } else if (url === getUrl(finalUrl).pathname) {
      prevPane(url, html);
    } else {
      swap.with(url, swap.paneSelectors, ({ html, finalUrl }) => prevPane(finalUrl, html));
    }
  } else {
    closePanes();
  }
}


const loaded = (e) => {
  if (!session.get('stateIds')) {
    session.set('stateIds', [0]);
  }

  if (location.hash) {
    const params = parseQuery(location.hash.substr(1));
    if (params.pane) {
      swap.with(params.pane, swap.paneSelectors, addPane);
    }
  } else {
    fireElements('on');
    fireRoutes('on', location.href, null);
  }

  updateSessionState(location.href);
  replaceState(location.href);
}


const openPage = ({ method, html, selectors, finalMethod, finalUrl }) => {
  const from = location.href;

  updateSessionState(location.href);

  if ($html.classList.contains(swap.qs.paneOpen)) {
    closePanes();
  }

  fireRoutes('off', finalUrl, from, method);

  swap.to(html, selectors, false, () => {
    pushState(finalUrl);
    fireRoutes('on', finalUrl, from, finalMethod);
  });
}


const popstate = (e) => {
  /*
    - check if headers determine it should be cached or not
    - if not cached then ajax request
    - if cached then return state
    - check headers on whether to cache or not
  */

  if (!e.state) return;

  const { html, selectors, paneHistory, id } = session.get(e.state.id);
  const forward = id > swap.stateId;
  const justAtId = session.get('stateIds').indexOf(id) + (forward ? -1 : 1);
  const justAt = session.get(justAtId).url;

  updateSessionState(justAt);

  swap.stateId = id;
  swap.paneHistory = paneHistory;

  fireRoutes('off', location.href, justAt);

  const dom = new DOMParser().parseFromString(html, 'text/html');

  swap.to(dom, selectors, false, () => {
    $html.className = dom.documentElement.className;
    fireRoutes('on', location.href, justAt);
  });
}


module.exports = function (opts = {}) {
  swap.qs = {};
  swap.qs.link = 'a:not([target="_blank"]):not([data-swap-ignore])';
  swap.qs.form = 'form:not([data-swap-ignore])';
  swap.qs.continue = '[data-swap-continue]';
  swap.qs.pane = '.Pane';
  swap.qs.paneContent = '.PaneContent';
  swap.qs.paneForms = '.PaneContent form:not([data-swap-ignore])';
  swap.qs.paneCloseBtn = '.PaneCloseBtn';
  swap.qs.paneOpen = 'swap-pane';

  swap.paneSelectors = opts.paneSelectors || ['.Main -> .Pane.active:last-child .PaneContent'];
  swap.formValidator = opts.formValidator || ((e) => true);

  swap.event('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css(opts)));
    document.head.appendChild(style);
    loaded();
  });

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
    e.target.closest('form').dataset.swapContinue = 'true';
  });

  swap.event('submit', swap.qs.form, swap.submit);

  swap.event('click', swap.qs.paneCloseBtn, () => {
    swap.closePane();
  });

  swap.event('click', `.${swap.qs.paneOpen}`, (e) => {
    if (!e.target.closest(swap.qs.pane)) {
      closePanes();
    }
  });

  swap.event('input', swap.qs.paneForms, (e) => {
    const formsData = getPaneFormsData();
    const pane = getPaneState();
    if (pane) {
      pane.edited = formsData !== pane.formsData;
    }
  });
}
