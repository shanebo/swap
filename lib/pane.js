const { $html, htmlToElement, qs } = require('./utils');
const { getPaneState, pushPaneState, updatePaneHash, replaceState, pushState, updateSessionState } = require('./history');


const paneTemplate = `
    <div class="Pane light-mode">
      <button class="Pane-closeBtn Button Button--default Button--circle Button--icon icon-x Button--medium"></button>
      <button class="Pane-expandBtn Button Button--default Button--circle Button--icon icon-maximize-2 Button--medium"></button>
      <div class="Pane-content"></div>
    </div>
  `;


const addPane = ({ html, finalUrl, selectors }) => {
  updateSessionState(location.href);

  $html.classList.add(swap.qs.paneIsOpen);
  const pane = htmlToElement(paneTemplate);
  // pane.style.backgroundColor = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  document.body.appendChild(pane);

  const oldPane = qs('.Pane.is-active');

  if (oldPane) {
    oldPane.classList.remove('is-active');
  }

  setTimeout(() => {
    pane.classList.add('is-visible', 'is-active');
    swap.to(html, selectors, true);
    pushPaneState(finalUrl, selectors);
  }, 10);
}


const samePane = ({ html, finalUrl }) => {
  swap.paneSaved = true;
  const paneState = getPaneState();
  paneState.edited = false;
  updateSessionState(location.href);
  swap.paneHistory.pop();
  swap.to(html, paneState.selectors, true);
  pushPaneState(finalUrl, paneState.selectors);
}


const prevPane = (url, html, selectors) => {
  const oldPane = qs('.Pane.is-active');
  const pane = oldPane.previousElementSibling;

  oldPane.classList.remove('is-active');
  pane.classList.add('is-active');

  if (html) {
    swap.to(html, selectors, true);
  }

  removePane(oldPane);
  updatePaneHash(url);
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
  swap.paneHistory = [];
  swap.paneUrl = false;
  swap.paneSaved = false;
  pushState(location.href.replace(/#.*$/, ''));
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
