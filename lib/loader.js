// TODO
// add a way to tell swap what element to add the loader on
// for example, when a pane is doing requests, be able to add the loader on the pane
// and when an inline modal or something it could be told where to be put


const css = (opts) => (`
  html {
    --swap-loader-color: ${opts.color || '#5BDF8F'};
  }

  html::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    z-index: 10000;
    transform: translateX(-100%);
    background-color: var(--swap-loader-color);
  }

  html.swap-progressing::before {
    animation-timing-function: ease-in-out;
    animation-name: swapLoader;
    animation-duration: 1s;
    animation-iteration-count: infinite;
  }

  @keyframes swapLoader {
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(100%);
    }
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
