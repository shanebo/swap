import config from './config.js';
import { ajax, buildRequest } from './request.js';
import { resetHash, popState, captureState } from './history.js';
import { listener, fireElements, fireRoutes, delegateHandle } from './events.js';
import { extractNewAssets, assetsChanged, loadAssets, renderBody, getNonAssetHeadTags } from './render.js';
import { initPage, openPage, reloadPage } from './page.js';
import { getPanes, hasPane, prevPane, samePane, addPane, closePanes, clickOffPane } from './pane.js';
import { openConfirm, closeConfirm, okConfirm } from './confirm.js';
import { addFormDirective, continueForm, repeatForm, submitExternalForm } from './form.js';
import { keyDown, keyUp } from './keys.js';
import { buildUrl, shouldSwap, getUrl, getPath, getSelectors } from './utils.js';


const swap = {
  metaKeyOn: false,
  request: false,
  responseUrl: false,
  confirmations: {}
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
    newNodes.forEach(node => document.head.append(node));
  }

  renderBody(dom, selectors);

  loadAssets(scripts.concat(links, styles), () => {
    if (callback) callback();
    fireElements('on');
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

    captureState();
    fireRoutes('off', finalUrl, location.href, 'get');

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


swap.click = function(e) {
  const link = this;

  if (!shouldSwap(buildUrl(link))) return;

  e.preventDefault();
  const selectors = getSelectors(link);

  if (link.hasAttribute('data-swap-inline')) {
    swap.inline(link, selectors);
  } else {
    swap.with(link, selectors, link.hasAttribute('data-swap-pane') ? addPane : openPage);
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
      submitExternalForm(e);
    }
    return;
  }

  e.preventDefault();
  const sels = selectors || getSelectors(target);

  if (target.hasAttribute('data-swap-inline')) {
    swap.inline(target, sels);
  } else {
    const callback = target.hasAttribute('data-swap-repeat')
      ? repeatForm
      : target.hasAttribute('data-swap-continue')
        ? continueForm
        : hasPane()
          ? samePane
          : openPage;
    swap.with(target, sels, callback);
  }
}


swap.closePane = ({ html, selectors, finalMethod, finalUrl } = {}, formSaved = false) => {
  const panes = getPanes();

  if (panes.length >= 2) {
    const { fromPaneUrl, fromPaneEdited } = history.state;

    if (!formSaved || fromPaneEdited) {
      prevPane({ finalUrl: fromPaneUrl });
    } else if (fromPaneUrl === getPath(finalUrl)) {
      prevPane({ finalUrl: fromPaneUrl, html });
    } else {
      swap.with(fromPaneUrl, swap.opts.paneSelectors, prevPane);
    }
  } else {
    if (formSaved) {
      if ((location.pathname + location.search) === getPath(finalUrl)) {
        openPage({ html, selectors, finalMethod, finalUrl });
      } else {
        reloadPage();
      }
    }

    closePanes();
    resetHash();
  }
}


swap.setConfirmation = (name, value) => {
  swap.confirmations[name] = value;
}


swap.listen = () => {
  swap.event('DOMContentLoaded', initPage);
  swap.event('popstate', popState);
  swap.event('keydown', keyDown);
  swap.event('keyup', keyUp);
  swap.event('click', swap.opts.confirmTrigger, openConfirm);
  swap.event('click', swap.opts.confirmCancelTrigger, closeConfirm);
  swap.event('click', swap.opts.confirmOkTrigger, okConfirm);
  swap.event('click', swap.opts.link, swap.click);
  swap.event('click', swap.opts.button, swap.submit);
  swap.event('click', swap.opts.continueTrigger, addFormDirective('continue'));
  swap.event('click', swap.opts.repeatTrigger, addFormDirective('repeat'));
  swap.event('submit', swap.opts.form, swap.submit);
  swap.event('click', swap.opts.paneCloseBtn, swap.closePane);
  swap.event('click', `.${swap.opts.paneIsOpen}`, clickOffPane);
}


export default swap;
