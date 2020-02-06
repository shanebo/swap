const { qs, qsa, $html } = require('./dom');
const { updatePaneHash } = require('./history');


const openPane = ({ html, finalUrl }) => {
  $html.setAttribute(swap.pane.activeAttribute, 'true');
  updatePane(0, html);
  addPaneHistory(finalUrl);
  // swap.pane.open();
}

const updatePane = (direction, html) => {
  if (direction) {
    const activePane = qs('.PaneContent');
    const activeIndex = [...qsa(swap.pane.panels)].indexOf(activePane);
    const newIndex = activeIndex + direction;
    activePane.classList.remove(swap.pane.activePanelName);
    if (direction === -1) activePane.innerHTML = '';
    qs(`.PanesHolder > div:nth-child(${newIndex + 1})`).classList.add(swap.pane.activePanelName);
    const mask = qs(swap.pane.mask);
    mask.style.setProperty('--pane-x', - (newIndex * mask.offsetWidth) + 'px');
  }

  swap.to(html, swap.pane.selectors, true);

  qs(swap.pane.backButton).style.display = [...qsa(swap.pane.panels)].indexOf(qs('.PaneContent')) > 0
    ? 'inline'
    : 'none';
}

const nextPane = ({ html, finalUrl }) => {
  updatePane(1, html);
  addPaneHistory(finalUrl);
}

const samePane = ({ html, finalUrl }) => {
  swap.paneHistory.pop();
  updatePane(0, html);
  addPaneHistory(finalUrl);
}

const prevPane = ({ html, finalUrl }) => {
  updatePane(-1, html);
  updatePaneHash(finalUrl);
  swap.paneUrl = finalUrl;
  // swap.pane.back();
}

const resetPane = () => {
  $html.removeAttribute(swap.pane.activeAttribute);

  [...qsa(swap.pane.panels)].forEach((div, d) => {
    div.classList.remove(swap.pane.activePanelName);
    div.innerHTML = '';
    qs(swap.pane.mask).style.setProperty('--pane-x', '0px');
    if (d === 0) {
      div.classList.add(swap.pane.activePanelName);
    }
  });

  swap.paneHistory = [];
  swap.paneUrl = false;
  // swap.pane.close();
}

const addPaneHistory = (url) => {
  updatePaneHash(url);
  swap.paneUrl = url;
  swap.paneHistory.push(location.hash.replace('#pane=', ''));
}


export {
  openPane,
  prevPane,
  samePane,
  nextPane,
  resetPane
};
