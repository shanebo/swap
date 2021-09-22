import swap from './swap.js';
import { getPaneState } from './history.js';
import { openPage } from './page.js';
import { hasPane, samePane } from './pane.js';


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
  const pane = getPaneState();
  if (pane) {
    const formsData = getPaneFormsData();
    pane.edited = formsData !== pane.formsData;
  }
}


const continueForm = (obj) => {
  // handle error use cases
  const { xhr } = obj;
  const paneIsOpen = hasPane();

  if (xhr.status === 200) {
    swap.formSaved = true;
    paneIsOpen
      ? swap.closePane(obj)
      : openPage(obj);
  } else if (xhr.status >= 500) {
    paneIsOpen
      ? samePane(obj)
      : openPage(obj);
  }
}


const repeatForm = (obj) => {
  // handle error use cases
  const { xhr } = obj;

  if (xhr.status === 200) {
    swap.formSaved = true;
  }

  hasPane()
    ? samePane(obj)
    : openPage(obj);
}


const getFormData = (form) => new URLSearchParams(new FormData(form)).toString();


const getPaneFormsData = () => [...document.querySelectorAll(swap.opts.paneForms)].map(getFormData).toString();


export {
  addContinueDirective,
  addRepeatDirective,
  checkForm,
  continueForm,
  repeatForm,
  getFormData,
  getPaneFormsData
};
