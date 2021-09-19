import swap from './swap.js';
import { getPath, getFormData, parseQuery } from './utils.js';


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


const pushState = (url) => {
  pushSessionState(url);
  history.pushState({ id: swap.stateId }, '', url);
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


const getPaneFormsData = () => [...document.querySelectorAll(swap.opts.paneForms)].map(getFormData).toString();


const previousUrl = () => {
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


const currentUrl = () => {
  const params = parseQuery(location.hash.substr(1));
  return params.pane || location.href;
}


const updateHistory = (url, pane = {}) => {
  if (Object.keys(pane).length) {
    const path = getPath(url);

    if (pane.bypass) {
      updateSessionState(location.href);
    } else if (pane.reset) {
      swap.paneHistory = [];
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
      swap.directiveUrl = path;
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
  pushState,
  replaceState,
  getPaneFormsData,
  updateSessionState,
  pushSessionState,
  updateHistory,
  getPaneState,
  previousUrl,
  currentUrl
};
