const loader = require('./lib/loader');
const { $html, renderTitle, extractNewAssets, loadAssets, renderBody } = require('./lib/dom');
const { talk, buildPaneClickRequest, buildSubmitRequest } = require('./lib/request');
const { pushState, replaceState, updateOurState, session, getCurrentHistoryPane } = require('./lib/history');
const { listener, fireElements, fireRoutes, delegateHandle } = require('./lib/events');
const { loadPrevPane, prevPane, continuePane, samePane, openPane, nextPane, resetPane, getPaneFormsData } = require('./lib/pane');
const { buildUrl, shouldSwap, getUrl, getSelectors, parseQuery, bypassKeyPressed } = require('./lib/utils');


window.swap = {
  metaKeyOn: false,
  paneUrl: false,
  paneHistory: [],
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

  if (form.dataset.swapContinue) {
    swap.with(req, sels, continuePane);
  } else if (form.dataset.swapInline) {
    swap.inline(req, sels);
  } else if ($html.getAttribute(swap.pane.activeAttribute)) {
    swap.with(req, sels, samePane);
  } else {
    swap.with(req, sels);
  }
}


swap.backPane = (e) => {
  replaceState(location.href);
  swap.paneHistory.pop();
  const { url, edited } = getCurrentHistoryPane();

  if (edited) {
    prevPane(url);
  } else {
    swap.with(
      buildPaneClickRequest(url),
      swap.pane.selectors,
      loadPrevPane
    );
  }
}


swap.closePane = () => {
  replaceState(location.href);
  resetPane();
  pushState(location.href.replace(/#.*$/, ''));
}


swap.formChanged = (e) => {
  const formsData = getPaneFormsData();
  const paneHistoryItem = getCurrentHistoryPane();
  if (paneHistoryItem) {
    paneHistoryItem.edited = !(formsData.toString() === paneHistoryItem.formsData.toString());
  }
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
        swap.pane.selectors,
        openPane
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
  resetPane();

  fireRoutes('off', finalUrl, from, method);

  swap.to(html, selectors, false, () => {
    console.log('FIRED!');
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
  const { html, selectors, paneHistory, id } = session.get(e.state.id);
  const goForward = swap.stateId < id;
  const justAtId = session.get('stateIds').indexOf(e.state.id) + (goForward ? -1 : 1);
  const justAt = justAtId >= 0 ? session.get(justAtId).url : null;

  updateOurState(justAt);

  swap.stateId = id;
  swap.paneHistory = paneHistory;

  fireRoutes('off', href, justAt);

  const dom = new DOMParser().parseFromString(html, 'text/html');

  swap.to(dom, selectors, false, () => {
    // this block feels like it should go in swap.to maybe
    const paneIsActive = dom.documentElement.getAttribute(swap.pane.activeAttribute);
    if (paneIsActive) {
      $html.setAttribute(swap.pane.activeAttribute, 'true');
    } else {
      $html.removeAttribute(swap.pane.activeAttribute);
    }

    fireRoutes('on', href, justAt);
  });
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
  window.addEventListener('click', delegateHandle('button[data-swap-continue]', (e) => {
    const form = e.target.closest('form');
    form.dataset.swapContinue = 'true';
    // const formId = e.target.getAttribute('form');
    // const form = document.getElementById(formId);
    // form.dataset.swapContinue = 'true';
  }));
  window.addEventListener('submit', delegateHandle('form:not([data-swap="false"])', swap.submit));

  swap.event('click', swap.pane.backButton, swap.backPane);
  swap.event('click', swap.pane.closeButton, swap.closePane);
  swap.event('click', '[swap-pane-is-active]', (e) => {
    if (!e.target.closest(swap.pane.selector)) {
      swap.closePane();
    }
  });

  swap.event('input', 'form:not([data-swap="false"])', swap.formChanged);
}
