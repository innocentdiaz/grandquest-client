import Phaser from 'phaser';
import _ from 'underscore';

/*
  Import images
*/

/*
  Landscapes
*/
// Country
import countryPlatformImage from '@/assets/img/landscapes/country/platform.png';
import countryTreesImage from '@/assets/img/landscapes/country/trees.png';
import countryMountainsImage from '@/assets/img/landscapes/country/mountains.png';
import countryCloudsImage from '@/assets/img/landscapes/country/clouds.png';

/*
  Spritesheets
*/
import  AdventurerSheet from '@/assets/img/spritesheets/adventurer-sheet.png';
/*

*/
import SelectionHand from '@/assets/img/icon/select-target-hand.png';
import { CombatRoom } from '@/types';

/*
  Declare interfaces
*/
interface GameInterface {
  // new Phaser.Game
  game: any;
  // Used to manipulate the game
  actions:  {
    [actionName: string]: any,
  };
  // Stores important game variables
  global: {
    gameState: any;
    gameInstance: {};
    gameCanvas: any;
    gameCreated: boolean;
    gameClouds: any;
    targetHand: any;
    playerPlacingLine: PlacingLine;
    enemyPlacingLine:  PlacingLine;
  };
}
interface PlacingLine {
  [index: number]: {
    character:  boolean;
    next:       number;
    prev:       number;
  }
}

/*
  Launch function
  Will return a GameInterface object
*/
function launch(gameState: CombatRoom) {
  let global = {
    // state from the server
    gameState: gameState,
    // new Phaser.Game
    gameInstance: {},
    // when game.created() is called
    gameCreated: false,
    gameCanvas: null,
    gameClouds: null,
    targetHand: null,
    playerPlacingLine: {
      1: {
        character: false,
        next: 2,
        prev: 0,
      },
      2: {
        character: false,
        next: 3,
        prev: 1,
      },
      3: {
        character: false,
        next: 0,
        prev: 2,
      },
    },
    enemyPlacingLine: {
      0: {
        character: false,
        next: 1,
        prev: 3,
      },
      1: {
        character: false,
        next: 2,
        prev: 0,
      },
      2: {
        character: false,
        next: 3,
        prev: 1,
      },
      3: {
        character: false,
        next: 0,
        prev: 2,
      },
    },
  };

  let game = new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
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
        // set game instance globally
        global.gameInstance = this;
        global.gameCanvas = document.querySelector('#combat canvas');
      },
      create() {
        /*
          Load images asyncronously
        */

        let imagesLoaded = 0;

        _.each([
          ['country-platform', countryPlatformImage],
          ['country-trees-bg', countryTreesImage],
          ['country-mountains-bg', countryMountainsImage],
          ['country-clouds-bg', countryCloudsImage],
        ], (a, i, l) => {
          const name = a[0];
          const src = a[1];

          const img = new Image();
          img.src = src;

          img.onload = () => {
            this.textures.addImage(name, img);

            imagesLoaded++;
            if (imagesLoaded === l.length) {
              actions.addBackground.bind(this)();
            }
          }
        });
        
        // this.textures.addBase64('selection-hand', SelectionHand);
        // this.textures.addSpriteSheet('adventurer', AdventurerSheet, { frameWidth: 50, frameHeight: 37 }).setDisplaySize(window.innerWidth);

        // init animations for entities
        // for(id in entityTypes) {
        //   entityTypes[id].init();
        // }
        global.gameCreated = true
      },
      update() {
        // move the clouds around
        if (global.gameClouds) {
          global.gameClouds.tilePositionX += 0.085;
        }
      },
    },
  });

  const actions = {
    addBackground() {
      /*
        Handy dimensions
      */
      const canvasHeight = global.gameCanvas.offsetHeight;

      /*
        Country background
      */
      // how many times the 67% of canvas height fits into the original image height
      const exponential = (canvasHeight * 0.67) / 142;
      // dimensions to fit this percentage
      const countryWidth = 384 * exponential;
      const countryHeight = 202 * exponential;

      // add each image in order
      _.each([
        'country-mountains-bg',
        'country-clouds-bg',
        'country-trees-bg',
        'country-platform',
      ], (name, i, l) => {
        // clouds are parallax
        const img = this.add.tileSprite(0, 0, countryWidth, countryHeight, name)
          .setDepth(i) // z coordinate
          .setScale(canvasHeight/ 202)
          .setOrigin(0);
        if (name === 'country-clouds-bg') {
          // set them to the game instance
          global.gameClouds = img
        } else {
          // // extraHeight because each layer goes 5% higher
          // const r = l.length - (i + 1);
          // const extraHeight = r * (canvasHeight * 0.05);

          // this.add.image(0, canvasHeight - extraHeight, name)
          // .setDepth(i) // z coordinate
          // .setDisplaySize(countryWidth, countryHeight)
          // .setOrigin(0, 1);
        }
      });
    }
  };

  let gameInterface = {
    game,
    global,
    actions,
  }

  return gameInterface;
}

export default launch;
