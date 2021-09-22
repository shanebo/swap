import swap from './swap.js';
import { getPaneFormsData, initState, popState, replaceState, updateSessionState, pushSessionState, session, getPaneState } from './history.js';
import { fireElements, fireRoutes } from './events.js';
import { loadSwapStyles } from './render.js';
import { loadPane, closePanes } from './pane.js';
import { openConfirm, closeConfirm, okConfirm } from './confirm.js';
import { keyDown, keyUp } from './keys.js';


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


  swap.event('popstate', popState);


  swap.event('keydown', keyDown);
  swap.event('keyup', keyUp);


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
