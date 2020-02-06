const buildPaneClickRequest = (url) => ({
  url,
  method: 'get',
  headers: {
    'x-requested-with': 'xmlhttprequest',
    'pane-url': swap.paneUrl
  }
});

const buildSubmitRequest = (form) => ({
  url: form.action,
  method: form.method,
  body: new URLSearchParams(new FormData(form)).toString(),
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    ...swap.paneUrl && { 'pane-url': swap.paneUrl }
  }
});


export {
  buildSubmitRequest,
  buildPaneClickRequest
};
