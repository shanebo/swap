import swap from './swap.js';
import { htmlToElement } from './utils.js';


const addConfirm = (data) => {
  const confirm = htmlToElement(swap.opts.confirmTemplate(data));
  document.body.append(confirm);
  document.querySelector('[data-swap-model-confirm-ok]').focus();

  setTimeout(() => {
    confirm.classList.add('is-active');
  }, 10);
}


const removeConfirm = () => {
  const confirm = document.querySelector(swap.opts.confirm);
  confirm.classList.remove('is-active');
  setTimeout(() => {
    confirm.remove();
  }, swap.opts.confirmDuration);
}


export {
  addConfirm,
  removeConfirm
};
