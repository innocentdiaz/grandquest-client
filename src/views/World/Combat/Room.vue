<template>
  <div class="combat-root" id="combat">
    <header>
      <h1 id="title">
        Combat - {{ combatRoom.title }}
      </h1>
    </header>
    <!-- Display -->
    <div class="display" v-if="socket.loading">
      <p>Connecting to server</p>
    </div>
    <div class="display" v-else-if="!socket.connected">
      <p>You are not connected to the server</p>
    </div>
    <div :class="!initialized || selectionMode === 'HIDDEN' ? 'GUI hidden' : 'GUI'">
      <div>
        <h1 class="health">HP ...</h1>
        <div id="health-bar-container">
          <div id="health-bar"></div>
        </div>
        <h2>Players: {{ combatRoom.playerCount }} / {{ combatRoom.maxPlayers }}</h2>
      </div>
      <div>
        <ul id="gui-selection-list">
          <li
            v-for="(option, index) in currentScreenObject()"
            :key="option.title"
            :class="option.disabled ? 'disabled' : currentCursorIndex === index ? 'active' : ''"
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
import { Action, State } from 'vuex-class';
import { SocketState } from '@/types';
import _ from 'underscore';
import io from 'socket.io-client';
import api from '@/api';
import launchGame from './Game';

interface Attack { 
  title: string;
  description: string;
}
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

let gameInterface: any = false;

@Component
export default class CombatRoom extends Vue {
  @State  public socket!: SocketState;
  @State  public combatRoom!: CombatRoom;
  @Action public socketJoinRoom: any;
  @Action public socketLeaveRoom: any;

  public initialized: boolean = false;
  public description: string = '';
  
  public guiMasterObject: GuiMasterObject = {
    root: [],
    potions: [
    ],
    attacks: [
    ],
    actions: [
    ],
  };

  public selectionMode = 'ACTION';
  public currentScreen = 'root';
  public currentTargetSide = 0;
  public currentTargetIndex = 0;
  public currentCursorIndex = 0;
  public cursorMoveDate = Date.now();

  public mounted() {
    const { roomID } = this.$route.params;

    this.socketJoinRoom({ name: 'COMBAT_ROOM', parameter: roomID });

    document.addEventListener('keydown', (event) => {
      if (this.selectionMode === 'HIDDEN') {
        return;
      }
      if (Date.now() - this.cursorMoveDate <= 100) {
        return;
      }
      this.cursorMoveDate = Date.now();

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
        // case 'ENTER':
        //   break;
        // case 'ESCAPE':
        //   break;
      }
    });
  }
  public updated() {
    // please make sure that the gameState is ok
    if (!gameInterface) {
      gameInterface = launchGame(this.combatRoom);
    } else {
      // gameInterface.actions.updateState(this.combatRoom);
    }
  }
  public destroyed() {
    this.socketLeaveRoom('COMBAT_ROOM');
  }

  public moveCursor(direction: string) {
    if (this.selectionMode === 'TARGET') {
      let h = null;
      let side = null;

      switch (direction.toLowerCase()) {
        case 'up':
          h = 'up';
          break;
        case 'down':
          h = 'down';
          break;
        case 'left':
          side = 0;
          break;
        case 'right':
          side = 1;
          break;
        default:
          return;
      }

      if (h) {
        this.currentTargetIndex = this.nextTargetIndexInLine(h);
      } else if (typeof side === 'number') {
        this.currentTargetSide = side;
        this.currentTargetIndex = this.nextTargetIndexInLine();
      } else {
        return;
      }
      // moveCursorSound.play();

      const settings = {
        index: this.currentTargetIndex,
        side: this.currentTargetSide,
      };

      // playScreen.moveTargetHandTo(settings);
    } else if (this.selectionMode === 'ACTION') {
      const options = this.currentScreenObject();
      const currentIndex = this.currentCursorIndex;
      let nextIndex = currentIndex;
      let j = currentIndex;

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

      // select the next option that is not disabled in the screen
      for (const option of options) {
        if (!option.disabled) {
          nextIndex = j;
          break;
        }
        if (!direction || direction === 'down') {
          j++;
        } else if (direction === 'up') {
          j--;
        }
        if (j > options.length - 1) {
          j = 0;
        }
        if (j < 0) {
          j = options.length - 1;
        }
      }
      if (nextIndex === currentIndex) {
        return;
      }
      // moveCursorSound.play();
      this.currentCursorIndex = nextIndex;
    }
  }
  public generateObjectGui(currentPlayer: any) {
    //  this.currentTargetSide === 0
    //   ? playScreen.playerPlacingLine[this.currentTargetIndex]
    //   : this.currentTargetSide === 1
    //     ? playScreen.enemyPlacingLine[GuiManager.currentTargetIndex]
    //     : null

    const selectedTargetCharacter = {
      character: {enemy: false},
      entity: {attacks: {}},
    };
    if (!selectedTargetCharacter) {
      throw new Error('unknown selected target!');
    }

    // PARSE ROOT
    const parsedRoot = [
      { title: 'Attacks', description: '', to: 'attacks', disabled: false, select: null },
      { title: 'Potions', description: '', to: 'potions', disabled: false, select: null },
    ];
    // enable options based on external conditions
    if (selectedTargetCharacter.character.enemy) {
      parsedRoot[0].disabled = true;
    }
    // push them to the guiMasterObject
    this.guiMasterObject.root = parsedRoot;

    if (currentPlayer) {
      // PARSE ATTACKS
      const attacks = currentPlayer.entity.attacks;

      this.guiMasterObject.attacks.push({
        title: 'Back',
        to: 'root',
        description: '',
        disabled: false,
        select: null,
      });

      _.pairs(attacks).forEach((pair: [string, Attack]) => {
        const id = pair[0];
        const attackInfo = pair[1];

        this.guiMasterObject.attacks.push({
          title: attackInfo.title,
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
    }
  }
  public nextTargetIndexInLine(direction?: string) {
    // find the next target here

    return this.currentTargetIndex;
  }
  public currentScreenObject() {
    return this.guiMasterObject[this.currentScreen];
  }
}
</script>
<style lang="scss" scoped>
.combat-root {
  height: 90vh;
  width: 100%;
  position: relative;

  header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to bottom, rgb(22, 22, 22), rgba(24, 24, 24, 0.8), rgba(24, 24, 24, 0.7), rgba(0, 0, 0, 0));
    color: white;
    padding: 10px;
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
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
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
    list-style-image: url('../../../assets/img/icon/select-target-hand.png');
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
    list-style-image: url('../../../assets/img/icon/select-target-hand.png');
  }

  .GUI #health-bar-container {
    height: 10px;
    width: 100%;
    max-width: 200px;
    border: 1px solid grey;
  }
  .GUI #health-bar {
    background: #56f33e;
    width: 0;
    height: 10px;
  }
  .GUI.hidden {
    height: 0 !important;
    padding: 0;
    margin: 0;
  }
}
</style>
