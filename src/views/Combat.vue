<template>
  <div v-on:keydown="keyMonitor" class="combat-root">
    <!-- LOADING SCREEN -->
    <div v-if="roomConnection !== 1" id="loading-screen" :class="`${typeof roomConnection === 'string' ? 'blur' : ''}`">
      <img src="@/assets/img/icon/heros-trial.png" alt="Hero's Trial" class="icon" v-on:click="$router.push(`/world`)">
      <div class="tip">Fun fact: <br/> Lorem Ipsum this is some sample text for tips</div>
      <div id="loading-error-container" v-if="typeof roomConnection === 'string'">
        <div id="loading-error">
          <h1>Error</h1>
          <p id="loading-error-text">{{roomConnection}}</p>
          <button v-on:click="$router.replace('/world/games')">EXIT</button>
        </div>
      </div>
      <div v-else class="loading-text">
        {{
          !socket.connected
          ? 'Connecting to server...'
          : !player.authenticated
          ? 'Authenticating player...'
          : 'Joining room...'
        }} <ActivityIndicator/></div>
    </div>
    <!-- COMBAT GAME -->
    <div class="combat-game">
      <!-- header -->
      <header v-if="gameInterface.showGUI">
        <ul>
          <router-link to="/world">Exit</router-link>
          <div class="level" v-if="gameInterface.gameState.playState && currentPlayer">
            <div class="icon">
              <span id="level-label">{{currentPlayer.level}}</span>
            </div>
            <div class="bar">
              <p id="xp-label"></p>
              <div id="xp-juice"></div>
            </div>
          </div>
        </ul>
        <h1 id="title" v-if="gameInterface.gameInitialized && !gameInterface.isAnimating && gameInterface.gameState.playState">
          {{ combatGame.gameState.title }}, level {{ gameInterface.gameState.level }}
        </h1>
      </header>
      <!-- Main screen -->
      <div id="main">
        <div id="canvas-parent"></div>
        <!-- Display -->
        <div class="display" v-if="socket.loading">
          <p>Connecting to server</p>
        </div>
        <div class="display" v-else-if="!socket.connected">
          <p>You are not connected to the server</p>
        </div>
        <div class="display" v-else-if="!gameInterface.gameInitialized">
          <ActivityIndicator/>
        </div>
        <div v-else-if="gameInterface.showGUI && currentPlayerSelectionStatus === 1" class="GUI">
          <p>OK! Waiting for other players...</p>
        </div>
        <div
          v-else-if="currentPlayer" 
          :class="
            gameInterface.isAnimating || currentPlayerSelectionStatus === -1
              ? 'GUI hidden'
              : combatGame.selectionMode === 'TARGET' && currentPlayerSelectionStatus === 0
              ? 'GUI faded'
              : 'GUI'
          "
        >
          <div>
            <h2 class="health" v-if="currentPlayer">
              HP {{currentPlayer.entity.health}}/{{currentPlayer.entity.maxHealth}}
            </h2>
            <h2 class="health" v-else>HP ...</h2>
            <div class="bar-container" v-if="currentPlayer">
              <div id="health-bar" v-bind:style="{ width: `${currentPlayer.entity.health / currentPlayer.entity.maxHealth * 100}%` }"></div>
            </div>
            <h2 class="energy" v-if="currentPlayer">
              EP {{currentPlayer.entity.energy}}/{{currentPlayer.entity.maxEnergy}}
            </h2>
            <h2 v-else>EP ...</h2>
            <div class="bar-container" v-if="currentPlayer">
              <div id="energy-bar" v-bind:style="{ width: `${currentPlayer.entity.energy / currentPlayer.entity.maxEnergy * 100}%` }"></div>
            </div>
            <h3>Players: {{ combatGame.gameState.playerCount }} / {{ combatGame.gameState.maxPlayers }}</h3>
          </div>
          <div>
            <ul id="gui-selection-list">
              <li
                v-for="(option, index) in currentScreenObject"
                :key="option.title"
                :class="`${option.disabled ? 'disabled' : ''} ${combatGame.selectionMode !== 'TARGET' && combatGame.selectionMode !== 'HIDDEN' && currentCursorIndex == index ? 'active' : ''}`"
              >
                {{ option.title }}
              </li>
            </ul>
          </div>
          <div id="gui-description-container">
            <p v-html="description"></p>
          </div>
        </div>
      </div>
      <!-- Outcomes screen -->
      <div id="outcomes" v-if="gameInterface.gameInitialized && !gameInterface.gameState.playState && currentLevelRecord && !gameInterface.isAnimating">
        <div class="content">
          <aside>
            <div class="player-container" v-for="(player, id) in currentLevelRecord.players" v-bind:key="id">
              <img v-bind:src="require(`../assets/img/icon/people/${gameInterface.gameState.players[id].entity.name}.png`)" class="avatar" alt="Player entity">
              <div class="grid">
                <h3 class="title">{{gameInterface.gameState.players[id].username}}</h3>
                <h2 v-if="combatGame.gameState.readyToContinue[id]">Ready!</h2>
                <div v-else>
                  <p>Dmg: {{player.damageDealt}}</p>
                  <p>Gold: {{player.gold}}</p>
                  <p>XP: {{player.xp}}</p>
                </div>
              </div>
            </div>
          </aside>
          <div class="main">
            <h1>Level {{gameInterface.gameState.level}} {{currentLevelRecord.won ? 'completed' : 'lost'}}!</h1>
            <h2 class="subtitle">Level completed in {{gameInterface.gameState.turn}} turns</h2>
            <p>Damage dealt: {{currentLevelRecord.players[this.player.id].damageDealt}}</p>
            <p>Gold Earned: {{currentLevelRecord.players[this.player.id].gold}}</p>
            <p>XP Gained: {{currentLevelRecord.players[this.player.id].xp}}</p>
            <button>
              Ready!
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Action, State, Mutation } from 'vuex-class';
import ActivityIndicator from '@/components/ActivityIndicator.vue';
import { SocketState, Player, CombatGame } from '@/types';
import { Character, Attack, InventoryItem } from '@/game/types';
import _ from 'underscore';
import io from 'socket.io-client';
import api from '@/api';
import GameController from '@/game/places/combat';
import AudioManager from '@/game/audio-manager';

interface MasterObjectOption {
  id: string;
  title: string;
  description: string;
  to: null|string;
  disabled: boolean;
  select: {
    id: string;
    type: string;
  } | null;
}
interface GuiMasterObject {
  [root: string]: MasterObjectOption[];
  potions: MasterObjectOption[];
  attacks: MasterObjectOption[];
  actions: MasterObjectOption[];
}

@Component({
  components: { ActivityIndicator },
})
export default class CombatRoom extends Vue {
  @State public player!: Player;
  @State public socket!: SocketState;
  @State public combatGame!: CombatGame;
  @Action public socketJoinRoom: any;
  @Action public socketLeaveRoom: any;
  @Action public SOCKET_EMIT: any;
  @Mutation public SET_HEADER_VISIBILITY: any;
  @Mutation public SET_COMBAT_GAME_STATE: any;
  @Mutation public SET_COMBAT_GAME_SELECTION_MODE: any;
  @Mutation public RESET_GAME_STATE: any;
  @Mutation public SET_SOCKET_ROOM: any;

  public roomConnection: -1 | 0 | 1 | string = -1; // -1 = not pending, 0 = pending, 1 = ok, 'string' = error

  public description: string = '';

  public gameInterface = GameController();
  public currentScreen = 'root';
  public currentCursorIndex = 0;
  public cursorMoveDate = Date.now();

  public mounted() {
    this.SET_HEADER_VISIBILITY(false);

    // add event listeners
    document.addEventListener('keydown', this.keyMonitor, true);
    window.addEventListener('resize', this.gameInterface.resizeMonitor, true);

    // combat hub connection attempt
    if (this.socket.connected && this.player.authenticated) {
      console.log('attempt connections attempt from mount');
      this.attemptConnection();
    }
  }
  public updated() {
    const { player, socket, roomConnection } = this;
    // on disconnect socket
    if (!socket.connected && roomConnection !== -1) {
      console.log('disconnect');
      this.roomConnection = -1;
    }
    // combat hub connection attempt
    if (socket.connected && player.authenticated && roomConnection === -1) {
      console.log('attempt connections attempt from update');
      this.attemptConnection();
    }
  }
  public destroyed() {
    if (this.gameInterface) {
      this.gameInterface.destroyGame();
    }
    this.SET_HEADER_VISIBILITY(true);
    this.SOCKET_EMIT(['COMBAT_ROOM_LEAVE']);
    this.RESET_GAME_STATE('COMBAT_ROOM');
    document.removeEventListener('keydown', this.keyMonitor, true);
    window.removeEventListener('resize', this.gameInterface.resizeMonitor, true);
  }
  public attemptConnection() {
    if (!this.socket.connected) {
      return console.warn('Attempted connection but socket is not connected');
    }
    if (this.roomConnection !== -1) {
      return console.warn('Attempted connection when roomConnection is not -1');
    }

    const { roomID } = this.$route.params;
    this.roomConnection = 0;
    console.log('Joining combat room');
    this.SOCKET_EMIT(['COMBAT_ROOM_CONNECT', roomID, (err?: string) => {
      if (!err) {
        this.roomConnection = 1;
        if (!this.gameInterface.game) {
          this.gameInterface.launch();
        }
      } else {
        this.roomConnection = err;
      }
    }]);
  }
  public keyMonitor(event: any) {
    if (Date.now() - this.cursorMoveDate <= 100 || this.gameInterface.isAnimating) {
      return;
    }
    this.cursorMoveDate = Date.now();

    if (this.combatGame.selectionMode === 'ACTION' && this.currentPlayerSelectionStatus === 0) {
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
    } else {
      this.gameInterface.keyMonitor(event);
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

    this.description = options[j].description;
    this.currentCursorIndex = j;
  }
  public selectOption() {
    const currentScreenObj = this.guiMasterObject[this.currentScreen];
    const currentIndex = this.currentCursorIndex;
    const selectedOption: MasterObjectOption = currentScreenObj[currentIndex];

    if (!selectedOption || selectedOption.disabled) {
      return;
    }
    AudioManager.playOnce('cursorSelect')
    // this is a route
    if(selectedOption.to) {
      this.currentScreen = selectedOption.to;
      this.currentCursorIndex = 0;
    } else if (selectedOption.select) {
      this.gameInterface.selectAction(selectedOption.select);
    }
  }
  get guiMasterObject() {
    let guiMasterObject: GuiMasterObject = {
      root: [],
      potions: [
        ],
      attacks: [
        ],
      actions: [
        ],
    };
    if (!this.gameInterface.gameInitialized) {
      return guiMasterObject
    }

    const currentPlayer: Character | null = this.currentPlayer;

    if (!currentPlayer) {
      console.warn('No current player');
      return guiMasterObject;
    }

    // PARSE ROOT
    const parsedRoot: MasterObjectOption[] = [
      { id: 'attacks', title: 'Attacks', description: '', to: 'attacks', disabled: false, select: null },
      { id: 'potions', title: 'Potions', description: '', to: 'potions', disabled: false, select: null },
    ];

    // push them to the guiMasterObject
    guiMasterObject.root = parsedRoot;

    // PARSE ATTACKS
    const attacks = currentPlayer.entity.attacks;

    guiMasterObject.attacks.push({
      id: 'back',
      title: 'Back',
      to: 'root',
      description: '',
      disabled: false,
      select: null,
    });

    _.pairs(attacks).forEach((pair: [string, Attack]) => {
      const id = pair[0];
      const attackInfo = pair[1];
      const disabled = attackInfo.stats.energy > currentPlayer.entity.energy;
      guiMasterObject.attacks.push({
        id: attackInfo.name,
        title: attackInfo.name,
        description: !disabled
          ?
          `
            Description - <br/>
            ${attackInfo.description} <br/>
            Stats - <br/>
            Energy: ${attackInfo.stats.energy} <br/>
            Base dmg: ${attackInfo.stats.baseDamage}
          ` : `Description - <br/> ...`,
        to: null,
        disabled,
        select: {
          type: 'attack',
          id,
        },
      });
    });
    // PARSE POTIONS
    guiMasterObject.potions.push({
      id: 'back',
      title: 'Back',
      to: 'root',
      description: '',
      disabled: false,
      select: null,
    });
    const potions = _.filter(currentPlayer.entity.inventory, (i: InventoryItem) => i.type === 'potion');

    potions.forEach((item) => {
      guiMasterObject.potions.push({
        id: item.id,
        title: item.amount > 1 ? `${item.name} (${item.amount})` : item.name,
        description: `
          Name: ${item.name} <br/>
          Quantity: ${item.amount}
        `,
        to: null,
        disabled: item.amount === 0,
        select: {
          type: 'item',
          id: item.id,
        },
      });
    });

    if (this.combatGame.selectionMode === 'ACTION') {
      let selectedOption = guiMasterObject[this.currentScreen][this.currentCursorIndex];
      if (!selectedOption) {
        this.currentScreen = 'root';
        this.currentCursorIndex = 0;
        selectedOption = guiMasterObject.root[0];
      }

      if (selectedOption.disabled) {
        this.gameInterface.highlightCharacters(false);
      } else if (
        this.currentScreen === 'attacks' ||
        selectedOption.id === 'attacks'
      ) {
        this.gameInterface.highlightCharacters('enemies');
      } else if (selectedOption.id === 'heal-potion') {
        this.gameInterface.highlightCharacters('players');
      } else {
        this.gameInterface.highlightCharacters(true);
      }
    }
    return guiMasterObject;
  }
  get currentPlayer(): Character | null {
    // if not authenticated
    const { id } = this.player;
    if (!id) {
      return null;
    }
    // if no game intialized
    if (!this.gameInterface.gameInitialized) {
      return null;
    }
    // if no player matching this player id
    if (!this.gameInterface.gameState.players.hasOwnProperty(id)) {
      return null;
    }
    return this.gameInterface.gameState.players[id];
  }
  get currentPlayerSelectionStatus(): number {
    if (!this.currentPlayer) {
      return 0;
    }
    return this.currentPlayer.selectionStatus;
  }
  get currentScreenObject() {
    if (this.combatGame.selectionMode === 'TARGET') {
      this.currentScreen = 'root';
      this.currentCursorIndex = 0;
    }
    return this.guiMasterObject[this.currentScreen];
  }
  get currentLevelRecord() {
    let level = this.gameInterface.gameState.level;
    return this.gameInterface.gameState.levelRecord[level]
  }
}
</script>
<style lang="scss" scoped>
$mainGreen: #9dff5c;
#loading-screen {
  background: rgb(19, 19, 19);
  color: white;
  position: absolute;
  width: 100%;
  height: 100vh;
  z-index: 50;
  &.blur {
    .icon {
      filter: blur(20px);
    }
    .tip {
      filter: blur(20px);
    }
    .loading-text {
      filter: blur(20px);
    }
  }
  .icon {
    cursor: pointer;
    position: absolute;
    top: 1em;
    left: 1em;
    height: 3rem;
  }
  .tip {
    position: absolute;
    top: 1em;
    right: 1em;
    max-width: 30%;
    font-size: larger;
    font-weight: bold;
  }
  .loading-text {
    position: absolute;
    bottom: 1em;
    left: 1em;
    display: inline-flex;
    align-items: center;
  }
  #loading-error-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: black;
    #loading-error {
      padding: 1em;
      background: white;
      text-align: center;
      border-radius: 1em;
      width: 50%;
      button {
        font-family: 'Press Start 2P', monospace;
        background: #d30938;
        color: white;
        border: none;
        box-shadow: 0px 0px 5px white;
        padding: 1em 2em;
        border-radius: 5px;
        &:hover {
          transform: scale(1.1);
        }
      }
    }
  }
}
.combat-root {
  height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: black;
  #canvas-parent {
    text-align: center;
  }
  header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to bottom, rgb(22, 22, 22), rgba(24, 24, 24, 0.6), rgba(24, 24, 24, 0.4), rgba(0, 0, 0, 0));
    color: white;
    z-index: 15;
    animation: fade-in 0.5s forwards;
    #title {
      font-family: 'Lora', serif;
      margin-left: 10px;
    }
    ul {
      display: block;
      margin: 0;
      padding: 0;
      background: black;
      min-height: 30px;
      padding: 0 10px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;

      .level {
        display: flex;
        flex-direction: row;
        align-items: center;
        span {
          z-index: 10;
        }
        .icon {
          height: 20px;
          width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          background-image: url('../assets/img/misc/gold-frame.png');
          background-position: center center;
          background-repeat: no-repeat;
          background-size: contain;
          height: 45px;
          font-size: 15px;
          margin-right: 10px;
        }
        .bar {
          position: relative;
          height: 20px;
          width: 250px;
          color: white;
          background: black;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid white;
          overflow: hidden;
          font-size: 15px;
          #xp-label {
            z-index: 6;
          }
          #xp-juice {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            background-image: linear-gradient(to bottom, #a700a7 80%, #800080);
            width: 0;
            z-index: 5;
            &.animated {
              background-color: rgb(189, 0, 189);
              transition: .3s all ease-in-out;
            }
          }
        }
      }
    }
  }

  .GUI {
    animation-name: slide-up;
    animation-duration: 0.5s;
    animation-fill-mode: forwards;
  }
  #main {
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: stretch;
    flex-direction: column;
    overflow: hidden;
  }
  #outcomes {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: 2s outcomes-fadein forwards;
    .content {
      position: relative;
      border-radius: 5px;
      background: white;
      margin: 2em 1.25em;
      min-width: 70%;
      min-height: 50%;
      max-height: 70%;
      display: flex;
      flex-direction: row;
      align-items: stretch;
      animation: 1s outcomes-scalein forwards;

      .main {
        flex: 4;
        padding: 0 1em;
        button {
          position: absolute;
          background: $mainGreen;
          color: white;
          border: none;
          bottom: 1em;
          right: 1em;
          font-size: 1.3em;
          padding: 5px 8px;
          border-bottom-right-radius: 5px;
          transition: .2s all ease-in-out;
          &:hover {
            transform: scale(1.1);
            border-radius: 5px;
            box-shadow: 3px 3px 3px rgb(161, 161, 161);
          }
        }
      }
      aside {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        box-shadow: 0 0 5px inset grey;

        .player-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin: 20px 10px 0 0;

          .avatar {
            align-self: flex-start;
            height: 3.5em;
          }
          .grid {
            .title {
              display: block;
              margin: 10px 0 5px 0;
            }
            p {
              margin: 2px 0;
            }
          }
        }
      }
    }
  }
  .display {
    position: absolute;
    top: 2em;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: 'Press Start 2P', monospace;
  }
}
@keyframes slide-up {
  from {
    transform: translateY(80vh);
  }
  to {
    transform: translateY(0px);
  }
}
@keyframes outcomes-fadein {
  from {
    background-color: transparent;
  }
  to {
    background-color: rgba(24, 24, 24, 0.6);
  }
}
@keyframes outcomes-scalein {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>
