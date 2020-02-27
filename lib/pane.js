const { $html, htmlToElement, qs } = require('./utils');
const { getPaneState, updateSessionState, updateHistory } = require('./history');


const addPane = ({ html, finalUrl, selectors }) => {
  updateSessionState(location.href);

  $html.classList.add(swap.qs.paneIsOpen);
  const pane = htmlToElement(swap.paneTemplate);
  // pane.style.backgroundColor = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  document.body.appendChild(pane);

  const oldPane = qs('.Pane.is-active');

  if (oldPane) {
    oldPane.classList.remove('is-active');
  }

  setTimeout(() => {
    pane.querySelector('.Pane-expandBtn').href = finalUrl;
    pane.classList.add('is-visible', 'is-active');
    swap.to(html, selectors, true);
    updateHistory(finalUrl, { selectors, go: 1 });
  }, 10);
}


const samePane = ({ html, finalUrl }) => {
  updateSessionState(location.href);
  swap.paneSaved = true;
  const paneState = getPaneState();
  paneState.edited = false;
  swap.to(html, paneState.selectors, true);
  updateHistory(finalUrl, { selectors: paneState.selectors });
}


const prevPane = (url, html, selectors) => {
  updateSessionState(location.href);

  const oldPane = qs('.Pane.is-active');
  const pane = oldPane.previousElementSibling;

  oldPane.classList.remove('is-active');
  pane.classList.add('is-active');

  if (html) {
    swap.to(html, selectors, true);
  }

  removePane(oldPane);
  updateHistory(url, { selectors, go: -1 });
}


const continuePane = (obj) => {
  // handle error use cases
  const { xhr } = obj;

  if (xhr.status === 200) {
    swap.paneSaved = true;
    swap.closePane(obj);
  } else if (xhr.status >= 500) {
    samePane(obj);
  }
}


const closePanes = () => {
  $html.classList.remove(swap.qs.paneIsOpen);
  [...document.querySelectorAll(swap.qs.pane)].forEach(removePane);
  updateHistory(location.href.replace(/#.*$/, ''), { reset: true });
}


const removePane = (pane) => {
  pane.classList.remove('is-visible');
  setTimeout(() => {
    pane.remove();
  }, swap.paneDuration);
}


export {
  addPane,
  samePane,
  prevPane,
  continuePane,
  removePane,
  closePanes
};
