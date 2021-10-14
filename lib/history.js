import swap from './swap.js';
import { reloadPage } from './page.js';
import { fireRoutes } from './events.js';
import { getPath, hasPaneUrl, parseQuery } from './utils.js';
import { getPaneFormsData } from './form.js';


const buildState = (url) => ({
  id: 1,
  html: document.documentElement.outerHTML,
  expires: Date.now() + swap.opts.expires,
  url
});


const initState = (url) => {
  const state = history.state || buildState(url);
  history.replaceState(state, '', url);
}


const updateState = (moreState = {}) => {
  const state = { ...history.state, ...moreState };
  history.replaceState(state, '', state.url);
}


const captureState = () => {
  updateState({
    html: document.documentElement.outerHTML,
    // scroll position
  });
}


const pushState = (to) => {
  const { id, url, paneUrl, paneFormsEdited } = history.state;
  const state = buildState(to);

  state.from = url;
  state.fromId = id;
  state.fromPaneUrl = paneUrl;
  state.fromPaneEdited = paneFormsEdited;

  state.id = id + 1;
  state.paneUrl = getPaneParam(to);
  state.paneFormsData = getPaneFormsData();

  updateState({ to });
  history.pushState(state, '', to);
}


const popState = (e) => {
  /*
    check headers for cached or not
    - if not cached then ajax request
    - if cached then return state
  */
  if (!e.state) return;

  const { id, html, expires, from, fromId, to } = e.state;
  const isForward = id > fromId;
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
  pushState(location.href.split('#')[0] + `#pane=${path}`);
}


const updateHistory = (url) => {
  location.href === url
    ? captureState()
    : pushState(url);
}


const resetHash = () => {
  updateHistory(location.href.split('#')[0]);
}


const getCurrentUrl = () => getPaneParam() || location.href;


const getPreviousUrl = () => history.state.fromPaneUrl || history.state.from || '/';


const getPaneParam = (url) => {
  url = url || location.href;
  return hasPaneUrl(url)
    ? parseQuery(url.split('#')[1]).pane
    : null;
}


export {
  popState,
  initState,
  updateState,
  updateHistory,
  updatePaneHistory,
  resetHash,
  getPaneParam,
  getPreviousUrl,
  getCurrentUrl
};
