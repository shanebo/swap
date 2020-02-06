const {
  getUrl
} = require('./utils');


const buildState = () => ({
  html: document.documentElement.outerHTML,
  selectors: []
});

const pushState = (url) => {
  history.pushState(buildState(), '', url);
}

const replaceState = (url) => {
  history.replaceState(buildState(), '', url);
}

const updatePaneHash = (url) => {
  const pathname = getUrl(url).pathname; // we probably want url.search included in this
  // _paneUrl = url; // consider whether to handle urls with multiple query strings
  location.hash = `#pane=${pathname}`;
  history.replaceState(buildState(), '', location.href);
}


export {
  updatePaneHash,
  pushState,
  replaceState
};
