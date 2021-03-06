import swap from './swap.js';
import { ajax } from './request.js';
import { updateSessionState, updateHistory } from './history.js';
import { fireRoutes } from './events.js';
import { loadPane, closePanes } from './pane.js';


const openPage = ({ method, html, selectors, finalMethod, finalUrl }) => {
  const from = location.href;

  updateSessionState(location.href);

  if (document.documentElement.classList.contains(swap.opts.paneIsOpen)) {
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
  openPage,
  reloadPage
};
