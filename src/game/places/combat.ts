/*
  TODO:
  - Add icons for selection status
  - Add potions
  - Work on level scenery
  - Add music
  - Fix bug on game destruction/mounting
  - Optimize game loop updating
  - Add window.on resize events
  - Add low framerate setting
*/

import Phaser from 'phaser';
import { Howl } from 'howler';
import _ from 'underscore';
import store from '@/store';

/*
  Import types
*/
import { CombatRoom } from '@/types';
import { Character, CombatEvent } from '@/game/types';

/*
  Import images
*/
import countryPlatformImage from '@/assets/img/landscapes/country/platform.png';
import countryTreesImage from '@/assets/img/landscapes/country/trees.png';
import countryMountainsImage from '@/assets/img/landscapes/country/mountains.png';
import countryCloudsImage from '@/assets/img/landscapes/country/clouds.png';
import AdventurerSheet from '@/assets/img/spritesheets/adventurer-sheet.png';
import SlimeSheet from '@/assets/img/spritesheets/slime-sheet.png';
import SelectHandImage from '@/assets/img/icon/select-hand.png';

/*
  Import audio
*/
import cursorMoveSrc from '@/assets/audio/cursor-move.mp3';
import cursorSelectSrc from '@/assets/audio/cursor-select.mp3';

/*
  Import data
*/
import Entities from '@/game/data/characters';

/*
  Declare definitions
*/
type PhaserGame = any;
type GameInstance = any;

interface GiActions {
  [actionName: string]: any,
}

/*
  newGame method:
  Return a new Phaser.Game that makes use of a `global` game interface.
  This method is called by the GameInterface object (GameInterface.launch())
*/
const newGame = (global: GameInterface): PhaserGame => {
  /*
    GameInterface.Game
  */
  let game: any = new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth * .98,
    height: window.innerHeight * .75,
    backgroundColor: '#7fb8f9',
    parent: 'combat',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
      }
    },
    scene: {
      preload: function() {
        let canvasParent = document.getElementById('combat');
        if (!canvasParent) {
          throw new Error('Phaser.js expected a parent element for the canvas, but at time of creating got none');
        }
      },
      /*
        Game.create();
        Responsibe for loading assets asynchronously
        and adding animation for sprites
      */
      create() {
        console.log('game create');
        let self: GameInstance = this;
        /*
          Bind gameInterface.actions to `self`
        */
        _.each(actions, (func: any, action: string) => {
          actions[action] = func.bind(self);
        });
        /*
          Bind entity generators to `self`
        */
        for(const id in Entities) {
          Entities[id] = Entities[id].bind(self);
        }
        // Load images asyncronously
        let assetsLoaded = 0;
        _.each([
          { name: 'select-hand', src: SelectHandImage, type: 'image' },
          { name: 'country-platform', src: countryPlatformImage, type: 'image' },
          { name: 'country-trees-bg', src: countryTreesImage, type: 'image' },
          { name: 'country-mountains-bg', src: countryMountainsImage, type: 'image' },
          { name: 'country-clouds-bg', src: countryCloudsImage, type: 'image' },
          { name: 'adventurer', src: AdventurerSheet, type: 'spritesheet', spriteDimensions: [ 50, 37 ] },
          { name: 'slime', src: SlimeSheet, type: 'spritesheet', spriteDimensions: [32, 25] }
        ], (a, i, l) => {
          const { name, src, type, spriteDimensions } = a;

          const img = new Image();
          img.src = src;

          // method to add texture `onload` according to type
          const method = type === 'image'
          ? () => {
              self.textures.addImage(name, img);
            }
          : type === 'spritesheet' && spriteDimensions
          ? () => {
              self.textures.addSpriteSheet(
                name,
                img,
                { frameWidth: spriteDimensions[0], frameHeight: spriteDimensions[1] }
              );
            }
          : () => {};

          // image onload event
          img.onload = () => {
            method(); // add texture according to type
            assetsLoaded++;

            // IF all assets have loaded
            if (assetsLoaded === l.length) {
              /*
                Add animations
              */
              self.anims.create({
                key: 'adventurer-idle',
                frames: self.anims.generateFrameNumbers('adventurer', { start: 0, end: 3 }),
                frameRate: 3,
                repeat: -1,
              });
              self.anims.create({
                key: 'adventurer-walk',
                frames: self.anims.generateFrameNumbers('adventurer', { start: 8, end: 14 }),
                frameRate: 10,
                repeat: -1,
              });
              self.anims.create({
                key: 'adventurer-swing',
                frames: self.anims.generateFrameNumbers('adventurer', { frames:[38, 39, 40, 41, 42, 43, 47, 48, 49, 50, 51, 52] }),
                frameRate: 12,
                repeat: 0,
              });
              self.anims.create({
                key: 'adventurer-up-swing',
                frames: self.anims.generateFrameNumbers('adventurer', { start: 38, end: 49 }),
                frameRate: 11,
                repeat: 0,
              });
              self.anims.create({
                key: 'adventurer-back-swing',
                frames: self.anims.generateFrameNumbers('adventurer', { start: 53, end: 59 }),
                frameRate: 8,
                repeat: 0,
              });
              self.anims.create({
                key: 'adventurer-spin-swing',
                frames: self.anims.generateFrameNumbers('adventurer', { start: 45, end: 59 }),
                frameRate: 16,
                repeat: 0,
              });
              self.anims.create({
                key: 'slime-idle',
                frames: self.anims.generateFrameNumbers('slime', { start: 0, end: 7 }),
                frameRate: 7,
                repeat: -1,
              });
              self.anims.create({
                key: 'slime-hurt',
                frames: self.anims.generateFrameNumbers('slime', { start: 12, end: 16 }),
                frameRate: 6,
                repeat: 0,
              });

              actions.startGame();
            }
          };
        });
      },
      update() {
        let self: GameInstance = this;
        if (!global.gameInitialized) {
          return;
        }

        // Cloud animation
        if (global.gameClouds) {
          global.gameClouds.tilePositionX += 0.072;
        }

        const networkGameState = store.state.combatGame.gameState;

        /*
          CHARACTER UPDATING
        */

        // Despawn Characters
        let charactersOnLocal = {...global.gameState.players, ...global.gameState.enemies};
        _.forEach(charactersOnLocal, ({ id }) => {
          const characterOnNetwork = networkGameState.enemies.hasOwnProperty(id) || networkGameState.players.hasOwnProperty(id);
          if (!characterOnNetwork) {
            actions.despawnCharacter(id);
          }
        });

        // Spawn & Update Characters
        _.forEach({...networkGameState.players, ...networkGameState.enemies}, (characterOnNetwork) => {
          let category = characterOnNetwork.enemy
            ? global.gameState.enemies
            : global.gameState.players;
          let characterOnLocal = category[characterOnNetwork.id];

          // spawn player if not yet added locally
          if (characterOnLocal) {
            category = {
              ...category,
              [characterOnNetwork.id]: {...characterOnLocal, ...characterOnNetwork},
            }
          } else {
            characterOnLocal = actions.spawnCharacter(characterOnNetwork);
          }
          /*
            Graphics updating
          */
          // name tag
          if(!characterOnLocal._nameTag) {
            characterOnLocal._nameTag = self.add.text(
              0, 0,
              characterOnLocal.username,
              {
                fontSize: '17px',
                fill: '#fff',
                backgroundColor: '#0008',
                align: 'center',
              },
            )
            .setOrigin(0.5, 0)
            .setDepth(characterOnLocal.sprite.depth);
          }
          characterOnLocal._nameTag.x = characterOnLocal.sprite.x;
          characterOnLocal._nameTag.y = characterOnLocal.sprite.y - (characterOnLocal.sprite.height * 1.25);

          // health bar background
          if (!characterOnLocal._healthBarBackground) {
            characterOnLocal._healthBarBackground = self
            .add.rectangle(0, 0, 0, 0, 0xBEBEBE)
            .setDepth(characterOnLocal.sprite.depth)
            .setOrigin(0, 0);
          }
          characterOnLocal._healthBarBackground.setSize(characterOnLocal._nameTag.width, 9);
          characterOnLocal._healthBarBackground.x = characterOnLocal._nameTag.x - (characterOnLocal._nameTag.width / 2);
          characterOnLocal._healthBarBackground.y = characterOnLocal._nameTag.y + characterOnLocal._nameTag.height;

          // health bar
          if (!characterOnLocal._healthBar) {
            const width = characterOnLocal.entity.health / characterOnLocal.entity.maxHealth * (characterOnLocal._nameTag.displayWidth);

            characterOnLocal._healthBar = self
            .add.rectangle(0, 0, width, 0, 0x56F33E)
            .setDepth(characterOnLocal.sprite.depth + 1)
            .setOrigin(0, 0);
          } else if (!global.isAnimating) {
            const width = characterOnLocal.entity.health / characterOnLocal.entity.maxHealth * (characterOnLocal._nameTag.displayWidth);
            characterOnLocal._healthBar.setSize(width, 10);
          }
          characterOnLocal._healthBar.x = characterOnLocal._nameTag.x - (characterOnLocal._nameTag.width / 2);
          characterOnLocal._healthBar.y = characterOnLocal._nameTag.y + characterOnLocal._nameTag.height;

          // health text
          if (!characterOnLocal._healthText) {
            characterOnLocal._healthText = self.add.text(
              0, 0, '',
              {
                fontSize: '8px',
                fill: '#fff',
                backgroundColor: '#0000',
                align: 'center',
                baselineY: 0.5,
              },
            )
            .setOrigin(0.5, 0.5)
            .setDepth(characterOnLocal._healthBar.depth + 1);
          }
          let currentDisplayedHealth = Math.round(characterOnLocal.entity.maxHealth * (characterOnLocal._healthBar.width/characterOnLocal._nameTag.displayWidth));
          characterOnLocal._healthText.text = `${currentDisplayedHealth}/${characterOnLocal.entity.maxHealth}`;
          characterOnLocal._healthText.x = characterOnLocal._healthBarBackground.getCenter().x;
          characterOnLocal._healthText.y = characterOnLocal._healthBarBackground.getCenter().y;
        });

        /*
          UPDATE SELECTION HAND
        */
        // only while selecting a target
        if (store.state.combatGame.selectionMode === 'TARGET') {
          // if there are players
          if (Object.keys(global.gameState.players).length) {
            if (!global.targetHand) { // if there are players and there is no target hand
              actions.addTargetHand();
            } else {
              // update selection hand coordinates
              const placingLine = global.currentTargetSide === 0
              ? global.playerPlacingLine
              : global.enemyPlacingLine;

              const { character } = placingLine[global.currentTargetIndex];

              if (character) {
                global.targetHand.x = character.sprite.x;
                global.targetHand.y = character.sprite.y;
              }
            }
          } else if (global.targetHand) { // there are no players but there is a target hand
            actions.removeTargetHand();
          }
        }

        /*
          EVENTS UPDATING
        */

        // IF the network is at a different turn
        if (global.gameState.turn !== networkGameState.turn && !global.isAnimating) {
          // IF we have NOT just joined the match
          if (global.gameState.turn !== -1) {
            let appliedEvents = networkGameState.turnEvents[global.gameState.turn];
            actions.animateEvents(appliedEvents);
          }

          global.gameState.turn = networkGameState.turn;
        }
      },
    },
  });

  /*
    GameInterface.Actions
  */
  const actions: GiActions = {
    startGame() {
      let self: GameInstance = this;
      console.log('game started');

      // make background;
      actions.addBackground();

      // add events
      document.addEventListener('keydown', (event) => {
        if (Date.now() - self.cursorMoveDate <= 100) {
          return;
        }
        self.cursorMoveDate = Date.now();

        if (store.state.combatGame.selectionMode === 'TARGET') {
          switch (event.key.toUpperCase()) {
            case 'W':
              actions.moveCursor('up');
              break;
            case 'A':
              actions.moveCursor('left');
              break;
            case 'S':
              actions.moveCursor('down');
              break;
            case 'D':
              actions.moveCursor('right');
              break;
            case 'ENTER':
              cursorSelectAudio.play();
              store.commit('SET_COMBAT_GAME_SELECTION_MODE', 'ACTION');
              break;
          }
        }
      });

      global.gameInitialized = true;
    },
    moveCursor(direction: string) {
      let indexDirection = null;
      let side = null;

      switch (direction.toLowerCase()) {
        case 'up':
          indexDirection = 'up';
          break;
        case 'down':
          indexDirection = 'down';
          break;
        case 'left':
          side = 0;
          break;
        case 'right':
          side = 1;
          break;
        default:
          return;
      }

      if (indexDirection) {
        let j: any = global.currentTargetIndex;

        const placingLine = global.currentTargetSide == 0
          ? global.playerPlacingLine
          : global.enemyPlacingLine;

        for (const key in placingLine) {
          let position = placingLine[j];

          if (!position) {
            j = _.findKey({...placingLine}, (p: PlacingLineSpot) => !!p.character);
            if (!j) {
              console.warn('Empty placing line ');
              return actions.removeTargetHand();
            }
            position = placingLine[j];
          }

          if (!direction || direction == 'down') {
            j = position.nextIndex;
          } else if (direction == 'up') {
            j = position.prevIndex;
          }

          const nextPosition = placingLine[j];
          if (nextPosition.character) {
            global.currentTargetIndex = j;
            break;
          }
        }
      } else if (typeof side === 'number') {
        if (side === global.currentTargetSide) {
          return;
        }
        // HERE WE USE IT FOR THE SIDE WE WANT TO MOVE OUR CURSOR TO
        const newPlacingLine = side == 0
        ? global.playerPlacingLine
        : global.enemyPlacingLine;

        const newIndex: any = _.findKey({...newPlacingLine}, (p: PlacingLineSpot) => !!p.character);

        if (newIndex) {
          global.currentTargetSide = side;
          global.currentTargetIndex = newIndex;
        }
      } else {
        return;
      }

      cursorMoveAudio.play();
    },
    addBackground() {
      let self: any = this;
      /*
        Handy dimensions
      */
      const canvasWidth = self.game.canvas.offsetWidth;
      const canvasHeight = self.game.canvas.offsetHeight;

      /*
        Country background
      */
      const imagePixelHeight = 210;
      const exponential = canvasHeight / imagePixelHeight;

      // add each image in order
      _.each([
        'country-mountains-bg',
        'country-clouds-bg',
        'country-trees-bg',
        'country-platform',
      ], (name, i) => {
        // clouds are parallax
        const img =
          self.add.tileSprite(0, 0, canvasWidth, canvasHeight, name)
          // z-axis
          .setDepth(i)
          // pixelHeight of each image in tileset
          .setScale(exponential)
          .setOrigin(0);
        if (name === 'country-clouds-bg') {
          // set them to the game instance
          global.gameClouds = img
        } else if (name === 'country-mountains-bg') {
          img.setScale(exponential * .7);
        }
      });
    },
    spawnCharacter(character: Character): Character {
      let self: GameInstance = this;

      let { entity } = character;

      let selectedEntityGenerator = Entities[entity.name];
      if (!selectedEntityGenerator) {
        console.error('Attempted to spawn unknown entity ', entity.name);
      }

      // place them in our game state
      let placingLine = character.enemy
        ? global.enemyPlacingLine
        : global.playerPlacingLine;

      // find empty spot in line
      let emptySpotInLine: any = _.findKey({...placingLine}, (spot: PlacingLineSpot) => !spot.character);

      if (!emptySpotInLine) {
        throw new Error('Attempted to spawn character but there are not empty spaces in the placing line');
      }

      const canvasWidth = self.game.canvas.offsetWidth;
      const canvasHeight = self.game.canvas.offsetHeight;

      let coordinatesForEntity = character.enemy
        ? {
            x: canvasWidth * (0.6 + (0.08 * emptySpotInLine)),
            y: canvasHeight * ((0.9 - (0.02 * Object.keys(placingLine).length)) + (0.02 * emptySpotInLine)),
          }
        : {
            x: canvasWidth * (0.25 - (0.08 * emptySpotInLine)),
            y: canvasHeight * ((0.9 - (0.02 * Object.keys(placingLine).length)) + (0.02 * emptySpotInLine)),
          };

      const cat = character.enemy
          ? 'enemies'
          : 'players';
      const p = character.enemy
          ? 'enemyPlacingLine'
          : 'playerPlacingLine';
      global.gameState[cat] = {
        ...global.gameState[cat],
        [character.id]: selectedEntityGenerator(character, coordinatesForEntity),
      };

      // reference the spawned player in their placing line
      global[p] = {
        ...global[p],
        [emptySpotInLine]: {
          ...global[p][emptySpotInLine],
          character: global.gameState[cat][character.id],
        },
      };

      return global.gameState[cat][character.id];
    },
    despawnCharacter(id: string) {
      let character: Character | undefined = global.gameState.players[id] || global.gameState.enemies[id];

      if (!character) {
        return console.error('Attempted to despawn a character that does not exist in the game state');
      }

      let gameStateCategory = character.enemy
        ? global.gameState.enemies
        : global.gameState.players;
      let p = character.enemy
        ? global.enemyPlacingLine
        : global.playerPlacingLine;

      delete gameStateCategory[id];

      _.forEach(['sprite', '_nameTag', '_healthBar', '_healthBarBackground', '_healthText'], (graphic) => {
        if (character.hasOwnProperty(graphic)) {
          character[graphic].destroy();
        }
      });
    },
    addTargetHand() {
      let self: GameInstance = this;

      if (global.targetHand) {
        return console.warn('target hand already added')
      };

      let spot: PlacingLineSpot|undefined = _.find({...global.playerPlacingLine}, (index: PlacingLineSpot) => !!index.character);

      if (!spot || !spot.character) {
        console.error('No player to add target hand to');
        return
      }

      const { character } = spot;

      global.targetHand =
        self.add.image(character.sprite.x, character.sprite.y, 'select-hand')
        .setDepth(11); // z-coordinate above the player
    },
    removeTargetHand() {
      if (!global.targetHand) {
        return console.warn('attempted to remove target hand which does not exist');
      }
      global.targetHand.destroy()
      global.targetHand = null;
    },
    moveTargetHandTo(settings: { index: number, side: number }) {
      const { index, side } = settings;

      const placingLine = side === 0
        ? global.playerPlacingLine
        : global.enemyPlacingLine;

      const character = placingLine[index].character;

      if(!character) {
        throw new Error('No characters at index ' + index);
      }

      if (!global.targetHand) {
        throw new Error('No target hand in game interface');
      }

      global.targetHand.x = character.sprite.x - character.sprite.width
      global.targetHand.y = character.sprite.y
    },
    animateEvents(events: [], i = 0) {
      global.isAnimating = true;
      const event = events[i];
      const next = events[i + 1];

      actions.animateEvent(event).then(() => {
        if (!!next) {
          actions.animateEvents(events, i + 1);
        } else {
          global.isAnimating = false;
        }
      });
    },
    animateEvent(event: CombatEvent) {
      let self: GameInstance = this;

      return new Promise((ok) => {
        let timeline = self.tweens.createTimeline();
        const character = {...global.gameState.players, ...global.gameState.enemies}[event.characterId];
        const receiver = {...global.gameState.players, ...global.gameState.enemies}[event.receiverId];

        // attack animation
        const originalPosition = character.sprite.x;
        const atkPosition = character.enemy
          ? character.sprite.x - (self.game.canvas.offsetWidth * 0.1)
          : character.sprite.x + (self.game.canvas.offsetWidth * 0.1);

        if (character && receiver) {
          /*
            Parallel anims:
            - Timeline anims
            - Sprite anims
          */

          timeline.add({ // move closer to enemy
            targets: [character.sprite],
            duration: 800,
            x: atkPosition,
            onStart() {
              character.sprite.play(`${character.entity.name}-walk`);
            },
          });
          timeline.add({ // stay there shortly
            targets: [character.sprite],
            duration: 1000,
            x: atkPosition,
            onStart() {
              character.sprite.play(event.action.id);
              receiver.sprite.play(`${receiver.entity.name}-hurt`);
              // update sprite health bar
              const damagePercentage = (event.outcome.damage / receiver.entity.maxHealth);
              const totalWidth = receiver._nameTag.displayWidth;
              const currentWidth = receiver._healthBar.width;

              self.tweens.add({
                targets: receiver._healthBar,
                width: currentWidth - (totalWidth * damagePercentage),
                duration: 250,
              });
            },
          });
          timeline.add({ // walk back
            targets: [character.sprite],
            duration: 800,
            x: originalPosition,
            onStart() {
              character.sprite.scaleX *= -1;
              character.sprite.play(`${character.entity.name}-walk`);
              setTimeout(() => receiver.sprite.play(`${receiver.entity.name}-idle`));
            },
            onComplete() {
              character.sprite.scaleX *= -1;
              character.sprite.play(`${character.entity.name}-idle`);
              ok();
            },
          });

          timeline.play();
        }
      });
    }
  };

  return game;
}
export interface GameInterface {
  gameState: CombatRoom;
  gameInitialized: boolean;
  currentTargetSide: number;
  currentTargetIndex: number;
  gameClouds: any;
  targetHand: any;
  isAnimating: boolean;
  playerPlacingLine: PlacingLine;
  enemyPlacingLine:  PlacingLine;
  launch: () => void;
  destroyGame: () => void;
};
interface PlacingLine {
  [index: string]: PlacingLineSpot;
}
interface PlacingLineSpot {
  character: Character|null;
  nextIndex: number;
  prevIndex: number;
}

const cursorMoveAudio = new Howl({
  src: [ cursorMoveSrc ],
});
const cursorSelectAudio = new Howl({
  src: [ cursorSelectSrc ],
});
/*
  Launch function
  Will return a GameInterface.Global object
*/
function CombatInterface(): GameInterface {
  let game: any = null;
  /*
    GameInterface.Global
  */
  let global: GameInterface = {
    // state from the server
    gameState: {
      id: '',
      title: '',
      players: {},
      enemies: {},
      playerCount: 0,
      maxPlayers: 4,
      turn: -1,
      level: 0,
      turnEvents: {},
    },
    // called startGame();
    gameInitialized: false,
    currentTargetSide: 0,
    currentTargetIndex: 1,
    gameClouds: null,
    targetHand: null,
    isAnimating: false,
    // this will be generated using the game state with `gameInterface.actions.startGame()
    playerPlacingLine: _.reduce(_.range(1, 5), (memo, index) => ({
      ...memo,
      [index]: {
        character: null,
        nextIndex: index >= store.state.combatGame.gameState.maxPlayers ? 1 : index + 1,
        prevIndex: index === 1 ? store.state.combatGame.gameState.maxPlayers : index - 1,
      },
    }), {}),
    // generate placing line object for enemies in a range from 1-4
    enemyPlacingLine: _.reduce(_.range(1, 5), (memo, index) => ({
      ...memo,
      [index]: {
        character: null,
        nextIndex: index >= 4 ? 1 : index + 1,
        prevIndex: index === 1 ? 4 : index - 1,
      },
    }), {}),
    launch: () => {
      if (!game) {
        game = newGame(global);
      }
    },
    destroyGame: () => {
      if (game) {
        game = game.destroy();
      }
    },
  };

  console.log('new global');
  return global;
}

export default CombatInterface;
