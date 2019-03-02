<template>
  <div class="shop-main" ref="shop-main">
    <!-- Left-side panel -->
    <div class="npc-container">
      <div class="content">
        <img class="logo" :src="require(`../assets/img/icon/${shopName}.png`)" alt="Shop logo">
        <div id="npc-frame">
          <img :src="require(`../assets/img/icon/people/${npcName.toLowerCase()}.png`)" :alt="npcName">
          <div id="npc-name">
            {{npcName}}
          </div>
          <div id="npc-data">
            <button v-on:click="speak">
              Speak to {{npcName}}
            </button>
          </div>
          <div class="speech-bubble">
            Welcome, young traveller
          </div>
        </div>
      </div>
    </div>
    <!-- Selection Window -->
    <div class="GUI" :style="{ backgroundImage: `url(${require('../assets/img/backgrounds/' + shopName + '.png')})` }">
      <div class="user-control abs" v-if="!socket.connected">
        <h2>Offline</h2>
        <span>You don't appear to be connected to the server. You can not make any transactions unless you are online.</span>
      </div>
      <div class="user-control abs" v-else-if="!player.authenticated">
        <h2>Hmmm...</h2>
        <span>It doesn't look like you are logged in... Please log in order to make transactions!</span>
      </div>
      <!-- Sign container -->
      <div class="sign">
        <ul id="gui-selection-list">
          <li
            v-for="(option, index) in currentScreenObject"
            :key="option.title"
            :class="`${option.disabled ? 'disabled' : ''} ${currentCursorIndex == index ? 'active' : ''}`"
          >
            {{ option.title }}
          </li>
        </ul>
      </div>
    </div>
  </div> 
</template>
<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { State, Mutation, Action } from 'vuex-class';
import { Player, SocketState } from '@/types';
import AudioManager from '@/game/audio-manager';
import _ from 'underscore';

@Component
export default class Shop extends Vue {
  @State public player!: Player;
  @State public socket!: SocketState;
  @Action public SOCKET_EMIT: any;
  @Mutation public SET_HEADER_VISIBILITY!: any;

  @Prop()
  public shopName!: string;
  @Prop()
  public exitShop!: () => void;
  // GUI state
  public moveCursorDelta: number = Date.now();
  public currentCursorIndex: number = 0;
  public currentScreen: string = 'root';

  public speechAnimationInterval: any = null;
  public shops: { [shopName: string]: any } = {
    'monokai-village/potions-shop': {
      npcName: 'Even',
      npcSpeak: [
        'Sorry but our beauty potions probably wouldn\'t work on you.',
        'If you\'re looking for a love potion, I\'ve got bad news for you.',
        'Yes, I\'ve got the concoction you\'re looking for, just follow me into the cellar.',
        'I think some herbal tea would fix your stomach problems!',
        'We don\'t sell quackery, we sell magic!',
      ],
      guiMasterObject: {
        // screens
        'root': [
          // options
          { title: 'Buy', description: 'Buy from Even\'s potions', to: 'buy', disabled: false },
          { title: 'Sell', description: 'Sell potions from your own inventory', to: 'sell', disabled: false, select: null },
          { title: 'Exit',
            description: 'Back to the map',
            to: null,
            disabled: false,
            select: () => {
              this.animateSpeech('See you around, bozo.', () => setTimeout(() => {
                const shopMainEl = document.querySelector('.shop-main');
                if (!shopMainEl) {
                  return;
                }
                shopMainEl.classList.add('hide');
                this.exitShop();
              }, 1500));
            },
          },
        ],
        'buy': [
          { title: 'Back', description: '', to: 'root', disabled: false, select: null },
          ..._.map({
              'heal-potion': { title: 'Health I', price: 11, description: 'Regenerates 25 health points when consumed' },
              'energy-potion': { title: 'Energy I', price: 16, description: 'Recharges 15 energy points when consumed' },
            }, ({ title, description, price }, id) => ({
              title: `${title} - ${price} gold`,
              description,
              to: null,
              disabled: this.player && this.player.gold < price,
              select: () => {
                this.SOCKET_EMIT({
                  name: 'ITEM_TRANSACTION',
                  params: [
                    {
                      shop: 'potions-shop',
                      item: id,
                    },
                    (err: any) => {
                      if (err) {
                        this.animateSpeech(err);
                      }
                    }
                  ]
                });
              },
            })
          )
        ],
        'sell': [
          { title: 'Back', description: '', to: 'root', disabled: false, select: null },
        ]
      }
    },
    'monokai-village/village-gate': {
      npcName: 'Daelen',
      npcSpeak: [
        'I used to be an adventurer like you.',
        'Are you sure you\'re supposed to be wandering the village all by yourself?',
      ],
      guiMasterObject: {
        // screens
        'root': [
          // options
          { title: 'Order Caravan', description: 'Send a caravan on an expedition for treasure', to: 'caravan', disabled: false },
          { title: 'Exit',
            description: 'Back to the map',
            to: null,
            disabled: false,
            select: () => {
              this.animateSpeech('See you around, bozo.', () => setTimeout(() => {
                const shopMainEl = document.querySelector('.shop-main');
                if (!shopMainEl) {
                  return;
                }
                shopMainEl.classList.add('hide');
                this.exitShop();
              }, 1500));
            },
          },
        ],
        'caravan': [
          { title: 'Back', description: '', to: 'root', disabled: false, select: null },
        ],
      }
    }
  }

  public mounted() {
    if (!this.shops.hasOwnProperty(this.shopName)) {
      throw new Error('Unknown shop name passed to Shop.vue: ' + this.shopName);
    }
    this.animateSpeech('Welcome young traveller. What do you seek?');

    document.addEventListener('keydown', this.keyMonitor, true);
  }
  public keyMonitor(event: any) {
    event.preventDefault();
    if (Date.now() - this.moveCursorDelta <= 100) {
      return
    }
    if (!this.player.authenticated || !this.socket.connected) {
      return
    }
    this.moveCursorDelta = Date.now();
    switch (event.key.toUpperCase()) {
      case 'W':
        this.moveCursor('up');
        break;
      case 'A':
        this.moveCursor('left');
        break;
      case 'S':
        this.moveCursor('down');
        break;
      case 'D':
        this.moveCursor('right');
        break;
      case 'ENTER':
        this.selectOption();
        break;
    }
  }
  public destroyed() {
    document.removeEventListener('keydown', this.keyMonitor, true);
  }
  public animateSpeech(speech: string, cb?: () => void) {
    const speechBubble = document.querySelector('.speech-bubble');
    if (!speechBubble) {
      return;
    }
    while (speechBubble.firstChild) {
      speechBubble.removeChild(speechBubble.firstChild);
    }

    const id = `${speech.trim().toLowerCase()}${Date.now()}`;
    const a = speech.split('');

    if (this.speechAnimationInterval === id) return;
    this.speechAnimationInterval = id;

    a.forEach((s, i) => {
      setTimeout(() => {
        if (this.speechAnimationInterval === id) {
          const charEl = document.createElement('span');
          charEl.innerHTML = s;
          speechBubble.appendChild(charEl);
          charEl.classList.add('fade-in');
          if (i === a.length - 1) {
            this.speechAnimationInterval = '';
            if (typeof cb === 'function') {
              cb();
            }
          }
        }
      }, 35 * (i + 1));
    });
  }
  public speak() {
    const randomSpeech = this.currentShop.npcSpeak[Math.floor(Math.random() * this.currentShop.npcSpeak.length)];
    this.animateSpeech(randomSpeech)
  }
  public selectOption() {
    let option = this.currentScreenObject[this.currentCursorIndex];

    if (typeof option.select === 'function') {
      option.select();
    } else if (option.to) {
      this.currentScreen = option.to;
      this.currentCursorIndex = 0;
      AudioManager.playOnce('cursorSelect');
    }
  }
  public moveCursor(direction: string) {
    const options = this.currentScreenObject;
    const currentIndex = this.currentCursorIndex;
    let nextIndex = currentIndex;
    let j = currentIndex;

    // Move the cursor index
    if (direction === 'up') {
      if (currentIndex > 0) {
        j--;
      } else {
        j = options.length - 1;
      }
    } else if (direction === 'down') {
      if (currentIndex < options.length - 1) {
        j++;
      } else {
        j = 0;
      }
    } else {
      return;
    }
    AudioManager.playOnce('cursorMove');
    this.currentCursorIndex = j;
  }
  @Watch('player')
  onChildChanged(cur: Player, prev: Player) {
    if (cur.gold !== prev.gold && (prev.gold === 0 && cur.gold !== 0)) {
      AudioManager.playOnce('goldDrop');
    }
  }
  get currentShop() {
    return this.shops[this.shopName];
  }
  get npcName() {
    if (!this.currentShop) return 'Daelen'; // default npc

    const npcName = this.currentShop.npcName;
    return npcName.charAt(0).toUpperCase() + npcName.substr(1);
  }
  get currentScreenObject() {
    return this.currentShop.guiMasterObject[this.currentScreen];
  }
}
</script>
<style lang="scss">
.shop-main {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 100vh;
  overflow: hidden;
  opacity: 0;
  animation-name: fade-in;
  animation-duration: .5s;
  animation-play-state: running;
  animation-fill-mode: forwards;

  &.hide {
    animation-name: fade-out;
  }
  
  .npc-container {
    background: #e6e6e6;
    .logo {
      margin: 1em 0;
      width: 275px;
    }
    .content {
      padding: 0 20px;
      h1 {
        margin: 10px 0 0 0;
        text-transform: capitalize;
      }
      #npc-frame {
        margin: 0 auto;
        width: 210px;
        img {
          width: inherit;
          user-select: none;
        }
        #npc-name {
          background: #3b63bb;
          color: white;
          padding: 5px;
          text-align: center;
        }
        #npc-data {
          display: flex;
          flex-direction: column;
          align-items: stretch;

          background: #1d2560;
          padding: 10px 15px;

          button {
            background: linear-gradient(to bottom, white, rgb(202, 202, 202));
            border: none;
            padding: 5px 10px;
            font-weight: bold;
            color: #3b63bb;
            &:hover {
              background: linear-gradient(to bottom, white, rgb(177, 177, 177));
            }
          }
        }
        .speech-bubble {
          font-family: 'Courier New', Courier, monospace;
          background: white;
          font-weight: bold;
          position: relative; border-radius: .4em;
          padding: 15px;
          margin-top: 10px;
        }
        .speech-bubble:after {
          content: '';
          position: absolute; 
          top: 0; 
          left: 85%;
          width: 0;
          height: 0;
          border: 1.375em solid transparent;
          border-bottom-color: #fffcf7; 
          border-top: 0;
          border-left: 0;
          margin-left: -0.687em;
          margin-top: -1.375em;
        }
      }
    }
  }
  .GUI {
    flex: 1;
    position: relative;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    height: 100% !important;
    font-size: large;

    .sign {
      background: url('../assets/img/textures/wood.png');
      background-repeat: repeat;
      border-radius: 5px;
      margin-top:2em;
      margin-left: 4em;
      margin-right: 4em;
      max-height: 50%;
      &::before {
        content: '|';
        font-size: large;
        position: absolute;
        top: 0;
        left: 25%;
        background: white;
        height: 2.5em;
      }
      &::after {
        content: '|';
        font-size: large;
        position: absolute;
        top: 0;
        right: 25%;
        background: white;
        height: 2.5em;
      }
    }

    .user-control {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: rgb(43, 43, 43);
      h2 {
        margin-top: 0;
        font-size: medium;
      }
      small, img {
        display: none;
      }
      &.abs {
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: 5em 1em;
        max-width: 1020px;
        max-height: 45vh;
        display: block;
      }
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
}
</style>

