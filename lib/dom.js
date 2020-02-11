const qs = document.querySelector.bind(document);
const qsa = document.querySelectorAll.bind(document);
const $html = document.documentElement;

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







const innerHtmlRender = (oldEl, newEl) => {
  oldEl.innerHTML = newEl.innerHTML;
}


const replaceRender = (oldEl, newEl) => {
  oldEl.parentNode.replaceChild(newEl, oldEl);
}


const renderBody = (dom, selectors) => {
  const matches = selectors.map(sel => {
    if (sel[1]) {
      // arrow use case
      const oldEl = qs(sel[1]);
      const newEl = dom.querySelector(sel[0]);
      return !oldEl || !newEl
        ? null
        : innerHtmlRender.bind(null, oldEl, newEl);
    } else {
      const oldEl = qs(sel[0]);
      const newEl = dom.querySelector(sel[0]);
      return !oldEl || !newEl
        ? null
        : replaceRender.bind(null, oldEl, newEl);
    }
  }).filter(el => el);

  const fullSwap = (!selectors.length || (matches.length !== selectors.length));

  if (fullSwap) {
    document.body = dom.body;
  } else {
    matches.forEach(render => render());
  }
}


const renderTitle = (dom) => {
  document.title = dom.head.querySelector('title').innerText;
}


const renderAssets = (nodes) => {
  nodes.forEach(({ parent, node }) => {
    const newNode = createAsset(node);
    document[parent].appendChild(newNode);
  });
}


const filterAssets = (attr, vnode, nodes) => !nodes.some((node) => vnode[attr] && node[attr] === vnode[attr]);


const extractNewAssets = (dom, selector) => {
  const nodes = [...document.querySelectorAll(selector)];
  const vnodes = [...dom.querySelectorAll(selector)]
    .filter((node) => filterAssets(selector === 'script' ? 'src' : 'href', node, nodes))
    .map((node) => {
      const parent = node.closest('body') ? 'body' : 'head';
      node.parentNode.removeChild(node);
      return {
        parent,
        node
      };
    });
  return vnodes;
}


const createAsset = (vnode) => {
  const type = vnode.tagName.toLowerCase();
  const node = document.createElement(type);
  node.innerHTML = vnode.innerHTML;

  ['rel', 'href', 'src', 'defer'].forEach(attr => {
    if (vnode[attr]) {
      node[attr] = vnode[attr];
    }
  });

  return node;
}


export {
  qs,
  qsa,
  renderAssets,
  renderBody,
  renderTitle,
  innerHtmlRender,
  replaceRender,
  extractNewAssets,
  delegateHandle,
  $html
};
