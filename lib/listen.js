import swap from './swap.js';
import { popState } from './history.js';
import { initPage } from './page.js';
import { clickOffPane } from './pane.js';
import { openConfirm, closeConfirm, okConfirm } from './confirm.js';
import { addContinueDirective, addRepeatDirective, checkForm } from './form.js';
import { keyDown, keyUp } from './keys.js';


export default function() {
  const opts = swap.opts;


  swap.event('DOMContentLoaded', initPage);


  swap.event('popstate', popState);


  swap.event('keydown', keyDown);
  swap.event('keyup', keyUp);


  swap.event('click', opts.confirmTrigger, openConfirm);
  swap.event('click', opts.confirmCancelTrigger, closeConfirm);
  swap.event('click', opts.confirmOkTrigger, okConfirm);


  swap.event('click', opts.link, swap.click);


  swap.event('click', opts.button, swap.submit);


  swap.event('click', opts.continueTrigger, addContinueDirective);
  swap.event('click', opts.repeatTrigger, addRepeatDirective);
  swap.event('input', opts.paneForms, checkForm);


  swap.event('submit', opts.form, swap.submit);


  swap.event('click', opts.paneCloseBtn, swap.closePane);


  swap.event('click', `.${opts.paneIsOpen}`, clickOffPane);
}
