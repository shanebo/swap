import swapConfig from '../../index.js';

swapConfig({
  // clickSelector: 'a:not(.Note a):not([target="_blank"]):not([data-swap="false"])',
  // formSelector: 'form:not([data-swap="false"])',
  color: '#c6000e'
});


swap.on('body', (e) => {
  console.log('fire this on every swap that happens');
});


// // swap.on('')


console.log('hi joe');
