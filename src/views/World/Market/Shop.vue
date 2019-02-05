<template>
  <div class="shop-main">
    <div class="npc-container">
      <button id="exit" v-on:click="$router.replace({ name:'market' })">
        <h2>Exit</h2>
      </button>
      <!-- Left-side panel -->
      <div class="content">
        <h1>{{shopName}}</h1>
        <div id="npc-frame">
          <img :src="require(`../../../assets/img/icon/people/${npcName.toLowerCase()}.png`)" :alt="npcName">
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
    <div class="GUI">
      <div class="user-control">
        <h2>{{player.username}}</h2>
        <div id="stats">
          <h2>Stats</h2>
          <p>Gold: {{player.gold}}</p>
          <p>Weapon Health: {{player.weapon_health}}</p>
        </div>
      </div>
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
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State, Mutation, Action } from 'vuex-class';
import { Player } from '@/types';

@Component
export default class Shop extends Vue {
  @State public player!: Player;
  @Action public SOCKET_EMIT: any;
  @Mutation public SET_HEADER_VISIBILITY!: any;

  // GUI state
  public moveCursorDelta: number = Date.now();
  public currentCursorIndex: number = 0;
  public currentScreen: string = 'root';

  public speechAnimationInterval: any = null;
  public shopName: string = '';
  public shops = {
    blacksmith: {
      npcName: 'Daelen',
      npcSpeak: [
        'I used to be an adventurer just like you',
        'Are you supposed to be wandering the markets all by yourself?',
      ],
      guiMasterObject: {
        // screens
        'root': [
          // options
          { title: 'Repairs', description: 'Repair damaged weapons and armor', to: 'repairs', disabled: false, select: 'REPAIR_WEAPON' },
          { title: 'Upgrades', description: 'Level up your weapons', to: 'upgrades', disabled: false, select: null },
        ],
        'upgrades': [
          { title: 'Back', description: '', to: 'root', disabled: false, select: null },
        ],
      }
    },
  }

  public beforeMount() {
    const { name } = this.$route.params;

    if (!this.shops.hasOwnProperty(name)) {
      return this.$router.replace({
        name: 'market',
      });
    }

    this.shopName = name;
  }
  public mounted() {
    this.SET_HEADER_VISIBILITY(false);
    this.animateSpeech('Welcome young traveller. What do you seek?');

    document.addEventListener('keydown', (event) => {

      if (Date.now() - this.moveCursorDelta <= 100) {
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
    });
  }
  public destroyed() {
    this.SET_HEADER_VISIBILITY(true);
    this.shopName = '';
  }
  public animateSpeech(speech: string) {
    const speechBubble = document.querySelector('.speech-bubble');
    if (!speechBubble) throw new Error('no speech bubble el available to animate');
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

    if (option.select) {
      this.SOCKET_EMIT({
        name: 'MARKET_BLACKSMITH_SELECT',
        params: [
          option.select, 
          (message: any) => {
            if (typeof message === 'string') {
              this.animateSpeech(message);
            }
          }
        ],
      });
    } else if (option.to) {
      this.currentScreen = option.to;
      this.currentCursorIndex = 0;
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

    this.currentCursorIndex = j;
  }
  get currentShop() {
    return this.shops[this.shopName];
  }
  get npcName() {
    if (!this.currentShop) return 'Daelen'; // default npc

    let npcName = this.currentShop.npcName;
    return npcName.charAt(0).toUpperCase() + npcName.substr(1);
  }
  get currentScreenObject() {
    return this.currentShop.guiMasterObject[this.currentScreen];
  }
}
</script>
<style lang="scss">
.shop-main {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 100vh;
  overflow: hidden;
  
  .npc-container {
    background: #e6e6e6;

    #exit {
      display: absolute;
      background: black;
      color: white;
      font-family: 'Courier New', Courier, monospace;
      border: none;
      font-weight: bold;
    }
    .content {
      padding: 0 20px;
      h1 {
        margin: 10px 0 0 0;
        text-transform: capitalize;
      }
      #npc-frame {
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
    background: rgb(26, 26, 26);
    height: 100% !important;
    font-size: large;

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
    }
  }

  .fade-in {
    transform: translateY(-30px);
    opacity: 0;
    animation-name: fade-down;
    animation-duration: .35s;
    animation-play-state: running;
    animation-fill-mode: forwards;
  }
  @keyframes fade-down {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>

