/*
TRIGGERS
- click
- submit

AJAX
this runs ajax from the options the user either manually calls, or that the click or submit methods build
- with

with could call
- off
- before
- on


EVENTS (for elements and routes)
- off
- before
- on
*/


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


swap.off('/from').on('/to', fn);

swap.from('/foo').to('/joe').off(fn);

swap.from('/foo').to('/joe')
    .off(fn)
    .before(fn)
    .on(fn);

swap.when('/foo', '/joe').off(fn);
swap.when('/foo', '/joe').on(fn);
swap.when('/foo', '/joe').before(fn);

swap.when(fn).off();

swap.from('/foo').on('/joe', fn);
swap.from('/foo').before('/joe', fn);
swap.to('/joe').off('/foo', fn);

swap.on('/joe', fn).from('/foo');
swap.before('/joe', fn).from('/foo');
swap.off('/foo', fn).to('/joe');

swap
  .on('/uno', uno)
  .on('/dos', dos)
  .on('/tres', tres)
  .on('/quatro', quatro)
  .off('/tres', tres);


/*
- before and on use whatever triggered the change method wise
- off uses whatever the current location is (regardless of method)
- before and on get fired on the the first url, not on redirects
*/


swap.on('/tasks/:id/move', (e) => {

});

swap.on({
  method: 'post',
  route: '/tasks/:id/move'
}, (e) => {

});


routes
- every route fires when it matches
- every route fires off when page state change

components
- has checks run on every page transition
- not fires if it was on previous page



app.before(route, fn);
app.on(route, fn);
app.off(route, fn);

app.before(selector, fn);
app.on(selector, fn);
app.off(selector, fn);

app.event(name, selector, fn);
// app.off(name, selector, fn);



app.on(name, selector, fn);
app.off(name, selector, fn);
app.emit(name, selector, fn);

app.before(route, fn);
app.on(route, fn);
app.off(route, fn);
app.emit(route);

app.before(selector, fn);
app.on(selector, fn);
app.off(selector, fn);


app.get('/foo', middleware);
app.use('/foo', middleware);
app.use(handle);
app.use('/foo', handle, handle);
app.get('/foo', handle, handle);
app.use('/foo', handle, handle);
app.use('*', handle, handle);
app.all('/foo', handle, handle);
app.use(handle, handle);
app.get('/foo', handle);







app.click('.ApjNav a', fn);


app.on('click', '.ApjNav a', fn);
app.on('.ApjNav', fn);

app.on('/ask-pastor-john', fn);
app.on('.ApjNav', fn);

app.on('route', '/ask-pastor-john', fn);
app.on('route', '.ApjNav', fn);

app.on(name, selector, fn);
app.off(name, selector, fn);

app.before('route', route, fn);
app.on('route', route, fn);
app.off('route', route, fn);

app.before('element', selector, fn);
app.on('element', selector, fn);
app.off('element', selector, fn);

app.event('resize', fn);
app.event('click', '.btn', fn);


swap.on('*', () => {
  let timeout = 0;
  swap.event('input', '.ApjSearchInput', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const value = e.target.value;
      const url = `${location.origin + location.pathname}?q=${value}`;
      swap.with(url, ['.ApjResources']);
    }, 10);
  });
});


app.globalEvent('input', '.ApjSearchInput', (e) => {

});


swap.has('.ApjSearchInput', () => {
  let timeout = 0;
  swap.event('input', '.ApjSearchInput', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const value = e.target.value;
      const url = `${location.origin + location.pathname}?q=${value}`;
      swap.with(url, ['.ApjResources']);
    }, 10);
  });
});

const scroll = (e) => 'doin something';

app.on('.btn', (e) => {
  btn.addEventListener('scroll', scroll);
});

app.off('.btn', (e) => {
  btn.removeEventListener('scroll', scroll);
});

app.on('/foo', (e) => {
  btn.addEventListener('scroll', scroll);
  window.addEventListener('resize', resize);
});

app.off('/foo', (e) => {
  btn.removeEventListener('scroll', scroll);
});

app.on('/foo', (e) => {
  btn.addEventListener('scroll', scroll);
  app.event('resize', resize);
});







/////////////////


swap.off('/from').on('/to', fn);


swap.from('/foo').to('/joe').off(fn);

swap.from('/foo').to('/joe')
  .off(fn)
  .before(fn)
  .on(fn);


swap.when('/foo', '/joe').off(fn);
swap.when('/foo', '/joe').on(fn);
swap.when('/foo', '/joe').before(fn);

swap.when(fn).off();


swap.from('/foo').on('/joe', fn);
swap.from('/foo').before('/joe', fn);
swap.to('/joe').off('/foo', fn);


swap.on('/joe', fn).from('/foo');
swap.before('/joe', fn).from('/foo');
swap.off('/foo', fn).to('/joe');




swap
  .on('/uno', uno)
  .on('/dos', dos)
  .on('/tres', tres)
  .on('/quatro', quatro)
  .off('/tres', tres);

swap.from('')




// First arg is the event
app.on('.btn', handle);
app.on('/foo', handle);
app.on('atelunch', handle);
app.on('click', '.btn', handle);
app.on('click(.btn)', handle);
app.emit('atelunch', arg1, arg2, arg3);
app.off('.btn', handle);
app.off('/foo', handle);
app.off('atelunch', handle);
app.off('click', '.btn', handle);
app.off('click(.btn)', handle);



// Joe's ideal
app.on('has', '.btn', handle);
app.on('matches', '/foo', handle);
app.on('click', '.btn', handle);
app.on('atelunch', handle);
app.off('element', '.btn', handle);
app.off('route', '/foo', handle);
app.off('click', '.btn', handle);
app.off('atelunch', handle);




app.on('element(.btn)', handle);
app.on('route(/foo/:id/project/:projectId)', handle);
app.on('click(.btn)', handle);
app.on('atelunch', handle);
app.off('element(.btn)', handle);
app.off('route(/foo/:id/project/:projectId)', handle);
app.off('click(.btn)', handle);
app.off('atelunch', handle);
app.emit('atelunch', arg1, arg2, arg3);





// Event delegation
app.on('click', '.btn', handle);
app.off('click', '.btn', handle);
app.emit('click', '.btn', arg1, arg2, arg3);


app[event](type, handle);
app[when](type, [scope], handle);
app[event](type)[when](handle);

app.on(route).atPage(handle);
app.on(selector).atPage(handle);



// elements
app.has('.btn').beforeRoute(handle);
app.has('.btn').onRoute(handle);
app.has('.btn').offRoute(handle);

app.has('.btn').before(handle);
app.has('.btn').on(handle);
app.has('.btn').off(handle);

app.has('.btn').before(handle);
app.has('.btn').at(handle);
app.has('.btn').out(handle);

app.has('.btn').loading(handle);
app.has('.btn').loaded(handle);
app.has('.btn').unloading(handle);

app.has('.btn').loading(handle);
app.has('.btn').loaded(handle);

app.has('.btn').loading(handle);
app.has('.btn').arrived(handle);
app.has('.btn').leaving(handle);





app.has('.btn').before(handle);
app.has('.btn').on(handle);
app.has('.btn').off(handle);

app.route('/foo/:id').before(handle);
app.route('/foo/:id').on(handle);
app.route('/foo/:id').off(handle);


app.on('click', '.btn', handle);
app.off('click', '.btn', handle);
app.emit('click', '.btn', arg1, arg2);
app.on('atepizza', handle);
app.off('atepizza', handle);







app.route('/foo/:id').before(handle);
app.route('/foo/:id').at(handle);
app.route('/foo/:id').from(handle);

app.has('.btn').before(handle);
app.has('.btn').at(handle);
app.has('.btn').from(handle);

app.route('/foo/:id').to(handle);
app.route('/foo/:id').at(handle);
app.route('/foo/:id').from(handle);

app.on('click', '.btn', handle);
app.off('click', '.btn', handle);
app.emit('click', '.btn', arg1, arg2);
app.on('atepizza', handle);
app.off('atepizza', handle);






app.has('.btn').to(handle);
app.has('.btn').at(handle);
app.has('.btn').from(handle);

app.to('/foo/:id', handle);
app.at('/foo/:id', handle);
app.from('/foo/:id', handle);


app.matches('/foo/:id').to(handle);
app.matches('/foo/:id').at(handle);
app.matches('/foo/:id').from(handle);

app.matches('/foo/:id', 'on', handle);
app.matches({
  route: '/foo/:id',
  when: 'on',
  handle: handle
});



app.on('mouseover').for('.btn').do(handle);
app.on('mouseover', '.btn', handle);
app.off('mouseover', '.btn', handle);
app.on('pizza', '.btn', handle);


app.has('.btn').toPage(handle);
app.has('.btn').atPage(handle);
app.has('.btn').fromPage(handle);

app.matches('/foo/:id').toPage(handle);
app.matches('/foo/:id').atPage(handle);
app.matches('/foo/:id').fromPage(handle);


app.has('.btn').before(handle);
app.has('.btn').on(handle);
app.has('.btn').off(handle);

app.remove('route', when, route, handle);

app.matches('/foo/:id').before(handle);
app.matches('/foo/:id').on(handle);
app.matches('/foo/:id').off(handle);


app.to('.btn', handle);

app.to('/foo', handle);
app.at('/foo', handle);
app.from('/foo', handle);

app.on('click', '.btn', handle);
app.off('click', '.btn', handle);
app.emit('click', '.btn', arg1, arg2);
app.on('atepizza', handle);
app.off('atepizza', handle);



app.on('at', '.btn', handle);
app.on('at', '/foo', handle);
app.off('at', '/foo', handle);




app.matches('/foo/:id').before(handle);
app.matches('/foo/:id').on(handle);
app.matches('/foo/:id').off(handle);

app.route('/foo/:id').before(handle);
app.route('/foo/:id').at(handle);
app.route('/foo/:id').after(handle);

app.event('atepizza').on(handle);
app.event('click').for('.btn', handle);


qs(document).on('click', '.btn', handle);
qs(document).off('click', '.btn', handle);

qsa(document).forEach(item => item.on('click', handle));
qsa(document).off('click', '.btn', handle);


app.route.before('.btn', handle);
app.route.on('.btn', handle);
app.route.off('.btn', handle);

app.route.before('/foo/:id', handle);
app.route.on('/foo/:id', handle);
app.route.off('/foo', handle);




page.before('.btn', handle);
page.on('.btn', handle);
page.off('.btn', handle);

page.before('/foo', handle);
page.on('/foo', handle);
page.off('/foo', handle);

page.before('/foo', handle);
page.on('/foo', handle);
page.off('/foo', handle);

// app.has('.btn').in(handle);
// app.has('.btn').on(handle);
// app.has('.btn').out(handle);

app.has('.btn')
  .in(handle)
  .at(handle)
  .out(handle);

app.has('.btn')
  .before(handle)
  .on(handle)
  .off(handle);

app.has('.btn')
  .beforeRoute(handle)
  .onRoute(handle)
  .offRoute(handle);

// routes
app.route('/foo/:id')
  .before(handle)
  .on(handle)
  .off(handle);

app.for('.btn').on('click', handle);
app.for('.btn').off('click', handle);
app.for('.btn').emit(arg1, arg2, arg3);

app.on('atepizza', handle);
app.off('atepizza', handle);
app.emit('atepizza', arg1, arg2);




// API to load a url programmatically
app.to('/foo/57').swap(selectors);
app.to('/foo/57', selectors);

// event delegation
app.add('click', '.btn', handle);
app.remove('click', '.btn', handle);
app.emit('click', '.btn', arg1, arg2, arg3);

app.on('click', '.btn', handle);
app.for('.btn').on('click', handle);
app.delegate('.btn').off('click', handle);
app.emit('click', '.btn', arg1, arg2, arg3);

app.on('click', '.btn', handle);
app.off('click', '.btn', handle);
app.emit('click', '.btn', arg1, arg2, arg3);



app.for('.btn').on('click', handle);
app.for('.btn').off('click', handle);

app.for('.btn').click(handle);
app.for('.btn').unclick(handle);
app.for('.btn').remove('click', handle);



app.click('.btn', handle);
app.remove('click', '.btn', handle);

// $('.btn').on('click', handle);
// $(document).on('click', '.btn', handle);
app.off('click', '.btn', handle);








app.pageIs('/foo/:id').on(handle);
app.pageIs('/foo/:id').off(handle);
app.pageHas('.btn').on(handle);
app.pageHas('.btn').off(handle);

app.url('/foo/:id').on(handle);
app.url('/foo/:id').off(handle);
app.url('.btn').on(handle);
app.url('.btn').off(handle);

app.route('/foo/:id').on(handle);
app.route('/foo/:id').off(handle);
app.route('.btn').on(handle);
app.route('.btn').off(handle);

app.element('.btn').on(handle);
app.element('.btn').off(handle);

app.click('.btn').on(handle);
app.click('.btn').off(handle);




// routes
// - every route fires when it matches
// - every route fires off when page state change

// components
// - has checks run on every page transition
// - not fires if it was on previous page





// app.event('resize', fn);
// app.event('click', '.btn', fn);


// swap.on('*', () => {
//   let timeout = 0;
//   swap.event('input', '.ApjSearchInput', (e) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       const value = e.target.value;
//       const url = `${location.origin + location.pathname}?q=${value}`;
//       swap.with(url, ['.ApjResources']);
//     }, 10);
//   });
// });


// app.globalEvent('input', '.ApjSearchInput', (e) => {

// });


// swap.has('.ApjSearchInput', () => {
//   let timeout = 0;
//   swap.event('input', '.ApjSearchInput', (e) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       const value = e.target.value;
//       const url = `${location.origin + location.pathname}?q=${value}`;
//       swap.with(url, ['.ApjResources']);
//     }, 10);
//   });
// });

// const scroll = (e) => 'doin something';

// app.on('.btn', (e) => {
//   btn.addEventListener('scroll', scroll);
// });

// app.off('.btn', (e) => {
//   btn.removeEventListener('scroll', scroll);
// });

// app.on('/foo', (e) => {
//   btn.addEventListener('scroll', scroll);
//   window.addEventListener('resize', resize);
// });

// app.off('/foo', (e) => {
//   btn.removeEventListener('scroll', scroll);
// });

// app.on('/foo', (e) => {
//   btn.addEventListener('scroll', scroll);
//   app.event('resize', resize);
// });
