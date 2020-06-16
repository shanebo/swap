const { getUrl, getFormData, $html } = require('./utils');


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


const buttonPostRequest = (btn) => {
  const { swapMethod, swapAction, swapBody } = btn.dataset;
  const req = baseRequest(btn.href || swapAction, 'post');

  req.headers['Content-Type'] = 'application/json';

  const body = swapBody
    ? JSON.parse(decodeURIComponent(swapBody))
    : {};

  if (swapMethod.toLowerCase() !== 'post') {
    body._method = swapMethod.toLowerCase();
  }

  req.body = JSON.stringify(body);
  return req;
}


const requestMapper = {
  a: (link) => baseRequest(link.href),
  buttonForm: buttonPostRequest,
  url: (url) => baseRequest(url),
  object: (obj) => obj,
  form: (form) => form.method.toLowerCase() === 'get'
    ? formGetRequest(form)
    : formPostRequest(form)
};


const buildRequest = (arg) => {
  const type = typeof arg === 'string'
    ? 'url'
    : isElement(arg)
      ? arg.tagName.toLowerCase()
      : 'object';

  return arg.dataset && arg.dataset.swapMethod
    ? requestMapper['buttonForm'](arg)
    : requestMapper[type](arg);
}


const ajax = ({ method, url, headers, body = null }, callback) => {
  const xhr = new XMLHttpRequest();

  xhr.withCredentials = true;

  if (swap.request) {
    swap.request.abort();
  }

  swap.request = xhr;
  $html.classList.add('swap-is-loading');
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
    $html.classList.remove('swap-is-loading');
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
    $html.classList.remove('swap-is-loading');
    swap.request = false;
  }

  xhr.send(body);
}


export {
  ajax,
  buildRequest
};
