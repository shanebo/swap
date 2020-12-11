const { renderTitle, extractNewAssets, assetsChanged, loadAssets, renderBody } = require('./render');
const { ajax, buildRequest } = require('./request');
const { listener, fireElements, fireRoutes, delegateHandle } = require('./events');
const { openPage } = require('./page');
const { prevPane, continuePane, samePane, addPane, closePanes } = require('./pane');
const { $html, buildUrl, shouldSwap, getUrl, getPath, getSelectors } = require('./utils');


window.swap = {
  sessionExpiration: 5000,
  request: false,
  metaKeyOn: false,
  paneUrl: false,
  paneHistory: [],
  paneSaved: false,
  confirmMap: {
    // deleteLayer: {
    //   title: "Delete this layer?",
    //   cancel: "Cancel",
    //   ok: "Yes, delete"
    // },
    // deleteLayerAndDescendants: {
    //   title: "Delete this layer and all it's descendants?",
    //   cancel: "Cancel",
    //   ok: "Yes, delete"
    // },
  },
  before: listener.bind(window.swap, 'before'),
  on: listener.bind(window.swap, 'on'),
  off: listener.bind(window.swap, 'off'),
  stateId: -1,
  responseUrl: false
};


swap.to = (html, selectors, inline, callback) => {
  fireElements('off');

  const dom = typeof html === 'string'
    ? new DOMParser().parseFromString(html, 'text/html')
    : html;

  if (swap.responseUrl && assetsChanged(dom)) {
    location.href = swap.responseUrl;
  }

  const links = extractNewAssets(dom, 'link');
  const scripts = extractNewAssets(dom, 'script');

  if (!inline) renderTitle(dom);

  renderBody(dom, selectors);

  loadAssets(scripts.concat(links), () => {
    fireElements('on');
    if (callback) callback();
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
    const { swapInline } = link.dataset;

    if (swapInline) {
      swap.inline(link, sels);
    } else {
      swap.with(link, sels, link.hasAttribute('data-swap-pane') ? addPane : openPage);
    }
  }
}


swap.inline = (options, selectors = []) => {
  const req = buildRequest(options);
  ajax(req, (xhr, res, html) => {
    swap.to(html, selectors, true);
  });
}


const createAndTriggerButtonForm = (btn, action) => {
  const form = document.createElement('form');
  form.method = btn.getAttribute('formmethod');
  form.action = action;
  document.body.appendChild(form);
  form.submit();
}


swap.submit = function(e, selectors) {
  const target = e.target; // form, submit button, or swap button form
  const formaction = target.getAttribute('formaction');
  const action = formaction || target.action || target.href;

  if (!shouldSwap(getUrl(action))) {
    // when action is on different hostname than location.hostname
    if (formaction) {
      // this is a buttonForm use case
      e.preventDefault();
      createAndTriggerButtonForm(target, formaction);
    }
    return;
  }

  if (!swap.formValidator(e)) return;

  e.preventDefault();
  const sels = selectors || getSelectors(target);
  const { swapInline } = target.dataset;

  if (swapInline) {
    swap.inline(target, sels);
  } else {
    const callback = target.hasAttribute('data-swap-pane-continue')
      ? continuePane
      : $html.classList.contains(swap.qs.paneIsOpen)
        ? samePane
        : openPage;
    swap.with(target, sels, callback);
  }
}


swap.closePane = ({ html, finalUrl } = {}) => {
  if (swap.paneHistory.length >= 2) {
    const { url, edited, selectors } = swap.paneHistory[swap.paneHistory.length - 2];

    if (!swap.paneSaved || edited) {
      prevPane(url, false, selectors);
    } else if (url === getPath(finalUrl)) {
      prevPane(url, html, selectors);
    } else {
      swap.with(url, selectors, ({ html, finalUrl, selectors }) => prevPane(finalUrl, html, selectors));
    }
  } else {
    closePanes();
  }
}


swap.configConfirm = (name, values) => {
  swap.confirmMap[name] = values;
}
