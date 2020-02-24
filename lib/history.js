const { qs, getUrl, getFormData } = require('./utils');


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

  if (stateIds.length > 20) {
    session.remove(stateIds.unshift());
  }

  session.set('stateIds', stateIds);
  updateSessionState(url);
}


const updateSessionState = (url) => {
  session.set(swap.stateId, {
    html: document.documentElement.outerHTML,
    paneHistory: [...swap.paneHistory],
    id: swap.stateId,
    selectors: [],
    url
  });
}


const pushPaneState = (url) => {
  swap.paneHistory.push({
    url: getUrl(url).pathname,
    edited: false,
    formsData: getPaneFormsData()
  });

  updatePaneHash(url);
}


const updatePaneHash = (url) => {
  const pathname = getUrl(url).pathname; // we probably want url.search included in this
  swap.paneUrl = url; // consider whether to handle urls with multiple query strings
  location.hash = `#pane=${pathname}`;
  pushSessionState(location.href);
  replaceState(location.href);
}


const getPaneState = () => swap.paneHistory[swap.paneHistory.length - 1];


const getPaneFormsData = () => {
  const activePanelForms = qs(swap.qs.paneContent).querySelectorAll(swap.qs.form);
  return [...activePanelForms].map(getFormData).toString();
}


export {
  session,
  pushState,
  replaceState,
  pushPaneState,
  getPaneFormsData,
  updateSessionState,
  pushSessionState,
  updatePaneHash,
  getPaneState
};
