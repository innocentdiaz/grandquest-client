import Howler from 'howler';

// import sounds
import GoldDropFX from '@/assets/audio/money-drop.mp3';
import CursorSelectFX from '@/assets/audio/cursor-select.mp3';
import CursorMoveFX from '@/assets/audio/cursor-move.mp3';
import FieldsCombatAudio from '@/assets/audio/fields-music1.mp3';
import CombatHitAudio from '@/assets/audio/combat-hit.mp3';

let AudioManager: { [sound: string]: any } = {
  sounds: {
    goldDrop: new Howler.Howl({ src: [ GoldDropFX ] }),
    cursorSelect: new Howler.Howl({ src: [ CursorSelectFX ], volume: 0.5 }),
    cursorMove: new Howler.Howl({ src: [ CursorMoveFX ], volume: 0.5 }),
    fieldsCombat: new Howler.Howl({ src: [ FieldsCombatAudio ], volume: 0.5 }),
    combatHit: new Howler.Howl({ src: [ CombatHitAudio ], volume: 0.75 }),
  },
  playOnce(name: string, stop: boolean) {
    if (!AudioManager.sounds.hasOwnProperty(name)) {
      console.error('AudioManager does not know sound: ', name);
    } else {
      let Howl = AudioManager.sounds[name];
      console.log(`now playing ${name} (${Howl.state()})`);
      if (stop) {
        Howl.stop();
      }
      Howl.play();
    }
  },
  stopAll() {
    for (let name in AudioManager.sounds) {
      AudioManager.sounds[name].stop();
    }
  },
}

export default AudioManager;
