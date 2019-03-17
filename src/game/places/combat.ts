import Phaser from 'phaser';
import _ from 'underscore';
import AudioManager from '../audio-manager';
import animationsManager from '@/game/animations';
import animations, { connectAnimations } from '@/game/animations';
import store from '@/store';

/*
  Import types
*/
import { CombatRoom } from '@/types';
import { CombatCharacter, CombatEvent } from '@/game/types';

/*
  Import images
*/
import skyMainImage from '@/assets/img/landscapes/main-sky.png'
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
import MountainWarriorSheet from '@/assets/img/spritesheets/mountain-warrior-sheet.png';
// items
import healPotionImage from '@/assets/img/items/heal-potion.png';
// misc
import graveMarkerImage from'@/assets/img/misc/grave-marker.png';
import SelectTargetImage from '@/assets/img/icon/select-target.png';
import xpOrbImage from '@/assets/img/misc/xp-orb.png';

/*
  Declare types & interfaces
*/
interface PhaserGame {
  resize: (width: number, height: number) => PhaserGame;
  scene: {
    scenes: Scene[];
  }
  canvas: HTMLCanvasElement;
  destroy: () => void;
}
type PhaserConfig = {
  type: any;
  pixelArt?: boolean;
  width: number;
  height: number;
  backgroundColor?: string;
  physics: any;
  parent?: string;
  scene: {
    preload?: () => void;
    create?: () => void;
    update?: () => void;
  }
}
interface Scene {
  add: {
    image: (x: number, y: number, id: string) => any;
    sprite: (x: number, y: number, id: string) => any;
    graphics: () => any;
    rectangle: (x1: number, x2: number, y1: number, y2: number, color: number) => any;
    text: (x: number, y: number, text: string, styles: any) => any;
    particles: (name: string) => any;
    tileSprite: (x: number, y: number, width: number, height: number, id: string) => any;
  };
  game: PhaserGame;
  tweens: {
    add: (options: any) => any;
    createTimeline: () => any;
  };
  anims: {
    create: (config: any) => any;
    generateFrameNumbers: (key: string, config: { frames: number[] } | { start: number, end: number }) => any;
  };
  textures: {
    addSpriteSheet: (id: string, img: HTMLImageElement, config: any) => void;
    addImage: (id: string, img: HTMLImageElement) => void;
  };
  cameras: {
    main: {
      flash: () => void;
      shake: () => void;
    }
  };
  time: {
    delayedCall: (time: number, cb: () => any) => void;
  }
};

interface ControllerActions {
  [index: string]: any,
  startLevel: (level: number) => void;
  renderBackground: () => void;
  spawnCharacter: (character: CombatCharacter) => CombatCharacter;
  coordinatesForEntity: (character: CombatCharacter) => { x: number, y: number };
  despawnCharacter: (id: string | number) => void;
  addTargetHand: () => void;
  removeTargetHand: () => void;
  moveTargetHandTo: (settings: { index: number, side: number }) => void;
  animateEvents: (events: CombatEvent[], i?: number) => void;
  setInterval: (name: string, func: (i: number) => any, interval: number) => void;
  stopInterval: (name: string) => void;
}

/**
 * The main controller for the Phaser game
 */
export interface GameController {
  gameState: CombatRoom;
  gameInitialized: boolean;
  gameIntervals: {
    [intervalName: string]: number,
  };
  currentTargetSide: 0 | 1;
  currentTargetIndex: number;
  _gameClouds: any;
  _fadeScreen: any;
  currentStage: {
    name: 'country' | 'mountains' | null;
    imgs: any[];
  },
  game: PhaserGame | null;
  targetHand: any;
  isAnimating: boolean;
  selectedAction: null | { id: string; type: string };
  showGUI: boolean;
  playerPlacingLine: PlacingLine;
  enemyPlacingLine: PlacingLine;
  launch: () => void;
  destroyGame: () => void;
  keyMonitor: (event: any) => void;
  resizeMonitor: (event: any) => void;
  highlightCharacters: (category: boolean | 'enemies' | 'players') => void;
  selectAction: (selectedAction: { id: string; type: string }) => void;
};

/**
 * Organizes characters in specific spots of placing lines to be rendered accordingly
 */
interface PlacingLine {
  [placingIndex: string]: {
    readonly character: CombatCharacter | null;
    nextIndex: number;
    prevIndex: number;
  };
}

/**
  Returns a new Phaser.Game that makes use of a game controller.
  This method is called by GameController.launch()
*/
/*
  There are three sections to this fuction:
  1) Phaser config object creation
  2) Phaser.Game creation
  3) Game controller actions creation
  4) Return game
*/
const newGame = (global: GameController): PhaserGame => {
  // -------------------------------------------------
  //      Configuration for Phaser Game & Game logic
  //      (I recommend collapsing this entire object when not
  //       working on the game logic, its a bit big)
  let config: PhaserConfig = {
    type: Phaser.AUTO,
    pixelArt: true,
    // width set to 98% of window width withing range of 300 and 920 pixels
    width: window.innerWidth * .98 > 920 ? 920 : window.innerWidth * .98 < 300 ? 300 : window.innerWidth * .98,
    height: window.innerHeight * .68,
    parent: 'canvas-parent',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
      }
    },
    scene: {
      preload() {
        let canvasParent = document.getElementById('canvas-parent');
        if (!canvasParent) {
          throw new Error('Phaser.js expected a parent element for the canvas, but at time of creating got none');
        }
        /*
          Connect the animations manager to the game controller
        */
        connectAnimations(global);
      },
      /*
        Game.create();
        Responsibe for loading assets asynchronously
        and adding animation for sprites
      */
      create() {
        let scene: Scene = game.scene.scenes[0];
        /*
          Bind GameController.actions to `scene`
        */
        _.each(actions, (func: any, action: string) => {
          actions[action] = func.bind(scene);
        });

        // Load images asyncronously
        let assetsLoaded = 0;
        _.each([
          // main sky
          { name: 'main-sky', src: skyMainImage, type: 'image' },
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
          // entities
          { name: 'adventurer', src: AdventurerSheet, type: 'spritesheet', spriteDimensions: [ 50, 37 ] },
          { name: 'slime', src: SlimeSheet, type: 'spritesheet', spriteDimensions: [32, 25] },
          { name: 'mountain-warrior', src: MountainWarriorSheet, type: 'spritesheet', spriteDimensions: [64, 36] },
          // items
          { name: 'item-heal-potion', src: healPotionImage, type: 'image' },
          // misc
          { name: 'select-target', src: SelectTargetImage, type: 'image' },
          { name: 'grave-marker', src: graveMarkerImage, type: 'spritesheet', spriteDimensions: [29, 20] },
          { name: 'xp-orb', src: xpOrbImage, type: 'image' },
        ], (a, i, l) => {
          const { name, src, type, spriteDimensions } = a;

          const img = new Image();
          img.src = src;

          // method to add texture `onload` according to type
          const method = type === 'image'
          ? () => {
              scene.textures.addImage(name, img);
            }
          : type === 'spritesheet' && spriteDimensions
          ? () => {
              scene.textures.addSpriteSheet(
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
              scene.anims.create({
                key: 'adventurer-idle',
                frames: scene.anims.generateFrameNumbers('adventurer', { start: 0, end: 3 }),
                frameRate: 4,
                repeat: -1,
              });
              scene.anims.create({
                key: 'adventurer-hurt',
                frames: scene.anims.generateFrameNumbers('adventurer', { start: 60, end: 64 }),
                frameRate: 10,
                repeat: 0,
              });
              scene.anims.create({
                key: 'adventurer-walk',
                frames: scene.anims.generateFrameNumbers('adventurer', { start: 8, end: 14 }),
                frameRate: 12,
                repeat: -1,
              });
              scene.anims.create({
                key: 'adventurer-swing',
                frames: scene.anims.generateFrameNumbers('adventurer', { frames:[38, 39, 40, 41, 42, 43, 47, 48, 49, 50, 51, 52] }),
                frameRate: 15,
                repeat: 0,
              });
              scene.anims.create({
                key: 'adventurer-up-swing',
                frames: scene.anims.generateFrameNumbers('adventurer', { start: 38, end: 49 }),
                frameRate: 12,
                repeat: 0,
              });
              scene.anims.create({
                key: 'adventurer-back-swing',
                frames: scene.anims.generateFrameNumbers('adventurer', { start: 53, end: 58 }),
                frameRate: 9,
                repeat: 0,
              });
              scene.anims.create({
                key: 'adventurer-spin-swing',
                frames: scene.anims.generateFrameNumbers('adventurer', { start: 45, end: 59 }),
                frameRate: 16,
                repeat: 0,
              });
              scene.anims.create({
                key: 'slime-idle',
                frames: scene.anims.generateFrameNumbers('slime', { start: 0, end: 7 }),
                frameRate: 7,
                repeat: -1,
              });
              scene.anims.create({
                key: 'slime-bite',
                frames: scene.anims.generateFrameNumbers('slime', { start: 9, end: 16 }),
                frameRate: 8,
                repeat: 0,
              });
              scene.anims.create({
                key: 'slime-hurt',
                frames: scene.anims.generateFrameNumbers('slime', { start: 12, end: 16 }),
                frameRate: 6,
                repeat: 0,
              });
              scene.anims.create({
                key: 'mountain-warrior-idle',
                frames: scene.anims.generateFrameNumbers('mountain-warrior', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1,
              });
              scene.anims.create({
                key: 'mountain-warrior-walk',
                frames: scene.anims.generateFrameNumbers('mountain-warrior', { start: 4, end: 9 }),
                frameRate: 9,
                repeat: -1,
              });
              scene.anims.create({
                key: 'mountain-warrior-jump',
                frames: scene.anims.generateFrameNumbers('mountain-warrior', { start: 25, end: 32 }),
                frameRate: 6,
                repeat: 0,
              });
              scene.anims.create({
                key: 'mountain-warrior-slash',
                frames: scene.anims.generateFrameNumbers('mountain-warrior', { start: 10, end: 14 }),
                frameRate: 9,
                repeat: 0,
              });
              scene.anims.create({
                key: 'mountain-warrior-hurt',
                frames: scene.anims.generateFrameNumbers('mountain-warrior', { start: 15, end: 19 }),
                frameRate: 4,
                repeat: 0,
              });
              scene.anims.create({
                key: 'grave-marker',
                frames: scene.anims.generateFrameNumbers('grave-marker', { frames: [0] }),
                frameRate: 1,
                repeat: 0,
              });
              global.gameInitialized = true;
            }
          };
        });
      },
      update() {
        let scene: Scene = game.scene.scenes[0];
        if (!global.gameInitialized) {
          return;
        }

        const networkGameState = store.state.combatGame.gameState;

        /*
          GAME LOGIC
        */
        /* Level updating / rendering */
        // if we are on a different level than on the network
        if (global.gameState.level !== networkGameState.level && networkGameState.level !== -1) {
          // update the level locally
          global.gameState.level = networkGameState.level;
          // despawn all the characters
          _.forEach({...global.gameState.players, ...global.gameState.enemies}, c => {
            actions.despawnCharacter(c.id);
          });
          // load the scene
          actions.startLevel(global.gameState.level);
        }

        // generate user placing line
        if (networkGameState.maxPlayers !== Object.keys(global.playerPlacingLine).length) {
          // reset players on local state
          global.gameState.players = {};
          // generate empty placing line withing range
          global.playerPlacingLine = _.reduce(_.range(1, networkGameState.maxPlayers + 1), (memo: object, index: number) => ({
            ...memo,
            [String(index)]: {
              get character() {
                return null;
              },
              nextIndex: index >= networkGameState.maxPlayers ? 1 : index + 1,
              prevIndex: index === 1 ? networkGameState.maxPlayers : index - 1,
            },
          }), {});
        }

        // generate enemy placing line
        if (Object.keys(networkGameState.enemies).length !== Object.keys(global.enemyPlacingLine).length) {
          // despawn any players that could be on it
          global.gameState.enemies = {};
          // generate empty placing line withing range
          global.enemyPlacingLine = _.reduce(_.range(1, Object.keys(networkGameState.enemies).length + 1), (memo: object, index: number) => ({
            ...memo,
            [String(index)]: {
              get character() {
                return null;
              },
              nextIndex: index >= Object.keys(networkGameState.enemies).length ? 1 : index + 1,
              prevIndex: index === 1 ? Object.keys(networkGameState.enemies).length : index - 1,
            },
          }), {});
        }

        // Despawn Characters
        let charactersOnLocal = {...global.gameState.players, ...global.gameState.enemies};
        _.forEach(charactersOnLocal, ({ id }) => {
          const characterOnNetwork = networkGameState.enemies.hasOwnProperty(id) || networkGameState.players.hasOwnProperty(id);
          if (!characterOnNetwork) {
            actions.despawnCharacter(id);
          }
        });

        // Update Characters States
        _.forEach({...global.gameState.players, ...global.gameState.enemies}, (characterOnLocal) => {
          let id: string = String(characterOnLocal.id);
          let characterOnNetwork = characterOnLocal.enemy
            ? networkGameState.enemies[id]
            : networkGameState.players[id];

          if (characterOnLocal.enemy) {
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
        });

        // IF the network is at a different turn
        if (global.gameState.turn !== networkGameState.turn && !global.isAnimating) {
          // IF we have NOT just joined the match
          let appliedEvents = networkGameState.turnEvents[global.gameState.turn];
          if (appliedEvents && global.gameState.turn !== -1) {
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

        /*
          SCENE RENDERING
        */
        // Cloud animation
        if (global._gameClouds) {
          global._gameClouds.tilePositionX += 0.072;
        }
        // Create & Update Characters Graphics
        _.forEach({...networkGameState.players, ...networkGameState.enemies}, (characterOnNetwork) => {
          let id: string = String(characterOnNetwork.id);
          let characterOnLocal = characterOnNetwork.enemy
           ? global.gameState.enemies[id]
           : global.gameState.players[id];

          // user does not exist locally, spawn them if game is NOT animating
          if (!characterOnLocal && !global.isAnimating) {
            characterOnLocal = actions.spawnCharacter(characterOnNetwork);
          }
          // user does not exist locally BUT the game is animating, don't continue
          else if (!characterOnLocal) {
            return;
          }

          // if game is NOT animating, update their position
          if (!global.isAnimating) {
            let coordinates = actions.coordinatesForEntity(characterOnLocal);
            characterOnLocal.sprite.x = coordinates.x;
            characterOnLocal.sprite.y = coordinates.y;
          }
          // name tag
          if(!characterOnLocal._nameTag) {
            characterOnLocal._nameTag = scene.add.text(
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
          characterOnLocal._nameTag.setDepth(characterOnLocal.sprite.depth);

          // health bar background
          if (!characterOnLocal._healthBarBackground) {
            characterOnLocal._healthBarBackground = scene.add.rectangle(0, 0, 0, 0, 0xBEBEBE)
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

            characterOnLocal._healthBar = scene
            .add.rectangle(0, 0, width, 0, 0x56F33E)
            .setOrigin(0, 0);
          } else if (characterOnLocal._healthBar.visible) {
            if (!global.isAnimating) {
              const width = characterOnLocal.entity.health / characterOnLocal.entity.maxHealth * (characterOnLocal._nameTag.displayWidth);
              characterOnLocal._healthBar.setSize(width, 10);
            }
            characterOnLocal._healthBar.x = characterOnLocal._nameTag.x - (characterOnLocal._nameTag.width / 2);
            characterOnLocal._healthBar.y = characterOnLocal._nameTag.y + characterOnLocal._nameTag.height;
            characterOnLocal._healthBar.setDepth(characterOnLocal.sprite.depth + 1);
          }
          // health text
          if (!characterOnLocal._healthText) {
            characterOnLocal._healthText = scene.add.text(
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
          } else if (characterOnLocal._healthText.visible) {
            let currentDisplayedHealth = characterOnLocal.entity.maxHealth * (characterOnLocal._healthBar.width/characterOnLocal._nameTag.displayWidth);
            characterOnLocal._healthText.text = `${Math.round(currentDisplayedHealth / 10) * 10}/${characterOnLocal.entity.maxHealth}`;
            characterOnLocal._healthText.x = characterOnLocal._healthBarBackground.getCenter().x;
            characterOnLocal._healthText.y = characterOnLocal._healthBarBackground.getCenter().y + 2;
            characterOnLocal._healthText.setDepth(characterOnLocal.sprite.depth + 2);
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
        if (global.targetHand) {
          const currentPlayer = store.state.user.id ? global.gameState.players[store.state.user.id] : null;
          // remove the target hand if game is animating or the user already selected the target & action
          if (currentPlayer && currentPlayer.selectionStatus === 1 || global.isAnimating || store.state.combatGame.selectionMode !== 'TARGET') {
            actions.removeTargetHand();
          } else {
            // update selection hand coordinates
            const placingLine = global.currentTargetSide === 0
              ? global.playerPlacingLine
              : global.enemyPlacingLine;

            const character = placingLine[global.currentTargetIndex].character;

            if (character && character.sprite.depth === 15) {
              global.targetHand.x = character.sprite.getCenter().x;
              global.targetHand.y = character._nameTag.y - 15;
              global.targetHand.setDepth(character.sprite.depth);
            } else {
              actions.removeTargetHand();
            }
          }
        } else if (store.state.combatGame.selectionMode === 'TARGET' && !global.isAnimating) {
          actions.addTargetHand();
        }
        // update fadeScreen size
        if (global._fadeScreen) {
          if (global.isAnimating) {
            global.highlightCharacters(false);
            global._fadeScreen.destroy();
            global._fadeScreen = null;
          } else {
            global._fadeScreen
              .setSize(scene.game.canvas.offsetWidth, scene.game.canvas.offsetHeight);
          }
        }
      },
    },
  };

  // -----------------------------------------------------
  //  Create Phaser Game using config
  let game: PhaserGame = new Phaser.Game(config);

  /*
    GameController actions
  */
  const actions: ControllerActions = {
    startLevel(level) {
      /*
        SCENE Z-DEPTHS FOR IMAGE & SPRITE
        -
        Background images: 1-4
        CombatCharacter (idle): 10
        FadeScreen: 14
        CombatCharacter (selected or animating): 15
        TargetHand: CombatCharacter.depth
        NameTag: CombatCharacter.depth
        HealthBar: CombatCharacter.depth + 1
        HealthText: CombatCharacter.depth + 2
      */
      let scene: Scene = game.scene.scenes[0];

      // stop all audio
      AudioManager.stopAll();
      // remove target hand
      actions.removeTargetHand();
      // despawn characters
      _.each({...global.gameState.players, ...global.gameState.enemies}, (character) => {
        actions.despawnCharacter(character.id);
      });
      
      if (level <= 4) {
        global.currentStage.name = 'country';
      } else {
        global.currentStage.name = 'mountains';
      }

      global.showGUI = false;
      global.isAnimating = true;

      // create a cover for the screen
      var width = scene.game.canvas.offsetWidth + 10;
      var height = scene.game.canvas.offsetHeight + 10;
      var slope = 200;
      var polygon = new Phaser.Geom.Polygon([
          0-slope, height,
          0, 0,
          width, 0,
          width, height,
      ]);

      let screenCover = scene.add.graphics()
        .fillStyle(0x000)
        .fillPoints(polygon.points, true)
        .setDepth(100);

      let timeline = scene.tweens.createTimeline();
      timeline.add({
        targets: [screenCover],
        duration: 150,
        x: width + slope,
        onComplete() {
          screenCover.destroy();
          AudioManager.playOnce('fieldsCombat', true);
          setTimeout(() => {
            global.isAnimating = false;
            global.showGUI = true;
          }, 1500);
        },
      });

      actions.renderBackground();
      store.commit('SET_COMBAT_GAME_SELECTION_MODE', 'ACTION');
      setTimeout(() => {
        AudioManager.playOnce('cursorSelect');
        timeline.play();
      }, 2000);
    },
    renderBackground() {
      let scene: Scene = game.scene.scenes[0];
      /*
      Handy dimensions
      */
     const canvasWidth = scene.game.canvas.offsetWidth;
     const canvasHeight = scene.game.canvas.offsetHeight;
      let imagePixelHeight = 0;
      let scaleRatio = 0;
      scene.add.image(canvasWidth / 2, 0, 'main-sky')
        .setDepth(0)
        .setScale(canvasWidth/800)
        .setOrigin(0.5, 0)

      /*
        Wipe the old scene if it exists
      */
      if (global.currentStage.imgs.length) {
        for (let img of global.currentStage.imgs) {
          img.destroy();
        }
      }
      // add main-sky
      global.currentStage.imgs = [
        scene.add.image(canvasWidth / 2, 0, 'main-sky')
          .setDepth(0)
          .setScale(canvasWidth/800)
          .setOrigin(0.5, 0)
      ];

      if (global.currentStage.name === 'country') {
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
            scene.add.tileSprite(0, 0, canvasWidth, canvasHeight, name)
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
          global.currentStage.imgs.push(img);
        });
      } else if (global.currentStage.name === 'mountains') {
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
            scene.add.tileSprite(0, 0, canvasWidth, canvasHeight, name)
            // z-axis
            .setDepth(i)
            // pixelHeight of each image in tileset
            .setScale(scaleRatio)
            .setOrigin(0);
          if (name === 'grassy-mountains-clouds-bg') {
            // set them to the game instance
            global._gameClouds = img;
          }
          global.currentStage.imgs.push(img);
        });
      } else {
        throw new Error('Scene not configured for level ' + global.gameState.level);
      }
    },
    spawnCharacter(character): CombatCharacter {
      let scene: Scene = game.scene.scenes[0];

      let { entity } = character;

      // place them in our game state
      let placingLine = character.enemy
        ? global.enemyPlacingLine
        : global.playerPlacingLine;

      // find empty spot in line
      let emptySpotInLine = _.findKey({...placingLine}, (spot) => {
        return spot.character === null;
      });

      if (!emptySpotInLine) {
        throw new Error('f');
      }

      const characterType = character.enemy
        ? 'enemies'
        : 'players';
      const p = character.enemy
        ? 'enemyPlacingLine'
        : 'playerPlacingLine';

        console.clear();
        console.log(`${entity.name}-idle`)
      // create game sprite
      let sprite =
        scene.add.sprite(-20, 0, entity.name)
        .setScale(scene.game.canvas.offsetHeight / 210)
        .setDepth(10)
        .setOrigin(0.5)
        .play(`${entity.name}-idle`, false, Math.floor(Math.random() * 3));
      let characterId = String(character.id);
      // add character with sprite to the global game state!
      global.gameState[characterType] = {
        ...global.gameState[characterType],
        [characterId]: {
          ...character,
          sprite,
        },
      };
      // add placingSpot.character getter to empty spot in placing line
      global[p] = {
        ...global[p],
        [emptySpotInLine]: Object.defineProperty(
          global[p][emptySpotInLine],
          'character',
          {
            get: function() {
              const character = global.gameState[characterType][characterId];
              if (!character) {
                return null;
              } else {
                return global.gameState[characterType][characterId];
              }
            },
          })
      };

      // animate spawning
      if (!character.enemy) {
        global.isAnimating = true;
        const coordinates = actions.coordinatesForEntity(character);
        sprite.setPosition(-20, coordinates.y);
        scene.tweens.add({
          targets: [sprite],
          x: coordinates.x,
          duration: 375,
          onStart() {
            sprite.play(`${character.entity.name}-walk`);
          },
          onComplete() {
            sprite.play(`${character.entity.name}-idle`);
            global.isAnimating = false;
          },
        });
      }

      return global.gameState[characterType][character.id];
    },
    coordinatesForEntity(character): { x: number, y: number } {
      let scene: any = this;
      // place them in our game state
      let placingLine = character.enemy
        ? global.enemyPlacingLine
        : global.playerPlacingLine;
      let spotInLine: string = _.findKey({...placingLine}, (spot) => {
        const characterInSpot = spot.character;
        return !!characterInSpot && characterInSpot.id == character.id
      });

      const canvasWidth = scene.game.canvas.offsetWidth;
      const canvasHeight = scene.game.canvas.offsetHeight;

      // begin placing the enemies at 60% of the screen width AND enemies at 35% of the screen width
      let bx = character.enemy ? 0.6 : 0.35;
      // begin placing the characters at 80% of the screen height
      let by = 0.8;
      
      // space the characters horizontally by 8% of the screen width
      let run = 0.08;
      // space the characters vertically by 2% of the screen height
      let rise = 0.02;

      // in the grassy mountains scene ...
      if (global.currentStage.name === 'mountains') {
        // begin placing characters at 75% of the screen height
        by = 0.7;
        rise = 0.04;
      }

      // place players backwards horizontally (start from right-most user)
      if (!character.enemy) {
        run *= -1;
      }

      const input = Number(spotInLine);

      // slope intercept form
      const coordinates = {
        X: input * run + bx,
        Y: input * rise + by,
      };

      return {
        x: canvasWidth * coordinates.X,
        y: canvasHeight * coordinates.Y,
      };
    },
    despawnCharacter(id) {
      let character: CombatCharacter = global.gameState.players[id] || global.gameState.enemies[id];

      if (!character) {
        return;
      }

      let cat = character.enemy
        ? global.gameState.enemies
        : global.gameState.players;
      
      // remove character from game state;
      delete cat[id];

      // remove character from placing line
      if (character.enemy) {
        global.enemyPlacingLine = _.mapObject(global.enemyPlacingLine, (spot) => {
          let newSpot = {...spot};
          const enemyInSpot = spot.character;
          if (!enemyInSpot || enemyInSpot.id === character.id) {
            // set placingSpot.character to a getter that returns null
            Object.defineProperty(newSpot, 'character', {
              get: function() { return null },
            });
          }
          return newSpot;
        });
      } else {
        global.playerPlacingLine = _.mapObject(global.playerPlacingLine, (spot, i) => {
          let newSpot = {...spot};
          const playerInSpot = spot.character;
          if (!playerInSpot || playerInSpot.id === character.id) {
            // set placingSpot.character to a getter that returns null
            Object.defineProperty(newSpot, 'character', {
              get: function() { return null },
            });
          }
          return newSpot;
        });
      }

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
      let scene: Scene = game.scene.scenes[0];

      if (global.targetHand) {
        return console.warn('target hand already added')
      };

      let config!: { index: number; side: 0|1 };
      // find a valid spot withing both placing lines to place the target hand in
      _.each(
        [..._.pairs(global.playerPlacingLine), ..._.pairs(global.enemyPlacingLine)],
        (pair) => {
        if (config) {
          return;
        }
        const key = pair[0];
        const character: CombatCharacter | null = pair[1].character;
        if (!character) {
          return;
        }
        if (character && character.sprite.depth === 15) {
          config = {
            index: Number(key),
            side: character.enemy ? 1 : 0,
          };
        }
      });

      if (!config) {
        console.warn('No config to add target hand');
        return;
      }

      global.currentTargetIndex = config.index;
      global.currentTargetSide = config.side;

      global.targetHand = scene.add.image(0, 0, 'select-target')
        .setScale(scene.game.canvas.offsetHeight / 17500);
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
        throw new Error('No target hand in game controller');
      }

      global.targetHand.x = character.sprite.x - character.sprite.width
      global.targetHand.y = character.sprite.y
    },
    animateEvents(events: CombatEvent[], i = 0) {
      global.isAnimating = true;
      const event = events[i];
      const next = events[i + 1];

      if (!event) return global.isAnimating = false;

      animations.animateEvent(event)
      .then(() => {
        if (!!next) {
          actions.animateEvents(events, i + 1);
        } else {
          let aliveEnemies = _.filter(global.gameState.enemies, e => e.entity.health > 0);
          let alivePlayers = _.filter(global.gameState.players, p => p.entity.health > 0);

          if (!aliveEnemies.length || !alivePlayers.length && global.gameState.turn % 2 == 0) {
            AudioManager.stopAll();
            AudioManager.playOnce(alivePlayers.length ? 'combatSuccess' : 'combatFail');
            setTimeout(() => {
              global.isAnimating = false;
            }, 5000);
          } else {
            setTimeout(() => {
              global.isAnimating = false;
              if (global.gameState.turn % 2 === 0) {
                store.commit('SET_COMBAT_GAME_SELECTION_MODE', 'ACTION');
              }
            }, 1000);
          }
        }
      })
      .catch((err: string) => {
        console.warn(err);
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
  };
  return game;
}

/*
  GameController generator function
*/
export default function (): GameController {
  let gameController: GameController = {
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
    game: null,
    gameInitialized: false,
    currentTargetSide: 0,
    currentTargetIndex: 1,
    _gameClouds: null,
    _fadeScreen: null,
    currentStage: {
      name: null,
      imgs: [],
    },
    targetHand: null,
    selectedAction: null,
    showGUI: false,
    isAnimating: false,
    playerPlacingLine: {},
    enemyPlacingLine: {},
    gameIntervals: {},
    launch() {
      if (!this.game) {
        this.game = newGame(this);
      }
    },
    destroyGame() {
      // stop any audio playing
      AudioManager.stopAll();
      // stop any intervals set
      _.forEach(gameController.gameIntervals, (i: number) => {
        clearInterval(i);
      });
      // destroy the phaser game instance
      if (gameController.game) {
        gameController.game.destroy();
        gameController.game = null;
      }
  
      this.gameInitialized = false;
    },
    // this will be binded to the game on launch
    keyMonitor(event: KeyboardEvent) {
      if (!gameController.game) {
        return console.warn('Key monitor attempted to run but no game has been initialized');
      }

      let scene: any = gameController.game.scene.scenes[0];
      if (Date.now() - scene.cursorMoveDate <= 100) {
        return;
      }
      scene.cursorMoveDate = Date.now();

      let indexDirection: string | null = null;
      let side: 0 | 1 | null = null;

      switch (event.key.toUpperCase()) {
        case 'W':
          indexDirection = 'up';
          break;
        case 'S':
          indexDirection = 'down';
          break;
        case 'A':
          side = 0;
          break;
        case 'D':
          side = 1;
          break;
        case 'ESCAPE':
          store.commit('SET_COMBAT_GAME_SELECTION_MODE', 'ACTION');
          AudioManager.playOnce('cursorBack');
          return;
      }

      /* user is moving up/down */
      if (indexDirection) {
        const placingLine = gameController.currentTargetSide == 0
          ? this.playerPlacingLine
          : this.enemyPlacingLine;
        const characters = this.currentTargetSide === 0
          ? gameController.gameState.players
          : gameController.gameState.enemies;
        
        // algorith to find next occupied spot in the specified direction (up or down)
        let j = this.currentTargetIndex;
        for (const key in placingLine) {
          let p = placingLine[j];
          if (indexDirection == 'down') {
            j = p.nextIndex;
          } else {
            j = p.prevIndex;
          }

          const characterInSpot = placingLine[j].character;
          // if found (new) next occupied spot
          if (
            characterInSpot &&
            characterInSpot.sprite.depth === 15 &&
            this.currentTargetIndex !== j
          ) {
            this.currentTargetIndex = j;
            // sounds effect
            AudioManager.playOnce('cursorMove');
            break;
          }
        }
      }
      // user is moving left/right
      else if (typeof side === 'number') {
        if (side === this.currentTargetSide) {
          return;
        }
        const newPlacingLine = side == 0
          ? this.playerPlacingLine
          : this.enemyPlacingLine;
        const characters = this.currentTargetSide === 0
          ? gameController.gameState.players
          : gameController.gameState.enemies;

        const newIndex = _.findKey({...newPlacingLine}, (spot) => {
          const character = spot.character;
          return !!character && character.sprite.depth === 15;
        });
        if (newIndex) {
          this.currentTargetSide = side;
          this.currentTargetIndex = Number(newIndex);
        }
        // sound effect
        AudioManager.playOnce('cursorMove');
      }
      // user is making a selection
      else if (event.key.toUpperCase() === 'ENTER') {
        // sound effect
        AudioManager.playOnce('cursorSelect');
        const placingLine = gameController.currentTargetSide == 0
          ? gameController.playerPlacingLine
          : gameController.enemyPlacingLine;

        const target = placingLine[gameController.currentTargetIndex].character;

        if (!target) {
          return console.warn('Null character selected as target');
        }
        if (!gameController.selectedAction) {
          return console.warn('Null selectedAction provided when selecting target');
        }
        store.dispatch('SOCKET_EMIT', [
          'COMBAT_ROOM_ACTION', {
            receiverId: target.id,
            action: gameController.selectedAction,
          }
        ]);
      }
    },
    resizeMonitor() {
      if (!gameController.game || !gameController.gameInitialized) {
        return;
      }
      const width = window.innerWidth * .98;
      const height = window.innerHeight * .68;
      gameController.game.resize(width > 920 ? 920 : width < 300 ? 300 : width, height);
    },
    highlightCharacters(category) {
      if (!gameController.gameInitialized || !gameController.game) {
        return;
      }
      const scene = gameController.game.scene.scenes[0];

      // ADD fade screen ...
      if (!gameController._fadeScreen) {
        gameController._fadeScreen = scene.add.rectangle(0, 0, scene.game.canvas.offsetWidth, scene.game.canvas.offsetHeight, 0x000)
          .setAlpha(0.5)
          .setDepth(14)
          .setOrigin(0, 0);
      }

      // category = true
      // ADD highlight all characters
      if (category === true) {
        _.each({...gameController.gameState.players, ...gameController.gameState.enemies}, (character) => {
          if (character.sprite.depth != 15) {
            character.sprite.setDepth(15);
          }
        });
      }
      // category = false
      // REMOVE highlights all characters
      else if (category === false) {
        _.each({...gameController.gameState.players, ...gameController.gameState.enemies}, (character) => {
          if (character.sprite.depth != 10){
            character.sprite.setDepth(10);
          }
        });
      }
      // category = 'players' / 'enemies'
      // ADD highlight all category
      else if (typeof category === 'string') {
        const oppositeCategory = category === 'enemies'
          ? 'players'
          : 'enemies';
        _.each(gameController.gameState[category], (character) => {
          if (character.sprite.depth != 15) {
            character.sprite.setDepth(15);
          }
        });
        _.each(gameController.gameState[oppositeCategory], (character) => {
          if (character.sprite.depth != 10) {
            character.sprite.setDepth(10);
          }
        });
      }
    },
    selectAction(action) {
      gameController.selectedAction = action;
      store.commit('SET_COMBAT_GAME_SELECTION_MODE', 'TARGET');
    }
  }

  return gameController;
};
