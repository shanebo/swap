const { $html } = require('./dom');

let activeRequest;


const buildPaneClickRequest = (url) => ({
  url,
  method: 'get',
  headers: {
    'x-requested-with': 'xmlhttprequest',
    'pane-url': swap.paneUrl
  }
});


const buildSubmitRequest = (form) => {
  if (form.method.toLowerCase() === 'get') {
    const url = form.action;
    const query = new URLSearchParams(new FormData(form)).toString();
    const cleanQuery = decodeURIComponent(query).replace(/[^=&]+=(&|$)/g, '').replace(/&$/, '');
    const search = cleanQuery ? '?' + encodeURI(cleanQuery) : cleanQuery;
    return {
      method: 'get',
      url: `${url}${search}`
    }
  }

  return {
    url: form.action,
    method: form.method,
    body: new URLSearchParams(new FormData(form)).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...swap.paneUrl && { 'pane-url': swap.paneUrl }
    }
  };
};


const talk = ({ method, url, headers, body }, callback) => {
  const xhr = new XMLHttpRequest();

  if (activeRequest) {
    activeRequest.abort();
  }

  activeRequest = xhr;

  $html.classList.add('swap-progressing');

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
    $html.classList.remove('swap-progressing');

    if (xhr.status !== 200) {
      alert('Error: ' + xhr.status);
      return;
    }

    callback(xhr, xhr.response, xhr.responseText);
    activeRequest = false;
  }

  xhr.onerror = (e) => {
    console.log(e); // handle non-HTTP error (e.g. network down)
    activeRequest = false;
  }

  xhr.send(body || null);
}

// const talk = (opts, callback) => {
//   const xhr = new XMLHttpRequest();

//   if (activeRequest) {
//     activeRequest.abort();
//   }

//   activeRequest = xhr;

//   $html.classList.add('swap-progressing');

//   xhr.open(opts.method, opts.url, true);

//   if (opts.headers) {
//     Object.keys(opts.headers).forEach((header) => {
//       xhr.setRequestHeader(header, opts.headers[header]);
//     });
//   }

//   // xhr.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
//   // xhr.setRequestHeader('cache-control', 'max-age=0');
//   // xhr.setRequestHeader('expires', '0');
//   // xhr.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
//   // xhr.setRequestHeader('pragma', 'no-cache');

//   xhr.onload = () => {
//     $html.classList.remove('swap-progressing');

//     if (xhr.status !== 200) {
//       console.log('Error: ' + xhr.status);
//       return;
//     }

//     callback(xhr, xhr.response, xhr.responseText);
//     activeRequest = false;
//   }

//   xhr.onerror = (e) => {
//     console.log(e); // handle non-HTTP error (e.g. network down)
//     activeRequest = false;
//   }

//   xhr.send(opts.body || null);
// }



export {
  talk,
  buildSubmitRequest,
  buildPaneClickRequest
};
