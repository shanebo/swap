const qs = document.querySelector.bind(document);
const qsa = document.querySelectorAll.bind(document);
const $html = document.documentElement;

const innerHtmlRender = (oldEl, newEl) => {
  oldEl.innerHTML = newEl.innerHTML;
}

const replaceRender = (oldEl, newEl) => {
  oldEl.parentNode.replaceChild(newEl, oldEl);
}

const delegateHandle = function(delegate, fn) {
  return function(e) {
    if (e.target.matches(delegate)) {
      return fn.apply(e.target, arguments);
    }

    const parent = e.target.closest(delegate);

    if (parent) {
      return fn.apply(parent, arguments);
    }
  }
}


export {
  qs,
  qsa,
  innerHtmlRender,
  replaceRender,
  delegateHandle,
  $html
};
