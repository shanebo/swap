import swap from './swap.js';


const keyUp = (e) => {
  if (e.key === 'Escape') {
    swap.closePane();
  }
}


export {
  keyUp
};
