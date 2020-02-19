const { qs } = require('./utils');

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


const loadAssets = (nodes, next) => {
  if (!nodes.length) return next();

  const inlineScripts = nodes.filter(({ node }) => !node.href && !node.src);
  const headAssets = nodes.filter(({ node }) => node.href || node.src);

  let remaining = headAssets.length;

  const loadedFile = () => {
    remaining -= 1;
    if (!remaining) {
      completed();
    }
  }

  const appendAssets = (arr) => {
    arr.forEach(({ parent, node }) => {
      const newNode = createAsset(node);
      if (newNode.href || newNode.src) {
        newNode.onload = loadedFile;
        newNode.onerror = loadedFile;
      }
      document[parent].appendChild(newNode);
    });
  }

  const completed = () => {
    remaining = 0;
    appendAssets(inlineScripts);
    next();
  }

  if (!remaining) {
    completed();
    return;
  }

  appendAssets(headAssets);
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
  node.dataset.flag = Date.now();
  node.innerHTML = vnode.innerHTML;

  ['rel', 'href', 'src', 'defer'].forEach(attr => {
    if (vnode[attr]) {
      node[attr] = vnode[attr];
    }
  });

  return node;
}


export {
  loadAssets,
  renderBody,
  renderTitle,
  innerHtmlRender,
  replaceRender,
  extractNewAssets
};
