import { GameController } from './places/combat';
import { CombatEvent } from './types';
import AudioManager from '@/game/audio-manager';
import store from '@/store';
import _ from 'underscore';

/*
  Declare types & interfaces
*/

interface Animations {
  attack: {
    [attackId: string]: (event: CombatEvent, gameController: GameController) => Promise<{}>;
  };
  item: {
    [itemId: string]: (event: CombatEvent, gameController: GameController) => Promise<{}>;
  };
  GUI: {
    XP: (amount?: number) => void;
  };
}

interface AnimationsManager {
  gameController: GameController | null;
  animateEvent: (event: CombatEvent) => Promise<{}>;
  animations: Animations;
}

/*
  Set the gameController globally
*/
export const connectAnimations = (_gameController: GameController) => {
  animationsManager.gameController = _gameController;
}

const animations: Animations = {
  attack: {
    'adventurer-swing': (event, gameController) => new Promise((resolve) => {
      if (!gameController.game) {
        return;
      }

      const scene = gameController.game.scene.scenes[0];
  
      let timeline = scene.tweens.createTimeline();
      const character = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.characterId];
      const receiver = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.receiverId];

      const originalPosition = character.sprite.x;
      const atkPosition = receiver.sprite.x - (receiver.sprite.displayWidth * 1.1);

      timeline.add({
        targets: [character.sprite],
        duration: 800,
        x: atkPosition,
        onStart() {
          character.sprite.play(`adventurer-walk`);
          character.sprite.setDepth(15);
        },
      });
      timeline.add({
        targets: [character.sprite],
        duration: 1000,
        x: atkPosition,
        onStart() {
          character.sprite.play('adventurer-swing');
          setTimeout(() => {
            if (!event.outcome.damage) return;

            receiver.sprite.play(`${receiver.entity.name}-hurt`);

            const damagePercentage = (event.outcome.damage / receiver.entity.maxHealth);
            const totalWidth = receiver._nameTag.displayWidth;
            const currentWidth = receiver._healthBar.width;
            const newWidth = currentWidth - (totalWidth * damagePercentage);
            scene.tweens.add({
              targets: receiver._healthBar,
              width: newWidth <= 0 ? 0 : newWidth,
              duration: 220,
            });
            /*
              If the last enemy has been killed
            */
            const aliveEnemies = _.filter(gameController.gameState.enemies, e => e.entity.health > 0);
            if (newWidth <= 0 && !aliveEnemies.length) {
              scene.cameras.main.flash();
              AudioManager.stopAll();
            } else {
              receiver.sprite.play(`${receiver.entity.name}-hurt`);
            }
            AudioManager.playOnce('combatHit');

            // animate XP bar for the current player
            if (store.state.player.id === character.id) {
              animationsManager.animations.GUI.XP(event.outcome.xp);
            }
          }, 585);
        },
      });
      timeline.add({
        targets: [character.sprite],
        duration: 800,
        x: originalPosition,
        onStart() {
          character.sprite.scaleX *= -1;
          character.sprite.play(`adventurer-walk`);
          if (receiver.entity.health) {
            setTimeout(() => {
              receiver.sprite.play(`${receiver.entity.name}-idle`);
            });
          }
        },
        onComplete() {
          character.sprite.scaleX *= -1;
          character.sprite.play(`adventurer-idle`);
          character.sprite.setDepth(10);
          resolve();
        },
      });
      timeline.play();
    }),
    'adventurer-up-swing': (event, gameController) => new Promise((resolve) => {
      if (!gameController.game) {
        return;
      }

      const scene = gameController.game.scene.scenes[0];
  
      let timeline = scene.tweens.createTimeline();
      const character = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.characterId];
      const receiver = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.receiverId];

      const originalPosition = character.sprite.x;
      const atkPosition = receiver.sprite.x - (receiver.sprite.displayWidth * 1.1);

      timeline.add({
        targets: [character.sprite],
        duration: 800,
        x: atkPosition,
        onStart() {
          character.sprite.play(`adventurer-walk`);
          character.sprite.setDepth(15);
        },
      });
      timeline.add({
        targets: [character.sprite],
        duration: 1000,
        x: atkPosition,
        onStart() {
          character.sprite.play('adventurer-up-swing');
          setTimeout(() => {
            if (!event.outcome.damage) return;

            const damagePercentage = (event.outcome.damage / receiver.entity.maxHealth);
            const totalWidth = receiver._nameTag.displayWidth;
            const currentWidth = receiver._healthBar.width;
            const newWidth = currentWidth - (totalWidth * damagePercentage);
            scene.tweens.add({
              targets: receiver._healthBar,
              width: newWidth <= 0 ? 0 : newWidth,
              duration: 180,
            });
            /*
              If the last enemy has been killed
            */
            const aliveEnemies = _.filter(gameController.gameState.enemies, e => e.entity.health > 0);
            if (newWidth <= 0 && !aliveEnemies.length) {
              scene.cameras.main.flash();
              AudioManager.stopAll();
            } else {
              receiver.sprite.play(`${receiver.entity.name}-hurt`);
            }
            AudioManager.playOnce('combatHit');

            // animate XP bar for the current player
            if (store.state.player.id === character.id) {
              animationsManager.animations.GUI.XP(event.outcome.xp);
            }
          }, 580);
        },
      });
      timeline.add({
        targets: [character.sprite],
        duration: 800,
        x: originalPosition,
        onStart() {
          character.sprite.scaleX *= -1;
          character.sprite.play(`adventurer-walk`);

          if (receiver.entity.health) {
            setTimeout(() => {
              receiver.sprite.play(`${receiver.entity.name}-idle`)
            });
          }
        },
        onComplete() {
          character.sprite.scaleX *= -1;
          character.sprite.play(`adventurer-idle`);
          character.sprite.setDepth(10);
          resolve();
        },
      });
      timeline.play();
    }),
    'adventurer-back-swing': (event, gameController) => new Promise((resolve) => {
      if (!gameController.game) {
        return;
      }

      const scene = gameController.game.scene.scenes[0];
  
      let timeline = scene.tweens.createTimeline();
      const character = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.characterId];
      const receiver = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.receiverId];

      const originalPosition = character.sprite.x;
      const atkPosition = receiver.sprite.x - (receiver.sprite.displayWidth * 1.1);

      timeline.add({
        targets: [character.sprite],
        duration: 800,
        x: atkPosition,
        onStart() {
          character.sprite.play('adventurer-walk');
          character.sprite.setDepth(15);
        },
      });
      timeline.add({
        targets: [character.sprite],
        duration: 1000,
        x: atkPosition,
        onStart() {
          character.sprite.play('adventurer-back-swing');
          setTimeout(() => {
            receiver.sprite.play(`${receiver.entity.name}-hurt`);

            if (!event.outcome.damage) return;

            const damagePercentage = (event.outcome.damage / receiver.entity.maxHealth);
            const totalWidth = receiver._nameTag.displayWidth;
            const currentWidth = receiver._healthBar.width;
            const newWidth = currentWidth - (totalWidth * damagePercentage);
            scene.tweens.add({
              targets: receiver._healthBar,
              width: newWidth <= 0 ? 0 : newWidth, // avoid negative health bar
              duration: 150,
            });
            /*
              If the last enemy has been killed
            */
            const aliveEnemies = _.filter(gameController.gameState.enemies, e => e.entity.health > 0);
            if (newWidth <= 0 && !aliveEnemies.length) {
              scene.cameras.main.flash();
              AudioManager.stopAll();
            } else {
              console.log('still have ', !newWidth, ' and ', !aliveEnemies.length);
              receiver.sprite.play(`${receiver.entity.name}-hurt`);
            }
            AudioManager.playOnce('combatHit');

            // animate XP bar for the current player
            if (store.state.player.id === character.id) {
              animationsManager.animations.GUI.XP(event.outcome.xp);
            }
          }, 470);
        },
      });
      timeline.add({
        targets: [character.sprite],
        duration: 800,
        x: originalPosition,
        onStart() {
          character.sprite.scaleX *= -1;
          character.sprite.play('adventurer-walk');
          if (receiver.entity.health) {
            setTimeout(() => {
              receiver.sprite.play(`${receiver.entity.name}-idle`);
            });
          }
        },
        onComplete() {
          character.sprite.scaleX *= -1;
          character.sprite.play(`adventurer-idle`);
          character.sprite.setDepth(10);
          resolve();
        },
      });
      timeline.play();
    }),
    'slime-bite': (event, gameController) => new Promise((resolve) => {
      if (!gameController.game) {
        return;
      }

      const scene = gameController.game.scene.scenes[0];
  
      let timeline = scene.tweens.createTimeline();
      const character = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.characterId];
      const receiver = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.receiverId];

      const originalPosition = character.sprite.x;
      const atkPosition = receiver.sprite.x + (receiver.sprite.displayWidth * 1.1);

      // crawl to receiver
      timeline.add({
        targets: [character.sprite],
        duration: 1250,
        x: atkPosition,
        onStart() {
          character.sprite.setDepth(15);
          character.sprite.play(`slime-idle`);
        },
      });
      // slime bite!
      timeline.add({
        targets: [character.sprite],
        duration: 1200,
        x: atkPosition,
        onStart() {
          character.sprite.play('slime-bite');
          setTimeout(() => {
            if (!event.outcome.damage) return;

            const damagePercentage = event.outcome.damage / receiver.entity.maxHealth;
            const totalWidth = receiver._nameTag.displayWidth;
            const currentWidth = receiver._healthBar.width;
            const newWidth = currentWidth - (totalWidth * damagePercentage);
            scene.tweens.add({
              targets: receiver._healthBar,
              width: newWidth <= 0 ? 0 : newWidth >= totalWidth ? totalWidth : newWidth,
              duration: 250,
            });
            
            receiver.sprite.play(`${receiver.entity.name}-hurt`);
            /*
              If the last enemy has been killed
            */
            const alivePlayers = _.filter(gameController.gameState.players, e => e.entity.health > 0);
            if (newWidth <= 0 && !alivePlayers.length) {
              AudioManager.stopAll();
            } else {
              receiver.sprite.play(`${receiver.entity.name}-hurt`);
            }
            AudioManager.playOnce('combatHit');
          }, 200);
        },
      });
      // walk back to original position
      timeline.add({
        targets: [character.sprite],
        duration: 1250,
        x: originalPosition,
        onStart() {
          character.sprite.scaleX *= -1;
          character.sprite.play(`slime-idle`);
          setTimeout(() => receiver.sprite.play(`${receiver.entity.name}-idle`), 100);
        },
        onComplete() {
          character.sprite.scaleX *= -1;
          character.sprite.play(`slime-idle`);
          character.sprite.setDepth(10);
          resolve();
        },
      });
      timeline.play();
    }),
  },
  item: {
    'heal-potion': (event, gameController) => new Promise((resolve) => {
      if (!gameController.game) {
        return;
      }

      const scene = gameController.game.scene.scenes[0];
  
      let timeline = scene.tweens.createTimeline();
      const character = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.characterId];
      const receiver = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.receiverId];
  
      let itemImg = scene.add.image(character.sprite.x, character.sprite.y, `item-${event.action.id}`);

      itemImg.setDepth(character.sprite.depth + 1);
      timeline.add({
        targets: itemImg,
        y: character.sprite.y,
        duration: 250,
        onStart() {
          // update sprite health bar
          if (!event.outcome.heal) return;

          const healPercentage = (event.outcome.heal / receiver.entity.maxHealth);
          const totalWidth = receiver._nameTag.displayWidth;
          const currentWidth = receiver._healthBar.width;
          const newWidth = currentWidth + (totalWidth * healPercentage);
          scene.tweens.add({
            targets: receiver._healthBar,
            width: newWidth >= totalWidth ? totalWidth : newWidth,
            duration: 250,
          });
        },
      });
      timeline.add({
        targets: itemImg,
        y: character.sprite.y - 50,
        alpha: { value: 0, duration: 500 },
        ease: 'Power1',
        duration: 500,
        onComplete() {
          itemImg.destroy();
          resolve();
        },
      });
      timeline.play();
    }),
  },
  GUI: {
    XP: (amount) => {
      const gameController = animationsManager.gameController;
      if (!gameController || !gameController.game) {
        return console.warn('Attempted to animate GUI.XP but gameController OR game have not been initialized yet');
      }
      if (!store.state.player.id) {
        return;
      }
      const currentPlayer = gameController.gameState.players[store.state.player.id];
      if (!currentPlayer) {
        return;
      }
      let XP = currentPlayer.xp;
      let level = currentPlayer.level;
      const max = level === 1
        ? 55
        : level === 2
        ? 175
        : 0;
      // elements
      const barElement = document.querySelector('.level .bar');
      const barJuiceElement = document.getElementById('xp-juice');
      const barLabelElement = document.getElementById('xp-label');
      const levelLabelElement = document.getElementById('level-label');
      
      if (!barElement || !barJuiceElement || !barLabelElement || !levelLabelElement) {
        return;
      }

      barLabelElement.innerHTML = `${XP}/${max} xp`;

      if (!amount) {
        levelLabelElement.innerHTML = String(level);
        barJuiceElement.style.width = `${(XP/max) * 100}%`;
        return;
      }
      let barWidth = Number((barJuiceElement.clientWidth / (barElement.clientWidth - 2)).toFixed(2));
      const lvlShown = Number(levelLabelElement.innerHTML);
      const shownXP = barWidth*max;

      // maths
      const totalXP = shownXP+amount;
      const leveled = Math.floor(totalXP/max); // 0
      const remainder = totalXP%max;
      let j = leveled-lvlShown > 0 ? leveled-lvlShown : 0;

      let i = 0;
      const interval = setInterval(() => {
        barWidth = Number((barJuiceElement.clientWidth / (barElement.clientWidth - 2)).toFixed(2));
        let newWidth = 0;
        barJuiceElement.setAttribute('class', '');
        // if we animated the parents to 100% last animation
        if (barWidth >= 1) {
          barWidth = 0;
          barJuiceElement.style.width = '0%';
          level++;
          levelLabelElement.innerHTML = String(level);
        }
        if (i < j) {
          newWidth = 1;
        }
        // animate last increase
        else if (i === j) {
          newWidth = (remainder/max) + barWidth;
        }
        // all animations are complete
        else {
          if (i === 1) {
            barJuiceElement.style.width = `${remainder/max*100}%`;
          }
          return clearInterval(interval);
        }
        barJuiceElement.setAttribute('class', 'animated');
        barJuiceElement.style.width = `${newWidth*100}%`;
        i++;
      }, 300);
    },
  },
};

const animationsManager: AnimationsManager = {
  gameController: null,
  animations,
  animateEvent: (event: CombatEvent) => new Promise((resolve, error) => {
    if (!animationsManager.gameController || !animationsManager.gameController.game) {
      return error('Attempted to run an animation but the game instance has not yet been binded OR the game has not been started');
    }

    // find the animation
    let selectedAnimation = event.action.type === 'attack'
     ? animations.attack[event.action.id]
     : event.action.type === 'item'
     ? animations.item[event.action.id]
     : null;

    if (!selectedAnimation) {
      return error('Attempted to play an animation that is not registered: ' + event.action.id);
    }

    // play the animation
    selectedAnimation(event, animationsManager.gameController)
      .then(resolve)
      .catch(error);
  }),
}

export default animationsManager;
