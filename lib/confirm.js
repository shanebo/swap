import swap from './swap.js';
import { htmlToElement } from './utils.js';


const openConfirm = (e) => {
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

  const confirm = htmlToElement(swap.opts.confirmTemplate(data));
  document.body.append(confirm);
  document.querySelector('[data-swap-model-confirm-ok]').focus();
  setTimeout(() => {
    confirm.classList.add('is-active');
  }, 10);
}


const closeConfirm = () => {
  const confirm = document.querySelector(swap.opts.confirm);
  confirm.classList.remove('is-active');
  setTimeout(() => {
    confirm.remove();
  }, swap.opts.confirmDuration);
  delete swap.confirmEvent;
}


const okConfirm = () => {
  const e = swap.confirmEvent;
  const handle = e.target.hasAttribute('formmethod') ? 'submit' : 'click';
  swap[handle].call(e.target, e);
  closeConfirm();
}


export {
  openConfirm,
  closeConfirm,
  okConfirm
};
