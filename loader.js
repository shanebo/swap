const css = (opts) => (`
    html {
      --swap-progress: 0px;
      --swap-progress-color: ${opts.color || '#5BDF8F'};
    }

    html::before {
      content: '';
      position: fixed;
      background-color: var(--swap-progress-color);
      top: 0;
      left: 0;
      width: var(--swap-progress);
      height: 2px;
      z-index: 1000;
      opacity: 0;
      transform: translateZ(1000);
      transition:
        opacity 400ms ease 700ms,
        width 400ms ease 500ms,
        height 400ms ease 500ms;
    }

    html.swap-progressing::before {
      height: 7px;
      opacity: 1;
      transition:
        opacity 0ms ease,
        width 400ms ease,
        height 400ms ease;
    }
  `);


const loader = (opts) => {
  document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css(opts)));
    document.head.appendChild(style);
  });
}


module.exports = function (opts) {
  loader(opts);
}
