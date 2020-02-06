const qs = document.querySelector.bind(document);
const qsa = document.querySelectorAll.bind(document);
const $html = document.documentElement;

const innerHtmlRender = (oldEl, newEl) => {
  oldEl.innerHTML = newEl.innerHTML;
}

const replaceRender = (oldEl, newEl) => {
  oldEl.parentNode.replaceChild(newEl, oldEl);
}

export {
  qs,
  qsa,
  innerHtmlRender,
  replaceRender,
  extractNewAssets,
  $html
};
