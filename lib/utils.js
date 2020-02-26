const qs = document.querySelector.bind(document);
const qsa = document.querySelectorAll.bind(document);
const $html = document.documentElement;


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
    ? `${sel} ${swap.qs.paneContent}`
    : `${sel} ${swap.qs.paneDefaultRenderType} ${swap.qs.paneContent}`);


const getSelectors = (el) => {
  return el.dataset.hasOwnProperty('swapPane')
    ? el.dataset.swapPane !== ''
      ? getPaneSelectors(el.dataset.swapPane)
      : swap.paneSelectors
    : cleanSelectors(el.dataset.swap || el.dataset.swapInline || '');
}


const bypassKeyPressed = (key) => ['Alt', 'Control', 'Meta'].includes(key);


const getFormData = (form) => new URLSearchParams(new FormData(form)).toString();


const htmlToElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim(); // Never return a text node of whitespace as the result
  return template.content.firstChild;
}


// const getHeaders = (str) => {
//   return str.trim().split('\n').map(line => {
//     const splat = line.split(':');
//     return {
//       [splat[0].trim()]: splat[1].trim()
//     };
//   }).reduce(((r, c) => Object.assign(r, c)), {});
// }


// const removeEmptyProps = (obj) =>
//   Object.fromEntries(
//     Object.entries(obj)
//       .filter(([k, v]) => v != null)
//       .map(([k, v]) => (typeof v === 'object' ? [k, removeEmptyProps(v)] : [k, v]))
//   );


export {
  qs,
  qsa,
  $html,
  htmlToElement,
  getSelectors,
  getFormData,
  buildUrl,
  getUrl,
  getPath,
  shouldSwap,
  parseQuery,
  bypassKeyPressed
};
