import $vm from '@/main';
import { TweenMax } from 'gsap';
import _ from 'underscore';

/*
  Assets
*/
import PotionsShopLabelImage from '@/assets/img/icon/monokai-village/potions-shop.png';
import VillageGateLabelImage from '@/assets/img/icon/monokai-village/village-gate.png';
import CombatLabelImage from '@/assets/img/icon/monokai-village/heros-trial.png';
import CombatShopLabelImage from '@/assets/img/icon/monokai-village/combat-shop.png';

import store from '@/store';
import audioManager from '../audio-manager';

const newGame = (global: GameInterface): any => {

  const preload = () => {
    const map = document.getElementById('map');
    const container = document.getElementById('map-container');
    if (!map || !container) {
      throw new Error('Found no #map || #map-container element to add labels to');
    }

    let labelsLoaded = 0;
    _.each([
      {
        tooltip: {
          title: 'Potions Shop',
          description: 'Monokai Village\'s finest alchemy shop.',
        },
        shop: 'monokai-village/potions-shop',
        coordinates: ['50%', '28%'],
        src: PotionsShopLabelImage,
      },
      {
        tooltip: {
          title: 'Village Gate',
          description: 'Visit the gates of the Monokai Village.',
        },
        shop: 'monokai-village/village-gate',
        coordinates: ['25%', '86%'],
        src: VillageGateLabelImage,
      },
      {
        tooltip: {
          title: 'Hero\'s Trial',
          description: 'Feeling brave? Venture into the unknowns of the Monokai landscapes and slay monsters for great rewards!',
        },
        route: '/world/games',
        coordinates: ['75%', '86%'],
        src: CombatLabelImage,
      },
      {
        tooltip: {
          title: 'El Combatánte',
          description: 'Prepare yourself for battle!',
        },
        shop: 'monokai-village/combat-shop',
        coordinates: ['73%', '60%'],
        src: CombatShopLabelImage,
      },
    ], (label, i, list) => {
      const {
        shop,
        route,
        tooltip,
        coordinates,
        src,
      } = label;

      const img = new Image();
      img.src = src;
      img.style.left = coordinates[0];
      img.style.top = coordinates[1];
      img.style.opacity = '0.75';
      img.style.position = 'absolute';
      img.style.height = '2.6em';
      img.style.cursor = 'pointer';

      img.addEventListener('mouseover', () => {
        img.style.opacity = '1';
        global.tooltip = tooltip;
      });
      img.addEventListener('mouseleave', () => {
        img.style.opacity = '0.75';
        global.tooltip = {};
      });
      img.addEventListener('click', () => {
        if (global.paused) {
          return;
        }
        global.tooltip = {};
        global.paused = true;

        audioManager.playOnce('cursorSelect');

        TweenMax.to(
          container,
          0.8,
          {
            opacity: 0,
            onComplete() {
              if (shop) {
                global.chosenShop = shop;
              } else if (route) {
                $vm.$router.push(route);
              }
            }
          },
        );
      });

      map.appendChild(img);

      // load the image
      img.onload = () => {
        labelsLoaded++;
        if (labelsLoaded === list.length && global.gameRunning) {
          global.gameLoaded = true;
          create();
        }
      }
    });
  }
  const create = () => {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) {
      throw new Error('Failed to find #map-container on game creation');
    }

    // fade in
    TweenMax.fromTo(
      mapContainer,
      0.8,
      { opacity: 0 },
      { opacity: 1 },
    );

    step();
  }
  const step = () => {
    if (!global.gameLoaded || global.paused) {
      return;
    }

    const container = document.getElementById('map-container');
    const map = document.getElementById('map');

    if (!map || !container) {
      throw new Error('Could no find #map or #map-container in game step');
    }

    // update sky colors!
    const worldHour = new Date(store.state.world.timeOfDay).getHours();
    let bg = '';

    if (worldHour >= 5 && worldHour < 9) {
      // morning
       bg = 'linear-gradient(#89b8ff, #89b8ff, #fdaea3, #fdaea3)';
    } else if (worldHour >= 9 && worldHour < 19) {
      // day
      bg = 'linear-gradient(#1c6fcf, #1c6fcf, #95d6f8, #95d6f8)';
    } else if (worldHour >= 19 && worldHour < 21) {
      // evening
      bg = 'linear-gradient(#52adff, #52adff, #ed8d45, #ed8d45)';
    } else {
      // night
      bg = 'linear-gradient(#01071f, #01071f, #663c94, #663c94)';
    }

    container.style.backgroundImage = bg;

    // animate panning
    const pointer = global.pointer;
    const speed = 8;

    if (pointer.hovering) {
      // left / right
      const containerWidth = container.clientWidth;
      const mapWidth = map.clientWidth;
      const leftVal = parseInt(map.style.left || '0px', 10) ;

      if (pointer.x < containerWidth * 0.25) {
        if (leftVal < -speed) {
          map.style.left = (leftVal + speed) + "px"; 
        }
      } else if (pointer.x > containerWidth * 0.75) {
        if (leftVal > containerWidth - mapWidth + speed) {
          map.style.left = (leftVal - speed) + "px"; 
        }
      }
      
      // up / down
      const containerHeight = container.clientHeight;
      const mapHeight = map.clientHeight;
      const topVal = parseInt(map.style.top || '0px', 10);

      if (pointer.y < containerHeight * 0.25) {
        if (topVal < -speed) {
          map.style.top = (topVal + speed) + "px"; 
        }
      } else if (pointer.y > containerHeight * 0.75) {
        if (topVal >= containerHeight - mapHeight + speed) {
          map.style.top = (topVal - speed) + "px";
        }
      }
    }
    
    if (global.gameLoaded) {
      window.requestAnimationFrame(step);
    }
  }

  preload();
};

/**
* Contains an interface for sharing data outside of the Phaser.Game instance
*/
interface GameInterface {
  gameRunning: boolean;
  gameLoaded: boolean;
  tooltip: {
    title?: string;
    description?: string;
  };
  chosenShop: string | null;
  paused: boolean;
  pointer: { x: number; y: number; hovering: boolean; };
  launch: () => void;
  exitShop: () => void;
  destroyGame: () => void;
  mouseMonitor: (event: MouseEvent) => void;
}

/**
* This is the game interface creator
* @returns returns a new GameInterface
*/
export default (): GameInterface => {
  const global: GameInterface = {
    tooltip: {},
    chosenShop: null,
    paused: false,
    gameRunning: false,
    gameLoaded: false,
    pointer: { x: 0, y: 0, hovering: false },
    launch() {
      if (!global.gameRunning) {
        newGame(global);
        global.gameRunning = true;
      }
    },
    destroyGame() {
      if (global.gameRunning) {
        global.gameLoaded = false;
        global.gameRunning = false;
      }
    },
    mouseMonitor(event) {
      if (!global.gameLoaded) {
        return;
      }

      global.pointer = {
        x: event.clientX,
        y: event.clientY,
        hovering: true,
      };
    },
    exitShop() {
      if (!global.gameRunning) {
        return;
      }
      const container = document.getElementById('map-container');
      if (!container) {
        throw new Error('Could not find #map-container on exit shop');
      }

      global.chosenShop = null;

      TweenMax.to(
        container,
        0.8,
        {
          opacity: 1,
          onComplete() {
            global.paused = false;
          }
        },
      );
    },
  };

  return global;
};
