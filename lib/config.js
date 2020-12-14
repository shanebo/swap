import swap from './swap.js';


const defaults = ({ paneClass, color }) => ({
  link: 'a:not([target="_blank"]):not([data-swap-ignore]):not([data-swap-confirm])',
  button: `
    a[formmethod]:not([data-swap-confirm]),
    button[formaction]:not([data-swap-confirm]),
    input[formaction][type="submit"]:not([data-swap-confirm])
  `,
  form: 'form:not([data-swap-ignore])',
  formValidator: ((e) => true),
  notice: '.Notice',
  pane: '.Pane',
  paneActive: '.Pane.is-active',
  paneCloseBtn: '.Pane-closeBtn, [data-swap-close-pane]',
  paneIsOpen: 'swap-pane-is-open',
  paneDefaultEl: '.Main',
  paneDefaultRenderType: '>>',
  paneContinue: '[data-swap-pane-continue]',
  paneDuration: 700,
  sessionExpiration: 5000,
  confirm: '.Confirm',
  confirmTrigger: 'button[data-swap-confirm], a[data-swap-confirm]',
  confirmTemplate: `
    <div class="Confirm light-mode">
      <h2 class="c2 bold" data-swap-model-confirm-title></h2>
      <div class="Confirm-actions">
        <button
          data-swap-model-confirm-cancel
          class="Button Button--subtle Button--radius Button--medium"
          >
        </button>

        <button
          data-swap-model-confirm-ok
          class="Button Button--danger Button--radius Button--medium"
          >
        </button>
      </div>
    </div>
  `,
  paneForms: '.Pane.is-active form:not([data-swap-ignore])',
  paneContent: '.Pane.is-active .Pane-content',
  paneTemplate: `
    <div class="Pane ${paneClass}">
      <button class="Pane-closeBtn"></button>
      <a class="Pane-expandBtn"></a>
      <div class="Pane-content"></div>
    </div>
  `,
  paneSelectors: [`.Main >> .Pane.is-active .Pane-content`],
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
      background-color: ${color || '#5BDF8F'};
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
