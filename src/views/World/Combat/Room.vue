<template>
  <div class="combat-root">
    <header>
      <ul>
        <router-link to="/combat">Exit</router-link>
      </ul>
      <h1 id="title" v-if="gameInterface.gameInitialized && !gameInterface.isAnimating && gameInterface.gameState.playState">
        Combat - {{ combatGame.gameState.title }}, Level - {{ gameInterface.gameState.level }}, Turn - {{ gameInterface.gameState.turn }}
      </h1>
    </header>
    <!-- Main screen -->
    <div id="main" v-bind:style="{ display: gameInterface.gameState.playState ? 'flex' : 'none' }">
      <div id="canvas-parent"></div>
      <!-- Display -->
      <div class="display" v-if="socket.loading">
        <p>Connecting to server</p>
      </div>
      <div class="display" v-else-if="!socket.connected">
        <p>You are not connected to the server</p>
      </div>
      <!-- GUI -->
      <ActivityIndicator v-if="!gameInterface.gameInitialized"/>
      <div
        v-else-if="currentPlayer" 
        :class="
          gameInterface.isAnimating || currentPlayer.selectionStatus === -1
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
    <div id="outcomes" v-if="gameInterface.gameInitialized && !gameInterface.gameState.playState">
      <div id="main">
        <h1>Level {{gameInterface.gameState.level}} complete</h1>
        <h2 class="subtitle">Level completed in {{gameInterface.gameState.turn}} turns</h2>
        <div v-if="currentLevelRecord[this.player.id]">
          <h2>Stats</h2>
          <p>Damage received: {{currentLevelRecord[this.player.id].damageReceived}}</p>
          <p>Damage dealt: {{currentLevelRecord[this.player.id].damageDealt}}</p>
          <p>Health points: {{Object.values(currentLevelRecord[this.player.id].healed).reduce((a, h) => a + h.total, 0)}}</p>
          <p>Killed: {{Object.keys(currentLevelRecord[this.player.id].killed).length}}</p>
          <p>Gold: {{currentLevelRecord[this.player.id].gold}}</p>
          <h2>Rewards</h2>
          <p>
            <span v-for="(healed, name) in currentLevelRecord[this.player.id].healed" :key="name">
              Healed {{name}} {{healed.times}} times for {{healed.reward}} gold
            </span>
            <span v-for="(killed, name) in currentLevelRecord[this.player.id].killed" :key="name">
              Killed {{killed.times}} {{ killed.times > 1 ? `${name}s` : name }} for {{killed.reward}} gold
            </span>
          </p>
        </div>
        <div v-else>
          <p>No stats available</p>
        </div>
      </div>
      <aside>
        <div class="player-container" v-for="(player, id) in currentLevelRecord" v-bind:key="id">
          <img v-bind:src="require(`../../../assets/img/icon/${gameInterface.gameState.players[id].entity.name}.png`)" alt="Player entity">
          <div class="content">
            <h3 class="title">{{gameInterface.gameState.players[id].username}} <span>{{combatGame.gameState.readyToContinue[id] ? '- Ready!' : ''}}</span></h3>
            <div class="grid">
              <p>Damage dealt: {{player.damageDealt}}</p>
              <p>Damage taken: {{player.damageReceived}}</p>
              <p>Health points: {{player.healed.total}}</p>
              <p>Killed: {{Object.keys(player.killed).length}}</p>
              <p>Gold: {{player.gold}}</p>
            </div>
          </div>
        </div>
      </aside>
      <button v-if="!combatGame.gameState.readyToContinue[player.id]" v-on:click="SOCKET_EMIT({ name: 'COMBAT_ROOM_READY' })">
        <img src="@/assets/img/icon/1bit-swords.png" alt="Battle!">
        <br>
        READY
      </button>
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
import CombatInterface, { GameInterface } from '@/game/places/combat';

// audio
import { Howl } from 'howler';
import cursorMoveSrc from '@/assets/audio/cursor-move.mp3';
import cursorSelectSrc from '@/assets/audio/cursor-select.mp3';

interface MasterObjectOption {
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
  @Mutation public SET_COMBAT_GAME_SELECTION_MODE: any;
  @Mutation public RESET_GAME_STATE: any;

  public description: string = '';

  public cursorSelectAudio = new Howl({
    src: [ cursorSelectSrc ],
  });
  public cursorMoveAudio = new Howl({
    src: [ cursorMoveSrc ],
  });

  public gameInterface: GameInterface = CombatInterface();
  public currentScreen = 'root';
  public currentCursorIndex = 0;
  public cursorMoveDate = Date.now();

  public beforeMount() {
    this.RESET_GAME_STATE('COMBAT_ROOM');
  }
  public mounted() {
    const { roomID } = this.$route.params;
    this.gameInterface.launch();

    this.socketJoinRoom({ name: 'COMBAT_ROOM', parameter: roomID });
    this.SET_HEADER_VISIBILITY(false);

    document.addEventListener('keydown', (event) => {
      event.preventDefault();

      if (Date.now() - this.cursorMoveDate <= 100) {
        return;
      }
      this.cursorMoveDate = Date.now();

      if (this.combatGame.selectionMode === 'ACTION') {
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
          case 'ESCAPE':
            if (this.combatGame.selectionMode === 'ACTION') {
              this.currentScreen = 'root';
              this.SET_COMBAT_GAME_SELECTION_MODE('TARGET');
            }
            break;
        }
      }
    });
  }
  public destroyed() {
    if (this.gameInterface) {
      this.gameInterface.destroyGame();
    }
    this.SET_HEADER_VISIBILITY(true);
    this.socketLeaveRoom('COMBAT_ROOM');
    this.RESET_GAME_STATE('COMBAT_ROOM')
  }

  public moveCursor(direction: string) {
    if (this.combatGame.selectionMode === 'ACTION' && this.currentPlayerSelectionStatus === 0) {
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

      this.cursorMoveAudio.play();

      this.description = options[j].description;

      this.currentCursorIndex = j;
    }
  }
  public selectOption() {
    this.cursorSelectAudio.play();

    if (this.combatGame.selectionMode == 'ACTION') {
      const currentScreenObj = this.guiMasterObject[this.currentScreen];
      const currentIndex = this.currentCursorIndex;
      const selectedOption: MasterObjectOption = currentScreenObj[currentIndex];

      if (selectedOption.disabled) {
        return;
      }

      // this is a route
      if(selectedOption.to) {
        this.currentScreen = selectedOption.to;
        this.currentCursorIndex = 0;
      } else if (selectedOption.select) {
        // remove and update index if player is removed / changed
        const placingLine = this.gameInterface.currentTargetSide == 0
          ? this.gameInterface.playerPlacingLine
          : this.gameInterface.enemyPlacingLine;

        const target = placingLine[this.gameInterface.currentTargetIndex].character;

        // TODO: player.onDisconnect => IF player is target THEN setSelectionMode('TARGET');
        if (!target) {
          return console.error('No target available');
        }

        this.SOCKET_EMIT({
          name: 'COMBAT_ROOM_ACTION',
          param: {
            receiverId: target.id,
            action: selectedOption.select
          },
        });
      }
    }
  }
  get guiMasterObject(): GuiMasterObject {
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

    const selectedTarget = this.gameInterface.currentTargetSide === 0
    ? this.gameInterface.playerPlacingLine[this.gameInterface.currentTargetIndex]
    : this.gameInterface.enemyPlacingLine[this.gameInterface.currentTargetIndex];

    const currentPlayer: Character | null = this.currentPlayer;

    if (!currentPlayer) {
      console.warn('No current player');
      return guiMasterObject;
    }
    if (!selectedTarget || !selectedTarget.character) {
      return guiMasterObject;
    }

    // PARSE ROOT
    const parsedRoot: MasterObjectOption[] = [
      { title: 'Attacks', description: '', to: 'attacks', disabled: false, select: null },
      { title: 'Potions', description: '', to: 'potions', disabled: false, select: null },
    ];

    // enable options based on external conditions
    if (!selectedTarget.character.enemy) {
      parsedRoot[0].disabled = true;
    }
    // push them to the guiMasterObject
    guiMasterObject.root = parsedRoot;

    // PARSE ATTACKS
    const attacks = currentPlayer.entity.attacks;

    guiMasterObject.attacks.push({
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
      title: 'Back',
      to: 'root',
      description: '',
      disabled: false,
      select: null,
    });
    const potions = _.filter(currentPlayer.entity.inventory, (i: InventoryItem) => i.type === 'potion');

    potions.forEach((item: InventoryItem) => {
      guiMasterObject.potions.push({
        title: item.amount > 1 ? `${item.name} x${item.amount}` : item.name,
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
    // PARSE ACTIONS
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
.combat-root {
  height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: black;
  header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to bottom, rgb(22, 22, 22), rgba(24, 24, 24, 0.6), rgba(24, 24, 24, 0.4), rgba(0, 0, 0, 0));
    color: white;
    #title {
      margin-left: 10px;
    }
    ul {
      display: block;
      margin: 0;
      padding: 10px;
      background: black;
    }
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
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: row;
    overflow: hidden;
    color: white;
    background: black;
    padding-top: 25px;
    background: linear-gradient(to right, black 66.6%, #ff2828 5%);
    button {
      background: black;
      color: white;
      padding: 25px 10px;
      border: none;
      transition: .2s all ease-in-out;
      img {
        height: 2.85em;
      }
      &:hover {
        padding: 25px 30px;
      }
    }
  }
  #outcomes > div {
    padding: 0.8em;
  }
  #outcomes #main {
    flex: 2;
    background: black;
    h2 {
      font-size: larger;
    }
  }
  #outcomes aside {
    background: rgb(255, 40, 40);
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .player-container {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      padding: 25px 5px;
      img {
        height: 3.5em;
        width: 3.5em;
        border: 5px inset rgb(124, 61, 32);
        border-radius: 2px;
        background: rgb(199, 40, 40);
      }
      .content {
        flex: 1;
        align-self: stretch;
        margin-left: 10px;
        .title {
          font-size: large;
          margin: 0;
        }
        .grid {
          display: grid;
          grid-gap: 5px;
          grid-template-columns: auto auto;
          p {
            margin: 1px 0;
          }
        }
      }
    }
  }
  .display {
    position: absolute;
    top: 1em;
    bottom: 1em;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Press Start 2P', monospace;
  }
  .GUI {
    background: rgba(24, 24, 24, 0.856);
    display: inline-flex;
    align-items: stretch;
    justify-content: space-between;
    height: 27vh;
    font-family: 'Press Start 2P', monospace;
    padding: 10px;
    color: white;

    transition: .75s height ease-in-out;
  }
  .GUI > div {
    flex: 1;
  }
  .GUI li {
    list-style-type: none;
    transition: .1s all ease-in-out;
  }
  .GUI li.active {
    color: rgb(199, 199, 199);
    padding-left: 2px;
    list-style-image: url('../../../assets/img/icon/select-hand.png');
  }
  .GUI .left {
    border-right: 2px solid white
  }
  .GUI .right {
    border-left: 2px solid white
  }
  .GUI li.disabled {
    color: rgb(87, 87, 87);
  }
  .GUI.disabled li.active {
    color: grey;
    padding-left: 2px;
    list-style-image: url('../../../assets/img/icon/select-hand.png');
  }
  .GUI .bar-container {
    height: 10px;
    width: 100%;
    max-width: 200px;
    border: 1px solid grey;
  }
  .GUI #health-bar {
    background: #56f33e;
    height: 10px;
  }
  .GUI #energy-bar {
    background: rgb(0, 218, 218);
    height: 10px;
  }
  .GUI.faded {
    opacity: 0.5;
  }
  .GUI.hidden {
    opacity: 0;
  }
}
</style>
