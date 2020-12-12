import swap from './swap.js';
import { getUrl, getFormData } from './utils.js';


const isElement = (item) => item instanceof Element || item instanceof HTMLDocument;


const baseRequest = (url, method = 'get') => ({
  url,
  method,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    ...swap.paneUrl && {
      'Pane-Url': swap.paneUrl
    }
  }
});


const formGetRequest = (form) => {
  const data = getFormData(form);
  const cleanQuery = decodeURIComponent(data).replace(/[^=&]+=(&|$)/g, '').replace(/&$/, '');
  const search = cleanQuery ? `?${encodeURI(cleanQuery)}` : cleanQuery;
  return baseRequest(`${form.action}${search}`);
}


const formPostRequest = (form) => {
  const req = baseRequest(form.action, form.method);
  req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  req.body = getFormData(form);
  return req;
}


const submitButtonRequest = (btn) => {
  const req = baseRequest(btn.getAttribute('formaction'), 'post');
  req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  req.body = getFormData(btn.closest('form'));
  return req;
}


const buttonPostRequest = (btn) => {
  const formmethod = btn.getAttribute('formmethod');
  const formbody = btn.getAttribute('formbody');
  const req = baseRequest(btn.href || btn.getAttribute('formaction'), 'post');

  req.headers['Content-Type'] = 'application/json';

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

  // xhr.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
  // xhr.setRequestHeader('cache-control', 'max-age=0');
  // xhr.setRequestHeader('expires', '0');
  // xhr.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
  // xhr.setRequestHeader('pragma', 'no-cache');

  xhr.onload = () => {
    document.documentElement.classList.remove('swap-is-loading');
    if (xhr.status !== 200) {
      alert('Error: ' + xhr.status);
      return;
    }

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
  }

  xhr.send(body);
}


export {
  ajax,
  buildRequest
};
