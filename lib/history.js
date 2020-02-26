const { qsa, getUrl, getFormData } = require('./utils');


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


// const prevStateUrl = () => {
//   const stateIds = session.get('stateIds');
//   const prevState = session.get(stateIds[stateIds.length - 1]);

//   return prevState ? prevState.url : null;
// }

const pushState = (url) => {
  // if (prevStateUrl() === url) return;

  pushSessionState(url);
  history.pushState({ id: swap.stateId }, '', url);
}


const replaceState = (url) => {
  history.replaceState({ id: swap.stateId }, '', url);
}

const pushSessionState = (url) => {
  // if (prevStateUrl() === url) return;

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
  updateSessionState(url);
}


const updateSessionState = (url) => {
  session.set(swap.stateId, {
    expires: Date.now() + window.swap.sessionExpiration,
    html: document.documentElement.outerHTML,
    paneHistory: [...swap.paneHistory],
    id: swap.stateId,
    selectors: [],
    url
  });
}


// const pushPaneState = (url, selectors) => {
//   swap.paneHistory.push({
//     selectors,
//     url: getUrl(url).pathname,
//     edited: false,
//     formsData: getPaneFormsData()
//   });

//   updatePaneHash(url);
// }


// const updatePaneHash = (url) => {
//   const pathname = getUrl(url).pathname; // we probably want url.search included in this
//   swap.paneUrl = url; // consider whether to handle urls with multiple query strings
//   location.hash = `#pane=${pathname}`;
//   pushSessionState(location.href);
//   replaceState(location.href);
// }


const getPaneState = () => swap.paneHistory[swap.paneHistory.length - 1];


const getPaneFormsData = () => [...qsa(swap.qs.paneForms)].map(getFormData).toString();

const updateHistory = (url, selectors = [], isPane = false, paneMovement = 0, resetPane = false) => {
  if (isPane) {
    const pathname = getUrl(url).pathname;

    if (swap.paneUrl === pathname) {
      updateSessionState(location.href);
    } else if (resetPane) {
      swap.paneHistory = [];
      swap.paneUrl = false;
      swap.paneSaved = false;

      pushSessionState(url);
      history.pushState({ id: swap.stateId }, '', url);
    } else {
      if (paneMovement === -1) {
        swap.paneHistory.pop();
      } else if (paneMovement === 1) {
        swap.paneHistory.push({
          selectors,
          url: pathname,
          edited: false,
          formsData: getPaneFormsData()
        });
      } else {
        swap.paneHistory[swap.paneHistory.length - 1].url = pathname;
      }

      location.hash = `#pane=${pathname}`;
      swap.paneUrl = url; // consider whether to handle urls with multiple query strings
      pushSessionState(location.href);
      replaceState(location.href);
    }
  } else {
    if (location.href === url) {
      updateSessionState(location.href);
    } else {
      pushSessionState(url);
      history.pushState({ id: swap.stateId }, '', url);
    }
  }
}


export {
  session,
  pushState,
  replaceState,
  // pushPaneState,
  getPaneFormsData,
  updateSessionState,
  pushSessionState,
  updateHistory,
  // updatePaneHash,
  getPaneState
};
