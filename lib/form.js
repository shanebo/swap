import swap from './swap.js';
import { openPage } from './page.js';
import { hasPane, samePane } from './pane.js';


const addFormDirective = (type) => (e) => {
  const form = e.target.closest('form');
  if (form) {
    form.setAttribute(`data-swap-${type}`, 'true');
  }
}


const continueForm = (obj) => {
  const { xhr } = obj;
  const paneIsOpen = hasPane();

  if (xhr.status === 200) {
    paneIsOpen
      ? swap.closePane(obj, true)
      : openPage(obj);
  } else if (xhr.status >= 500) {
    paneIsOpen
      ? samePane(obj)
      : openPage(obj);
  }
}


const repeatForm = (obj) => {
  const { xhr } = obj;

  if (xhr.status === 200) {
    hasPane()
      ? samePane(obj)
      : openPage(obj);
  } else if (xhr.status >= 500) {
    // handle error use cases
  }
}


const submitExternalForm = (e) => {
  // create and trigger buttonForm for external hostname
  e.preventDefault();
  const target = e.target;
  const form = document.createElement('form');
  const formbody = target.getAttribute('formbody');
  form.method = target.getAttribute('formmethod');
  form.action = target.getAttribute('formaction');

  if (formbody) {
    const body = JSON.parse(decodeURIComponent(formbody));
    Object.keys(body).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.value = body[key];
      input.name = key;
      form.append(input);
    });
  }

  document.body.append(form);
  form.submit();
}


const getFormData = (form) => new URLSearchParams(new FormData(form)).toString();


const getPaneFormsData = () => [...document.querySelectorAll(swap.opts.paneForms)].map(getFormData).toString();


export {
  addFormDirective,
  continueForm,
  repeatForm,
  submitExternalForm,
  getFormData,
  getPaneFormsData
};
