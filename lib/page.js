import swap from './swap.js';
import { ajax } from './request.js';
import { initState, replaceState, pushSessionState, updateSessionState, updateHistory } from './history.js';
import { fireElements, fireRoutes } from './events.js';
import { loadSwapStyles } from './render.js';
import { hasPane, loadPane, closePanes } from './pane.js';


const initPage = (e) => {
  loadSwapStyles();
  initState();
  fireRoutes('on', location.href, null);

  if (/pane=/.test(location.hash)) {
    loadPane();
  } else {
    fireElements('on');
    pushSessionState(location.href);
    replaceState(location.href);
  }
}


const openPage = ({ method, html, selectors, finalMethod, finalUrl }) => {
  const from = location.href;

  updateSessionState(location.href);

  if (hasPane()) {
    closePanes();
  }

  fireRoutes('off', finalUrl, from, 'get');

  swap.to(html, selectors, false, () => {
    updateHistory(finalUrl);
    fireRoutes('on', finalUrl, from, finalMethod);
  });
}


const reloadPage = (selectors = []) => {
  const opts = { url: location.href, method: 'get' };
  ajax(opts, (xhr, res, html) => {
    const dom = new DOMParser().parseFromString(html, 'text/html');

    swap.to(dom, selectors, false, () => {
      document.documentElement.className = dom.documentElement.className;

      if (location.hash) {
        loadPane(true);
      } else {
        fireRoutes('on', location.href, null);
      }

      updateSessionState(location.href);
    });
  });
}


export {
  initPage,
  openPage,
  reloadPage
};
