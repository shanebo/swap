const { updatePaneHash, replaceState, pushState } = require('./history');
const { qs, qsa, $html, getUrl, getFormData } = require('./utils');


const paneTemplate = `
    <div class="pane">
        <button class="PaneCloseBtn">close</button>
        <button>expand</button>
        <div class="PaneContent"></div>
    </div>
  `;


function htmlToElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim(); // Never return a text node of whitespace as the result
  return template.content.firstChild;
}


function removePane(pane) {
  pane.classList.remove('active');
  setTimeout(() => {
    pane.remove();

    // if paneHistory.length
    //   get current pane history item
    //   and set state to current state

  }, 300);
}


const addPane = ({ html, finalUrl }) => {
  replaceState(location.href);

  $html.classList.add(swap.qs.sheetOpen);

  const pane = htmlToElement(paneTemplate);
  pane.style.backgroundColor = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  document.body.appendChild(pane);
  // pane.querySelector('.PaneCloseBtn').addEventListener('click', (e) => {
  //   swap.backPane();
  // });

  setTimeout(() => {
    pane.classList.add('active');
    renderPane(html);
    pushPaneHistory(finalUrl);
  }, 10);
}


const renderPane = (html) => {
  swap.to(html, swap.sheetSelectors, true);
}


const samePane = ({ html, finalUrl }) => {
  replaceState(location.href);
  swap.sheetHistory.pop();
  renderPane(html);
  pushPaneHistory(finalUrl);
}

const prevPane = (url, html) => {
  if (html) {
    swap.to(html, ['.Main -> .pane.active:nth-last-child(2) .PaneContent'], true);
  }
  removePane(document.querySelector('.pane:last-child'));
  updatePaneHash(url);
}


const continuePane = (obj) => {
  // handle error use cases
  const { xhr } = obj;

  if (xhr.status === 200) {
    swap.paneSaved = true;
    swap.backPane(obj);
  } else if (xhr.status >= 500) {
    samePane(obj);
  }
}


const closePanes = () => {
  replaceState(location.href);
  $html.classList.remove(swap.qs.sheetOpen);
  [...document.querySelectorAll('.pane')].forEach(removePane);
  swap.sheetHistory = [];
  swap.paneUrl = false;
  swap.paneSaved = false;
  pushState(location.href.replace(/#.*$/, ''));
}


const getPaneFormsData = () => {
  const activePanelForms = qs(swap.qs.pane).querySelectorAll(swap.qs.form);
  return [...activePanelForms].map(getFormData).toString();
}


const pushPaneHistory = (url) => {
  swap.sheetHistory.push({
    url: getUrl(url).pathname,
    edited: false,
    formsData: getPaneFormsData()
  });
  updatePaneHash(url);
}


export {
  addPane,
  removePane,
  samePane,
  prevPane,
  continuePane,
  closePanes,
  getPaneFormsData
};
