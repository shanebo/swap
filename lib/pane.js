import swap from './swap.js';
import { htmlToElement, getPreviousSibling, parseQuery } from './utils.js';
import { getPaneState, updateSessionState, updateHistory } from './history.js';
import { openPage } from './page.js';


const loadPane = (bypass = false) => {
  const params = parseQuery(location.hash.substr(1));
  if (params.pane) {
    swap.with(params.pane, swap.opts.paneSelectors, (obj) => addPane(obj, bypass));
  }
}


const addPane = ({ html, finalUrl, selectors }, bypass = false) => {
  updateSessionState(location.href);

  document.documentElement.classList.add(swap.opts.paneIsOpen);
  const pane = htmlToElement(swap.opts.paneTemplate);
  document.body.append(pane);

  const oldPane = document.querySelector('.Pane.is-active');

  if (oldPane) {
    oldPane.classList.remove('is-active');
  }

  setTimeout(() => {
    pane.querySelector('.Pane-expandBtn').href = finalUrl;
    pane.classList.add('is-visible', 'is-active');
    swap.to(html, selectors, true);
    updateHistory(finalUrl, { selectors, go: 1, bypass });
  }, 10);
}


const samePane = ({ html, finalUrl }) => {
  updateSessionState(location.href);
  swap.formSaved = true;
  const paneState = getPaneState();
  paneState.edited = false;
  const pane = document.querySelector('.Pane.is-active');
  pane.querySelector('.Pane-expandBtn').href = finalUrl;
  swap.to(html, paneState.selectors, true);
  updateHistory(finalUrl, { selectors: paneState.selectors });
}


const prevPane = (url, html, selectors) => {
  updateSessionState(location.href);

  const oldPane = document.querySelector('.Pane.is-active');
  const pane = getPreviousSibling(oldPane, '.Pane');

  oldPane.classList.remove('is-active');
  pane.classList.add('is-active');

  if (html) {
    swap.to(html, selectors, true);
  }

  removePane(oldPane);
  updateHistory(url, { selectors, go: -1 });
}


// const continuePane = (obj) => {
//   // handle error use cases
//   const { xhr } = obj;

//   if (xhr.status === 200 && swap.paneHistory.length > 1) {
//     swap.paneSaved = true;
//     swap.closePane(obj);
//   } else if (xhr.status >= 500) {
//     samePane(obj);
//   }
// }


const continueForm = (obj) => {
  // handle error use cases
  const { xhr } = obj;

  if (xhr.status === 200) {
    swap.formSaved = true;

    if (document.documentElement.classList.contains(swap.opts.paneIsOpen)) {
      swap.closePane(obj);
    } else {
      openPage(obj);
    }
  } else if (xhr.status >= 500) {
    if (document.documentElement.classList.contains(swap.opts.paneIsOpen)) {
      samePane(obj);
    } else {
      openPage(obj);
    }
  }
}



const repeatForm = (obj) => {
  const { xhr } = obj;

  if (xhr.status === 200) {
    swap.formSaved = true;
  }

  if (document.documentElement.classList.contains(swap.opts.paneIsOpen)) {
    samePane(obj);
  } else {
    openPage(obj);
  }
}



// const isEmptyResponse = xhr.status === 200 && xhr.contentType != 'text/html';


// const continuePane = (obj) => {
//   // handle error use cases
//   const { xhr } = obj;

//   const isPane = /pane=/.test(location.hash);

//   if (xhr.status === 200) {
//     if (isPane) {
//       swap.paneSaved = true;
//       swap.closePane(obj);
//     } else {
//       const stateIds = session.get('stateIds');

//       if (stateIds.length >= 2) {
//         const previousPageStateId = stateIds[stateIds.length - 2];
//         const { url, selectors } = session.get(previousPageStateId);
//         swap.with(url, selectors);
//       } else {
//         swap.with('/');
//       }
//     }
//   } else if (xhr.status >= 500) {
//     if (isPane) {
//       samePane(obj);
//     } else {
//       // same page
//     }
//   }
// }



const closePanes = () => {
  document.documentElement.classList.remove(swap.opts.paneIsOpen);
  [...document.querySelectorAll(swap.opts.pane)].forEach(removePane);
  updateHistory(location.href.replace(/#.*$/, ''), { reset: true });
}


const removePane = (pane) => {
  pane.classList.remove('is-visible');
  setTimeout(() => {
    pane.remove();
  }, swap.opts.paneDuration);
}


export {
  loadPane,
  addPane,
  samePane,
  prevPane,
  continueForm,
  repeatForm,
  removePane,
  closePanes
};
