import swap from './swap.js';
import { getPaneUrl, htmlToElement, getPreviousSibling } from './utils.js';
import { updateState, resetHash, updatePaneHistory } from './history.js';
import { getPaneFormsData } from './form.js';


const hasPane = () => document.documentElement.classList.contains(swap.opts.paneIsOpen);


const getPane = () => document.querySelector('.Pane.is-active');


const getPanes = () => [...document.querySelectorAll('.Pane')];


const loadPane = (bypass = false) => {
  const url = getPaneUrl();
  swap.with(url, swap.opts.paneSelectors, (obj) => addPane(obj, bypass));
}


const addPane = ({ html, finalUrl, selectors }, bypass = false) => {
  if (history.state.paneFormsData) {
    updateState({
      paneFormsEdited: history.state.paneFormsData !== getPaneFormsData()
    });
  }

  const oldPane = getPane();

  if (oldPane) {
    oldPane.classList.remove('is-active');
  }

  document.documentElement.classList.add(swap.opts.paneIsOpen);

  const pane = htmlToElement(swap.opts.paneTemplate({ url: finalUrl }));

  document.body.append(pane);

  setTimeout(() => {
    pane.classList.add('is-visible', 'is-active');
    swap.to(html, selectors, true);

    if (!bypass) {
      updatePaneHistory(finalUrl);
    }
  }, 10);
}


const samePane = ({ html, finalUrl }) => {
  getPane().querySelector('.Pane-expandBtn').href = finalUrl;
  swap.to(html, swap.opts.paneSelectors, true);
  updatePaneHistory(finalUrl);
}


const prevPane = ({ html, finalUrl }) => {
  const oldPane = getPane();
  const pane = getPreviousSibling(oldPane, '.Pane');

  oldPane.classList.remove('is-active');
  pane.classList.add('is-active');

  if (html) {
    swap.to(html, swap.opts.paneSelectors, true);
  }

  removePane(oldPane);
  updatePaneHistory(finalUrl);
}


const closePanes = () => {
  swap.directiveUrl = false;
  document.documentElement.classList.remove(swap.opts.paneIsOpen);
  getPanes().forEach(removePane);
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
    closePanes();
    resetHash();
  }
}


export {
  hasPane,
  getPane,
  getPanes,
  loadPane,
  addPane,
  samePane,
  prevPane,
  removePane,
  closePanes,
  clickOffPane
};
