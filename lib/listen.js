import swap from './swap.js';
import { getPaneFormsData, replaceState, updateSessionState, pushSessionState, session, getPaneState } from './history.js';
import { fireElements, fireRoutes } from './events.js';
import { loadSwapStyles } from './render.js';
import { reloadPage } from './page.js';
import { loadPane, closePanes } from './pane.js';
import { addConfirm, removeConfirm } from './confirm.js';
import { bypassKeyPressed } from './utils.js';


export default function() {
  const opts = swap.opts;


  swap.event('DOMContentLoaded', (e) => {
    loadSwapStyles();

    if (!session.get('stateIds')) {
      session.set('stateIds', []);
      swap.stateId = -1;
    } else {
      const stateIds = session.get('stateIds');
      swap.stateId = stateIds[stateIds.length - 1];
    }

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
    if (bypassKeyPressed(e.key)) {
      swap.metaKeyOn = false;
    }
  });


  swap.event('click', opts.confirmTrigger, (e) => {
    e.preventDefault();

    const {
      swapConfirm,
      swapConfirmTitle,
      swapConfirmCancel,
      swapConfirmOk,
    } = e.target.dataset;

    swap.confirmEvent = e;

    const data = swapConfirm
      ? swap.confirmations[swapConfirm]
      : {
          title: swapConfirmTitle,
          cancel: swapConfirmCancel,
          ok: swapConfirmOk
        };

    addConfirm(data);
  });


  swap.event('click', opts.confirmCancelTrigger, (e) => {
    removeConfirm();
    delete swap.confirmEvent;
  });


  swap.event('click', opts.confirmOkTrigger, () => {
    const e = swap.confirmEvent;
    const handle = e.target.hasAttribute('formmethod') ? 'submit' : 'click';
    swap[handle].call(e.target, e);
    removeConfirm();
    delete swap.confirmEvent;
  });


  swap.event('click', opts.button, swap.submit);


  swap.event('click', opts.link, swap.click);


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


  swap.event('keyup', (e) => {
    if (e.key === 'Escape') {
      swap.closePane();
    }
  });


  swap.event('click', `.${opts.paneIsOpen}`, (e) => {
    const notConfirmOrInsideConfirm = (e.target !== document.querySelector(opts.confirm)
      && !e.target.closest(opts.confirm));

    if (!e.target.closest(opts.pane) && notConfirmOrInsideConfirm) {
      updateSessionState(location.href);
      closePanes();
    }
  });
}
