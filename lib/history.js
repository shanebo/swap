const {
  getUrl
} = require('./utils');


const buildState = (from, to) => ({
  html: document.documentElement.outerHTML,
  id: swap.stateId,
  selectors: [],
  from,
  to
});

const pushState = (url, from) => {
  swap.stateId++;
  history.pushState(buildState(from), '', url);
}

const replaceState = (url, to) => {
  const from = history.state ? history.state['from'] : null;
  const state = buildState(from, to);
  history.replaceState(state, '', url);
}

const updatePaneHash = (url) => {
  const from = location.href;
  const pathname = getUrl(url).pathname; // we probably want url.search included in this
  swap.paneUrl = url; // consider whether to handle urls with multiple query strings
  location.hash = `#pane=${pathname}`;
  history.replaceState(buildState(from), '', location.href);
}


export {
  updatePaneHash,
  pushState,
  replaceState
};
