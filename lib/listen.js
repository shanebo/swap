import swap from './swap.js';
import { getPaneFormsData, initState, replaceState, updateSessionState, pushSessionState, session, getPaneState } from './history.js';
import { fireElements, fireRoutes } from './events.js';
import { loadSwapStyles } from './render.js';
import { reloadPage } from './page.js';
import { loadPane, closePanes } from './pane.js';
import { openConfirm, closeConfirm, okConfirm } from './confirm.js';
import { bypassKeyPressed } from './utils.js';


export default function() {
  const opts = swap.opts;


  swap.event('DOMContentLoaded', (e) => {
    loadSwapStyles();
    initState();
    fireRoutes('on', location.href, null);

    if (/pane=/.test(location.hash)) {
      loadPane();
    } else {
      fireElements('on');
      pushSessionState(location.href);
      replaceState(location.href);
    }
  });


  swap.event('popstate', (e) => {
    /*
      - check if headers determine it should be cached or not
      - if not cached then ajax request
      - if cached then return state
    */

    if (!e.state) return;

    const pageState = session.get(e.state.id);

    if (!pageState) return reloadPage();

    const { html, selectors, paneHistory, expires, id } = pageState;
    const forward = id > swap.stateId;

    const stateIds = session.get('stateIds');
    const justAtId = stateIds[stateIds.indexOf(id) + (forward ? -1 : 1)];
    const justAt = justAtId ? session.get(justAtId).url : null;

    if (justAt) updateSessionState(justAt);

    swap.stateId = id;
    swap.paneHistory = paneHistory;

    fireRoutes('off', location.href, justAt);

    if (expires < Date.now()) {
      reloadPage(selectors);
    } else {
      const dom = new DOMParser().parseFromString(html, 'text/html');

      swap.to(dom, selectors, false, () => {
        document.documentElement.className = dom.documentElement.className;
        fireRoutes('on', location.href, justAt);
        updateSessionState(location.href);
      });
    }
  });


  swap.event('keydown', (e) => {
    if (bypassKeyPressed(e.key)) {
      swap.metaKeyOn = true;
    }
  });


  swap.event('keyup', (e) => {
    if (e.key === 'Escape') {
      swap.closePane();
    } else if (bypassKeyPressed(e.key)) {
      swap.metaKeyOn = false;
    }
  });


  swap.event('click', opts.confirmTrigger, openConfirm);
  swap.event('click', opts.confirmCancelTrigger, closeConfirm);
  swap.event('click', opts.confirmOkTrigger, okConfirm);


  swap.event('click', opts.link, swap.click);


  swap.event('click', opts.button, swap.submit);


  swap.event('click', opts.continueTrigger, (e) => {
    const form = e.target.closest('form');
    if (form) {
      form.dataset.swapContinue = 'true';
    }
  });


  swap.event('click', opts.repeatTrigger, (e) => {
    const form = e.target.closest('form');
    if (form) {
      form.dataset.swapRepeat = 'true';
    }
  });


  swap.event('input', opts.paneForms, (e) => {
    const formsData = getPaneFormsData();
    const pane = getPaneState();
    if (pane) {
      pane.edited = formsData !== pane.formsData;
    }
  });


  swap.event('submit', opts.form, swap.submit);


  swap.event('click', opts.paneCloseBtn, swap.closePane);


  swap.event('click', `.${opts.paneIsOpen}`, (e) => {
    const notConfirmOrInsideConfirm = (e.target !== document.querySelector(opts.confirm)
      && !e.target.closest(opts.confirm));

    if (!e.target.closest(opts.pane) && notConfirmOrInsideConfirm) {
      updateSessionState(location.href);
      closePanes();
    }
  });
}
