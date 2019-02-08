import Howler from 'howler';

// import sounds
import GoldDropFX from '@/assets/audio/money-drop.mp3';
import CursorSelectFX from '@/assets/audio/cursor-select.mp3';
import CursorMoveFX from '@/assets/audio/cursor-move.mp3';

let AudioManager: { [sound: string]: any } = {
  sounds: {
    goldDrop: GoldDropFX,
    cursorSelect: CursorSelectFX,
    cursorMove: CursorMoveFX,
  },
  playOnce(name: string) {
    if (!AudioManager.sounds.hasOwnProperty(name)) {
      console.error('AudioManager does not know sound: ', name);
    } else {
      new Howler.Howl({ 
        src: [ AudioManager.sounds[name] ],
        autoplay: true
      });
    }
  },
}

export default AudioManager;
