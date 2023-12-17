# Swap

Turn your links and forms into dynamic ajax requests which can swap specific returned html elements with your dom all while updating your browser history. This enables you to write dumb HTML websites but with the feel of single page app performance.

Swap provides:

- HTML directives for common interactions
- Route and element listeners for before/off/on requests
- Direct methods for more complex JS needs
- Event delegation
- Browser history management


## Example
`<a href="/foo" data-swap=".test">Foo</a>`


## Directives
HTML attributes that unlock swap features.


### Pages
`data-swap="<selectors>"`

This will open the link but swap elements given your selectors. This will result in you being at the url the link specified. For full page swaps with no selector swapping no directive on links or forms needed.


### Fragments
`data-swap-inline="<optional selectors>"`

This will swap elements given your selectors but not change your url. This is good for loading up things like popovers.


### Panes
`data-swap-pane="<optional selectors>"`

This will open the link in a pane and update your url with the pane's url at the `#pane=<url>`.

Open links in a pane interaction via `[data-swap-pane]`. Great for quick nested interactions like opening an account quickly without losing the page you're on. Panes which contain pane links will open new panes on top of the pane you're on and manage the history in the url.

`<a href="/accounts/1234" data-swap-pane>Account #1234</a>`


### Confirmations
Before running the link, form, or formbutton, the `data-swap-confirm` directive will trigger a confirm modal. If user clicks the `[data-swap-confirm-ok]` button the element will run.

```
swap.setConfirmation('deleteLayer', {
  title: "Delete this layer?",
  cancel: "Cancel",
  ok: "Yes, delete"
});
```

`<button data-swap-confirm="deleteLayer" formaction="/layers/123/delete" formmethod="post">Delete Layer</button>`


## Event Delegation
```
swap.event(name, selector, fn);
swap.event('resize', fn);
swap.event('click', '.btn', fn);
```

<!--
swap.on('mouseover', '.btn', fn);
swap.off('mouseover', '.btn', fn);

swap.on(name, selector, fn);
swap.off(name, selector, fn);
swap.emit(name);

swap.on('click', '.btn', fn);
swap.off('click', '.btn', fn);

swap.add('click', '.btn', fn);
swap.remove('click', '.btn', fn);
swap.emit('click', '.btn', arg1, arg2, arg3);

swap.delegate('.btn').off('click', fn);

swap[event](type, fn);
swap[when](type, [scope], fn);
swap[event](type)[when](fn);
-->


## Route / Element Listeners
How will you know when you're on a route or when an element is on the page you're on if swap is all ajax based? Listeners!

routes
- every route fires when it matches
- every route fires off when page state change

elements
- has checks run on every page transition
- not fires if it was on previous page

swap.before(route || selector, fn);
swap.on(route || selector, fn);
swap.off(route || selector, fn);

swap.from('/foo').to('/joe')
  .off(fn)
  .before(fn)
  .on(fn);

### Event

before
{
  to: the first url
  from: where you're at, ignoring method type
}

off
{
  to: the first url
  from: where you're at, ignoring method type
}

on
{
  to: the redirected to url (if applicable), otherwise the first url
  from: where you're at, ignoring method type
}


## Methods

If you need to write some custom interactions, you can call on the swap methods directly in JS.

swap.click -> with / pane
swap.inline -> with
swap.submit -> with
swap.with(opts, selectors); // ajax
swap.to(html, selectors);

Swap provides route and element listeners `before`, `off`, and `on` fnd requests.

before = the event that fires before the ajax request is sent
ajax = gets new state in html
off = after the new html is in hand but before the swap happens
on is after the swapping has updated the page to the latest state
fire (off/on/before) should only fire route things when ajax is used
elements should fire (off/on/before) when ajax or render is used
pane use case = all the ajax workflow but a different swapping function (which fns popstate and swapping differently)
