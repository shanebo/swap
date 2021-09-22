import swap from './swap.js';
import { bypassKeyPressed } from './utils.js';


const keyDown = (e) => {
  if (bypassKeyPressed(e.key)) {
    swap.metaKeyOn = true;
  }
}


const keyUp = (e) => {
  if (e.key === 'Escape') {
    swap.closePane();
  } else if (bypassKeyPressed(e.key)) {
    swap.metaKeyOn = false;
  }
}


export {
  keyDown,
  keyUp
};
