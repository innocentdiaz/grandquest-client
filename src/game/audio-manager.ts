import Howler from 'howler';

// import sounds
import GoldDropFX from '@/assets/audio/money-drop.mp3';
import XPGainFX from '@/assets/audio/xp-gain.mp3';
import CursorSelectFX from '@/assets/audio/cursor-select.mp3';
import CursorMoveFX from '@/assets/audio/cursor-move.mp3';
import CursorBackFX from '@/assets/audio/cursor-back.mp3';
import FieldsCombatAudio from '@/assets/audio/fields-music1.mp3';
import CombatHitAudio from '@/assets/audio/combat-hit.mp3';
import CombatSuccessAudio from '@/assets/audio/combat-success.mp3';
import CombatFailAudio from '@/assets/audio/combat-fail.mp3';
import EnemyHurtAudio from '@/assets/audio/enemy-hurt.mp3';
import HealAudio from '@/assets/audio/heal.mp3';
import npcBubbleAudio from '@/assets/audio/npc-bubble.mp3';
import AttackMissAudio from '@/assets/audio/attack-miss.mp3';
import JumpAudio from '@/assets/audio/jump.mp3';

interface AudioManager {
  sounds: {
    [soundName: string]: any;
  };
  playOnce: (name: string, stop?: boolean) => void;
  stopAll: () => void;
}

const audioManager: AudioManager = {
  sounds: {
    goldDrop: new Howler.Howl({ src: [ GoldDropFX ] }),
    cursorSelect: new Howler.Howl({ src: [ CursorSelectFX ], volume: 0.65 }),
    cursorMove: new Howler.Howl({ src: [ CursorMoveFX ], volume: 0.65 }),
    cursorBack: new Howler.Howl({ src: [ CursorBackFX ], volume: 0.7 }),
    fieldsCombat: new Howler.Howl({ src: [ FieldsCombatAudio ], volume: 0.5, loop: true }),
    combatHit: new Howler.Howl({ src: [ CombatHitAudio ], volume: 0.6 }),
    combatSuccess: new Howler.Howl({ src: [ CombatSuccessAudio ], volume: 0.6 }),
    combatFail: new Howler.Howl({ src: [ CombatFailAudio ], volume: 0.75 }),
    xpGain: new Howler.Howl({ src: [ XPGainFX ] }),
    enemyHurt: new Howler.Howl({ src: [ EnemyHurtAudio ], volume: 0.4 }),
    heal: new Howler.Howl({ src: [ HealAudio ] }),
    npcBubble: new Howler.Howl({ src: [ npcBubbleAudio ], volume: 0.2 }),
    attackMiss: new Howler.Howl({ src: [ AttackMissAudio ], volume: 0.8 }),
    jump: new Howler.Howl({ src: [ JumpAudio ], volume: 0.8 }),
  },
  playOnce(name, stop) {
    if (!audioManager.sounds.hasOwnProperty(name)) {
      console.error('AudioManager does not know sound: ', name);
    } else {
      const Howl = audioManager.sounds[name];
      if (stop) {
        Howl.stop();
      }
      Howl.play();
    }
  },
  stopAll() {
    for (const name in audioManager.sounds) {
      audioManager.sounds[name].stop();
    }
  },
};

export default audioManager;
