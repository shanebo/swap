import swap from './swap.js';
import { getPaneFormsData, replaceState, updateSessionState, pushSessionState, session, getPaneState } from './history.js';
import { fireElements, fireRoutes } from './events.js';
import { reloadPage } from './page.js';
import { loadPane, closePanes } from './pane.js';
import { htmlToElement, parseQuery, bypassKeyPressed } from './utils.js';


export default function() {
  swap.on('body', () => {
    const confirm = htmlToElement(swap.opts.confirmTemplate);
    if (!document.querySelector(swap.opts.confirm)) {
      document.body.appendChild(confirm);
    }
  });


  swap.event('DOMContentLoaded', (e) => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(swap.opts.css));
    document.head.appendChild(style);

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

        if (location.hash) {
          const params = parseQuery(location.hash.substr(1));
          if (params.pane) swap.paneUrl = params.pane;
        }
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


  swap.event('click', swap.opts.confirmTrigger, (e) => {
    e.preventDefault();

    const {
      swapConfirm,
      swapConfirmTitle,
      swapConfirmCancel,
      swapConfirmOk,
    } = e.target.dataset;

    const renderConfirm = ({ title, cancel, ok }) => {
      document.querySelector('[data-swap-model-confirm-title]').innerText = title;
      document.querySelector('[data-swap-model-confirm-cancel]').innerText = cancel;
      document.querySelector('[data-swap-model-confirm-ok]').innerText = ok;
      document.querySelector('[data-swap-model-confirm-ok]').focus();
    }

    if (swapConfirm) {
      renderConfirm(swap.confirmations[swapConfirm]);
    } else {
      renderConfirm({
        title: swapConfirmTitle,
        cancel: swapConfirmCancel,
        ok: swapConfirmOk
      });
    }

    document.querySelector(swap.opts.confirm).classList.add('is-active');
    swap.confirmEvent = e;
  });


  swap.event('click', '[data-swap-model-confirm-cancel]', (e) => {
    document.querySelector(swap.opts.confirm).classList.remove('is-active');
    delete swap.confirmEvent;
  });


  swap.event('click', '[data-swap-model-confirm-ok]', () => {
    const e = swap.confirmEvent;
    const handle = e.target.hasAttribute('formmethod') ? 'submit' : 'click';
    swap[handle].call(e.target, e);
    document.querySelector(swap.opts.confirm).classList.remove('is-active');
    delete swap.confirmEvent;
  });


  swap.event('click', swap.opts.button, swap.submit);


  swap.event('click', swap.opts.link, swap.click);


  swap.event('click', swap.opts.paneContinue, (e) => {
    const form = e.target.closest('form');
    if (form) {
      form.dataset.swapPaneContinue = 'true';
    }
  });


  swap.event('input', swap.opts.paneForms, (e) => {
    const formsData = getPaneFormsData();
    const pane = getPaneState();
    if (pane) {
      pane.edited = formsData !== pane.formsData;
    }
  });


  swap.event('submit', swap.opts.form, swap.submit);


  swap.event('click', swap.opts.paneCloseBtn, swap.closePane);


  swap.event('keyup', (e) => {
    if (e.key === 'Escape') {
      swap.closePane();
    }
  });


  swap.event('click', `.${swap.opts.paneIsOpen}`, (e) => {
    const notConfirmOrInsideConfirm = (e.target !== document.querySelector(swap.opts.confirm)
      && !e.target.closest(swap.opts.confirm));

    if (!e.target.closest(swap.opts.pane) && notConfirmOrInsideConfirm) {
      updateSessionState(location.href);
      closePanes();
    }
  });
}
