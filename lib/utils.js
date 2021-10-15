import swap from './swap.js';


const getUrl = (url) => {
  const source = document.createElement('a');
  source.setAttribute('href', url);
  return buildUrl(source);
}


const getPath = (original) => {
  const url = getUrl(original);
  return url.pathname + url.search;
}


const parseQuery = (search) => decodeURIComponent(search)
  .split('&')
  .reduce((params, keyval) => {
      const [ key, val ] = keyval.split('=');
      params[key] = val;
      return params;
    }, {});


const buildUrl = (source) => {
  const obj = {
    query: parseQuery(source.search.substr(1))
  };

  [
    'href',
    'protocol',
    'host',
    'hostname',
    'port',
    'pathname',
    'search',
    'hash',
    'origin'
  ].forEach(prop => obj[prop] = source[prop]);

  return obj;
}


const hasPaneUrl = (url) => /#pane=/.test(url || location.href);


const getPaneUrl = (url) => {
  url = url || location.href;
  return hasPaneUrl(url)
    ? parseQuery(url.split('#')[1]).pane
    : null;
}


const shouldSwap = (destination) => {
  if (swap.metaKeyOn) return false;

  if (destination.hostname !== location.hostname
      || destination.protocol !== location.protocol) {
      // hostname protocol failed so hard refresh
    return false;
  }

  if (destination.pathname === location.pathname
      && destination.href.includes('#')
      && !destination.hash.includes('pane=')) {
    return false;
  }

  return true;
}


const cleanSelectors = (str) => str
  .split(',')
  .map(selector => selector.trim())
  .filter(selector => selector);


const getSelectors = (el) => {
  return el.hasAttribute('data-swap-pane')
    ? swap.opts.paneSelectors
    : cleanSelectors(el.dataset.swap || el.dataset.swapInline || '');
}


const htmlToElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim(); // Never return a text node of whitespace as the result
  return template.content.firstChild;
}


const getPreviousSibling = function(el, selector){
  let sibling = el.previousElementSibling;
  while (sibling) {
    if (sibling.matches(selector)) return sibling;
    sibling = sibling.previousElementSibling;
  }
}


export {
  htmlToElement,
  getSelectors,
  getPreviousSibling,
  buildUrl,
  hasPaneUrl,
  getPaneUrl,
  getUrl,
  getPath,
  shouldSwap
};
