const { getUrl } = require('./utils');


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


const buildState = (url) => ({
  html: document.documentElement.outerHTML,
  sheetHistory: [...swap.sheetHistory],
  id: swap.stateId,
  selectors: [],
  url
});


const pushState = (url) => {
  // const currState = session.get(swap.stateId);
  if (location.href === url) {
    const state = buildState(url);
    session.set(swap.stateId, state);
    return;
  }

  pushToSessionHistory(url);
  history.pushState({ id: swap.stateId }, '', url);
}


const pushToSessionHistory = (url) => {
  swap.stateId += 1;

  const stateIds = session.get('stateIds').filter((id, i) => {
    const keep = id < swap.stateId;
    if (!keep) {
      session.remove(id);
    }
    return keep;
  });

  stateIds.push(swap.stateId);

  if (stateIds.length > 20) {
    session.remove(stateIds.unshift());
  }

  session.set('stateIds', stateIds);

  const state = buildState(url);
  session.set(swap.stateId, state);
}


const updateOurState = (url) => {
  const newState = buildState(url);
  session.set(swap.stateId, newState);
}


const replaceState = (url) => {
  updateOurState(url);
  history.replaceState({ id: swap.stateId }, '', url);
}


const updatePaneHash = (url) => {
  const pathname = getUrl(url).pathname; // we probably want url.search included in this
  swap.paneUrl = url; // consider whether to handle urls with multiple query strings
  location.hash = `#pane=${pathname}`;
  pushToSessionHistory(location.href);
  history.replaceState({ id: swap.stateId }, '', location.href);
}


const getCurrentHistoryPane = () => swap.sheetHistory[swap.sheetHistory.length - 1];


export {
  session,
  pushState,
  replaceState,
  updateOurState,
  updatePaneHash,
  getCurrentHistoryPane
};














/*
click/submit/addPane = pushState(isPane)
  replace current session item state with current page state
  swap elements
  push browser state
  push new item to session with current page state
  if (isPane) push pane state


popstate(e) (history.back() and history.forward and history.go())
  replace current session item state with current page state
  set swap.stateId = e.state.id
  set paneHistory = session lookup get paneHistory
  swap elements


closePane
  replace current session item state with current page state
  swap elements
  push browser state
  push new item to session with current page state
  push pane state
  after pane is closed (700ms) replace current session item state with current page state
*/

