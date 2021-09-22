import { getPaneFormsData, getPaneState } from './history.js';


const addContinueDirective = (e) => {
  const form = e.target.closest('form');
  if (form) {
    form.dataset.swapContinue = 'true';
  }
}


const addRepeatDirective = (e) => {
  const form = e.target.closest('form');
  if (form) {
    form.dataset.swapRepeat = 'true';
  }
}


const checkForm = (e) => {
  const formsData = getPaneFormsData();
  const pane = getPaneState();
  if (pane) {
    pane.edited = formsData !== pane.formsData;
  }
}


export {
  addContinueDirective,
  addRepeatDirective,
  checkForm
};
