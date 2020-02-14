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


if (!session.get('stateIds')) {
  // initial settings
  session.set('stateIds', [0]);
}


const buildState = (from, to) => ({
  html: document.documentElement.outerHTML,
  id: swap.stateId,
  selectors: [],
  from,
  to
});


const pushState = (at, from) => {
  // const currState = session.get(swap.stateId);
  if (location.href === at) {
    const state = buildState(from);
    session.set(swap.stateId, state);
    return;
  }

  swap.stateId += 1;

  console.log({ stateIds: session.get('stateIds') });


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


  const state = buildState(from);
  session.set(swap.stateId, state);
  history.pushState({ id: swap.stateId }, '', at);
}


const updateOurState = (at, to) => {
  const state = session.get(swap.stateId);
  const from = state ? state.from : null;
  const newState = buildState(from, to);
  session.set(swap.stateId, newState);
}


const replaceState = (at, to) => {
  updateOurState(at, to);
  history.replaceState({ id: swap.stateId }, '', at);
}


const updatePaneHash = (url) => {
  const from = location.href;
  const pathname = getUrl(url).pathname; // we probably want url.search included in this
  swap.paneUrl = url; // consider whether to handle urls with multiple query strings
  location.hash = `#pane=${pathname}`;
  history.replaceState(buildState(from), '', location.href);
}


export {
  session,
  updateOurState,
  updatePaneHash,
  pushState,
  replaceState
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
