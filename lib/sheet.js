const { updatePaneHash, replaceState } = require('./history');
const { qs, qsa, $html, getUrl, getFormData } = require('./utils');


const openSheet = ({ html, finalUrl }) => {
  replaceState(location.href);
  $html.setAttribute(swap.qs.sheetOpen, 'true');
  renderPane(html);
  addSheetHistory(finalUrl);
}


const renderPane = (html) => {
  swap.to(html, swap.sheetSelectors, true);
  toggleBackButton();
}


const nextPane = ({ html, finalUrl }) => {
  replaceState(location.href);
  changePane(1);
  renderPane(html);
  addSheetHistory(finalUrl);
}


const samePane = ({ html, finalUrl }) => {
  replaceState(location.href);
  swap.sheetHistory.pop();
  renderPane(html);
  addSheetHistory(finalUrl);
}


const loadPrevPane = ({ html, finalUrl }) => {
  changePane(-1);
  renderPane(html);
  updatePaneHash(finalUrl);
}


const prevPane = (url) => {
  changePane(-1);
  updatePaneHash(url);
  toggleBackButton();
}


const continuePane = (obj) => {
  // handle error use cases
  const { xhr } = obj;

  if (xhr.status === 200) {
    swap.backPane(obj);
  } else if (xhr.status >= 500) {
    samePane(obj);
  }
}


const changePane = (direction) => {
  const oldPane = qs(swap.qs.pane);
  const oldIndex = getIndexOfPane(oldPane);
  const newIndex = oldIndex + direction;
  const newPane = qs(`.PanesHolder > div:nth-child(${newIndex + 1})`);
  const mask = qs(swap.qs.sheetMask);

  if (direction === -1) oldPane.innerHTML = '';

  oldPane.classList.remove(swap.paneName);
  newPane.classList.add(swap.paneName);
  mask.style.setProperty('--pane-x', - (newIndex * mask.offsetWidth) + 'px');
}


const resetSheet = () => {
  $html.removeAttribute(swap.qs.sheetOpen);

  const mask = qs(swap.qs.sheetMask);

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

  swap.sheetHistory = [];
  swap.paneUrl = false;
}


const getIndexOfPane = (pane) => [...qsa(swap.qs.sheetPanes)].indexOf(pane);


const toggleBackButton = () => {
  const activePanelIndex = getIndexOfPane(qs(swap.qs.pane));
  qs(swap.qs.sheetBackButton).style.display = activePanelIndex > 0
    ? 'inline'
    : 'none';
}


const getPaneFormsData = () => {
  const activePanelForms = qs(swap.qs.pane).querySelectorAll(swap.qs.form);
  return [...activePanelForms].map(getFormData).toString();
}


const addSheetHistory = (url) => {
  swap.sheetHistory.push({
    url: getUrl(url).pathname,
    edited: false,
    formsData: getPaneFormsData()
  });
  updatePaneHash(url);
}


export {
  openSheet,
  loadPrevPane,
  prevPane,
  continuePane,
  changePane,
  samePane,
  nextPane,
  resetSheet,
  getPaneFormsData
};
