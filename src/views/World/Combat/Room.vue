<template>
  <div class="combat-root">
    <!-- Main screen -->
    <div id="combat">
      <ActivityIndicator v-if="!gameInterface.gameInitialized"/>
      <header>
        <ul>
          <router-link to="/combat">Exit</router-link>
        </ul>
        <h1 id="title">
          Combat - {{ combatGame.gameState.title }}
        </h1>
      </header>
      <!-- Display -->
      <div class="display" v-if="socket.loading">
        <p>Connecting to server</p>
      </div>
      <div class="display" v-else-if="!socket.connected">
        <p>You are not connected to the server</p>
      </div>
    </div>
    <!-- GUI -->
    <div :class="combatGame.selectionMode === 'TARGET' || currentPlayerSelectionStatus === 1 ? 'GUI hidden' : 'GUI'">
      <div>
        <h1 class="health" v-if="currentPlayer">
          HP {{currentPlayer.entity.health}}/{{currentPlayer.entity.maxHealth}}
        </h1>
        <h1 class="health" v-else>HP ...</h1>
        <div id="health-bar-container" v-if="currentPlayer">
          <div id="health-bar" v-bind:style="{ width: `${currentPlayer.entity.health / currentPlayer.entity.maxHealth * 100}%` }"></div>
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
        <p>{{description}}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Action, State, Mutation } from 'vuex-class';
import ActivityIndicator from '@/components/ActivityIndicator.vue';
import { SocketState, User, CombatGame } from '@/types';
import { Character, Attack } from '@/game/types';
import _ from 'underscore';
import io from 'socket.io-client';
import api from '@/api';
import launchGame,{ GameInterface, GiGlobal } from '@/game/places/combat';

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
  @State public user!: User;
  @State public socket!: SocketState;
  @State public combatGame!: CombatGame;
  @Action public socketJoinRoom: any;
  @Action public socketLeaveRoom: any;
  @Action public EMIT_COMBAT_GAME_ACTION: any;
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

  public gameInterface: GiGlobal = {};
  public currentScreen = 'root';
  public currentCursorIndex = 0;
  public cursorMoveDate = Date.now();

  public beforeMount() {
    this.RESET_GAME_STATE('COMBAT_ROOM');
  }
  public mounted() {
    const { roomID } = this.$route.params;
    this.gameInterface = launchGame();

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

        this.EMIT_COMBAT_GAME_ACTION({
          receiverId: target.id,
          action: selectedOption.select
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

    const currentPlayer: Character = this.combatGame.gameState.players[this.user.id];

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

      guiMasterObject.attacks.push({
        title: attackInfo.name,
        description: attackInfo.description,
        to: null,
        disabled: false,
        select: {
          type: 'attack',
          id,
        },
      });
    });
    // PARSE POTIONS

    // PARSE ACTIONS
    return guiMasterObject;
  }
  get currentPlayer(): Character | null {
    // if not authenticated
    if (!this.user.id) {
      return null;
    }
    // if no game intialized
    if (!this.gameInterface.gameInitialized) {
      return null;
    }
    // if no player matching this user id
    if (!this.combatGame.gameState.players[this.user.id]) {
      return null;
    }
    return this.combatGame.gameState.players[this.user.id];
  }
  get currentPlayerSelectionStatus(): number {
    if (!this.currentPlayer) {
      return 0;
    }
    return this.currentPlayer.selectionStatus;
  }
  get currentScreenObject() {
    return this.guiMasterObject[this.currentScreen];
  }
}
</script>
<style lang="scss" scoped>
.combat-root {
  min-height: 50vh;
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
  .display {
    position: absolute;
    top: 0;
    bottom: 0;
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
    height: 30vh;
    overflow: hidden;
    font-family: 'Press Start 2P', monospace;
    padding: 10px;
    border-radius: 2px;
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
  .GUI.disabled {
    filter: blur(5px);
  }
  .GUI.disabled li {
    color: grey;
  }
  .GUI li.disabled {
    color: rgb(87, 87, 87);
  }

  .GUI.disabled li.active {
    color: grey;
    padding-left: 2px;
    list-style-image: url('../../../assets/img/icon/select-hand.png');
  }

  .GUI #health-bar-container {
    height: 10px;
    width: 100%;
    max-width: 200px;
    border: 1px solid grey;
  }
  .GUI #health-bar {
    background: #56f33e;
    height: 10px;
  }
  .GUI.hidden {
    opacity: 0.5;
  }
}
</style>
