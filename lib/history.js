const {
  getUrl
} = require('./utils');


const session = {
  set: function(key, value){
    sessionStorage.setItem(key, JSON.stringify(value));
    return session;
  },

  get: function(key){
    return JSON.parse(sessionStorage.getItem(key));
  },

  remove: function(key){
    sessionStorage.removeItem(key);
    return session;
  }
};


const buildState = (url) => ({
  html: document.documentElement.outerHTML,
  paneHistory: [...swap.paneHistory],
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

  pushToOurHistory(url);
  history.pushState({ id: swap.stateId }, '', url);
}


const pushToOurHistory = (url) => {
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
  pushToOurHistory(location.href);
  history.replaceState({ id: swap.stateId }, '', location.href);
}


const getCurrentHistoryPane = () => swap.paneHistory[swap.paneHistory.length - 1];


export {
  session,
  updateOurState,
  updatePaneHash,
  pushState,
  replaceState,
  getCurrentHistoryPane
};







/*


[1, 2, 3, 4, 5]


load page
- history.pushState an id
- push the state object into sessionStorage


open page
- update state ids state object in sessionStorage
- swap content
- history.pushState an id
- push the state object into sessionStorage

pushState means it and newer items get deleted before pushState adds the new one


popstate
- go(state.id) other names historyGo / goBackOrForward
  - get state object from sessionStorage via e.state.id
  - update page with e.state stuff


on popstate
- get swap.stateId
- update swap.stateId state object in sessionStorage with latest state
- get e.state.id
- get state object from sessionStorage via e.state.id
- update page with e.state stuff


*/
