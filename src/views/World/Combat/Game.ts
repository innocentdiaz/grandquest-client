import Phaser from 'phaser';
import _ from 'underscore';
import { CombatRoom } from '@/types';

/*
  Import images
*/
import countryPlatformImage from '@/assets/img/landscapes/country/platform.png';
import countryTreesImage from '@/assets/img/landscapes/country/trees.png';
import countryMountainsImage from '@/assets/img/landscapes/country/mountains.png';
import countryCloudsImage from '@/assets/img/landscapes/country/clouds.png';
import  AdventurerSheet from '@/assets/img/spritesheets/adventurer-sheet.png';
import SelectionHand from '@/assets/img/icon/select-target-hand.png';


/*
  Declare interfaces
*/
interface GiActions {
  [actionName: string]: () => any,
}
interface GiGlobal {
  gameState: any;
  gameInstance: {};
  gameCanvas: any;
  gameCreated: boolean;
  gameClouds: any;
  targetHand: any;
  playerPlacingLine: PlacingLine;
  enemyPlacingLine:  PlacingLine;
};
interface GameInterface {
  // new Phaser.Game
  game: any;
  // Used to manipulate the game
  actions:  GiActions;
  // Stores important game variables
  global: GiGlobal
}
interface PlacingLine {
  [index: number]: {
    character:  boolean;
    nextIndex:       number;
    prevIndex:       number;
  }
}

/*
  Launch function
  Will return a GameInterface object
*/
function launch(gameState: CombatRoom) {
  let global: GiGlobal = {
    // state from the server
    gameState: gameState,
    // new Phaser.Game
    gameInstance: {},
    // when game.created() is called
    gameCreated: false,
    gameCanvas: null,
    gameClouds: null,
    targetHand: null,
    // generate the placing line object using the range of players allowed
    playerPlacingLine: _.reduce(_.range(1, gameState.maxPlayers + 1), (memo, index) => {
      return {
        ...memo,
        [index]: {
          character: false,
          nextIndex: index >= gameState.maxPlayers ? 1 : index + 1,
          prevIndex: index === 1 ? gameState.maxPlayers : index - 1,
        },
      };
    }, {}),
    // generate placing line object for enemies in a range from 1-4
    enemyPlacingLine: _.reduce(_.range(1, 5), (memo, index) => {
      return {
        ...memo,
        [index]: {
          character: false,
          nextIndex: index > 5 ? 1 : index + 1,
          prevIndex: index === 1 ? 4 : index - 1,
        },
      };
    }, {}),
  };

  let game: any = new Phaser.Game({
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

        // BIND GiActions to game instance
        _.each(actions, (func: any, action: string) => {
          actions[action] = func.bind(this);
        });
      },
      create() {
        /*
          Load images asyncronously
        */

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

            if (i === l.length - 1) {
              actions.addBackground();
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

  const actions: GiActions = {
    addBackground(): void {
      /*
        Handy dimensions
      */
      const canvasWidth = global.gameCanvas.offsetWidth;
      const canvasHeight = global.gameCanvas.offsetHeight;

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
    updateGameState(): void {

    },
  };

  let gameInterface: GameInterface = {
    game,
    global,
    actions,
  }

  return gameInterface;
}

export default launch;
