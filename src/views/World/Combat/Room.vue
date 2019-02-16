<template>
  <div class="combat-root" v-on:keydown="keyMonitor">
    <header>
      <ul>
        <router-link to="/combat">Exit</router-link>
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
        Combat - {{ combatGame.gameState.title }}, Level - {{ gameInterface.gameState.level }}, Turn - {{ gameInterface.gameState.turn }}
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
      <!-- GUI -->
      <ActivityIndicator v-if="!gameInterface.gameInitialized"/>
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
    <div id="outcomes" v-if="gameInterface.gameInitialized && !gameInterface.gameState.playState">
      <div class="content">
        <aside>
          <div class="player-container" v-for="(player, id) in currentLevelRecord" v-bind:key="id">
            <img v-bind:src="require(`../../../assets/img/icon/people/${gameInterface.gameState.players[id].entity.name}.png`)" class="avatar" alt="Player entity">
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
          <h1>Level {{gameInterface.gameState.level}} complete!</h1>
          <h2 class="subtitle">Level completed in {{gameInterface.gameState.turn}} turns</h2>
          <p>Damage dealt: {{currentLevelRecord[this.player.id].damageDealt}}</p>
          <p>Gold Earned: {{currentLevelRecord[this.player.id].gold}}</p>
          <p>XP Gained: {{currentLevelRecord[this.player.id].xp}}</p>
          <button>
            Ready!
          </button>
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
import CombatInterface, { GameInterface } from '@/game/places/combat';
import AudioManager from '@/game/audio-manager';

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
  @Mutation public SET_COMBAT_GAME_STATE: any;
  @Mutation public SET_COMBAT_GAME_SELECTION_MODE: any;
  @Mutation public RESET_GAME_STATE: any;
  @Mutation public SET_SOCKET_ROOM: any;

  public description: string = '';

  public gameInterface: GameInterface = CombatInterface();
  public currentScreen = 'root';
  public currentCursorIndex = 0;
  public cursorMoveDate = Date.now();

  public mounted() {
    const { roomID } = this.$route.params;
    if (!this.socket.connected) {
      // SET ERROR SCREEN HERE
      console.log('ERR SCREEN not connected');
      return;
    }
    this.SET_HEADER_VISIBILITY(false);
    document.addEventListener('keydown', this.keyMonitor, true);
    this.gameInterface.launch();
    // connect to the room
    this.SOCKET_EMIT({
      name: 'COMBAT_ROOM_CONNECT',
      params: [roomID, (err: any, room?: CombatRoom) => {
        console.log(err);
        if (err || !room) {
          // SET ERROR SCREEN HERE
          console.log('ERR SCREEN', err);
        } else {
          console.log('set state', room);
          this.SET_COMBAT_GAME_STATE(room);
        }
      }],
    });
  }
  public destroyed() {
    if (this.gameInterface) {
      this.gameInterface.destroyGame();
    }
    this.SET_HEADER_VISIBILITY(true);
    this.socketLeaveRoom('COMBAT_ROOM');
    this.RESET_GAME_STATE('COMBAT_ROOM');
    document.removeEventListener('keydown', this.keyMonitor, true);
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
        case 'ESCAPE':
          this.currentScreen = 'root';
          this.currentCursorIndex = 0;
          this.SET_COMBAT_GAME_SELECTION_MODE('TARGET');
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

    AudioManager.playOnce('cursorMove', true);

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
        params: [{
          receiverId: target.id,
          action: selectedOption.select
        }],
      });
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
    #title {
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
          background-image: url('../../../assets/img/misc/gold-frame.png');
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
            background-color: rgb(167, 0, 167);
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
    font-family: 'Press Start 2P', monospace;
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
