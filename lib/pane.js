const { qs, qsa, $html } = require('./dom');
const { updatePaneHash, replaceState, getCurrentHistoryPane } = require('./history');
const { getUrl, getFormData } = require('./utils');
const { buildPaneClickRequest } = require('./request');


const openPane = ({ html, finalUrl }) => {
  replaceState(location.href);
  $html.setAttribute(swap.qs.sheetOpen, 'true');
  renderPane(html);
  addPaneHistory(finalUrl);
}


const renderPane = (html) => {
  swap.to(html, swap.sheetSelectors, true);
  toggleBackButton();
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
  toggleBackButton();
}


const continuePane = ({ xhr, html, finalUrl }) => {
  // handle error use cases
  // we probably could inject response html right into previous pane since the server already redirected to the right html
  // conditionally hard reload previous pane, or just slide back
  if (xhr.status === 200) {
    replaceState(location.href);
    swap.paneHistory.pop();
    const { url, edited } = getCurrentHistoryPane();

    console.log({ url });
    console.log({ finalUrl });


    if (edited) {
      prevPane(url);
    } else if (url === getUrl(finalUrl).pathname) {
      changePane(-1);
      renderPane(html);
    } else {
      swap.with(
        buildPaneClickRequest(url),
        swap.sheetSelectors,
        loadPrevPane
      );
    }
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


const resetPane = () => {
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

  swap.paneHistory = [];
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


const addPaneHistory = (url) => {
  swap.paneHistory.push({
    url: getUrl(url).pathname,
    edited: false,
    formsData: getPaneFormsData()
  });
  updatePaneHash(url);
}


export {
  getPaneFormsData,
  loadPrevPane,
  openPane,
  prevPane,
  continuePane,
  samePane,
  nextPane,
  resetPane
};
