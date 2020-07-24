<template>
  <div v-on:keydown="keyMonitor" class="combat-root">
    <!-- LOADING SCREEN -->
    <div v-if="!gameInterface.gameInitialized || roomConnection !== 1" id="loading-screen" :class="`${typeof roomConnection === 'string' ? 'blur' : ''}`">
      <img src="@/assets/img/icon/monokai-village/heros-trial.png" alt="Hero's Trial" class="icon" v-on:click="$router.push(`/world`)">
      <div class="tip">Hot tip: <br/> {{hotTip}}</div>
      <div id="loading-error-container" v-if="typeof roomConnection === 'string'">
        <div id="loading-error">
          <h1>Error</h1>
          <p id="loading-error-text">{{roomConnection}}</p>
          <button v-on:click="$router.replace('/world/games')" class="exit-btn">EXIT</button>
        </div>
      </div>
      <div v-else class="loading-text">
        {{
          socket.loading
          ? 'Connecting to server...'
          : !socket.connected
          ? 'Failed connection to server...'
          : !gameInterface.gameInitialized
          ? 'Loading assets...'
          : 'Beginning game...'
        }} <ActivityIndicator/></div>
    </div>
    <!-- COMBAT GAME -->
    <div class="combat-game">
      <div class="main-screen">
        <!-- header -->
        <header>
          <div class="game-header" v-if="gameInterface.showGUI">
            <ul>
              <router-link to="/world">Exit</router-link>
              <div class="level" v-if="gameInterface.gameState.playState && currentPlayer">
                <div class="icon">
                  <span id="level-label">{{user.level}}</span>
                </div>
                <div class="bar">
                  <p id="xp-label">{{user.xp}}/{{user.nextLevelXp}} xp</p>
                  <div id="xp-juice" :style="`width:${user.xp / user.nextLevelXp * 100}%;`"></div>
                </div>
              </div>
            </ul>
            <h1 id="title" v-if="gameInterface.gameInitialized && !gameInterface.isAnimating && gameInterface.gameState.playState">
              {{ combatGame.gameState.title }}, level {{ gameInterface.gameState.level }}
            </h1>
          </div>
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
            <div class="stats-container">
              <div class="hp-container" v-if="currentPlayer">
                <header>
                  <span>HP</span><span>{{currentPlayer.entity.health}}/{{currentPlayer.entity.maxHealth}}</span>
                </header>
                <div class="bar framed">
                  <div class="juice" :style="{width:`${(currentPlayer.entity.health/currentPlayer.entity.maxHealth)*100}%`}"></div>
                </div>
              </div>
              <div class="energy-container" v-if="currentPlayer">
                <header>
                  <span>EP</span><span>{{currentPlayer.entity.energy}}/{{currentPlayer.entity.maxEnergy}}</span>
                </header>
                <div class="bar framed">
                  <div class="juice" v-bind:style="{ width: `${currentPlayer.entity.energy / currentPlayer.entity.maxEnergy * 100}%` }"></div>
                </div>
              </div>
              <h3 class="subtitle">Players: {{ combatGame.gameState.playerCount }} / {{ combatGame.gameState.maxPlayers }}</h3>
            </div>
            <div>
              <ul id="gui-selection-list">
                <li
                  v-for="(option, index) in currentScreenObject"
                  :key="option.title"
                  :class="`${option.disabled ? 'disabled' : ''} ${combatGame.selectionMode !== 'TARGET' && combatGame.selectionMode !== 'HIDDEN' && currentCursorIndex == index ? 'active' : ''}`"
                  v-on:mouseover="setCursorIndex(index)"
                  v-on:click="combatGame.selectionMode === 'TARGET' ? guiWakeup() : selectOption()"
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
              <div class="user-container" v-for="(user, id) in currentLevelRecord.players" v-bind:key="id">
                <img v-bind:src="require(`../assets/img/icon/people/${gameInterface.gameState.players[id].entity.name}.png`)" class="avatar" alt="User entity">
                <div class="grid">
                  <h3 class="title">{{gameInterface.gameState.players[id].username}}</h3>
                  <h2 v-if="combatGame.gameState.readyToContinue[id]">Ready!</h2>
                  <div v-else>
                    <p>Dmg: {{user.damageDealt}}</p>
                    <p>Gold: {{user.gold}}</p>
                    <p>XP: {{user.xp}}</p>
                  </div>
                </div>
              </div>
            </aside>
            <div class="main">
              <h1>Level {{gameInterface.gameState.level}} {{currentLevelRecord.won ? 'completed' : 'lost'}}!</h1>
              <h2 class="subtitle">Level completed in {{gameInterface.gameState.turn}} turns</h2>
              <p><img class="icon" src="@/assets/img/icon/1bit-swords.png"/> dealt: {{currentLevelRecord.players[this.user.id].damageDealt}} dmg</p>
              <p><img class="icon" src="@/assets/img/items/coins.png"/> earned: {{currentLevelRecord.players[this.user.id].gold}} gold</p>
              <p><img class="icon" src="@/assets/img/misc/xp-orb.png"/> gained: {{currentLevelRecord.players[this.user.id].xp}} xp</p>
              <button
                class="ready"
                v-if="currentLevelRecord.won"
                :disabled="combatGame.gameState.readyToContinue[this.user.id]"
                v-on:click="SOCKET_EMIT(['COMBAT_ROOM_READY'])"
              >
                Ready!
              </button>
              <button
                v-else
                v-on:click="$router.replace('/world/games')"
                class="exit-btn"
              >
                EXIT
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="combat-side-menu">
        <div class="logo-container">
          <img src="@/assets/img/icon/monokai-village/heros-trial.png" alt="">
        </div>
        <div class="invitations-container">
          <h2>INVITE</h2>
          <div class="link-container" v-if="gameInterface.gameState.playerCount < gameInterface.gameState.maxPlayers">
            <img class="icon" src="@/assets/img/icon/share-link.png" v-on:click="copyLink">
            <input class="link" id="link-input" readonly="readonly" v-bind:value="roomLink"/>
          </div>
          <span style="color: #25AD10" id="link-copy-label"></span>
          <DiscordLabel/>
          <a href="https://reddit.com/r/grandquest" target="_blank" class="reddit-container">
            <img class="icon" src="@/assets/img/icon/reddit.png" alt="">
            <div class="label">
              r/grandquest
            </div>
          </a>
        </div>
        <div class="queued-events" v-if="!gameInterface.isAnimating && gameInterface.gameState.playState === 1">
          <div class="character-container" v-for="character in gameInterface.turn % 2 ? gameInterface.gameState.enemies : gameInterface.gameState.players" :key="character.id">
            <div class="portrait-container">
              <img :src="require(`@/assets/img/spritesheets/${character.entity.name}-portrait.png`)" alt="">
            </div>
            <div class="description">
              <h2 class="title">{{character.username}}</h2>
              <p class="event-description" v-html="eventDescription(character.id)"></p>
            </div>
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
import DiscordLabel from '@/components/DiscordLabel.vue';
import { SocketState, User, CombatGame } from '@/types';
import { CombatCharacter, Attack, InventoryItem } from '@/game/types';
import _ from 'underscore';
import { TweenMax } from 'gsap';
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
  components: { ActivityIndicator, DiscordLabel },
})
export default class CombatRoom extends Vue {
  @State public user!: User;
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

  public roomLink = window.location.href;
  public roomConnection: -1 | 0 | 1 | string = -1; // -1 = not pending, 0 = pending, 1 = ok, 'string' = error

  public hotTip = '';

  public gameInterface = GameController();
  public currentScreen = 'root';
  public currentCursorIndex = 0;
  public cursorMoveDate = Date.now();

  public mounted() {
    this.SET_HEADER_VISIBILITY(false);

    // add event listeners
    document.addEventListener('keydown', this.keyMonitor, true);
    window.addEventListener('resize', this.gameInterface.resizeMonitor, true);

    this.hotTip = _.sample([
      'Coordinates with others players to make the most effective use of your attacks and items!',
      'Different enemies have different gold and xp rewards!',
      'Completely finishing levels rewards all players in gold. Yay gold!',
      'You can buy potions to heal yourself or other players in combat. Hooray, teamwork!',
      'Enemies become stronger as you advance. Keep yourself strong by upgrading your defense and power!',
      'Leveling up in combat regenerates your health 100%!',
    ]) || '';

    // combat hub connection attempt
    if (this.socket.connected && this.user.authenticated) {
      this.attemptConnection();
    }
  }
  public updated() {
    const { user, socket, roomConnection } = this;
    // on disconnect socket
    if (!socket.connected && roomConnection !== -1) {
      this.roomConnection = -1;
    }
    // combat hub connection attempt
    if (socket.connected && user.authenticated && roomConnection === -1) {
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
      return;
    }
    if (this.roomConnection !== -1) {
      return;
    }

    const { roomID } = this.$route.params;
    this.roomConnection = 0;

    this.SOCKET_EMIT(['COMBAT_ROOM_CONNECT', roomID, (err?: string, combatRoom?: CombatRoom) => {
      if (err) {
        this.roomConnection = err;
      } else {
        this.roomConnection = 1;
        if (!this.gameInterface.game) {
          this.SET_COMBAT_GAME_STATE(combatRoom);
          this.gameInterface.launch();
        }
      }
    }]);
  }
  public keyMonitor(event: any) {
    if (Date.now() - this.cursorMoveDate <= 100 || this.gameInterface.isAnimating) {
      return;
    }
    this.cursorMoveDate = Date.now();

    if (this.combatGame.selectionMode === 'ACTION' && this.currentPlayerSelectionStatus === 0) {
      const key = event.key.toUpperCase();

      if (key === 'W' || key === 'ARROWUP') {
        this.moveCursor('up');
      } else if (key === 'A' || key === 'ARROWLEFT') {
        this.moveCursor('left');
      } else if (key === 'S' || key === 'ARROWDOWN') {
        this.moveCursor('down');
      } else if (key === 'D' || key === 'ARROWRIGHT') {
        this.moveCursor('right');
      } else if (key === 'ENTER') {
        this.selectOption();
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

    this.setCursorIndex(j);
  }
  public setCursorIndex(index: number) {
    if (this.currentCursorIndex != index && this.combatGame.selectionMode === 'ACTION') {
      AudioManager.playOnce('cursorMove');
      this.currentCursorIndex = index;
    }
  }
  public selectOption() {
    const currentScreenObj = this.guiMasterObject[this.currentScreen];
    const currentIndex = this.currentCursorIndex;
    const selectedOption: MasterObjectOption = currentScreenObj[currentIndex];

    if (!selectedOption || selectedOption.disabled) {
      return;
    }

    AudioManager.playOnce('cursorSelect');

    // this is a route
    if(selectedOption.to) {
      this.currentCursorIndex = 0;
      this.currentScreen = selectedOption.to;
    } else if (selectedOption.select) {
      this.gameInterface.selectAction(selectedOption.select);
    }
  }
  public eventDescription(id: string): string {
    if (!this.gameInterface.gameInitialized) {
      return '';
    }

    const characters = {...this.gameInterface.gameState.players, ...this.gameInterface.gameState.enemies};
    const character = characters[id];

    if (!character) {
      return '...';
    }

    const queuedEvents = this.gameInterface.gameState.queuedEvents;
    const characterEvent = _.find(queuedEvents, (event) => {
      return event.character.id === id;
    });

    if (character.entity.health === 0) {
      return 'Dead.';
    }
    if (!characterEvent) {
      return 'Waiting...';
    }

    let spotInLine = 0;
    _.each([
      ..._.values(this.gameInterface.playerPlacingLine),
      ..._.values(this.gameInterface.enemyPlacingLine)
    ],
    (spot) => {
      if (spotInLine) { return };
      if (!!spot.character && String(spot.character.id) == id) {
        spotInLine = spot.index;
      }
    });

    const receiver = characters[characterEvent.receiver.id];

    // labelName examples:
    // self, Slime#2, Skepdimi
    const labelName = String(receiver.id) == String(id)
      ? 'self'
      : receiver.username + (receiver.enemy ? `#${spotInLine}` : '');

    return `<strong>${character.username}</strong> chose ${characterEvent.action.type} <strong>${characterEvent.action.id.replace(/-/gi, ' ')}</strong> on <strong>${labelName}</strong>`;
  }
  public copyLink() {
    /* Get the text field */
    const copyText = document.getElementById("link-input") as HTMLInputElement;

    if (!copyText) {
      return;
    }

    copyText.select();
    document.execCommand("copy");

    /* Alert the copied text */
    const linkCopyLabel = document.getElementById('link-copy-label');
    if (!linkCopyLabel) {
      return;
    }

    linkCopyLabel.innerHTML = 'Copied URL to clipboard!';
    TweenMax.fromTo(
      linkCopyLabel,
      0.5,
      { opacity: 0 },
      { opacity: 1 },
    );
    TweenMax.to(
      linkCopyLabel,
      0.8,
      {
        opacity: 0,
        delay: 2,
        onComplete() {
          linkCopyLabel.innerHTML = '';
        },
      },
    );
  }
  public guiWakeup() {
    this.currentCursorIndex = 0;
    this.currentScreen = 'root';
    this.SET_COMBAT_GAME_SELECTION_MODE('ACTION');
    AudioManager.playOnce('cursorBack');
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

    const currentPlayer: CombatCharacter | null = this.currentPlayer;

    if (!currentPlayer) {
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
    const potions = _.filter(currentPlayer.inventory, (i: InventoryItem) => i.type === 'potion');

    potions.forEach((item) => {
      guiMasterObject.potions.push({
        id: item.id,
        title: item.uids.length > 1 ? `${item.name} (${item.uids.length})` : item.name,
        description: `
          Name: ${item.name} <br/>
          Quantity: ${item.uids.length}
        `,
        to: null,
        disabled: item.uids.length === 0,
        select: {
          type: 'item',
          id: item.id,
        },
      });
    });

    if (this.combatGame.selectionMode === 'ACTION') {
      let selectedOption = guiMasterObject[this.currentScreen][this.currentCursorIndex];
      let currentPlayer = this.currentPlayer;

      if (!selectedOption) {
        this.currentScreen = 'root';
        this.currentCursorIndex = 0;
        selectedOption = guiMasterObject.root[0];
      }

      if (!this.gameInterface.isAnimating) {
        if (selectedOption.disabled || (currentPlayer && currentPlayer.entity.health === 0)) {
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
    }
    return guiMasterObject;
  }
  get currentPlayer(): CombatCharacter | null {
    // if not authenticated
    const { id } = this.user;
    if (!id) {
      return null;
    }
    // if no game intialized
    if (!this.gameInterface.gameInitialized) {
      return null;
    }
    // if no user matching this user id
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
  get description() {
    const selectionStatus = this.combatGame.selectionMode;

    if (selectionStatus === 'HIDDEN') {
      return '';
    }
    if (selectionStatus === 'ACTION') {
      const selectionOption = this.guiMasterObject[this.currentScreen][this.currentCursorIndex];
      return selectionOption.description;
    }
    if (selectionStatus === 'TARGET') {
      const targetSide = this.gameInterface.currentTargetSide;
      const targetIndex = this.gameInterface.currentTargetIndex;
      const placingLine = targetSide === 0
        ? this.gameInterface.playerPlacingLine
        : this.gameInterface.enemyPlacingLine;
      const target = placingLine[targetIndex].character;
      const currentPlayer = this.currentPlayer;

      if (!target) {
        return '';
      }
      if (currentPlayer && target.id === currentPlayer.id) {
        return `
          <h2>${target.username}</h2>
        `;
      } else {
        return `
          <h2>${target.username}${target.enemy ? `#${targetIndex}` : ''}</h2>
          <ul>
            <li>HP: ${Math.round(target.entity.health * 10) / 10}/${target.entity.maxHealth}</li>
            ${
              target.enemy && target.entity.health != 0
              ? `
                <li>Gold: ${target.goldReward}</li>
                <li>XP: ${target.xpReward}</li>
              `
              : ''
            }
            <li>Power: ${target.power}</li>
            <li>Defense: ${target.defense}</li>
          </ul>
        `;
      }
    }
    return '';
  }
}
</script>
<style lang="scss" scoped>
$mainGreen: #9dff5c;

.combat-root {
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: black;
  overflow: hidden;
  .combat-game {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100vw;

    .main-screen {
      position: relative;
      min-width: 600px;
      flex: 1;
      overflow: hidden;

      #canvas-parent {
        text-align: center;
        cursor: pointer;
      }
      .game-header {
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
            p {
              display: flex;
              flex-direction: row;
              align-items: center;
              .icon {
                margin-right: 0.5em;
                height: 1.5em;
                border-radius: 5px;
              }
            }
            .ready {
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

            .user-container {
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
    }
    .combat-side-menu {
      background: #c1cdc9;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: 1em;
      max-width: 300px;

      .logo-container {
        text-align: center;
        margin-bottom: 1em;
        img {
          width: 100%;
        }
      }
      .invitations-container {
        background: #dee7e3;
        text-align: center;
        border-radius: 5px;
        padding: 1em;

        .link-container {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          border: 1px solid #d1d5da;
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 1em;

          .icon {
            padding: 8px;
            height: 2em;
            background-image: linear-gradient(to bottom,#fafbfc,#eff3f6 90%);

            &:hover {
              cursor: pointer;
              background-image: linear-gradient(to bottom,#f0f3f6,#e6ebf1 90%);
              border-color: rgba(27,31,35,.35);
            }
            &:active {
              background: #e6ebf1;
            }
          }
          .link {
            background: white;
            box-shadow: inset 0 1px 2px rgba(27,31,35,.075);
            color: #24292e;
            font-family: monospace;
            border: none;
            flex: 1;
            display: flex;
            align-items: center;
            padding: 0 1em;
            overflow: hidden;
          }
        }
        .reddit-container {
          border-radius: calc(1.5em /2);
          display: flex;
          flex-direction: row;
          align-items: center;
          overflow: hidden;
          margin-bottom: 1em;
          .icon {
            height: 1.5em;
            padding: 4px;
          }
          .label {
            align-self: stretch;
            color: white;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: small;
          }
        }
        .reddit-container {
          .icon {
            background: #ff2f1f;
          }
          .label {
            background: #ff620a;
          }
        }
      }
      .queued-events {
        margin-top: 2em;
        background: #dee7e3;
        border-radius: 5px;
        padding: 1em;
        .character-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          .portrait-container {
            margin-right: 15px;
            .title {
              font-size: medium;
              margin: 0;
            }
            .event-description {
              margin: 0;
            }
            img {
              height: 3em;
              image-rendering: optimizeSpeed;             /* STOP SMOOTHING, GIVE ME SPEED  */
              image-rendering: -moz-crisp-edges;          /* Firefox                        */
              image-rendering: -o-crisp-edges;            /* Opera                          */
              image-rendering: -webkit-optimize-contrast; /* Chrome (and eventually Safari) */
              image-rendering: pixelated; /* Chrome */
              image-rendering: optimize-contrast;         /* CSS3 Proposed                  */
              -ms-interpolation-mode: nearest-neighbor;   /* IE8+                           */
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
.exit-btn {
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
