import $vm from '@/main';
import Phaser from 'phaser';
import _ from 'underscore';

/*
  Assets
*/
import MonokaiBgImage from '@/assets/img/backgrounds/monokai-village/monokai-village.png';
import PotionsShopLabelImage from '@/assets/img/icon/monokai-village/potions-shop.png';
import VillageGateLabelImage from '@/assets/img/icon/monokai-village/village-gate.png';
import CombatLabelImage from '@/assets/img/icon/monokai-village/heros-trial.png';
import CombatShopLabelImage from'@/assets/img/icon/monokai-village/combat-shop.png';

import store from '@/store';

const newGame = (global: GameInterface): any => {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    pixelArt: true,
    // width set to 98% of window width withing range of 300 and 920 pixels
    width: window.innerWidth,
    height: window.innerHeight,
    // backgroundColor: '#7fb8f9',
    parent: 'canvas-parent',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
      },
    },
    scene: {
      preload() {
        let canvasParent = document.getElementById('canvas-parent');
        if (!canvasParent) {
          throw new Error('Phaser.js expected a parent element for the canvas, but at time of creating got none');
        }
      },
      create() {
        const self: any = this;
        /*
          Bind gameInterface.actions to `self`
        */
        _.each(actions, (func: any, action: string) => {
          actions[action] = func.bind(self);
        });
        /*
          Bind minor helper functions
        */
        self.vw = (str: string) => {
          const num = parseInt(str.substring(0, str.length - 1));
          const decimal = num / 100;
          return global._bg.displayWidth * decimal;
        }
        self.vh = (str: string) => {
          const num = parseInt(str.substring(0, str.length - 1));
          const decimal = num / 100;
          return global._bg.displayHeight * decimal;
        }

        let assetsLoaded = 0;
        _.each([
          { name: 'monokai-bg', type: 'image', src: MonokaiBgImage, spriteDimensions: [] },
          { name: 'potions-shop-label', type: 'image', src: PotionsShopLabelImage, spriteDimensions: [] },
          { name: 'village-gate-label', type: 'image', src: VillageGateLabelImage, spriteDimensions: [] },
          { name: 'combat-label', type: 'image', src: CombatLabelImage, spriteDimensions: [] },
          { name: 'combat-shop-label', type: 'image', src: CombatShopLabelImage, spriteDimensions: [] },
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
            method();
            assetsLoaded++;
            if (assetsLoaded === l.length) {
              actions.loadScene();
              global.gameInitialized = true;
              self.cameras.main.fadeIn(750);
            }
          }
        });
      },
      update() {
        const self: any = this;
        if (!global.gameInitialized) {
          return
        }

        
        var pointer = self.input.activePointer;

        console.clear();
        console.log('x', pointer.y);
        console.log(`g.c.oW',`, self.game.canvas.offsetHeight);
        // move camera
        if (pointer.x < self.game.canvas.offsetWidth * 0.25) {
          self.cameras.main.scrollX -= 5.5;
        }
        if (pointer.x > self.game.canvas.offsetWidth * 0.75) {
          self.cameras.main.scrollX += 5.5;
        }
        if (pointer.y < self.game.canvas.offsetHeight * 0.25) {
          self.cameras.main.scrollY -= 5.5;
        }
        if (pointer.y > self.game.canvas.offsetHeight * 0.75) {
          self.cameras.main.scrollY += 5.5;
        }
        

        // update sky colors
        global._skyGradient.clear();
        const worldHour = new Date(store.state.world.timeOfDay).getHours();
        if (worldHour >= 5 && worldHour < 9) {
          // morning
          global._skyGradient.fillGradientStyle(0x89b8ff, 0x89b8ff, 0xfdaea3, 0xfdaea3);
        } else if (worldHour >= 9 && worldHour < 19) {
          // day
          global._skyGradient.fillGradientStyle(0x1c6fcf, 0x1c6fcf, 0x95d6f8, 0x95d6f8);
        } else if (worldHour >= 19 && worldHour < 21) {
          // evening
          global._skyGradient.fillGradientStyle(0x52adff, 0x52adff, 0xed8d45, 0xed8d45);
        } else {
          // night
          global._skyGradient.fillGradientStyle(0x01071f, 0x01071f, 0x663c94, 0x663c94);
        }
        global._skyGradient
          .fillRect(0, 0, global._bg.displayWidth, global._bg.displayHeight)
          .setDepth(1);
      }
    }
  });

  /*
    Game actions
    (All methods within are binded to the game instance on game creation)
  */
  let actions: { [action: string]: any } = {
    loadScene() {
      const self: any = this;

      /*
        z-index 1 = sky gradient
        z-index 5 = map
        z-index 8 = labels
      */
      
      // map background
      global._bg = self.add.image(0, 0, 'monokai-bg')
        .setScale(self.game.canvas.offsetWidth / 980)
        .setOrigin(0, 0)
        .setDepth(5);
        
      // sky gradient
      global._skyGradient = self.add.graphics()
          .fillGradientStyle(0x89b8ff, 0x89b8ff, 0xfdaea3, 0xfdaea3, 1)
          .fillRect(0, 0, global._bg.displayWidth, global._bg.displayHeight)
          .setDepth(1);

      // configure main camera
      self.cameras.main
        .setZoom(1.25)
        .setBounds(0, 0, global._bg.displayWidth, global._bg.displayHeight - (global._bg.displayHeight * 0.10));

      // configure labels
      let potionsShopLabel = self.add.image(self.vw('60%'), self.vh('28%'), 'potions-shop-label')
        .setAlpha(0.75)
        .setDisplaySize(self.vw('20%'), self.vw('20%')*(99/502))
        .setDepth(8)
        .setInteractive()
        .on('pointerover', () => {
          potionsShopLabel.setAlpha(1);
          global.tooltip = {
            title: 'Potions Shop',
            description: 'Monokai Village\'s finest alchemy shop.',
          }
        })
        .on('pointerout', () => {
          potionsShopLabel.setAlpha(0.75);
          global.tooltip = {};
        })
        .on('pointerup', (pointer: any) => {
          // if pointer is still within image bounds when click is released
          if (!pointer.wasCancelled) {
            self.cameras.main.fadeOut(750);
            self.cameras.main.once('camerafadeoutcomplete', () => {
              global.chosenShop = 'monokai-village/potions-shop';
              global.tooltip = {};
              self.scene.pause();
              self.cameras.main.fadeIn(750);
            });
          }
        });

      let gateShopLabel = self.add.image(self.vw('37%'), self.vh('86%'), 'village-gate-label')
        .setAlpha(0.6)
        .setDisplaySize(self.vw('20%'), self.vw('20%')*(148/917))
        .setDepth(8)
        .setInteractive()
        .on('pointerover', () => {
          gateShopLabel.setAlpha(1);
          global.tooltip = {
            title: 'Village Gate',
            description: 'Visit the gates of the Monokai Village.',
          }
        })
        .on('pointerout', () => {
          gateShopLabel.setAlpha(0.6);
          global.tooltip = {};
        })
        .on('pointerup', (pointer: any) => {
          if (!pointer.wasCancelled) {
            self.cameras.main.fadeOut(750);
            self.cameras.main.once('camerafadeoutcomplete', () => {
              global.chosenShop = 'monokai-village/village-gate';
              global.tooltip = {};
              self.scene.pause();
              self.cameras.main.fadeIn(750);
            });
          }
        });
      
      let combatLabel = self.add.image(self.vw('85%'), self.vh('86%'), 'combat-label')
        .setAlpha(0.6)
        .setDisplaySize(self.vw('20%'), self.vw('20%')*(169/821))
        .setDepth(8)
        .setInteractive()
        .on('pointerover', () => {
          combatLabel.setAlpha(1);
          global.tooltip = {
            title: 'Hero\'s Trial',
            description: 'Feeling brave? Venture into the unknowns of the Monokai landscapes and slay monsters for great rewards!',
          }
        })
        .on('pointerout', () => {
          combatLabel.setAlpha(0.6);
          global.tooltip = {};
        })
        .on('pointerup', (pointer: any) => {
          if (!pointer.wasCancelled) {
            self.cameras.main.fadeOut(750);
            self.cameras.main.once('camerafadeoutcomplete', () => {
              $vm.$router.push('/world/games');
            });
          }
        });

      let combatShopLabel = self.add.image(self.vw('82%'), self.vh('61%'), 'combat-shop-label')
        .setAlpha(0.6)
        .setDisplaySize(self.vw('20%'), self.vw('20%')*(106/484))
        .setDepth(8)
        .setInteractive()
        .on('pointerover', () => {
          combatShopLabel.setAlpha(1);
          global.tooltip = {
            title: 'El Combatánte',
            description: 'Prepare yourself for battle!',
          }
        })
        .on('pointerout', () => {
          combatShopLabel.setAlpha(0.6);
          global.tooltip = {};
        })
        .on('pointerup', (pointer: any) => {
          if (!pointer.wasCancelled) {
            self.cameras.main.fadeOut(750);
            self.cameras.main.once('camerafadeoutcomplete', () => {
              global.chosenShop = 'monokai-village/combat-shop';
              global.tooltip = {};
              self.scene.pause();
              self.cameras.main.fadeIn(750);
            });
          }
        });
    },
  }

  return game;
}

/**
* Contains an interface for sharing data outside of the Phaser.Game instance
*/
interface GameInterface {
  gameInitialized: boolean;
  tooltip: {
    title?: string;
    description?: string;
  };
  chosenShop: string | null;
  _bg: any;
  _skyGradient: any;
  launch: () => void;
  exitShop: () => void;
  destroyGame: () => void;
  scrollMonitor: (event: WheelEvent) => void;
}

/**
* This is the game interface creator
* @returns returns a new GameInterface
*/
export default (): GameInterface => {
  let game: any = null;

  let global: GameInterface = {
    tooltip: {},
    chosenShop: null,
    _bg: null,
    _skyGradient: null,
    gameInitialized: false,
    launch() {
      if (!game) {
        game = newGame(global);
      }
    },
    destroyGame() {
      if (game) {
        game.destroy();
      }
    },
    scrollMonitor(event) {
      if (!game) {
        return;
      }
      if (event.deltaY < 0 && game.scene.scenes[0].cameras.main.zoom < 2) {
        game.scene.scenes[0].cameras.main.setZoom(game.scene.scenes[0].cameras.main.zoom + 0.1)
      }
      if (event.deltaY > 0 && game.scene.scenes[0].cameras.main.zoom > 1.15) {
        game.scene.scenes[0].cameras.main.setZoom(game.scene.scenes[0].cameras.main.zoom - 0.1)
      }
    },
    exitShop() {
      if (!game) {
        return;
      }
      global.chosenShop = null;
      game.scene.scenes[0].scene.resume()
    }
  };

  return global;
};
