import swap from './swap.js';
import { reloadPage } from './page.js';
import { fireRoutes } from './events.js';
import { getPaneUrl, getPath } from './utils.js';
import { getPaneFormsData } from './form.js';


const buildState = (url) => ({
  id: 1,
  html: document.documentElement.outerHTML,
  maxAge: Date.now() + (swap.opts.maxAge * 1000),
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
  state.paneUrl = getPaneUrl(to);
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

  const { id, html, maxAge, from, fromId, to } = e.state;
  const isForward = id > fromId;
  const justAt = isForward ? from : to;

  captureState();
  fireRoutes('off', location.href, justAt);

  if (!html || maxAge < Date.now()) {
    reloadPage();
  } else {
    const dom = new DOMParser().parseFromString(html, 'text/html');

    swap.to(dom, [], false, () => {
      document.documentElement.className = dom.documentElement.className;
      fireRoutes('on', location.href, justAt);
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


const getCurrentUrl = () => getPaneUrl() || location.href;


const getPreviousUrl = () => history.state.fromPaneUrl || history.state.from || '/';


export {
  popState,
  initState,
  updateState,
  updateHistory,
  updatePaneHistory,
  resetHash,
  captureState,
  getPreviousUrl,
  getCurrentUrl
};
