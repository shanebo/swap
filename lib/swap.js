import { extractNewAssets, assetsChanged, loadAssets, renderBody, getNonAssetHeadTags } from './render.js';
import { ajax, buildRequest } from './request.js';
import { listener, fireElements, fireRoutes, delegateHandle } from './events.js';
import { openPage, reloadPage } from './page.js';
import { hasPane, prevPane, continueForm, repeatForm, samePane, addPane, closePanes } from './pane.js';
import { buildUrl, shouldSwap, getUrl, getPath, getSelectors } from './utils.js';
import { previousUrl, currentUrl } from './history.js';
import config from './config.js';
import listen from './listen.js';


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
      // create and trigger buttonForm for external hostname
      e.preventDefault();
      const form = document.createElement('form');
      const formbody = target.getAttribute('formbody');
      form.method = target.getAttribute('formmethod');
      form.action = formaction;

      if (formbody) {
        const body = JSON.parse(decodeURIComponent(formbody));
        Object.keys(body).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.value = body[key];
          input.name = key;
          form.append(input);
        });
      }

      document.body.append(form);
      form.submit();
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
    swap.directiveUrl = currentUrl();
    const callback = hasPane()
        ? samePane
        : openPage;
    swap.with(target, sels, callback);
  }
}


swap.closePane = ({ html, selectors, finalMethod, finalUrl } = {}) => {
  if (swap.paneHistory.length >= 2) {
    // two panes or more are open
    const { url, edited, selectors } = swap.paneHistory[swap.paneHistory.length - 2];

    if (!swap.formSaved || edited) {
      // The pane that is being closed was not saved
      // or the prev pane was edited
      // Examples:
      // - Account pane is open and open the create gift pane on top of it
      //   and then decide to close the gift pane w/o saving. The original
      //   account pane would not get clobbered.
      // - Gift pane is open with the form partially filled out and then you
      //   open a create account pane on top of it and create a new account.
      //   Then close the resulting pane. The original gift pane would not
      //   would not get clobbered.
      prevPane(url, false, selectors);
    } else if (url === getPath(finalUrl)) {
      // The previous pane is getting changed.
      // If the previous pane's url matches the url that response redirected to
      // then change the previous pane with response's html.
      prevPane(url, html, selectors);
    } else {
      // The previous pane is getting changed.
      // The previous pane's url does not match the url that the response redirected to
      // then reload the previous pane with the new url's html.
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


swap.listen = listen;


export default swap;
