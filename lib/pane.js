const { $html, htmlToElement } = require('./utils');
const { getPaneState, pushPaneState, updatePaneHash, replaceState, pushState, updateSessionState } = require('./history');


const paneTemplate = `
    <div class="Pane light-mode">
        <button class="PaneCloseBtn Button DropdownTrigger Button--default Button--circle Button--icon icon-x Button--medium"></button>
        <button class="PaneExpandBtn Button Button--circle Button--icon icon-maximize-2 Button--large"></button>
        <div class="PaneContent"></div>
    </div>
  `;


const addPane = ({ html, finalUrl }) => {
  updateSessionState(location.href);

  $html.classList.add(swap.qs.paneOpen);
  const pane = htmlToElement(paneTemplate);
  // pane.style.backgroundColor = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  document.body.appendChild(pane);

  setTimeout(() => {
    pane.classList.add('active');
    renderPane(html);
    pushPaneState(finalUrl);
  }, 10);
}


const renderPane = (html) => {
  swap.to(html, swap.paneSelectors, true);
}


const samePane = ({ html, finalUrl }) => {
  swap.paneSaved = true;
  getPaneState().edited = false;
  updateSessionState(location.href);
  swap.paneHistory.pop();
  renderPane(html);
  pushPaneState(finalUrl);
}


const prevPane = (url, html) => {
  if (html) {
    // THIS NEEDS TO BE A DYNAMIC SELECTOR AND MIGHT SHOULD CALL renderPane with a condition
    swap.to(html, ['.Main -> .Pane.active:nth-last-child(2) .PaneContent'], true);
  }

  removePane(document.querySelector('.Pane:last-child'));
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
  replaceState(location.href);
  $html.classList.remove(swap.qs.paneOpen);
  [...document.querySelectorAll(swap.qs.pane)].forEach(removePane);
  swap.paneHistory = [];
  swap.paneUrl = false;
  swap.paneSaved = false;
  pushState(location.href.replace(/#.*$/, ''));
}


const removePane = (pane) => {
  pane.classList.remove('active');
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
