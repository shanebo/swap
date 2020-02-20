const { getFormData, $html } = require('./utils');


const isElement = (item) => item instanceof Element || item instanceof HTMLDocument;


const baseRequest = (url, method = 'get') => ({
  url,
  method,
  headers: {
    'x-requested-with': 'xmlhttprequest',
    ...swap.paneUrl && {
      'pane-url': swap.paneUrl
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


const requestMapper = {
  a: (link) => baseRequest(link.href),
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
  return requestMapper[type](arg);
}


const ajax = ({ method, url, headers, body = null }, callback) => {
  const xhr = new XMLHttpRequest();

  if (swap.request) {
    swap.request.abort();
  }

  swap.request = xhr;
  $html.classList.add('swap-loading');
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
    $html.classList.remove('swap-loading');
    if (xhr.status !== 200) {
      alert('Error: ' + xhr.status);
      return;
    }
    callback(xhr, xhr.response, xhr.responseText);
    swap.request = false;
  }

  xhr.onerror = (e) => {
    alert('Error: handle non-HTTP error (e.g. network down)');
    swap.request = false;
  }

  xhr.send(body);
}


export {
  ajax,
  buildRequest
};
