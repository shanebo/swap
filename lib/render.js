const { qs, getUrl } = require('./utils');


const render = {
  replace: (el, target) => {
    target.parentNode.replaceChild(el, target);
  },
  innerHtml: (el, target) => {
    target.innerHTML = el.innerHTML;
    // target.insertAdjacentHTML('beforeend', el.innerHTML);
  },
  append: (el, target) => {
    target.appendChild(el);
  }
};


const renderBody = (dom, selectors) => {
  const matches = selectors.map(sel => {
    const innerHtmlPattern = sel.split(/\s*>>\s*/); // >> operator
    const appendPattern = sel.split(/\s*->\s*/); // -> operator

    if (innerHtmlPattern.length > 1) {
      return {
        type: 'innerHtml',
        el: dom.querySelector(innerHtmlPattern[0]),
        target: qs(innerHtmlPattern[1])
      };
    } else if (appendPattern.length > 1) {
      return {
        type: 'append',
        el: dom.querySelector(appendPattern[0]),
        target: qs(appendPattern[1])
      };
    }
    return {
      type: 'replace',
      el: dom.querySelector(sel),
      target: qs(sel)
    }
  }).map(sel => {
    const { el, target, type } = sel;
    return !el || !target
      ? null
      : render[type].bind(null, el, target);
  }).filter(el => el);

  const notice = dom.querySelector(swap.opts.notice);
  const oldNotice = qs(swap.opts.notice);

  const fullSwap = (!selectors.length || (matches.length !== selectors.length)) || (notice && !oldNotice);

  if (fullSwap) {
    document.body = dom.body;
    window.scrollTo(0, 0);
  } else {
    if (notice) {
      matches.push(render.replace.bind(null, notice, oldNotice));
    }

    matches.forEach(render => render());
  }
}


const renderTitle = (dom) => {
  const titleElement = dom.head.querySelector('title');
  if (titleElement) {
    document.title = titleElement.innerText;
  }
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


const assetPartsRegex = /(\/[^\.]+)(?:(?:[\-_\.])([^\.\-_]+))\.(.+)$/;


const buildAssetMap = (el, selector) => [...el.querySelectorAll(selector)]
  .filter((node) => selector !== 'link' || (selector === 'link' && node.rel === 'stylesheet')) // prevents other link tag types
  .map((node) => node[selector === 'script' ? 'src' : 'href'])
  .filter((url) => url)
  .map((url) => {
    const { host, pathname, search } = getUrl(url);
    const [ _, name, hash, extension ] = pathname.match(assetPartsRegex);

    return {
      name: `${host}/${name}.${extension}${search}`,
      url,
      hash
    }
  });


const assetsChanged = (dom) => {
  const existingAssets = ['link', 'script'].map((selector) => buildAssetMap(document, selector)).flat();
  const incomingAssets = ['link', 'script'].map((selector) => buildAssetMap(dom, selector)).flat();

  return incomingAssets.some((incomingAsset) => {
    const existingAsset = existingAssets.find((a) => a.name === incomingAsset.name);
    return existingAsset && existingAsset.hash !== incomingAsset.hash;
  });
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
  extractNewAssets,
  assetsChanged
};
