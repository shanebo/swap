const morph = require('nanomorph');


window.ix = {};
ix.instances = {};
ix.components = {};
ix.register = function(name, options) {
  ix.components[name] = (el) => {
    options.el = el;
    ix.component(options).render();
  }
}

ix.component = ({ el, data, template, methods }) => {
  el = typeof el === 'string'
    ? document.querySelector(el)
    : el;

  let renderDelay = 0;
  const id = uuid();

  el.dataset.ixComponentId = id;

  data = { ...data };
  data = new Proxy(data, {
    set: function(obj, prop, value) {
      obj[prop] = value;
      clearTimeout(renderDelay);
      renderDelay = setTimeout(render, 1);
    },
    deleteProperty: function (oTarget, sKey) {
      if (sKey in oTarget) { return false; }
      return oTarget.removeItem(sKey);
    },
    // defineProperty: function (oTarget, sKey, oDesc) {
    //   if (oDesc && 'value' in oDesc) { oTarget.setItem(sKey, oDesc.value); }
    //   return oTarget;
    // },
  });


  ix.instances[id] = {
    el,
    data,
    template,
    methods,
    render
  };

  function render() {
    console.log('render');
    const str = typeof template === 'function'
      ? template(data)
      : template;

    const klone = el.cloneNode();
    klone.innerHTML = str;
    morph(el, klone);
  }

  return ix.instances[id];
};



// click directive
document.documentElement.addEventListener('click', (e) => {
  const { ixClick } = e.target.dataset;

  if (ixClick) {
    const { ixComponentId } = e.target.closest('[data-ix-component-id]').dataset;
    const comp = ix.instances[ixComponentId];
    comp.methods[ixClick].call(comp, e);
  }
});


// init component directive
document.addEventListener('DOMContentLoaded', function(){
  [...document.querySelectorAll('[data-swap-component]')].forEach(el => {
    const { swapComponent } = el.dataset;
    ix.components[swapComponent](el);
  });
});


function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }).slice(0, 8);
}
