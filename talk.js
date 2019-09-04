const talk = (opts, callback) => {
  const doc = document.documentElement;
  const xhr = new XMLHttpRequest();

  xhr.open(opts.method, opts.url, true);

  // xhr.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
  // xhr.setRequestHeader('cache-control', 'max-age=0');
  // xhr.setRequestHeader('expires', '0');
  // xhr.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
  // xhr.setRequestHeader('pragma', 'no-cache');

  xhr.onload = () => {
    if (xhr.status !== 200) {
      console.log( 'Error: ' + xhr.status);
      return;
    }

    callback(xhr, xhr.response, xhr.responseText);
  }

  xhr.onloadstart = function(e) {
    doc.style.setProperty('--progress', '0%');
    doc.classList.add('swap-progressing');
  }

  xhr.onprogress = function(e) {
    if (e.lengthComputable) {
      const percent = (e.loaded / e.total) * 10;
      doc.style.setProperty('--progress', `${percent}%`);
    }
  }

  xhr.onloadend = function(e) {
    doc.style.setProperty('--progress', '100%');
    doc.classList.remove('swap-progressing');
  }

  xhr.onerror = console.log; // handle non-HTTP error (e.g. network down)

  xhr.send(opts.body || null);
}


module.exports = talk;
