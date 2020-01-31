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
