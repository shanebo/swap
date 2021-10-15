import swap from '../../lib/swap.js';

swap.config({
  paneDuration: 300,
  maxAge: .5
});

swap.on('.arrive', (e) => {
  alert('Arrived');
});

swap.off('.leave', (e) => {
  alert('Left');
});

swap.on('/route-on', (e) => {
  alert('On a route');
});

swap.off('/route-off', (e) => {
  alert('Off a route');
});

swap.before('/events', (e) => {
  alert(`Before from: ${e.from.href}, to: ${e.to.href}`);
});

swap.on('/events', (e) => {
  document.querySelector('.content').innerText = `On from: ${e.from ? e.from.href : 'null'}, to: ${e.to.href}`;
});

swap.off('/events', (e) => {
  alert(`Off from: ${e.from.href}, to: ${e.to.href}`);
});

swap.listen();
