import swap from './swap.js';
import { ajax } from './request.js';
import { replaceState, updateHistory } from './history.js';
import { fireElements, fireRoutes } from './events.js';
import { loadSwapStyles } from './render.js';
import { hasPane, loadPane, closePanes } from './pane.js';


const initPage = (e) => {
  loadSwapStyles();
  fireRoutes('on', location.href, null);

  if (/pane=/.test(location.hash)) {
    loadPane();
  } else {
    fireElements('on');
    replaceState(location.href);
  }
}


const openPage = ({ html, selectors, finalMethod, finalUrl }) => {
  const from = location.href;

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

      if (/pane=/.test(location.hash)) {
        loadPane(true);
      } else {
        fireRoutes('on', location.href, null);
      }
    });
  });
}


export {
  initPage,
  openPage,
  reloadPage
};
