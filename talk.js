const talk = (opts, callback) => {
  const doc = document.documentElement;
  const xhr = new XMLHttpRequest();

  doc.classList.add('swap-progressing');

  xhr.open(opts.method, opts.url, true);

  if (opts.headers) {
    Object.keys(opts.headers).forEach((header) => {
      xhr.setRequestHeader(header, opts.headers[header]);
    });
  }
  // xhr.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
  // xhr.setRequestHeader('cache-control', 'max-age=0');
  // xhr.setRequestHeader('expires', '0');
  // xhr.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
  // xhr.setRequestHeader('pragma', 'no-cache');

  xhr.onload = () => {
    doc.classList.remove('swap-progressing');

    if (xhr.status !== 200) {
      console.log( 'Error: ' + xhr.status);
      return;
    }

    callback(xhr, xhr.response, xhr.responseText);
  }

  xhr.onerror = console.log; // handle non-HTTP error (e.g. network down)

  xhr.send(opts.body || null);
}


module.exports = talk;
