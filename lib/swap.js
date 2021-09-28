import config from './config.js';
import { ajax, buildRequest } from './request.js';
import { popState, previousUrl, currentUrl } from './history.js';
import { listener, fireElements, fireRoutes, delegateHandle } from './events.js';
import { extractNewAssets, assetsChanged, loadAssets, renderBody, getNonAssetHeadTags } from './render.js';
import { initPage, openPage, reloadPage } from './page.js';
import { hasPane, prevPane, samePane, addPane, closePanes, clickOffPane } from './pane.js';
import { openConfirm, closeConfirm, okConfirm } from './confirm.js';
import { addContinueDirective, addRepeatDirective, checkForm, continueForm, repeatForm, submitExternalForm } from './form.js';
import { keyDown, keyUp } from './keys.js';
import { buildUrl, shouldSwap, getUrl, getPath, getSelectors } from './utils.js';



const swap = {
  request: false,
  responseUrl: false,
  stateId: -1,
  metaKeyOn: false,
  directiveUrl: false,
  paneHistory: [],
  formSaved: false,
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
      submitExternalForm(e);
    }
    return;
  }

  e.preventDefault();
  const sels = selectors || getSelectors(target);
  const { swapInline } = target.dataset;

  if (swapInline) {
    swap.inline(target, sels);
  } else if (target.hasAttribute('data-swap-repeat')) {
    swap.directiveUrl = currentUrl();
    swap.with(target, sels, repeatForm);
  } else if (target.hasAttribute('data-swap-continue')) {
    swap.directiveUrl = previousUrl();
    swap.with(target, sels, continueForm);
  } else {
    swap.directiveUrl = false;
    const callback = hasPane()
        ? samePane
        : openPage;
    swap.with(target, sels, callback);
  }
}


swap.closePane = ({ html, selectors, finalMethod, finalUrl } = {}) => {
  if (swap.paneHistory.length >= 2) {
    const { url, edited, selectors } = swap.paneHistory[swap.paneHistory.length - 2];

    if (!swap.formSaved || edited) {
      prevPane(url, false, selectors);
    } else if (url === getPath(finalUrl)) {
      prevPane(url, html, selectors);
    } else {
      swap.with(url, selectors, ({ html, finalUrl, selectors }) => prevPane(finalUrl, html, selectors));
    }
  } else {
    if (swap.formSaved) {
      if ((location.pathname + location.search) === getPath(finalUrl)) {
        openPage({ html, selectors, finalMethod, finalUrl });
      } else {
        reloadPage();
      }
    }

    closePanes();
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
  swap.event('click', swap.opts.continueTrigger, addContinueDirective);
  swap.event('click', swap.opts.repeatTrigger, addRepeatDirective);
  swap.event('input', swap.opts.paneForms, checkForm);
  swap.event('submit', swap.opts.form, swap.submit);
  swap.event('click', swap.opts.paneCloseBtn, swap.closePane);
  swap.event('click', `.${swap.opts.paneIsOpen}`, clickOffPane);
}


export default swap;
