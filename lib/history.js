import swap from './swap.js';
import { reloadPage } from './page.js';
import { fireRoutes } from './events.js';
import { getPath } from './utils.js';
import { getPane, getPanes } from './pane.js';


const buildState = (url) => ({
  html: document.documentElement.outerHTML,
  expires: Date.now() + swap.opts.expires,
  url
});


const setHistoryStateTo = (url) => {
  const state = history.state;
  state.to = url;
  history.replaceState(state, '', state.url);
}


const replaceState = (url, prevUrl) => {
  const state = buildState(url);
  state.from = prevUrl || location.href;
  state.id = history.state && history.state.id
    ? history.state.id
    : 1;
  swap.historyId = state.id;
  history.replaceState(state, '', url);
}


const pushState = (url) => {
  const state = buildState(url);
  state.from = location.href;
  state.id = history.state && history.state.id
    ? history.state.id + 1
    : 1;
  swap.historyId = state.id;
  setHistoryStateTo(url);
  history.pushState(state, '', url);
}


const popState = (e) => {
  /*
    check headers for cached or not
    - if not cached then ajax request
    - if cached then return state
  */
  if (!e.state) return;

  const { id, html, expires, from, to } = e.state;
  const isForward = id > swap.historyId;
  const justAt = isForward ? from : to;

  fireRoutes('off', location.href, justAt);

  if (!html || expires < Date.now()) {
    reloadPage();
  } else {
    const dom = new DOMParser().parseFromString(html, 'text/html');

    swap.to(dom, [], false, () => {
      document.documentElement.className = dom.documentElement.className;
      fireRoutes('on', location.href, justAt);
      // updateSessionState(location.href);
    });
  }
}


const updatePaneHistory = (url) => {
  const path = getPath(url);
  // const prevUrl = location.href;
  location.hash = `#pane=${path}`;
  replaceState(location.href);
  // replaceState(location.href, prevUrl);
}


const updateHistory = (url) => {
  if (location.href === url) {
    // replaceState(url);
  } else {
    pushState(url);
  }
}


const resetHash = () => {
  updateHistory(location.href.replace(/#.*$/, ''));
}


const getCurrentUrl = () => getPaneParam() || location.href;


const getPreviousUrl = () => {
  const panes = getPanes();
  return panes.length >= 2
    ? getPane().dataset.prevPaneUrl
    : history.length >= 2
      ? history.state.from
      : '/';
}


const getPaneParam = () => new URLSearchParams(location.hash.substring(1)).get('pane');


export {
  pushState,
  popState,
  replaceState,
  updateHistory,
  updatePaneHistory,
  resetHash,
  getPanes,
  getPaneParam,
  getPreviousUrl,
  getCurrentUrl
};
