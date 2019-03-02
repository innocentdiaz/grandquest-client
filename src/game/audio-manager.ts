import Howler from 'howler';

// import sounds
import GoldDropFX from '@/assets/audio/money-drop.mp3';
import CursorSelectFX from '@/assets/audio/cursor-select.mp3';
import CursorMoveFX from '@/assets/audio/cursor-move.mp3';
import FieldsCombatAudio from '@/assets/audio/fields-music1.mp3';
import CombatHitAudio from '@/assets/audio/combat-hit.mp3';
import CombatSuccessAudio from '@/assets/audio/combat-success.mp3';
import CombatFailAudio from '@/assets/audio/combat-fail.mp3';

interface AudioManager {
  sounds: {
    [soundName: string]: any;
  };
  playOnce: (name: string, stop?: boolean) => void;
  stopAll: () => void;
}

let audioManager: AudioManager = {
  sounds: {
    goldDrop: new Howler.Howl({ src: [ GoldDropFX ] }),
    cursorSelect: new Howler.Howl({ src: [ CursorSelectFX ], volume: 0.65 }),
    cursorMove: new Howler.Howl({ src: [ CursorMoveFX ], volume: 0.65 }),
    fieldsCombat: new Howler.Howl({ src: [ FieldsCombatAudio ], volume: 0.5, loop: true }),
    combatHit: new Howler.Howl({ src: [ CombatHitAudio ], volume: 0.6 }),
    combatSuccess: new Howler.Howl({ src: [ CombatSuccessAudio ], volume: 0.6 }),
    combatFail: new Howler.Howl({ src: [ CombatFailAudio ], volume: 0.6 }),
  },
  playOnce(name, stop) {
    if (!audioManager.sounds.hasOwnProperty(name)) {
      console.error('AudioManager does not know sound: ', name);
    } else {
      let Howl = audioManager.sounds[name];
      if (stop) {
        Howl.stop();
      }
      Howl.play();
    }
  },
  stopAll() {
    for (let name in audioManager.sounds) {
      audioManager.sounds[name].stop();
    }
  },
}

export default audioManager;
