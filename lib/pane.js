const { qs, qsa, $html } = require('./dom');
const { updatePaneHash, replaceState } = require('./history');
const { getUrl } = require('./utils');


const getIndexOfPane = (pane) => [...qsa(swap.pane.panels)].indexOf(pane);


const openPane = ({ html, finalUrl }) => {
  replaceState(location.href);
  $html.setAttribute(swap.pane.activeAttribute, 'true');
  renderPane(html);
  addPaneHistory(finalUrl);
}


const renderPane = (html) => {
  swap.to(html, swap.pane.selectors, true);
  qs(swap.pane.backButton).style.display = getIndexOfPane(qs('.PaneContent')) > 0 ? 'inline' : 'none';
}


const nextPane = ({ html, finalUrl }) => {
  replaceState(location.href);
  changePane(1);
  renderPane(html);
  addPaneHistory(finalUrl);
}


const samePane = ({ html, finalUrl }) => {
  replaceState(location.href);
  swap.paneHistory.pop();
  renderPane(html);
  addPaneHistory(finalUrl);
}


const loadPrevPane = ({ html, finalUrl }) => {
  changePane(-1);
  renderPane(html);
  updatePaneHash(finalUrl);
}


const prevPane = (url) => {
  changePane(-1);
  updatePaneHash(url);
}


const changePane = (direction) => {
  const oldPane = qs('.PaneContent');
  const oldIndex = getIndexOfPane(oldPane);
  const newIndex = oldIndex + direction;
  const newPane = qs(`.PanesHolder > div:nth-child(${newIndex + 1})`);
  const mask = qs(swap.pane.mask);

  if (direction === -1) oldPane.innerHTML = '';

  oldPane.classList.remove(swap.pane.activePanelName);
  newPane.classList.add(swap.pane.activePanelName);
  mask.style.setProperty('--pane-x', - (newIndex * mask.offsetWidth) + 'px');
}


const resetPane = () => {
  $html.removeAttribute(swap.pane.activeAttribute);

  const mask = qs(swap.pane.mask);

  if (mask) {
    mask.style.removeProperty('--pane-x');
    mask.innerHTML = `
      <div class="PanesHolder">
        <div class="PaneContent"></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    `;
  }

  swap.paneHistory = [];
  swap.paneUrl = false;
}

const getPaneFormsData = () => {
  return [...qsa('.PaneContent form:not([data-swap="false"])')].map((form) => {
    return new URLSearchParams(new FormData(form)).toString();
  });
}

const addPaneHistory = (url) => {
  swap.paneHistory.push({ url: getUrl(url).pathname, edited: false, formsData: getPaneFormsData() });
  updatePaneHash(url);
}


export {
  getPaneFormsData,
  loadPrevPane,
  openPane,
  prevPane,
  samePane,
  nextPane,
  resetPane
};
