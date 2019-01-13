import Phaser from 'phaser';
import _ from 'underscore';

/*
  Import types
*/
import { CombatRoom } from '@/types';
import { Character } from '@/game/types';

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
  Import data
*/
import Entities from '@/game/data/characters';

/*
  Declare interfaces
*/
interface GiActions {
  [actionName: string]: any,
}
interface GiGlobal {
  gameState: CombatRoom;
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
  global: GiGlobal;
}
interface PlacingLine {
  [index: number]: {
    character: Character|null;
    nextIndex: number;
    prevIndex: number;
  }
}
/*
  Launch function
  Will return a GameInterface object
*/
function launch(gameState: CombatRoom) {
  let global: GiGlobal = {
    // state from the server
    gameState: {
      ...gameState,
      players: {},
      enemies: {},
      turn: null, // so actions know we just joined
    },
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
          character: null,
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
          character: null,
          nextIndex: index >= 4 ? 1 : index + 1,
          prevIndex: index === 1 ? 4 : index - 1,
        },
      };
    }, {}),
  };

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
          Bind entity generators to game instance
        */
        for(const id in Entities) {
          Entities[id] = Entities[id].bind(this);
        }

        /*
          Load images asyncronously
        */
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

          if (type === 'image') {
            const img = new Image();
            img.src = src;

            // when image loads
            img.onload = () => {
              this.textures.addImage(name, img);
              assetsLoaded++;
  
              // when all images are done loading
              if (assetsLoaded === l.length) {
                actions.initGame();
              }
            }
          } else if (type === 'spritesheet') {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              this.textures.addSpriteSheet(
                name,
                img,
                { frameWidth: spriteDimensions[0], frameHeight: spriteDimensions[1] }
              );

              assetsLoaded++;
  
              // when all images are done loading
              if (assetsLoaded === l.length) {
                actions.initGame();
              }
            }
          }
        });
        
        // this.textures.addBase64('selection-hand', SelectionHand);
      },
      update() {
        // move the clouds around
        if (global.gameClouds) {
          global.gameClouds.tilePositionX += 0.072;
        }
      },
    },
  });

  const actions: GiActions = {
    initGame() {
      // add animations
      this.anims.create({
        key: 'adventurer-idle',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 0, end: 3 }),
        frameRate: 3,
        repeat: -1,
      });
      this.anims.create({
        key: 'slime-idle',
        frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 7 }),
        frameRate: 7,
        repeat: -1,
      });

      console.log('game initialized');
      
      // make background;
      actions.addBackground();

      global.gameCreated = true
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
          allPlayersInGameState[id] = actions.spawnCharacter(playerOnNetwork)
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
          allEnemiesInLocalState[id] = actions.spawnCharacter(enemyOnNetwork)//.updateHealthBar();
        }

        // var healthOnNetwork = enemyOnNetwork.entity.health;

        // enemyInLocal
        //   .setHealth(healthOnNetwork)
        //   // .updateHealthBar();
      }
      /*
        EVENTS UPDATING
      */

      // the network is at another turn
      if (global.gameState.turn != networkGameState.turn) {
        // we have not JUST joined the match
        if (global.gameState.turn != null) {
          // show us the events of the last match
          // var appliedEvents = networkGameState.turnEvents[localGameState.turn];

          // actions.animateEvents(appliedEvents);
        }

        global.gameState.turn = networkGameState.turn;
        
        if (global.gameState.turn % 2) {
          console.log('Enemy turn');
        } else {
          console.log('Player turn');
          // GuiManager.setSelectionMode('TARGET');
        }
      }

      /*
        Add target hand
      */
      if (!global.targetHand && global.gameState.turn % 2 === 0) {
        actions.addTargetHand()
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
        gameStateCategory = global.gameState.players
        placingLine = global.playerPlacingLine;
      }

      // find empty spot in line
      let emptySpotInLine: any = _.findKey(placingLine, (spot) => !spot.character);

      if (!emptySpotInLine) {
        console.error('Attempted to spawn character but there are not empty spaces in ', placingLine);
        return null;
      }

      // spawn the player and place them in the gameState (gameStateCategoryPlacing)
      let gameStateCategoryPlacing = gameStateCategory[character.id];

      const canvasWidth = this.game.canvas.offsetWidth;
      const canvasHeight = this.game.canvas.offsetHeight;

      let coordinatesForEntity = character.enemy
        ? {
            x: canvasWidth * (0.6 + (0.08 * emptySpotInLine)), 
            y: canvasHeight * ((0.9 - (0.02 * Object.keys(placingLine).length)) + (0.02 * emptySpotInLine)),
          }
        : {
            x: this.game.canvas.offsetWidth * 0.25,
            y: this.game.canvas.offsetHeight * 0.85,
          };

      gameStateCategoryPlacing = selectedEntityGenerator(
        character,
        coordinatesForEntity,
      );

      // reference the spawned player in their placing line
      placingLine[emptySpotInLine].character = gameStateCategoryPlacing;

      return gameStateCategoryPlacing;
    },
    addTargetHand() {
      if (global.targetHand) {
        return console.warn('target hand already added')
      };

      let spot: null | { character: Character } = _.find(global.playerPlacingLine, (index) => !!index.character);

      if (!spot) {
        console.error('No player to add target hand to');
        return
      }
      const character = spot.character;

      global.targetHand = 
        this.add.image(character.sprite.x, character.sprite.y, 'select-hand')
        .setDepth(11); // z-coordinate above the player
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
    animateEvents() {
      console.log('animating events');
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
