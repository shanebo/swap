const css = require('./lib/css');
const { renderTitle, extractNewAssets, assetsChanged, loadAssets, renderBody } = require('./lib/render');
const { ajax, buildRequest } = require('./lib/request');
const { getPaneFormsData, replaceState, updateSessionState, pushSessionState, session, getPaneState, updateHistory } = require('./lib/history');
const { listener, fireElements, fireRoutes, delegateHandle } = require('./lib/events');
const { prevPane, continuePane, samePane, addPane, closePanes } = require('./lib/pane');
const { $html, htmlToElement, buildUrl, shouldSwap, getUrl, getPath, getSelectors, parseQuery, bypassKeyPressed } = require('./lib/utils');


window.swap = {
  sessionExpiration: 5000,
  request: false,
  metaKeyOn: false,
  paneUrl: false,
  paneHistory: [],
  paneSaved: false,
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


const loadPane = (bypass = false) => {
  const params = parseQuery(location.hash.substr(1));
  if (params.pane) {
    swap.paneUrl = params.pane;
    swap.with(params.pane, swap.paneSelectors, (obj) => addPane(obj, bypass));
  }
}


const loaded = (e) => {
  if (!session.get('stateIds')) {
    session.set('stateIds', []);
    swap.stateId = -1;
  } else {
    const stateIds = session.get('stateIds');
    swap.stateId = stateIds[stateIds.length - 1];
  }

  if (location.hash) {
    loadPane();
  } else {
    fireElements('on');
    fireRoutes('on', location.href, null);
    pushSessionState(location.href);
    replaceState(location.href);
  }
}


const openPage = ({ method, html, selectors, finalMethod, finalUrl }) => {
  const from = location.href;

  updateSessionState(location.href);

  if ($html.classList.contains(swap.qs.paneIsOpen)) {
    closePanes();
  }

  fireRoutes('off', finalUrl, from, method);

  swap.to(html, selectors, false, () => {
    updateHistory(finalUrl);
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

  const pageState = session.get(e.state.id);

  if (!pageState) return reloadCurrentPage();

  const { html, selectors, paneHistory, expires, id } = pageState;
  const forward = id > swap.stateId;

  const stateIds = session.get('stateIds');
  const justAtId = stateIds[stateIds.indexOf(id) + (forward ? -1 : 1)];
  const justAt = justAtId ? session.get(justAtId).url : null;

  if (justAt) updateSessionState(justAt);

  swap.stateId = id;
  swap.paneHistory = paneHistory;

  fireRoutes('off', location.href, justAt);

  if (expires < Date.now()) {
    reloadCurrentPage(selectors);
  } else {
    const dom = new DOMParser().parseFromString(html, 'text/html');

    swap.to(dom, selectors, false, () => {
      $html.className = dom.documentElement.className;
      fireRoutes('on', location.href, justAt);
      updateSessionState(location.href);

      if (location.hash) {
        const params = parseQuery(location.hash.substr(1));
        if (params.pane) swap.paneUrl = params.pane;
      }
    });
  }
}


const reloadCurrentPage = (selectors = []) => {
  const opts = { url: location.href, method: 'get' };
  ajax(opts, (xhr, res, html) => {
    const dom = new DOMParser().parseFromString(html, 'text/html');

    swap.to(dom, selectors, false, () => {
      $html.className = dom.documentElement.className;

      if (location.hash) {
        loadPane(true);
      } else {
        fireRoutes('on', location.href, null);
      }

      updateSessionState(location.href);
    });
  });
}


module.exports = function (opts = {}) {
  swap.qs = {};
  swap.qs.link = 'a:not([target="_blank"]):not([data-swap-ignore]):not([data-swap-confirm])';
  swap.qs.formSubmitButton = 'form button[formaction]:not([data-swap-confirm]), form input[formaction][type="submit"]:not([data-swap-confirm])';
  swap.qs.button = 'button[formmethod]:not([data-swap-confirm]), a[formmethod]:not([data-swap-confirm])';
  swap.qs.form = 'form:not([data-swap-ignore])';
  swap.qs.notice = '.Notice';
  swap.qs.confirmTrigger = 'button[data-swap-confirm], a[data-swap-confirm]';
  swap.qs.confirm = '.Confirm';
  swap.qs.pane = '.Pane';
  swap.qs.paneActive = '.Pane.is-active';
  swap.qs.paneForms = `${swap.qs.paneActive} ${swap.qs.form}`;
  swap.qs.paneContent = `${swap.qs.paneActive} .Pane-content`;
  swap.qs.paneCloseBtn = '.Pane-closeBtn, [data-swap-close-pane]';
  swap.qs.paneIsOpen = 'swap-pane-is-open';
  swap.qs.paneDefaultEl = opts.paneDefaultEl || '.Main';
  swap.qs.paneDefaultRenderType = '>>';
  swap.qs.paneContinue = '[data-swap-pane-continue]';

  swap.paneTemplate = `
    <div class="Pane ${opts.paneClass || ''}">
      <button class="Pane-closeBtn"></button>
      <a class="Pane-expandBtn"></a>
      <div class="Pane-content"></div>
    </div>
  `;
  swap.paneDuration = opts.paneDuration || 700;
  swap.paneSelectors = [`${swap.qs.paneDefaultEl} ${swap.qs.paneDefaultRenderType} ${swap.qs.paneContent}`];
  swap.formValidator = opts.formValidator || ((e) => true);
  swap.sessionExpiration = opts.sessionExpiration || 5000;

  swap.confirmTemplate = `
    <div class="Confirm light-mode">
      <h2 class="c2 bold" data-swap-model-confirm-title></h2>
      <div class="Confirm-actions">
        <button
          data-swap-model-confirm-cancel
          class="Button Button--subtle Button--radius Button--medium"
          >
        </button>

        <button
          data-swap-model-confirm-ok
          class="Button Button--danger Button--radius Button--medium"
          >
        </button>
      </div>
    </div>
  `;

  swap.confirmMap = {
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
  };

  swap.configConfirm = (name, values) => {
    swap.confirmMap[name] = values;
  }

  swap.on('body', () => {
    const confirm = htmlToElement(swap.confirmTemplate);
    if (!document.querySelector(swap.qs.confirm)) {
      document.body.appendChild(confirm);
    }
  });



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

  swap.event('click', swap.qs.confirmTrigger, (e) => {
    e.preventDefault();

    const {
      swapConfirm,
      swapConfirmTitle,
      swapConfirmCancel,
      swapConfirmOk,
    } = e.target.dataset;

    const renderConfirm = ({ title, cancel, ok }) => {
      document.querySelector('[data-swap-model-confirm-title]').innerText = title;
      document.querySelector('[data-swap-model-confirm-cancel]').innerText = cancel;
      document.querySelector('[data-swap-model-confirm-ok]').innerText = ok;
      document.querySelector('[data-swap-model-confirm-ok]').focus();
    }

    if (swapConfirm) {
      renderConfirm(swap.confirmMap[swapConfirm]);
    } else {
      renderConfirm({
        title: swapConfirmTitle,
        cancel: swapConfirmCancel,
        ok: swapConfirmOk
      });
    }

    document.querySelector(swap.qs.confirm).classList.add('is-active');
    swap.confirmEvent = e;
  });

  swap.event('click', '[data-swap-model-confirm-cancel]', (e) => {
    document.querySelector(swap.qs.confirm).classList.remove('is-active');
    delete swap.confirmEvent;
  });

  swap.event('click', '[data-swap-model-confirm-ok]', () => {
    const e = swap.confirmEvent;
    const handle = e.target.hasAttribute('formmethod') ? 'submit' : 'click';
    swap[handle].call(e.target, e);
    document.querySelector(swap.qs.confirm).classList.remove('is-active');
    delete swap.confirmEvent;
  });

  swap.event('click', swap.qs.button, swap.submit);

  swap.event('click', swap.qs.formSubmitButton, swap.submit);

  swap.event('click', swap.qs.link, swap.click);

  swap.event('click', swap.qs.paneContinue, (e) => {
    const form = e.target.closest('form');
    if (form) {
      form.dataset.swapPaneContinue = 'true';
    }
  });

  swap.event('input', swap.qs.paneForms, (e) => {
    const formsData = getPaneFormsData();
    const pane = getPaneState();
    if (pane) {
      pane.edited = formsData !== pane.formsData;
    }
  });

  swap.event('submit', swap.qs.form, swap.submit);

  swap.event('click', swap.qs.paneCloseBtn, () => {
    swap.closePane();
  });

  swap.event('keyup', (e) => {
    if (e.key === 'Escape') {
      swap.closePane();
    }
  });

  swap.event('click', `.${swap.qs.paneIsOpen}`, (e) => {
    const notConfirmOrInsideConfirm = (e.target !== document.querySelector(swap.qs.confirm)
      && !e.target.closest(swap.qs.confirm));

    if (!e.target.closest(swap.qs.pane) && notConfirmOrInsideConfirm) {
      updateSessionState(location.href);
      closePanes();
    }
  });
}
