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


const shouldSwap = (destination) => {
  if (destination.hostname !== location.hostname
    || destination.protocol !== location.protocol) {
      // hostname protocol failed so hard refresh
    return false;
  }

  if ((destination.pathname === location.pathname) && destination.hash) {
    return false;
  }

  return true;
}


const cleanSelectors = (str) => str
  .split(',')
  .map(selector => selector.trim())
  .filter(selector => selector);


const renderOperators = ['>>', '->'];
const getPaneSelectors = (str) => cleanSelectors(str)
  .map(sel => renderOperators.includes(sel)
    ? `${sel} ${swap.opts.paneContent}`
    : `${sel} ${swap.opts.paneDefaultRenderType} ${swap.opts.paneContent}`);


const getSelectors = (el) => {
  return el.dataset.hasOwnProperty('swapPane')
    ? el.dataset.swapPane !== ''
      ? getPaneSelectors(el.dataset.swapPane)
      : swap.opts.paneSelectors
    : cleanSelectors(el.dataset.swap || el.dataset.swapInline || '');
}


const bypassKeyPressed = (key) => ['Alt', 'Control', 'Meta'].includes(key);


const getFormData = (form) => new URLSearchParams(new FormData(form)).toString();


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


const isElement = (item) => item instanceof Element || item instanceof HTMLDocument;


export {
  isElement,
  htmlToElement,
  getSelectors,
  getFormData,
  getPreviousSibling,
  buildUrl,
  getUrl,
  getPath,
  shouldSwap,
  parseQuery,
  bypassKeyPressed
};
