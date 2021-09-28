import swap from './swap.js';


const bypassKeyPressed = (key) => ['Alt', 'Control', 'Meta'].includes(key);


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
