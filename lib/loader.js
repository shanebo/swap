// TODO
// add a way to tell swap what element to add the loader on
// for example, when a pane is doing requests, be able to add the loader on the pane
// and when an inline modal or something it could be told where to be put


const css = (opts) => (`
  html {
    --swap-loader-color: ${opts.color || '#5BDF8F'};
  }

  html::before,
  .pane:last-of-type::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    z-index: 10000;
    transform: translateX(-100%);
    background-color: var(--swap-loader-color);
  }

  html.swap-progressing:not(.swap-pane)::before,
  html.swap-progressing .pane:last-of-type::before {
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

  .pane {
    position: fixed;
    top: 0;
    right: 0;
    min-width: 320px;
    height: 100vh;
    transition: transform 300ms ease;
    transform: translateX(100%);
    z-index: 2000;
  }

  .pane.active {
    transform: translateX(0%);
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


module.exports = (opts) => {
  loader(opts);
}
