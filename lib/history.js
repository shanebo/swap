import swap from './swap.js';
import { reloadPage } from './page.js';
import { fireRoutes } from './events.js';
import { getPaneFormsData } from './form.js';
import { getPath, parseQuery } from './utils.js';


const session = {
  set(key, value){
    sessionStorage.setItem(key, JSON.stringify(value));
    return session;
  },

  get(key) {
    return JSON.parse(sessionStorage.getItem(key));
  },

  remove(key){
    sessionStorage.removeItem(key);
    return session;
  }
};


const initState = () => {
  if (!session.get('stateIds')) {
    session.set('stateIds', []);
    swap.stateId = -1;
  } else {
    const stateIds = session.get('stateIds');
    swap.stateId = stateIds[stateIds.length - 1];
  }
}


const pushState = (url) => {
  pushSessionState(url);
  history.pushState({ id: swap.stateId }, '', url);
}


const popState = (e) => {
  /*
    - check if headers determine it should be cached or not
    - if not cached then ajax request
    - if cached then return state
  */

  if (!e.state) return;

  const pageState = session.get(e.state.id);

  if (!pageState) return reloadPage();

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
    reloadPage(selectors);
  } else {
    const dom = new DOMParser().parseFromString(html, 'text/html');

    swap.to(dom, selectors, false, () => {
      document.documentElement.className = dom.documentElement.className;
      fireRoutes('on', location.href, justAt);
      updateSessionState(location.href);
    });
  }
}


const replaceState = (url) => {
  history.replaceState({ id: swap.stateId }, '', url);
}


const pushSessionState = (url) => {
  swap.stateId += 1;

  const stateIds = session.get('stateIds').filter((id, i) => {
    const keep = id < swap.stateId;
    if (!keep) {
      session.remove(id);
    }
    return keep;
  });

  stateIds.push(swap.stateId);

  if (stateIds.length > 20) { // given the browser history doesn't have a limit, should we even do this?
    session.remove(stateIds.unshift());
  }

  session.set('stateIds', stateIds);
  updateSessionState(url);
}


const updateSessionState = (url) => {
  session.set(swap.stateId, {
    expires: Date.now() + swap.opts.sessionExpiration,
    html: document.documentElement.outerHTML,
    paneHistory: [...swap.paneHistory],
    id: swap.stateId,
    selectors: [],
    url
  });
}


const getPaneState = () => swap.paneHistory[swap.paneHistory.length - 1];


const getPreviousUrl = () => {
  const panesLength = swap.paneHistory.length;

  if (panesLength >= 2) {
    return swap.paneHistory[panesLength - 2].url;
  }

  const stateIds = session.get('stateIds');
  const stateIdsLength = stateIds.length;

  if (stateIds && stateIdsLength >= 2) {
    const previousPageStateId = stateIds[stateIdsLength - 2];
    return session.get(previousPageStateId).url;
  }

  return '/';
}


const getCurrentUrl = () => {
  return swap.paneHistory.length
    ? swap.paneHistory[swap.paneHistory.length - 1].url
    : location.href;
}


const updateHistory = (url, pane = {}) => {
  if (Object.keys(pane).length) {
    const path = getPath(url);

    if (pane.bypass) {
      updateSessionState(location.href);
    } else if (pane.reset) {
      swap.paneHistory = [];
      // need to set to false here because this is happening without a xhr request
      swap.directiveUrl = false;
      swap.formSaved = false;
      pushState(url);
    } else {
      if (pane.go === -1) {
        swap.paneHistory.pop();
      } else if (pane.go === 1) {
        swap.paneHistory.push({
          selectors: pane.selectors,
          url: path,
          edited: false,
          formsData: getPaneFormsData()
        });
      } else {
        swap.paneHistory[swap.paneHistory.length - 1].url = path;
      }

      location.hash = `#pane=${path}`;
      pushSessionState(location.href);
      replaceState(location.href);
    }
  } else {
    if (location.href === url) {
      updateSessionState(url);
    } else {
      pushState(url);
    }
  }
}


export {
  session,
  initState,
  pushState,
  popState,
  replaceState,
  updateSessionState,
  pushSessionState,
  updateHistory,
  getPaneState,
  getPreviousUrl,
  getCurrentUrl
};
