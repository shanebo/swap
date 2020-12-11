module.exports = function (opts = {}) {
  swap.opts = opts;
  swap.qs = {};
  swap.qs.link = 'a:not([target="_blank"]):not([data-swap-ignore]):not([data-swap-confirm])';
  swap.qs.button = `
    a[formmethod]:not([data-swap-confirm]),
    button[formaction]:not([data-swap-confirm]),
    input[formaction][type="submit"]:not([data-swap-confirm])
  `;
  swap.qs.form = 'form:not([data-swap-ignore])';
  swap.qs.notice = '.Notice';
  swap.qs.confirmTrigger = 'button[data-swap-confirm], a[data-swap-confirm]';
  swap.qs.confirm = '.Confirm';
  swap.qs.pane = '.Pane';
  swap.qs.paneActive = '.Pane.is-active';
  swap.qs.paneForms = `${swap.qs.paneActive} ${swap.qs.form}`;
  swap.qs.paneContent = `${swap.qs.paneActive} .Pane-content`;
  swap.qs.paneCloseBtn = '.Pane-closeBtn, [data-swap-close-pane]';
  swap.qs.paneIsOpen = 'swap-pane-is-open';
  swap.qs.paneDefaultEl = opts.paneDefaultEl || '.Main';
  swap.qs.paneDefaultRenderType = '>>';
  swap.qs.paneContinue = '[data-swap-pane-continue]';

  swap.paneTemplate = `
    <div class="Pane ${opts.paneClass || ''}">
      <button class="Pane-closeBtn"></button>
      <a class="Pane-expandBtn"></a>
      <div class="Pane-content"></div>
    </div>
  `;
  swap.paneDuration = opts.paneDuration || 700;
  swap.paneSelectors = [`${swap.qs.paneDefaultEl} ${swap.qs.paneDefaultRenderType} ${swap.qs.paneContent}`];
  swap.formValidator = opts.formValidator || ((e) => true);
  swap.sessionExpiration = opts.sessionExpiration || 5000;

  swap.confirmTemplate = `
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
  `;
}
