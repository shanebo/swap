module.exports = (opts) => `
  html {
    --swap-loader-color: ${opts.color || '#5BDF8F'};
  }

  html::before,
  .Pane:last-of-type::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    z-index: 10000;
    transform: translateX(-100%);
    background-color: var(--swap-loader-color);
  }

  html.swap-loading:not(.swap-pane)::before,
  html.swap-loading .Pane:last-of-type::before {
    animation-timing-function: ease-in-out;
    animation-name: swapLoader;
    animation-duration: 1s;
    animation-iteration-count: infinite;
  }

  @keyframes swapLoader {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(0%); }
    100% { transform: translateX(100%); }
  }

  .Pane {
    position: fixed;
    top: 0;
    right: 0;
    overflow-x: hidden;
    overflow-y: scroll;
    min-width: 320px;
    height: 100vh;
    transform: translateX(100%);
    z-index: 2000;
  }

  .Pane.active {
    transform: translateX(0%);
  }
`.replace(/\s+/g, ' ').trim();
