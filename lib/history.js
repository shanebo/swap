import swap from './swap.js';
import { getPath, getFormData } from './utils.js';


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
  const stateIds = session.get('stateIds');

  if (swap.paneHistory.length >= 2) {
    return swap.paneHistory[swap.paneHistory.length - 2].url;
  } else if (stateIds && stateIds.length >= 2) {
    const previousPageStateId = stateIds[stateIds.length - 2];
    return session.get(previousPageStateId).url;
  } else {
    return '/';
  }
}

const currentUrl = () => {
  return swap.paneUrl
    ? swap.paneUrl
    : location.href;
}


const updateHistory = (url, pane = {}) => {
  if (Object.keys(pane).length) {
    const path = getPath(url);

    if (pane.bypass) {
      updateSessionState(location.href);
    } else if (pane.reset) {
      swap.paneHistory = [];
      swap.paneUrl = false;
      swap.redirectTo = false;
      swap.paneSaved = false;
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
      swap.paneUrl = path;
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
