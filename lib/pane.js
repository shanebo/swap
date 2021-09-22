import swap from './swap.js';
import { htmlToElement, getPreviousSibling, parseQuery } from './utils.js';
import { getPaneState, updateSessionState, updateHistory } from './history.js';


const hasPane = () => document.documentElement.classList.contains(swap.opts.paneIsOpen);


const loadPane = (bypass = false) => {
  const params = parseQuery(location.hash.substr(1));
  if (params.pane) {
    swap.with(params.pane, swap.opts.paneSelectors, (obj) => addPane(obj, bypass));
  }
}


const addPane = ({ html, finalUrl, selectors }, bypass = false) => {
  updateSessionState(location.href);

  document.documentElement.classList.add(swap.opts.paneIsOpen);
  const pane = htmlToElement(swap.opts.paneTemplate);
  document.body.append(pane);

  const oldPane = document.querySelector('.Pane.is-active');

  if (oldPane) {
    oldPane.classList.remove('is-active');
  }

  setTimeout(() => {
    pane.querySelector('.Pane-expandBtn').href = finalUrl;
    pane.classList.add('is-visible', 'is-active');
    swap.to(html, selectors, true);
    updateHistory(finalUrl, { selectors, go: 1, bypass });
  }, 10);
}


const samePane = ({ html, finalUrl }) => {
  updateSessionState(location.href);
  swap.formSaved = true;
  const paneState = getPaneState();
  paneState.edited = false;
  const pane = document.querySelector('.Pane.is-active');
  pane.querySelector('.Pane-expandBtn').href = finalUrl;
  swap.to(html, paneState.selectors, true);
  updateHistory(finalUrl, { selectors: paneState.selectors });
}


const prevPane = (url, html, selectors) => {
  updateSessionState(location.href);

  const oldPane = document.querySelector('.Pane.is-active');
  const pane = getPreviousSibling(oldPane, '.Pane');

  oldPane.classList.remove('is-active');
  pane.classList.add('is-active');

  if (html) {
    swap.to(html, selectors, true);
  }

  removePane(oldPane);
  updateHistory(url, { selectors, go: -1 });
}


const closePanes = () => {
  document.documentElement.classList.remove(swap.opts.paneIsOpen);
  [...document.querySelectorAll(swap.opts.pane)].forEach(removePane);
  updateHistory(location.href.replace(/#.*$/, ''), { reset: true });
}


const removePane = (pane) => {
  pane.classList.remove('is-visible');
  setTimeout(() => {
    pane.remove();
  }, swap.opts.paneDuration);
}


const clickOffPane = (e) => {
  const notConfirmOrInsideConfirm = (e.target !== document.querySelector(swap.opts.confirm)
    && !e.target.closest(swap.opts.confirm));

  if (!e.target.closest(swap.opts.pane) && notConfirmOrInsideConfirm) {
    updateSessionState(location.href);
    closePanes();
  }
}


export {
  hasPane,
  loadPane,
  addPane,
  samePane,
  prevPane,
  removePane,
  closePanes,
  clickOffPane
};
