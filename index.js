const css = require('./lib/css');
const { renderTitle, extractNewAssets, assetsChanged, loadAssets, renderBody } = require('./lib/render');
const { ajax, buildRequest } = require('./lib/request');
const { getPaneFormsData, replaceState, updateSessionState, pushSessionState, session, getPaneState, updateHistory} = require('./lib/history');
const { listener, fireElements, fireRoutes, delegateHandle } = require('./lib/events');
const { prevPane, continuePane, samePane, addPane, closePanes } = require('./lib/pane');
const { $html, buildUrl, shouldSwap, getUrl, getPath, getSelectors, parseQuery, bypassKeyPressed } = require('./lib/utils');

require('./lib/component');


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
    console.log({ sels });

    const { swapInline } = link.dataset;

    if (swapInline) {
      swap.inline(link, sels);
    } else {
      swap.with(link, sels, link.dataset.hasOwnProperty('swapPane') ? addPane : openPage);
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
  const action = form.action || form.href || form.dataset.swapAction;

  if (!shouldSwap(getUrl(action))) return;
  if (!swap.formValidator(e)) return;

  e.preventDefault();
  const sels = selectors || getSelectors(form);
  const { swapInline, swapContinue } = form.dataset;

  if (swapInline) {
    swap.inline(form, sels);
  } else {
    const callback = swapContinue
      ? continuePane
      : $html.classList.contains(swap.qs.paneIsOpen)
        ? samePane
        : openPage;
    swap.with(form, sels, callback);
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
    console.log('reloading...');
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


// const popstate = (e) => {
//   /*
//     - check if headers determine it should be cached or not
//     - if not cached then ajax request
//     - if cached then return state
//     - check headers on whether to cache or not
//   */

//   if (!e.state) return;

//   const { html, selectors, paneHistory, expires, id } = session.get(e.state.id);
//   const forward = id > swap.stateId;
//   const justAtId = session.get('stateIds').indexOf(id) + (forward ? -1 : 1);
//   console.log({justAtId});
//   const justAt = session.get(justAtId).url;

//   updateSessionState(justAt);

//   swap.stateId = id;
//   swap.paneHistory = paneHistory;

//   fireRoutes('off', location.href, justAt);

//   if (expires < Date.now()) {
//     console.log('reloading...');
//     const opts = { url: location.href, method: 'get' };
//     ajax(opts, (xhr, res, html) => {
//       const dom = new DOMParser().parseFromString(html, 'text/html');

//       swap.to(dom, selectors, false, () => {
//         $html.className = dom.documentElement.className;

//         if (location.hash) {
//           loadPane();
//         } else {
//           fireRoutes('on', location.href, null);
//         }
//       });
//     });
//   } else {
//     const dom = new DOMParser().parseFromString(html, 'text/html');

//     swap.to(dom, selectors, false, () => {
//       $html.className = dom.documentElement.className;
//       fireRoutes('on', location.href, justAt);
//     });
//   }


  // if (expires < Date.now()) {
  //   console.log('reloading...');
  //   const opts = { url: location.href, method: 'get' };
  //   ajax(opts, (xhr, res, html) => {
  //     const dom = new DOMParser().parseFromString(html, 'text/html');

  //     swap.to(dom, selectors, false, () => {
  //       $html.className = dom.documentElement.className;

  //       if (location.hash) {
  //         loadPane();
  //       } else {
  //         fireRoutes('on', location.href, null);
  //       }
  //     });
  //   });
  // } else {
  //   const dom = new DOMParser().parseFromString(html, 'text/html');

  //   swap.to(dom, selectors, false, () => {
  //     $html.className = dom.documentElement.className;
  //     fireRoutes('on', location.href, justAt);
  //   });
  // }

module.exports = function (opts = {}) {
  swap.qs = {};
  swap.qs.link = 'a:not([target="_blank"]):not([data-swap-ignore])';
  swap.qs.button = 'button[data-swap-method], a[data-swap-method]';
  swap.qs.form = 'form:not([data-swap-ignore])';
  swap.qs.continue = '[data-swap-continue]';
  swap.qs.notice = '.Notice';
  swap.qs.pane = '.Pane';
  swap.qs.paneActive = '.Pane.is-active';
  swap.qs.paneForms = `${swap.qs.paneActive} ${swap.qs.form}`;
  swap.qs.paneContent = `${swap.qs.paneActive} .Pane-content`;
  swap.qs.paneCloseBtn = '.Pane-closeBtn';
  swap.qs.paneIsOpen = 'swap-pane-is-open';
  swap.qs.paneDefaultEl = opts.paneDefaultEl || '.Main';
  swap.qs.paneDefaultRenderType = '>>';

  swap.paneTemplate = `
    <div class="Pane ${opts.paneClass}">
      <button class="Pane-closeBtn"></button>
      <a class="Pane-expandBtn"></a>
      <div class="Pane-content"></div>
    </div>
  `;
  swap.paneDuration = opts.paneDuration || 700;
  swap.paneSelectors = [`${swap.qs.paneDefaultEl} ${swap.qs.paneDefaultRenderType} ${swap.qs.paneContent}`];
  swap.formValidator = opts.formValidator || ((e) => true);
  swap.sessionExpiration = opts.sessionExpiration || 5000;

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

  swap.event('click', swap.qs.button, swap.submit);

  swap.event('click', swap.qs.link, swap.click);

  swap.event('click', swap.qs.continue, (e) => {
    e.target.closest('form').dataset.swapContinue = 'true';
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
    if (!e.target.closest(swap.qs.pane)) {
      updateSessionState(location.href);
      closePanes();
    }
  });
}
