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
    pane.classList.add('is-visible', 'is-active');
    swap.to(html, selectors, true);
    updateHistory(finalUrl, selectors, true, 1);
  }, 10);
}


// const updateHistory = (url, isPane = false, paneMovement = 0) => {
//   if url has pane hash
//     if location.href == url
//       updatePaneSessionState()
//     else
//       if prevPane
//         pop from pane history
//       else if addPane
//         push to pane history
//       else samePane
//         do nothing to pane history

//       pushPaneState()
//   else
//     if location.href == url
//       updateSessionState()
//     else
//       pushSessionState()
// }


const samePane = ({ html, finalUrl }) => {
  swap.paneSaved = true;
  const paneState = getPaneState();
  paneState.edited = false;
  updateSessionState(location.href);
  // swap.paneHistory.pop();
  swap.to(html, paneState.selectors, true);
  updateHistory(finalUrl, paneState.selectors, true, 0);
  // pushPaneState(finalUrl, paneState.selectors);
}


const prevPane = (url, html, selectors) => {
  updateSessionState(location.href);

  console.log({html});

  const oldPane = qs('.Pane.is-active');
  const pane = oldPane.previousElementSibling;

  oldPane.classList.remove('is-active');
  pane.classList.add('is-active');

  if (html) {
    swap.to(html, selectors, true);
  }

  removePane(oldPane);
  updateHistory(url, selectors, true, -1);
  // updatePaneHash(url);
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
//   replaceState(location.href);
  $html.classList.remove(swap.qs.paneIsOpen);
  [...document.querySelectorAll(swap.qs.pane)].forEach(removePane);
  // swap.paneHistory = [];
  // swap.paneUrl = false;
  // swap.paneSaved = false;
  // pushState(location.href.replace(/#.*$/, ''));
  updateHistory(location.href.replace(/#.*$/, ''), [], true, 0, true);
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
