import swap from './swap.js';


const defaults = () => ({
  expires: 5000,
  link: 'a:not([target="_blank"]):not([data-swap-ignore]):not([data-swap-confirm]):not([formmethod])',
  button: `
    a[formmethod]:not([data-swap-confirm]),
    button[formaction]:not([data-swap-confirm]),
    input[formaction][type="submit"]:not([data-swap-confirm])
  `,
  form: 'form:not([data-swap-ignore])',
  continueTrigger: '[data-swap-continue]',
  repeatTrigger: '[data-swap-repeat]',
  pane: '.Pane',
  paneDuration: 700,
  paneSelectors: ['.Main >> .Pane.is-active .Pane-content'],
  paneCloseBtn: '.Pane-closeBtn, [data-swap-close-pane]',
  paneIsOpen: 'swap-pane-is-open',
  paneForms: '.Pane.is-active form:not([data-swap-ignore])',
  paneTemplate: ({ url }) => `
    <div class="Pane">
      <button class="Pane-closeBtn"></button>
      <a class="Pane-expandBtn" href="${url}"></a>
      <div class="Pane-content"></div>
    </div>
  `,
  confirm: '.Confirm',
  confirmDuration: 700,
  confirmTrigger: '[data-swap-confirm]',
  confirmCancelTrigger: '[data-swap-model-confirm-cancel]',
  confirmOkTrigger: '[data-swap-model-confirm-ok]',
  confirmTemplate: ({ title, cancel, ok }) => `
    <div class="Confirm">
      <h2 class="Confirm-title">${title}</h2>
      <div class="Confirm-actions">
        <button class="Confirm-cancelBtn" data-swap-model-confirm-cancel>${cancel}</button>
        <button class="Confirm-okBtn" data-swap-model-confirm-ok>${ok}</button>
      </div>
    </div>
  `,
  notice: '.Notice',
  css: `
    html.swap-is-loading:not(.swap-pane-is-open)::before,
    html.swap-is-loading .Pane.is-active::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      z-index: 10000;
      transform: translateX(-100%);
      background-color: var(--swap-loader-color, #5BDF8F);
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
      overflow: hidden;
      min-width: 320px;
      height: 100vh;
      transform: translateX(100%);
      z-index: 2000;
    }

    .Pane.is-visible {
      transform: translateX(0%);
    }
  `.replace(/\s+/g, ' ').trim()
});


export default function(options = {}) {
  swap.opts = {
    ...defaults(options),
    ...options
  };
}
