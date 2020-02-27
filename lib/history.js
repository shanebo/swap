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
// }


const getPaneState = () => swap.paneHistory[swap.paneHistory.length - 1];


const getPaneFormsData = () => [...qsa(swap.qs.paneForms)].map(getFormData).toString();


const updateHistory = (url, pane = {}) => {
  if (Object.keys(pane).length) {
    const pathname = getUrl(url).pathname;

    if (swap.paneUrl === pathname) {
      updateSessionState(location.href);
    } else if (pane.reset) {
      swap.paneHistory = [];
      swap.paneUrl = false;
      swap.paneSaved = false;
      pushState(url);
    } else {
      if (pane.go === -1) {
        swap.paneHistory.pop();
      } else if (pane.go === 1) {
        swap.paneHistory.push({
          selectors: pane.selectors,
          url: pathname,
          edited: false,
          formsData: getPaneFormsData()
        });
      } else {
        swap.paneHistory[swap.paneHistory.length - 1].url = pathname;
      }

      location.hash = `#pane=${pathname}`; // this needs to merge into whatever hash is there instead of replace, because the url could have other params on the hash
      swap.paneUrl = pathname; // consider whether to handle urls with multiple query strings
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
  getPaneState
};
