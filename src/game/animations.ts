import Phaser from 'phaser';
import { GameController } from './places/combat';
import { CombatEvent, CombatCharacter } from './types';
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
  misc: {
    XP :(event: CombatEvent) => void;
    damageText: (event: CombatEvent) => void;
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
      const character = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.character.id];
      const receiver = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.receiver.id];

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
            const damagePercentage = (event.outcome.damage / receiver.entity.maxHealth);
            const totalWidth = receiver._nameTag.displayWidth;
            const currentWidth = receiver._healthBar.width;
            const newWidth = currentWidth - (totalWidth * damagePercentage);
            scene.tweens.add({
              targets: receiver._healthBar,
              width: Math.max(newWidth, 0),
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
              if (event.outcome.damage === 0) {
                AudioManager.playOnce('attackMiss');
              } else {
                AudioManager.playOnce('combatHit');
                receiver.sprite.play(`${receiver.entity.name}-hurt`);
                AudioManager.playOnce(`enemyHurt`);
              }
            }

            // damage text
            animationsManager.animations.misc.damageText(event);

            // animate XP bar for the current user
            if (store.state.user.id === character.id && event.outcome.xp) {
              animationsManager.animations.GUI.XP(event.outcome.xp);
              animationsManager.animations.misc.XP(event);
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
      const character = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.character.id];
      const receiver = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.receiver.id];

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
            const damagePercentage = (event.outcome.damage / receiver.entity.maxHealth);
            const totalWidth = receiver._nameTag.displayWidth;
            const currentWidth = receiver._healthBar.width;
            const newWidth = currentWidth - (totalWidth * damagePercentage);
            scene.tweens.add({
              targets: receiver._healthBar,
              width: Math.max(newWidth, 0),
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
              if (event.outcome.damage === 0) {
                AudioManager.playOnce('attackMiss');
              } else {
                AudioManager.playOnce('combatHit');
                receiver.sprite.play(`${receiver.entity.name}-hurt`);
                AudioManager.playOnce(`enemyHurt`);
              }
            }

            // damage text
            animationsManager.animations.misc.damageText(event);

            // animate XP bar for the current user
            if (store.state.user.id === character.id && event.outcome.xp) {
              animationsManager.animations.GUI.XP(event.outcome.xp);
              animationsManager.animations.misc.XP(event);
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
      const character = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.character.id];
      const receiver = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.receiver.id];

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
            const damagePercentage = (event.outcome.damage / receiver.entity.maxHealth);
            const totalWidth = receiver._nameTag.displayWidth;
            const currentWidth = receiver._healthBar.width;
            const newWidth = currentWidth - (totalWidth * damagePercentage);
            scene.tweens.add({
              targets: receiver._healthBar,
              width: Math.max(newWidth, 0),
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
              if (event.outcome.damage === 0) {
                AudioManager.playOnce('attackMiss');
              } else {
                AudioManager.playOnce('combatHit');
                receiver.sprite.play(`${receiver.entity.name}-hurt`);
                AudioManager.playOnce(`enemyHurt`);
              }
            }

            // damage text
            animationsManager.animations.misc.damageText(event);

            // animate XP bar for the current user
            if (store.state.user.id === character.id && event.outcome.xp) {
              animationsManager.animations.GUI.XP(event.outcome.xp);
              animationsManager.animations.misc.XP(event);
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
      const character = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.character.id];
      const receiver = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.receiver.id];

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
            const damagePercentage = event.outcome.damage / receiver.entity.maxHealth;
            const totalWidth = receiver._nameTag.displayWidth;
            const currentWidth = receiver._healthBar.width;
            const newWidth = currentWidth - (totalWidth * damagePercentage);
            scene.tweens.add({
              targets: receiver._healthBar,
              width: Math.max(newWidth, 0),
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
              if (event.outcome.damage === 0) {
                AudioManager.playOnce('attackMiss');
              } else {
                AudioManager.playOnce('combatHit');
              }
            }

            // damage text
            animationsManager.animations.misc.damageText(event);
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
    'mountain-warrior-slash': (event, gameController) => new Promise((resolve) => {
      if (!gameController.game) {
        return;
      }

      const scene = gameController.game.scene.scenes[0];
  
      let timeline = scene.tweens.createTimeline();

      const character = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.character.id];
      const receiver = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.receiver.id];

      const originalPosition = character.sprite.x;
      const atkPosition = receiver.sprite.x + (receiver.sprite.displayWidth * 1.1);

      // jump to receiver
      timeline.add({
        targets: [character.sprite],
        duration: 480,
        x: atkPosition,
        onStart() {
          character.sprite.setDepth(15);
          AudioManager.playOnce('jump');
          character.sprite.play('mountain-warrior-jump');
        },
      });
      // warrior slash
      timeline.add({
        targets: [character.sprite],
        duration: 1200,
        x: atkPosition,
        onStart() {
          character.sprite.play('mountain-warrior-slash');
          setTimeout(() => {
            const damagePercentage = event.outcome.damage / receiver.entity.maxHealth;
            const totalWidth = receiver._nameTag.displayWidth;
            const currentWidth = receiver._healthBar.width;
            const newWidth = currentWidth - (totalWidth * damagePercentage);
            scene.tweens.add({
              targets: receiver._healthBar,
              width: Math.max(newWidth, 0),
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
              if (event.outcome.damage === 0) {
                AudioManager.playOnce('attackMiss');
              } else {
                AudioManager.playOnce('combatHit');
              }
            }

            // damage text
            animationsManager.animations.misc.damageText(event);
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
          character.sprite.play(`mountain-warrior-walk`);
          setTimeout(() => receiver.sprite.play(`${receiver.entity.name}-idle`), 100);
        },
        onComplete() {
          character.sprite.scaleX *= -1;
          character.sprite.play(`mountain-warrior-idle`);
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
      const character = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.character.id];
      const receiver = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.receiver.id];
  
      let potionImg = scene.add.image(character.sprite.x, character.sprite.y, `item-${event.action.id}`);

      potionImg.setDepth(character.sprite.depth + 1);

      timeline.add({
        targets: potionImg,
        y: character.sprite.y,
        duration: 250,
        onStart() {
          const healPercentage = (event.outcome.heal / receiver.entity.maxHealth);
          const totalWidth = receiver._nameTag.displayWidth;
          const currentWidth = receiver._healthBar.width;
          const newWidth = currentWidth + (totalWidth * healPercentage);
          scene.tweens.add({
            targets: receiver._healthBar,
            width: Math.min(newWidth, totalWidth),
            duration: 250,
            onStart() {
              AudioManager.playOnce('heal');
            }
          });

          // animate healing text
          const healText = scene.add.text(
            receiver.sprite.x,
            receiver.sprite.y + receiver.sprite.displayHeight,
            `+${event.outcome.heal}`,
            {
              fontSize: '20px',
              color: '#56f33e',
              textAlign: 'center',
            },
          )
          .setOrigin(0.5, 1)
          .setAlpha(0)
          .setDepth(15);
          scene.tweens.add({
            targets: healText,
            y: receiver.sprite.y - receiver.sprite.displayHeight,
            alpha: 1,
            duration: 250,
            onComplete() {
              setTimeout(() => {
                scene.tweens.add({
                  targets: healText,
                  y: healText.y - 30,
                  alpha: 0,
                  duration: 700,
                  onComplete() {
                    healText.destroy();
                  },
                });
              }, 1500);
            }
          });
        },
      });
      timeline.add({
        targets: potionImg,
        y: character.sprite.y - 50,
        alpha: { value: 0, duration: 500 },
        ease: 'Power1',
        duration: 700,
        onComplete() {
          potionImg.destroy();
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
      if (!store.state.user.id) {
        return;
      }
      const currentPlayer = store.state.user;

      if (!currentPlayer) {
        return;
      }
      let XP = currentPlayer.xp;
      let level = currentPlayer.level;
      // elements
      const barElement = document.querySelector('.level .bar');
      const barJuiceElement = document.getElementById('xp-juice');
      const barLabelElement = document.getElementById('xp-label');
      const levelLabelElement = document.getElementById('level-label');
      
      if (!barElement || !barJuiceElement || !barLabelElement || !levelLabelElement) {
        return;
      }

      barLabelElement.innerHTML = `${XP}/${currentPlayer.nextLevelXp} xp`;

      if (!amount) {
        levelLabelElement.innerHTML = String(level);
        barJuiceElement.style.width = `${(XP * 100)/(currentPlayer.nextLevelXp * 100) * 100}%`;
        return;
      }
      let barWidth = (barJuiceElement.clientWidth * 100) / (barElement.clientWidth * 100);
      const lvlShown = Number(levelLabelElement.innerHTML);
      const shownXP = barWidth * currentPlayer.nextLevelXp;

      // maths
      const totalXP = shownXP + amount;
      const leveled = Math.floor(totalXP / currentPlayer.nextLevelXp); // 0
      const newXp = totalXP % currentPlayer.nextLevelXp;
      let j = Math.max(leveled - lvlShown, 0);

      let i = 0;
      const interval = setInterval(() => {
        barWidth = (barJuiceElement.clientWidth * 100) / (barElement.clientWidth * 100);
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
          newWidth = (totalXP * 100) / (currentPlayer.nextLevelXp * 100);
        }
        // all animations are complete
        else {
          if (i === 1) {
            barJuiceElement.style.width = `${newXp / currentPlayer.nextLevelXp * 100}%`;
          }
          return clearInterval(interval);
        }
        barJuiceElement.setAttribute('class', 'animated');
        barJuiceElement.style.width = `${newWidth * 100}%`;
        i++;
      }, 300);
    },
  },
  misc: {
    XP: (event) => {
      if (!animationsManager.gameController || !animationsManager.gameController.game) {
        return;
      }
      const { gameController } = animationsManager;
      const scene = animationsManager.gameController.game.scene.scenes[0];

      const character = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.character.id];
      const receiver = {...gameController.gameState.players, ...gameController.gameState.enemies}[event.receiver.id];

      const particles = scene.add.particles('xp-orb').setDepth(15);
      const emitter = particles.createEmitter({
        scale: 0.75,
        timeScale: 2.75,
        moveToX: character.sprite.x,
        moveToY: character.sprite.y - 10,
        x: receiver.sprite.x,
        y: receiver.sprite.y,
        emitZone:{ source: new Phaser.Geom.Circle(0,0,50), type :"random" },
      });
      scene.time.delayedCall(200, () => {
          emitter.stop();
          AudioManager.playOnce('xpGain');
          scene.time.delayedCall(500, () => {
              particles.destroy();
          });
      });
    },
    damageText: (event) => {
      const { gameController } = animationsManager;
      if (!gameController || !gameController.game) {
        return;
      }
      const scene = gameController.game.scene.scenes[0];

      /*
        2.5x - 3x = critical
        1.8x - 2.5x = strong
        0.8x - 1.8x = ok
        0.1x - 0.8x = weak
        0 = miss
      */
      const characters = { ...gameController.gameState.players, ...gameController.gameState.enemies };

      const character = characters[event.character.id];
      const receiver = characters[event.receiver.id];

      const outcomeDamage = event.outcome.damage;

      const baseDamage = ((character.level / 12) + 1) * (character.power / receiver.defense) * event.outcome.attackBase;
      console.log(`${outcomeDamage} <= ${character.level / 12 + 1} * ${character.power / receiver.defense} * ${event.outcome.attackBase}`);
      let text = '';
      if (outcomeDamage === 0) {
        text = 'MISS!';
      } else if (outcomeDamage <= baseDamage * 0.8) {
        text = `${outcomeDamage}...`;
      } else if (outcomeDamage <= 1.8) {
        text = `${outcomeDamage}`;
      } else if (outcomeDamage <= baseDamage * 2.8) {
        text = `-${outcomeDamage}!`;
      } else {
        text = `CRITICAL!! -${outcomeDamage}`;
        scene.cameras.main.shake();
      }

      const damageText = scene.add.text(
        receiver.sprite.x,
        receiver.sprite.y + receiver.sprite.displayHeight,
        text,
        {
          fontSize: '20px',
          color: '#d30938',
          textAlign: 'center',
        },
      )
      .setOrigin(0.5, 1)
      .setAlpha(0)
      .setDepth(15);
      scene.tweens.add({
        targets: damageText,
        y: receiver.sprite.y - receiver.sprite.displayHeight,
        alpha: 1,
        duration: 250,
        onComplete() {
          setTimeout(() => {
            scene.tweens.add({
              targets: damageText,
              y: damageText.y - 30,
              alpha: 0,
              duration: 700,
              onComplete() {
                damageText.destroy();
              },
            });
          }, 2000);
        }
      });
    },
  }
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
