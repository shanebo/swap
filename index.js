const loader = require('./lib/loader');
const { qs, $html, innerHtmlRender, replaceRender, delegateHandle } = require('./lib/dom');
const { talk, buildPaneClickRequest, buildSubmitRequest } = require('./lib/request');
const { pushState, replaceState } = require('./lib/history');
const { listener, fireElements, fireRoutes } = require('./lib/events');
const { prevPane, samePane, openPane, nextPane, resetPane } = require('./lib/pane');
const { buildUrl, shouldSwap, getUrl, getSelectors, parseQuery, bypassKeyPressed } = require('./lib/utils');


window.swap = {
  metaKeyOn: false,
  paneUrl: false,
  paneHistory: [],
  before: listener.bind(window.swap, 'before'),
  on: listener.bind(window.swap, 'on'),
  off: listener.bind(window.swap, 'off')
};


swap.to = (html, sels, inline) => {
  fireElements('off');

  const dom = typeof html === 'string'
    ? new DOMParser().parseFromString(html, 'text/html')
    : html;
  const selectors = sels.map(sel => sel.split(/\s*->\s*/));

  const changes = selectors.map(sel => {
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

  const fullSwap = (!selectors.length || (changes.length !== selectors.length));

  if (fullSwap) {
    document.body = dom.body;


            // CLEAN THIS UP. THIS ALLOWS INLINE SCRIPTS TO RUN
            // get a list of all <script> tags in the new page
            var tmpScripts = document.querySelectorAll('script:not([src])');

            if (tmpScripts.length > 0) {
              // push all of the document's script tags into an array
              // (to prevent dom manipulation while iterating over dom nodes)
              var scripts = [];
              for (var i = 0; i < tmpScripts.length; i++) {
                  scripts.push(tmpScripts[i]);
              }

              // iterate over all script tags and create a duplicate tags for each
              for (var i = 0; i < scripts.length; i++) {
                var s = document.createElement('script');
                s.innerHTML = scripts[i].innerHTML;

                // add the new node to the page
                scripts[i].parentNode.appendChild(s);

                // remove the original (non-executing) node from the page
                scripts[i].parentNode.removeChild(scripts[i]);
              }
            }



  } else {
    changes.forEach(render => render());
  }

  if (!inline) {
    // document.head = dom.head;
    injectNewScriptsAndStyles(dom);
    document.title = dom.head.querySelector('title').innerText;
  }

  if (!selectors.length) {
    // make this smarter where it only scrolls to top on different urls?
    console.log('no selectors so scroll to top');
    window.scrollTo(0, 0);
  }

  fireElements('on');

  return swap;
}

injectNewScriptsAndStyles = (dom) => {
  const scripts = newNodes(dom, 'script[src]', (existingScripts, script) => {
    return existingScripts.filter((e) => e.src === script.src).length === 0;
  });

  if (scripts) {
    appendNodes('script', scripts, (script, newScript) => {
      newScript.type = script.type;
      newScript.src = script.src;
    });
  }

  const csses = newNodes(dom, 'link[href]', (existingCsses, css) => {
    return existingCsses.filter((e) => e.href === css.href).length === 0;
  });

  if (csses) {
    appendNodes('link', csses, (css, newCss) => {
      newCss.rel = css.rel;
      newCss.href = css.href;
    });
  }
}

newNodes = (dom, selector, filter) => {
  let nodes = [...dom.querySelectorAll(selector)];
  nodes.forEach((n) => n.parentNode.removeChild(n));
  const existingNodes = [...document.querySelectorAll(selector)];

  return nodes.filter((node) => filter(existingNodes, node));
}

appendNodes = (type, nodes, setter) => {
  nodes.forEach((node) => {
    const newNode = document.createElement(type);
    setter(node, newNode);
    document.head.appendChild(newNode);
  });
}


swap.with = (options, selectors = [], callback = openPage) => {
  const opts = typeof options === 'string'
    ? { url: options, method: 'get' }
    : options;

  const { url, method } = opts;

  fireRoutes('before', url, method);

  talk(opts, (xhr, res, html) => {
    const wasRedirected = url !== xhr.responseURL;
    const finalUrl = wasRedirected ? xhr.responseURL : url;
    const finalMethod = wasRedirected ? 'get' : method;

    callback({
      opts,
      xhr,
      url,
      method,
      html,
      selectors,
      finalMethod,
      finalUrl
    });
  });

  return swap;
}


swap.event = function(name, delegate, fn) {
  const e = {
    name,
    target: window,
    fn: arguments.length !== 3
      ? arguments[1]
      : delegateHandle(delegate, fn)
  };

  window.addEventListener(e.name, e.fn);
  return swap;
}


swap.click = function(e, selectors) {
  const link = this;

  if (!link.href || !shouldSwap(buildUrl(link))) return;

  if (!swap.metaKeyOn) {
    e.preventDefault();
    const sels = selectors || getSelectors(link);

    if (link.dataset.swapPane) {
      swap.with(
        buildPaneClickRequest(link.pathname), // we probably need to handle query string use case here
        sels,
        $html.getAttribute(swap.pane.activeAttribute)
          ? nextPane
          : openPane
      );
    } else if (link.dataset.swapInline) {
      swap.inline(link.href, sels);
    } else {
      swap.with(link.href, sels);
    }
  }
}


swap.inline = (options, selectors = []) => {
  const opts = typeof options === 'string'
    ? { url: options, method: 'get' }
    : options;

  talk(opts, (xhr, res, html) => {
    swap.to(html, selectors, true);
  });

  return swap;
}


swap.submit = function(e, selectors) {
  const form = e.target;

  if (!shouldSwap(getUrl(form.action))) return;
  if (!swap.formValidator(e)) return;

  e.preventDefault();
  const sels = selectors || getSelectors(form);
  const req = buildSubmitRequest(form);

  if (form.dataset.swapInline) {
    swap.inline(req, sels);
  } else if ($html.getAttribute(swap.pane.activeAttribute)) {
    swap.with(req, sels, samePane);
  } else {
    swap.with(req, sels);
  }
}


swap.backPane = (e) => {
  swap.paneHistory.pop();
  const url = swap.paneHistory[swap.paneHistory.length - 1];
  // if (previous pane is NOT edited && current pane was saved) {
  // THEN RELOAD PREV PANE
    swap.with(
      buildPaneClickRequest(url),
      swap.pane.selectors,
      prevPane
    );
  // }
}


swap.closePane = () => {
  resetPane();
  pushState(location.href.replace(/#.*$/, ''));
}









const loaded = (e) => {
  if (location.hash) {
    const params = parseQuery(location.hash.substr(1));
    if (params.pane) {
      swap.with(
        buildPaneClickRequest(params.pane),
        swap.pane.selectors,
        openPane
      );
    }
  } else {
    fireElements('on');
    fireRoutes('on', location.href);
  }

  replaceState(location.href);
}


const openPage = ({ method, html, selectors, finalMethod, finalUrl }) => {
  resetPane();
  fireRoutes('off', location.href, method);
  swap.to(html, selectors);
  pushState(finalUrl);
  fireRoutes('on', finalUrl, finalMethod);
}


const popstate = (e) => {
  /*
    - check to if headers determine it should be cached or not
    - if not cached then ajax request
    - if cached then return state
    - check headers on whether to cache or not
  */

  // if (!e.state || location.hash) return;
  if (!e.state) return;

  const { href } = location;
  const { html, selectors } = e.state;

  fireRoutes('off', href);

  const dom = new DOMParser().parseFromString(html, 'text/html');

  swap.to(dom, selectors);

  // getstateofourpanehistoryatthistime

  // this block feels like it should go in swap.to maybe
  const paneIsActive = dom.documentElement.getAttribute(swap.pane.activeAttribute);
  if (paneIsActive) {
    $html.setAttribute(swap.pane.activeAttribute, 'true');
  } else {
    $html.removeAttribute(swap.pane.activeAttribute);
  }

  fireRoutes('on', href);
}






module.exports = function (opts = {}) {
  loader(opts);

  swap.formValidator = opts.formValidator || ((e) => true);

  const paneDefaults = {
    selector: '.Pane',
    selectors: ['.Main -> .PaneContent', '.PaneHeader'],
    closeButton: '.PaneCloseBtn',
    mask: '.PaneMask',
    panels: '.PanesHolder > div',
    activePanelName: 'PaneContent',
    backButton: '.PaneBackBtn',
    activeAttribute: 'swap-pane-is-active',
    open: () => {},
    back: () => {},
    close: () => {}
  };

  swap.pane = {
    ...paneDefaults,
    ...opts.pane
  };

  window.addEventListener('DOMContentLoaded', loaded);
  window.addEventListener('popstate', popstate);

  window.addEventListener('keydown', (e) => {
    if (bypassKeyPressed(e.key)) {
      swap.metaKeyOn = true;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (bypassKeyPressed(e.key)) {
      swap.metaKeyOn = false;
    }
  });

  window.addEventListener('click', delegateHandle('a:not([target="_blank"]):not([data-swap="false"])', swap.click));
  window.addEventListener('submit', delegateHandle('form:not([data-swap="false"])', swap.submit));

  swap.event('click', swap.pane.backButton, swap.backPane);
  swap.event('click', swap.pane.closeButton, swap.closePane);
  swap.event('click', '[swap-pane-is-active]', (e) => {
    if (!e.target.closest(swap.pane.selector)) {
      swap.closePane();
    }
  });
}
