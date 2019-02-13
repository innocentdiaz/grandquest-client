/*
  TODO:
  - Work on level scenery
  - Optimize game loop updating
  - Add window.on resize events
  - Add low framerate setting
*/

import Phaser from 'phaser';
import _ from 'underscore';
import AudioManager from '../audio-manager';
import store from '@/store';

/*
  Import types
*/
import { CombatRoom } from '@/types';
import { Character, CombatEvent } from '@/game/types';

/*
  Import images
*/
// country landsacpe
import countryPlatformImage from '@/assets/img/landscapes/country/platform.png';
import countryTreesImage from '@/assets/img/landscapes/country/trees.png';
import countryMountainsImage from '@/assets/img/landscapes/country/mountains.png';
import countryCloudsImage from '@/assets/img/landscapes/country/clouds.png';
// grassy mountains landscape
import grassyMountainsImage from '@/assets/img/landscapes/mountains/grassy_mountains.png';
import grassyMountainsFarImage from '@/assets/img/landscapes/mountains/far_mountains.png';
import grassyMountainsClouds from '@/assets/img/landscapes/mountains/clouds.png';
import grassyMountainsHill from '@/assets/img/landscapes/mountains/hill.png';

// spritesheets
import AdventurerSheet from '@/assets/img/spritesheets/adventurer-sheet.png';
import SlimeSheet from '@/assets/img/spritesheets/slime-sheet.png';
// misc
import graveMarkerImage from'@/assets/img/misc/grave-marker.png';
import SelectHandImage from '@/assets/img/icon/select-hand.png';
import healPotionImage from '@/assets/img/items/heal-potion.png';

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
    
    width: Math.max(Math.min(window.innerWidth * .98, 200), 920),
    height: window.innerHeight * .68,
    backgroundColor: '#7fb8f9',
    parent: 'canvas-parent',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
      }
    },
    scene: {
      preload: function() {
        let canvasParent = document.getElementById('canvas-parent');
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

        // Load images asyncronously
        let assetsLoaded = 0;
        _.each([
          // country landscape
          { name: 'country-platform', src: countryPlatformImage, type: 'image' },
          { name: 'country-trees-bg', src: countryTreesImage, type: 'image' },
          { name: 'country-mountains-bg', src: countryMountainsImage, type: 'image' },
          { name: 'country-clouds-bg', src: countryCloudsImage, type: 'image' },
          // grassy mountains landscape
          { name: 'grassy-mountains-bg', src: grassyMountainsImage, type: 'image' },
          { name: 'grassy-mountains-far-bg', src: grassyMountainsFarImage, type: 'image' },
          { name: 'grassy-mountains-clouds-bg', src: grassyMountainsClouds, type: 'image' },
          { name: 'grassy-mountains-hill', src: grassyMountainsHill, type: 'image' },
          // misc
          { name: 'item-heal-potion', src: healPotionImage, type: 'image' },
          { name: 'select-hand', src: SelectHandImage, type: 'image' },
          { name: 'adventurer', src: AdventurerSheet, type: 'spritesheet', spriteDimensions: [ 50, 37 ] },
          { name: 'slime', src: SlimeSheet, type: 'spritesheet', spriteDimensions: [32, 25] },
          { name: 'grave-marker', src: graveMarkerImage, type: 'spritesheet', spriteDimensions: [29, 20] },
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
                key: 'adventurer-hurt',
                frames: self.anims.generateFrameNumbers('adventurer', { start: 60, end: 64 }),
                frameRate: 8,
                repeat: 0,
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
                key: 'slime-bite',
                frames: self.anims.generateFrameNumbers('slime', { start: 9, end: 16 }),
                frameRate: 8,
                repeat: 0,
              });
              self.anims.create({
                key: 'slime-hurt',
                frames: self.anims.generateFrameNumbers('slime', { start: 12, end: 16 }),
                frameRate: 6,
                repeat: 0,
              });
              self.anims.create({
                key: 'grave-marker',
                frames: self.anims.generateFrameNumbers('grave-marker', { frames: [0] }),
                frameRate: 1,
                repeat: 0,
              });
              global.gameInitialized = true;
            }
          };
        });
      },
      update() {
        let self: GameInstance = this;
        if (!global.gameInitialized) {
          return;
        }

        const networkGameState = store.state.combatGame.gameState;

        /*
          GAME LOGIC
        */

        // Despawn Characters
        let charactersOnLocal = {...global.gameState.players, ...global.gameState.enemies};
        _.forEach(charactersOnLocal, ({ id }) => {
          const characterOnNetwork = networkGameState.enemies.hasOwnProperty(id) || networkGameState.players.hasOwnProperty(id);
          if (!characterOnNetwork) {
            actions.despawnCharacter(id);
          }
        });

        /*
          SCENE RENDERING
        */
        // Cloud animation
        if (global._gameClouds) {
          global._gameClouds.tilePositionX += 0.072;
        }
        // Spawn & Update Characters Graphics
        _.forEach({...networkGameState.players, ...networkGameState.enemies}, (characterOnNetwork) => {
          let id: string = String(characterOnNetwork.id);
          let characterOnLocal = {...global.gameState.enemies, ...global.gameState.players}[id];

          if (characterOnLocal) {
            if (characterOnNetwork.enemy) {
              global.gameState.enemies = {
                ...global.gameState.enemies,
                [id]: {...characterOnLocal, ...characterOnNetwork},
              }
            } else {
              global.gameState.players = {
                ...global.gameState.players,
                [id]: {...characterOnLocal, ...characterOnNetwork},
              }
            }

            if (!global.isAnimating) {
              let coordinates = actions.coordinatesForEntity(characterOnLocal);
              characterOnLocal.sprite.x = coordinates.x;
              characterOnLocal.sprite.y = coordinates.y;
            }
          } else {
            characterOnLocal = actions.spawnCharacter(characterOnNetwork);
          }
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
          characterOnLocal._nameTag.y = characterOnLocal.sprite.y - (characterOnLocal.sprite.height * 1.75);

          // health bar background
          if (!characterOnLocal._healthBarBackground) {
            characterOnLocal._healthBarBackground = self
            .add.rectangle(0, 0, 0, 0, 0xBEBEBE)
            .setDepth(characterOnLocal.sprite.depth)
            .setOrigin(0, 0);
          } else if (characterOnLocal._healthBarBackground.visible) {
            characterOnLocal._healthBarBackground.setSize(characterOnLocal._nameTag.width, 9);
            characterOnLocal._healthBarBackground.x = characterOnLocal._nameTag.x - (characterOnLocal._nameTag.width / 2);
            characterOnLocal._healthBarBackground.y = characterOnLocal._nameTag.y + characterOnLocal._nameTag.height;
          }

          // health bar
          if (!characterOnLocal._healthBar) {
            const width = characterOnLocal.entity.health / characterOnLocal.entity.maxHealth * (characterOnLocal._nameTag.displayWidth);

            characterOnLocal._healthBar = self
            .add.rectangle(0, 0, width, 0, 0x56F33E)
            .setDepth(characterOnLocal.sprite.depth + 1)
            .setOrigin(0, 0);
          } else if (characterOnLocal._healthBar.visible) {
            if (!global.isAnimating) {
              const width = characterOnLocal.entity.health / characterOnLocal.entity.maxHealth * (characterOnLocal._nameTag.displayWidth);
              characterOnLocal._healthBar.setSize(width, 10);
            }
            characterOnLocal._healthBar.x = characterOnLocal._nameTag.x - (characterOnLocal._nameTag.width / 2);
            characterOnLocal._healthBar.y = characterOnLocal._nameTag.y + characterOnLocal._nameTag.height;
          }
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
          } else if (characterOnLocal._healthText.visible) {
            let currentDisplayedHealth = Math.round(characterOnLocal.entity.maxHealth * (characterOnLocal._healthBar.width/characterOnLocal._nameTag.displayWidth));
            characterOnLocal._healthText.text = `${currentDisplayedHealth}/${characterOnLocal.entity.maxHealth}`;
            characterOnLocal._healthText.x = characterOnLocal._healthBarBackground.getCenter().x;
            characterOnLocal._healthText.y = characterOnLocal._healthBarBackground.getCenter().y;
          }
          // grave marker
          if (!characterOnLocal._healthBar.width) {
            characterOnLocal._healthBar.visible = false;
            characterOnLocal._healthBarBackground.visible = false;
            characterOnLocal._healthText.visible = false;
            characterOnLocal.sprite.play('grave-marker');
            if (characterOnLocal.enemy) {
              characterOnLocal.sprite.scaleX = -Math.abs(characterOnLocal.sprite.scaleX);
            }
          }
        });
        // target selection hand
        if (store.state.combatGame.selectionMode === 'TARGET' && !global.isAnimating) {
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
        if (global.targetHand && store.state.combatGame.gameState.turn % 2) {
          actions.removeTargetHand();
          store.commit('SET_COMBAT_GAME_SELECTION_MODE', 'TARGET');
        }

        /* Animate game events */

        // IF the network is at a different turn
        if (global.gameState.turn !== networkGameState.turn && !global.isAnimating) {
          // IF we have NOT just joined the match
          if (global.gameState.turn !== -1) {
            let appliedEvents = networkGameState.turnEvents[global.gameState.turn];
            actions.animateEvents(appliedEvents);
          }
          global.gameState.turn = networkGameState.turn;
        }
        // play state updating
        if (!global.isAnimating && networkGameState.playState !== global.gameState.playState) {
          global.gameState.levelRecord = networkGameState.levelRecord;
          global.gameState.playState = networkGameState.playState;
          return;
        }

        /* Level updating / rendering */
        if (global.gameState.level !== networkGameState.level) {
          global.gameState.level = networkGameState.level;
          _.forEach({...global.gameState.players, ...global.gameState.enemies}, c => {
            actions.despawnCharacter(c.id);
          });
          actions.loadScene();
        }

        /*
          GUI rendering
        */
        if (!global.isAnimating) {
          actions.animateXPBar();
        }
      },
    },
  });

  /*
    GameInterface.Actions
  */
  const actions: GiActions = {
    keyMonitor(event: any) {
      let self: any = this;
      if (Date.now() - self.cursorMoveDate <= 100) {
        return;
      }
      self.cursorMoveDate = Date.now();
  
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
          AudioManager.playOnce('cursorSelect');
          store.commit('SET_COMBAT_GAME_SELECTION_MODE', 'ACTION');
          break;
      }
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

      AudioManager.playOnce('cursorMove');
    },
    loadScene() {
      console.log('load scene ', global.gameState.level);
      actions.addBackground();
      AudioManager.playOnce('fieldsCombat', true);
    },
    addBackground() {
      let self: any = this;
      /*
        Wipe the old scene if it exists
      */
      if (global._sceneImg.length) {
        for (let img of global._sceneImg) {
          img.destroy();
        }
        global._sceneImg = [];
      }
      /*
        Handy dimensions
      */
      const canvasWidth = self.game.canvas.offsetWidth;
      const canvasHeight = self.game.canvas.offsetHeight;
      let imagePixelHeight = 0;
      let scaleRatio = 0;

      switch(global.gameState.level) {
        case 0:
          imagePixelHeight = 210;
          scaleRatio = canvasHeight / imagePixelHeight;

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
              .setScale(scaleRatio)
              .setOrigin(0);
            if (name === 'country-clouds-bg') {
              // set them to the game instance
              global._gameClouds = img;
            } else if (name === 'country-mountains-bg') {
              img.setScale(scaleRatio * .7);
            }
            global._sceneImg.push(img);
          });
          break;
        case 1:
          imagePixelHeight = 216;
          scaleRatio = canvasHeight / imagePixelHeight;

          _.each([
            'grassy-mountains-far-bg',
            'grassy-mountains-bg',
            'grassy-mountains-clouds-bg',
            'grassy-mountains-hill',
          ], (name, i) => {
            // clouds are parallax
            const img =
              self.add.tileSprite(0, 0, canvasWidth, canvasHeight, name)
              // z-axis
              .setDepth(i)
              // pixelHeight of each image in tileset
              .setScale(scaleRatio)
              .setOrigin(0);
            if (name === 'grassy-mountains-clouds-bg') {
              // set them to the game instance
              global._gameClouds = img;
            }
            global._sceneImg.push(img);
          });
          break;
        default:
          throw new Error('Scene not configured for level ' + global.gameState.level);
      }
    },
    spawnCharacter(character: Character): Character {
      let self: GameInstance = this;

      let { entity } = character;

      // place them in our game state
      let placingLine = character.enemy
        ? global.enemyPlacingLine
        : global.playerPlacingLine;

      // find empty spot in line
      let emptySpotInLine = _.findKey({...placingLine}, (spot: PlacingLineSpot) => !spot.character);

      if (!emptySpotInLine) {
        throw new Error('Attempted to spawn character but there are not empty spaces in the placing line');
      }

      const cat = character.enemy
          ? 'enemies'
          : 'players';
      const p = character.enemy
        ? 'enemyPlacingLine'
        : 'playerPlacingLine';

      // create game sprite
      let sprite =
        self.add.sprite(0, 0, entity.name)
        .setScale(self.game.canvas.offsetHeight / 210)
        .setDepth(10 + emptySpotInLine)
        .setOrigin(0.5)
        .play(`${entity.name}-idle`, false, Math.floor(Math.random() * 3));

      let characterId: string = String(character.id);
      // add character with sprite to the global game state!
      global.gameState[cat] = {
        ...global.gameState[cat],
        [characterId]: {
          ...character,
          sprite,
        },
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
    coordinatesForEntity(character: Character): { x: number, y: number } {
      let self: any = this;
      // place them in our game state
      let placingLine = character.enemy
        ? global.enemyPlacingLine
        : global.playerPlacingLine;
      let spotInLine: string = _.findKey({...placingLine}, (spot: PlacingLineSpot) => !!spot.character && spot.character.id === character.id);
      if (!spotInLine) {
        throw new Error('no empty spot for coordinates');
      }

      const canvasWidth = self.game.canvas.offsetWidth;
      const canvasHeight = self.game.canvas.offsetHeight;

      let b = character.enemy ? 0.6 : 0.2;
      let c = global.gameState.level === 0
        ? 0.8
        : global.gameState.level === 1
        ? 0.6
        : 0;

      let xDelta = global.gameState.level === 0
        ? 0.08
        : global.gameState.level === 1
        ? 0.055
        : 0;
      let yDelta = global.gameState.level === 0
        ? 0.02
        : global.gameState.level === 1
        ? 0.03
        : 0;

      return {
        x: canvasWidth * ((Number(spotInLine) * xDelta) + b),
        y: canvasHeight * ((Number(spotInLine) * yDelta) + c),
      }
    },
    despawnCharacter(id: string) {
      let character: Character = global.gameState.players[id] || global.gameState.enemies[id];

      if (!character) {
        return;
      }

      let gameStateCategory = character.enemy
        ? global.gameState.enemies
        : global.gameState.players;
      let p = character.enemy
        ? global.enemyPlacingLine
        : global.playerPlacingLine;

      delete gameStateCategory[id];
      // filter out the character from the placing line
      p = _.mapObject(p, (spot) => ({
        ...spot,
        character: spot.character && spot.character.id === character.id ? null : spot.character,
      }));

      /*
        Delete any graphics
      */
      if (character.hasOwnProperty('sprite')) {
        character.sprite.destroy();
      }
      if (character.hasOwnProperty('_nameTag')) {
        character._nameTag.destroy();
      }
      if (character.hasOwnProperty('_healthBar')) {
        character._healthBar.destroy();
      }
      if (character.hasOwnProperty('_healthBarBackground')) {
        character._healthBarBackground.destroy();
      }
      if (character.hasOwnProperty('_healthText')) {
        character._healthText.destroy();
      }
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
        .setDepth(character.sprite.depth + 5); // z-coordinate above the player
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

      if (!event) return global.isAnimating = false;
      actions.animateEvent(event).then(() => {
        if (!!next) {
          actions.animateEvents(events, i + 1);
        } else {
          let aliveEnemies = _.filter(global.gameState.enemies, e => e.entity.health > 0);
          let alivePlayers = _.filter(global.gameState.players, p => p.entity.health > 0);

          if (!aliveEnemies.length || !alivePlayers.length) {
            AudioManager.stopAll();
            AudioManager.playOnce(alivePlayers.length ? 'combatSuccess' : 'combatFail');
            setTimeout(() => {
              global.isAnimating = false;
            }, 5000);
          } else {
            setTimeout(() => {
              global.isAnimating = false;
              if (global.gameState.turn % 2 === 0) {
                store.commit('SET_COMBAT_GAME_SELECTION_MODE', 'TARGET');
              }
            }, 1000);
          }
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
         if (event.action.type === 'attack') {
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
                setTimeout(() => {
                  receiver.sprite.play(`${receiver.entity.name}-hurt`)
                  AudioManager.playOnce('combatHit');
                  // update sprite health bar
                  if (!event.outcome.damage) return;
                  const damagePercentage = (event.outcome.damage / receiver.entity.maxHealth);
                  const totalWidth = receiver._nameTag.displayWidth;
                  const currentWidth = receiver._healthBar.width;
                  const newWidth = currentWidth - (totalWidth * damagePercentage);
                  self.tweens.add({
                    targets: receiver._healthBar,
                    width: newWidth <= 0 ? 0 : newWidth, // avoid negative health bar
                    duration: 250,
                  });

                  // animate XP bar for the current player
                  if (store.state.player.id === character.id) {
                    actions.animateXPBar(event.outcome.xp);
                  }
                }, 290);
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
          } else if (event.action.type === 'item') {
            switch(event.action.id) {
              case 'heal-potion':
                let itemImg = self.add.image(character.sprite.x, character.sprite.y, `item-${event.action.id}`);
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
                    self.tweens.add({
                      targets: receiver._healthBar,
                      width: newWidth,
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
                    ok();
                  },
                });
                timeline.play();
                break;
              default:
                console.error('unknown item', event.action.id);
            }
          }
        }
      });
    },
    setInterval(name: string, func: (i: number) => () => void, interval: number) {
      if (global.gameIntervals[name]) {
        actions.stopInterval(name);
      }
      let i = 0;
      let int = setInterval(() => {
        func(i);
        i++;
      }, interval);
      global.gameIntervals[name] = int;
    },
    stopInterval(name: string) {
      if (global.gameIntervals[name]) {
        clearInterval(global.gameIntervals[name]);
        delete global.gameIntervals[name];
      }
    },
    animateXPBar(amount?: number) {
      if (!store.state.player.id) {
        return;
      }
      const currentPlayer = global.gameState.players[store.state.player.id];
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
      actions.setInterval('xpBar', (i: number) => {
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
        else if (i === j) // ANIMATE LAST ONE
        {
          newWidth = (remainder/max)+barWidth;
        }
        else // ALL ANIMATIONS ARE COMPLETE
        {
          if (i === 1) {
            barJuiceElement.style.width = `${remainder/max*100}%`;
          }
          return actions.stopInterval('xpBar');
        }
        barJuiceElement.setAttribute('class', 'animated');
        barJuiceElement.style.width = `${newWidth*100}%`;
      }, 300);
    }
  };
  // Bind key monitor to game interface
  global.keyMonitor = actions.keyMonitor;

  return game;
}
export interface GameInterface {
  gameState: CombatRoom;
  gameInitialized: boolean;
  gameIntervals: {
    [intervalName: string]: number,
  }
  currentTargetSide: number;
  currentTargetIndex: number;
  _gameClouds: any;
  _sceneImg: any[];
  targetHand: any;
  isAnimating: boolean;
  playerPlacingLine: PlacingLine;
  enemyPlacingLine:  PlacingLine;
  launch: () => void;
  destroyGame: () => void;
  keyMonitor: (event: any) => void;
};
interface PlacingLine {
  [index: string]: PlacingLineSpot;
}
interface PlacingLineSpot {
  character: Character|null;
  nextIndex: number;
  prevIndex: number;
}

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
      level: -1,
      turnEvents: {},
      playState: 1,
      levelRecord: {},
      readyToContinue: {},
    },
    // called startGame();
    gameInitialized: false,
    currentTargetSide: 0,
    currentTargetIndex: 1,
    _gameClouds: null,
    _sceneImg: [],
    targetHand: null,
    isAnimating: false,
    // this will be generated using the game state with `gameInterface.actions.startGame()
    playerPlacingLine: _.reduce(_.range(1, 5), (memo, index) => ({
      ...memo,
      [String(index)]: {
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
    gameIntervals: {},
    launch: () => {
      if (!game) {
        game = newGame(global);
      }
    },
    destroyGame: () => {
      // stop any audio playing
      AudioManager.stopAll();
      // stop any intervals set
      _.forEach(global.gameIntervals, (i) => {
        clearInterval(i);
      });
      // destroy the phaser game instance
      if (game) {
        game = game.destroy();
      }
    },
    keyMonitor: () => {
      // this will be binded to the game on launch
    }
  };

  console.log('new global');
  return global;
}

export default CombatInterface;
