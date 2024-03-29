import swap from './swap.js';
import { ajax } from './request.js';
import { initState, updateHistory } from './history.js';
import { fireElements, fireRoutes } from './events.js';
import { loadSwapStyles } from './render.js';
import { hasPane, loadPane, closePanes } from './pane.js';
import { hasPaneUrl } from './utils.js';


const initPage = (e) => {
  loadSwapStyles();
  fireRoutes('on', location.href, null);

  if (hasPaneUrl()) {
    loadPane();
  } else {
    fireElements('on');
  }

  initState(location.href);
}


const openPage = ({ html, selectors, finalMethod, finalUrl }) => {
  if (hasPane()) {
    closePanes();
  }

  swap.to(html, selectors, false, () => {
    const from = location.href;
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

      if (hasPaneUrl()) {
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
