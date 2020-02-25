module.exports = (opts) => `
  html {
    --swap-loader-color: ${opts.color || '#5BDF8F'};
  }

  html::before,
  .Pane.is-active::before {
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

  html.swap-is-loading:not(.swap-pane-is-open)::before,
  html.swap-is-loading .Pane.is-active::before {
    animation-timing-function: ease-in-out;
    animation-name: swap-loader;
    animation-duration: 1s;
    animation-iteration-count: infinite;
  }

  @keyframes swap-loader {
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

  .Pane.is-visible {
    transform: translateX(0%);
  }

  .Pane.is-active {
    background-color: #aea;
  }
`.replace(/\s+/g, ' ').trim();
