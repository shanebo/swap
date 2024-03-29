import swap from './swap.js';
import { getFormData } from './form.js';
import { getUrl } from './utils.js';
import { getPreviousUrl, getCurrentUrl } from './history.js';


const baseRequest = (url, method = 'get') => ({
  url,
  method,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Swap-Referer-Url': getCurrentUrl()
  }
});


const setDirectiveUrlHeader = (target, req) => {
  if (target.hasAttribute('data-swap-repeat')) {
    req.headers['Swap-Directive-Url'] = getCurrentUrl();
  } else if (target.hasAttribute('data-swap-continue')) {
    req.headers['Swap-Directive-Url'] = getPreviousUrl();
  }
}


const formGetRequest = (form) => {
  const data = getFormData(form);
  const cleanQuery = decodeURIComponent(data).replace(/[^=&]+=(&|$)/g, '').replace(/&$/, '');
  const search = cleanQuery ? `?${encodeURI(cleanQuery)}` : cleanQuery;
  return baseRequest(`${form.action}${search}`);
}


const formPostRequest = (form) => {
  const req = baseRequest(form.action, form.method);
  req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  setDirectiveUrlHeader(form, req);
  req.body = getFormData(form);
  return req;
}


const submitButtonRequest = (btn) => {
  const req = baseRequest(btn.getAttribute('formaction'), 'post');
  req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  setDirectiveUrlHeader(btn, req);
  req.body = getFormData(btn.closest('form'));
  return req;
}


const buttonPostRequest = (btn) => {
  const formmethod = btn.getAttribute('formmethod');
  const formbody = btn.getAttribute('formbody');
  const req = baseRequest(btn.href || btn.getAttribute('formaction'), 'post');

  req.headers['Content-Type'] = 'application/json';
  setDirectiveUrlHeader(btn, req);

  const body = formbody
    ? JSON.parse(decodeURIComponent(formbody))
    : {};

  if (formmethod.toLowerCase() !== 'post') {
    body._method = formmethod.toLowerCase();
  }

  req.body = JSON.stringify(body);
  return req;
}


const requestMapper = {
  url: baseRequest,
  buttonForm: buttonPostRequest,
  submitButton: submitButtonRequest,
  object: (obj) => obj,
  a: (link) => baseRequest(link.href),
  form: (form) => form.method.toLowerCase() === 'get'
    ? formGetRequest(form)
    : formPostRequest(form)
};


const buildRequest = (arg) => {
  const type = typeof arg === 'string'
    ? 'url'
    : isElement(arg)
      ? arg.hasAttribute('formaction') && arg.closest('form') && arg.type !== 'button'
        ? 'submitButton'
        : arg.hasAttribute('formmethod')
          ? 'buttonForm'
          : arg.tagName.toLowerCase()
    : 'object';
  return requestMapper[type](arg);
}


const ajax = ({ method, url, headers, body = null }, callback) => {
  const xhr = new XMLHttpRequest();

  xhr.withCredentials = true;

  if (swap.request) {
    swap.request.abort();
  }

  swap.request = xhr;
  document.documentElement.classList.add('swap-is-loading');
  xhr.open(method, url, true);

  if (headers) {
    Object.keys(headers).forEach((header) => {
      xhr.setRequestHeader(header, headers[header]);
    });
  }

  // TODO: set cache headers

  xhr.onload = () => {
    document.documentElement.classList.remove('swap-is-loading');

    const wasRedirected = url.replace(/#.*$/, '') !== xhr.responseURL;
    swap.responseUrl = wasRedirected ? xhr.responseURL : url;

    const origUrl = getUrl(url);
    const redirectedUrl = getUrl(swap.responseUrl);

    if (origUrl.hostname !== redirectedUrl.hostname) {
      location.href = xhr.responseURL;
      return;
    }

    callback(xhr, xhr.response, xhr.responseText);

    swap.request = false;
    swap.responseUrl = false;
  }

  xhr.onerror = (e) => {
    console.log(e);
    document.documentElement.classList.remove('swap-is-loading');
    swap.request = false;
    alert('There was a problem with that request. Please try again.');
  }

  xhr.send(body);
}


const isElement = (item) => item instanceof Element || item instanceof HTMLDocument;


export {
  ajax,
  buildRequest
};
