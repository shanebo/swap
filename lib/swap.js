import { extractNewAssets, assetsChanged, loadAssets, renderBody, getNonAssetHeadTags } from './render.js';
import { ajax, buildRequest } from './request.js';
import { listener, fireElements, fireRoutes, delegateHandle } from './events.js';
import { openPage } from './page.js';
import { prevPane, continuePane, samePane, addPane, closePanes } from './pane.js';
import { buildUrl, shouldSwap, getUrl, getPath, getSelectors } from './utils.js';
import config from './config.js';
import listen from './listen.js';


const swap = {
  request: false,
  responseUrl: false,
  stateId: -1,
  metaKeyOn: false,
  paneUrl: false,
  paneHistory: [],
  paneSaved: false,
  confirmations: {
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
  }
};


swap.config = config;


swap.before = listener.bind(swap, 'before');


swap.on = listener.bind(swap, 'on');


swap.off = listener.bind(swap, 'off');


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
  const styles = extractNewAssets(dom, 'style');

  if (!inline) {
    const oldNodes = getNonAssetHeadTags(document);
    oldNodes.forEach((node) => node.remove());
    const newNodes = getNonAssetHeadTags(dom);
    newNodes.forEach(node => document.head.appendChild(node));
  }

  renderBody(dom, selectors);

  loadAssets(scripts.concat(links, styles), () => {
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


swap.submit = function(e, selectors) {
  const target = e.target; // form, submit button, or button form
  const formaction = target.getAttribute('formaction');
  const action = formaction || target.action || target.href;

  if (!shouldSwap(getUrl(action))) {
    // when action points at an external hostname
    if (formaction) {
      // create and trigger buttonForm for external hostname
      e.preventDefault();
      const form = document.createElement('form');
      form.method = target.getAttribute('formmethod');
      form.action = formaction;
      document.body.appendChild(form);
      form.submit();
    }
    return;
  }

  if (!swap.opts.formValidator(e)) return;

  e.preventDefault();
  const sels = selectors || getSelectors(target);
  const { swapInline } = target.dataset;

  if (swapInline) {
    swap.inline(target, sels);
  } else {
    const callback = target.hasAttribute('data-swap-pane-continue')
      ? continuePane
      : document.documentElement.classList.contains(swap.opts.paneIsOpen)
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


swap.setConfirmation = (name, value) => {
  swap.confirmations[name] = value;
}


swap.listen = listen;


export default swap;
