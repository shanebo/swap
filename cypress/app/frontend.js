import swapConfig from '../../index.js';

swapConfig({
  // clickSelector: 'a:not(.Note a):not([target="_blank"]):not([data-swap="false"])',
  // formSelector: 'form:not([data-swap="false"])',
  color: '#c6000e'
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
  alert(`On from: ${e.from.href}, to: ${e.to.href}`);
});

swap.off('/events', (e) => {
  alert(`Off from: ${e.from.href}, to: ${e.to.href}`);
});
