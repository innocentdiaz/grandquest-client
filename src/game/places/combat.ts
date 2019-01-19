/*
  TODO:
  - Add icons for selection status
  - Add health bars
  - Add potions
  - Work on level scenery
  - Reset Vuex store on mount/destruction of component
  - Add music
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
  Declare interfaces
*/
interface GiActions {
  [actionName: string]: any,
}
export interface GiGlobal {
  gameState: CombatRoom;
  gameInitialized: boolean;
  currentTargetSide: number;
  currentTargetIndex: number;
  gameClouds: any;
  targetHand: any;
  playerPlacingLine: PlacingLine;
  enemyPlacingLine:  PlacingLine;
};
export interface GameInterface {
  // Stores important game variables
  global: GiGlobal;
  // new Phaser.Game
  game: any;
  // Used to manipulate the game
  actions:  GiActions;
}
interface PlacingLine {
  [index: number]: PlacingLineSpot;
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
  Will return a GameInterface object
*/
function launch(): GiGlobal {
  /*
    GameInterface.Global
  */
  store.subscribe((m, s) => {
    actions.updateGameState(s.combatGame.gameState);
  });
  let global: GiGlobal = {
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
    },
    // called startGame();
    gameInitialized: false,
    currentTargetSide: 0,
    currentTargetIndex: 1,
    gameClouds: null,
    targetHand: null,
    // this will be generated using the game state with `gameInterface.actions.startGame()
    playerPlacingLine: _.reduce(_.range(1, 5), (memo, index) => {
      return {
        ...memo,
        [index]: {
          character: null,
          nextIndex: index >= store.state.combatGame.gameState.maxPlayers ? 1 : index + 1,
          prevIndex: index === 1 ? store.state.combatGame.gameState.maxPlayers : index - 1,
        },
      };
    }, {}),
    // generate placing line object for enemies in a range from 1-4
    enemyPlacingLine: _.reduce(_.range(1, 5), (memo, index) => {
      return {
        ...memo,
        [index]: {
          character: null,
          nextIndex: index >= 4 ? 1 : index + 1,
          prevIndex: index === 1 ? 4 : index - 1,
        },
      };
    }, {}),
  };

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
      /*
        Game.preload();
        Responsible for binding functions
        to the game instance. Functions to bind
        are gameInterface.actions and entity
        generators found in the `Entities` object
      */
      preload: function() {
        /*
          Bind gameInterface.actions to `this`
        */
        _.each(actions, (func: any, action: string) => {
          actions[action] = func.bind(this);
        });
        /*
          Bind entity generators to `this`
        */
        for(const id in Entities) {
          Entities[id] = Entities[id].bind(this);
        }
      },
      /*
        Game.create();
        Responsibe for loading assets asynchronously
        and adding animation for sprites
      */
      create() {
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
              this.textures.addImage(name, img);
            }
          : type === 'spritesheet'
          ? () => {
              this.textures.addSpriteSheet(
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
              this.anims.create({
                key: 'adventurer-idle',
                frames: this.anims.generateFrameNumbers('adventurer', { start: 0, end: 3 }),
                frameRate: 3,
                repeat: -1,
              });
              this.anims.create({
                key: 'adventurer-walk',
                frames: this.anims.generateFrameNumbers('adventurer', { start: 8, end: 14 }),
                frameRate: 10,
                repeat: -1,
              });
              this.anims.create({
                key: 'adventurer-swing',
                frames: this.anims.generateFrameNumbers('adventurer', { frames:[38, 39, 40, 41, 42, 43, 47, 48, 49, 50, 51, 52] }),
                frameRate: 12,
                repeat: 0,
              });
              this.anims.create({
                key: 'adventurer-up-swing',
                frames: this.anims.generateFrameNumbers('adventurer', { start: 38, end: 49 }),
                frameRate: 11,
                repeat: 0,
              });
              this.anims.create({
                key: 'adventurer-back-swing',
                frames: this.anims.generateFrameNumbers('adventurer', { start: 53, end: 59 }),
                frameRate: 8,
                repeat: 0,
              });
              this.anims.create({
                key: 'adventurer-spin-swing',
                frames: this.anims.generateFrameNumbers('adventurer', { start: 45, end: 59 }),
                frameRate: 16,
                repeat: 0,
              });
              this.anims.create({
                key: 'slime-idle',
                frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 7 }),
                frameRate: 7,
                repeat: -1,
              });
              this.anims.create({
                key: 'slime-hurt',
                frames: this.anims.generateFrameNumbers('slime', { start: 12, end: 16 }),
                frameRate: 6,
                repeat: 0,
              });

              actions.startGame();
            }
          };
        });
      },
      update() {
        // move the clouds around
        if (global.gameClouds) {
          global.gameClouds.tilePositionX += 0.072;
        }

        if (!global.gameInitialized) {
          return;
        }

        console.clear();
        _.forEach({...global.gameState.players, ...global.gameState.enemies}, (character) => {
          if (!character) {
            return;
          }

          /*
            Graphics updating
          */
          // name tag
          if(character._nameTag) {
            character._nameTag.destroy();
          }
          character._nameTag = this.add.text(
            character.sprite.x,
            character.sprite.y - (character.sprite.height * 1.25),
            character.username,
            {
              fontSize: '17px',
              fill: '#fff',
              backgroundColor: '#0008',
              align: 'center',
            },
          )
          .setOrigin(0.5, 0)
          .setDepth(character.sprite.depth);

          let graphics: any = this.add.graphics(character._nameTag.x, character._nameTag.y);

          // health bar background
          if (character._healthBarBackground) {
            character._healthBarBackground.destroy();
          }
          character._healthBarBackground = graphics
          .fillStyle(0xBEBEBE)
          .fillRect(
            character._nameTag.x - (character._nameTag.width / 2),
            character._nameTag.y + character._nameTag.height,
            character._nameTag.width,
            5,
          )
          .setDepth(character.sprite.depth);

          // health bar
          if (character._healthBar) {
            character._healthBar.destroy();
          }
          character._healthBar = graphics
          .fillStyle(0x56F33E)
          .fillRect(
            character._nameTag.x - (character._nameTag.width / 2),
            character._nameTag.y + character._nameTag.height,
            (character.entity.health / character.entity.maxHealth) * character._nameTag.width,
            6,
          )
          .setDepth(character.sprite.depth + 1);
        });

        /*
          Selection hand
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
      },
    },
  });

  /*
    GameInterface.Actions
  */
  const actions: GiActions = {
    startGame() {
      console.log('game started');

      // make background;
      actions.addBackground();

      // add events
      document.addEventListener('keydown', (event) => {
        if (Date.now() - this.cursorMoveDate <= 100) {
          return;
        }
        this.cursorMoveDate = Date.now();

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
      /*
        Handy dimensions
      */
      const canvasWidth = this.game.canvas.offsetWidth;
      const canvasHeight = this.game.canvas.offsetHeight;

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
          this.add.tileSprite(0, 0, canvasWidth, canvasHeight, name)
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
    updateGameState(networkGameState: CombatRoom) {
      if (!global.gameInitialized) {
        return;
      }
      /*
        Player updating section
      */
      const allPlayersOnNetworkState = networkGameState.players;
      const allPlayersInGameState = global.gameState.players;

      // despawn players
      // for (id in allPlayersInGameState) {
      //   var playerInNetwork = allPlayersOnNetworkState[id];

      //   if(!playerInNetwork) {
      //     // ORIGINAL GAME STATE IS MANIPULATED HERE
      //     playScreen.despawnCharacter(id);
      //   }
      // }

      // add / update players
      for (const id in allPlayersOnNetworkState) {
        const playerOnNetwork = allPlayersOnNetworkState[id];
        const playerInLocal = allPlayersInGameState[id];

        // spawn player
        if (!playerInLocal) {
          let c: Character = actions.spawnCharacter(playerOnNetwork);
          if (c.entity.name === 'adventurer') {
            c.sprite.play('adventurer-swing');
            setTimeout(() => c.sprite.play('adventurer-idle'), 1200);
          }
        }

        // // set the player's health
        // playerInLocal.setHealth(playerOnNetwork.entity.health);

        // // set the player's selectionStatus
        // playerInLocal.setStatusIcon(playerOnNetwork.entity.selectionStatus);
        // playerInLocal.entity.selectionStatus = status

        // set the current player's HP bar
        // if (playerInLocal.id === socket.id) {
        //   GuiManager.setHP(playerInLocal);
        // }
      }

      /*
        Enemy updating section
      */
      const allEnemiesInNetworkState = networkGameState.enemies;
      const allEnemiesInLocalState = global.gameState.enemies;
      
      // add / update enemies
      for (const id in allEnemiesInNetworkState) {
        var enemyOnNetwork = allEnemiesInNetworkState[id];
        var enemyInLocal = allEnemiesInLocalState[id];

        // spawn player
        if (!enemyInLocal) {
          actions.spawnCharacter(enemyOnNetwork)//.updateHealthBar();
        }

        // var healthOnNetwork = enemyOnNetwork.entity.health;

        // enemyInLocal
        //   .setHealth(healthOnNetwork)
        //   // .updateHealthBar();
      }
      /*
        EVENTS UPDATING
      */

      // IF the network is at a different turn
      if (global.gameState.turn !== networkGameState.turn) {
        // IF we have NOT just joined the match
        if (global.gameState.turn !== -1) {
          let appliedEvents = networkGameState.turnEvents[global.gameState.turn];
          actions.animateEvents(appliedEvents);
        }

        global.gameState.turn = networkGameState.turn;

        if (global.gameState.turn % 2) {
          // enemy turn
        } else {
          // player turn
        }
      }
    },
    spawnCharacter(character: Character) {
      let { entity } = character;

      let selectedEntityGenerator = Entities[entity.name];
      if (!selectedEntityGenerator) {
        console.error('Attempted to spawn unknown entity ', entity.name);
      }

      // place them in our game state
      let gameStateCategory;
      let placingLine;

      if (character.enemy) {
        gameStateCategory = global.gameState.enemies;
        placingLine = global.enemyPlacingLine;
      } else {
        gameStateCategory = global.gameState.players;
        placingLine = global.playerPlacingLine;
      }

      // find empty spot in line
      let emptySpotInLine: any = _.findKey({...placingLine}, (spot: PlacingLineSpot) => !spot.character);

      if (!emptySpotInLine) {
        console.error('Attempted to spawn character but there are not empty spaces in ', {...placingLine});
        return null;
      }

      const canvasWidth = this.game.canvas.offsetWidth;
      const canvasHeight = this.game.canvas.offsetHeight;

      let coordinatesForEntity = character.enemy
        ? {
            x: canvasWidth * (0.6 + (0.08 * emptySpotInLine)), 
            y: canvasHeight * ((0.9 - (0.02 * Object.keys(placingLine).length)) + (0.02 * emptySpotInLine)),
          }
        : {
            x: canvasWidth * (0.25 - (0.08 * emptySpotInLine)),
            y: canvasHeight * ((0.9 - (0.02 * Object.keys(placingLine).length)) + (0.02 * emptySpotInLine)),
          };

      gameStateCategory[character.id] = selectedEntityGenerator(
        character,
        coordinatesForEntity,
      );

      // reference the spawned player in their placing line
      placingLine[emptySpotInLine].character = gameStateCategory[character.id];

      return gameStateCategory[character.id];
    },
    addTargetHand() {
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
        this.add.image(character.sprite.x, character.sprite.y, 'select-hand')
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
      const event = events[i];
      const next = events[i + 1];

      actions.animateEvent(event).then(() => {
        if (!!next) {
          actions.animateEvents(events, i + 1);
        } else {
          console.log('done animating');
        }
      });
    },
    animateEvent(event: CombatEvent) {
      return new Promise((ok) => {
        let timeline = this.tweens.createTimeline();
        const character = {...global.gameState.players, ...global.gameState.enemies}[event.characterId];
        const receiver = {...global.gameState.players, ...global.gameState.enemies}[event.receiverId];

        // attack animation
        const originalPosition = character.sprite.x;
        const atkPosition = character.sprite.x + (this.game.canvas.offsetWidth * .1);

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
              setTimeout(() => receiver.sprite.play(`${receiver.entity.name}-hurt`));
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

  return global;
}

export default launch;
