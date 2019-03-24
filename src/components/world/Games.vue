<template>
  <div id="display">
    <header class="display-header">
      <img src="@/assets/img/icon/monokai-village/heros-trial.png" alt="" class="display-title">
    </header>
    <!-- Combat rooms list abs -->
    <div id="combat-rooms-container">
      <div id="combat-rooms">
        <div class="top-bar">
          <span>COMBAT ROOMS</span>
          <img class="exit-btn" src="@/assets/img/icon/exit.png" v-on:click="setRoomsVisiblity(false)">
        </div>
        <div class="list-container">
          <ul>
            <li v-for="c in combatHub.rooms" :key="c.id" :class="`room-item ${c.playerCount === c.maxPlayers ? 'disabled':''}`" v-on:click="joinRoom(c.id)">
              <div class="status-indicator">• </div>
              <span class="title">{{c.title}}</span>
              <span class="players">{{c.playerCount}}/{{c.maxPlayers}}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="body">
      <div class="panel" v-if="user.authenticated">
        <section>
          <h3>{{user.username}}'s battle information:</h3>
        </section>
        <section>
          <div class="character" v-if="user.authenticated">
            <div class="selection">
              <div class="img-container">
                <img :src="require(`@/assets/img/icon/people/${currentCharacter.name.toLowerCase()}.png`)" alt="character avatar">
                <div class="cover" v-if="true || user.level < currentCharacter.level">
                  <p>Coming soon!</p>
                </div>
              </div>
              <div class="control">
                <button :class="`chevron left ${currentCharacterIndex === 0 ? 'disabled' : ''}`" v-on:click="moveSelection(-1)"></button>
                <span class="character-name">{{user.level >= currentCharacter.level ? currentCharacter.name : '???'}}</span>
                <button :class="`chevron right ${currentCharacterIndex === availableCharacters.length - 1 ? 'disabled' : ''}`" v-on:click="moveSelection(1)"></button>
              </div>
              <p>{{false && user.level >= currentCharacter.level ? currentCharacter.description : ''}}</p>
            </div>
            <div class="info" v-if="combatData.loaded === 0">
              <ActivityIndicator />
            </div>
            <div class="info" v-else-if="combatData.loaded === 1">
              <div class="hp-container">
                <header>
                  <span>HP</span><span>{{combatData.health}}/{{combatData.maxHealth}}</span>
                </header>
                <div class="bar framed">
                  <div class="juice" :style="{width:`${(combatData.health/combatData.maxHealth)*100}%`}"></div>
                </div>
              </div>
              <div class="row framed">
                <div class="col">
                  <img src="@/assets/img/icon/1bit-swords.png" alt="Power">{{combatData.power}}
                </div>
                <div class="col">
                  <img src="@/assets/img/icon/1bit-shield.png" alt="Defense">{{combatData.defense}}
                </div>
              </div>
              <p>Wins: <span class="green">{{combatData.levelsWon}}</span></p>
              <p>Loses: <span class="red">{{combatData.levelsLost}}</span></p>
            </div>
          </div>
        </section>
        <!-- <section>
          <div class="champion">
            <img src="" alt="">
            <div class="content">
              <p>Today's Champion is...</p>
              <h2 class="title">Pixeltweak</h2>
            </div>
          </div>
        </section> -->
      </div>
      <div class="buttons">
        <button v-if="combatData.loaded && combatData.health === 0" class="need-health main-start" disabled="true">
          PLAY MULTIPLAYER
        </button>
        <button v-else :class="`${!user.authenticated ? 'need-auth' : user.socketLock ? 'socket-lock' : ''} main-start`" :disabled="combatHubConnection !== 1 || !user.authenticated || !!user.socketLock" v-on:click="setRoomsVisiblity(true)">
          PLAY MULTIPLAYER
        </button>
        <div class="hr-text">
          <hr>
          <span>or</span>
          <hr>
        </div>
        <button class="play-singleplayer">
          Venture on your own
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
import ActivityIndicator from '@/components/ActivityIndicator.vue';
import { CombatRoom, CombatHub, SocketState, World, User } from '@/types';
import api from '@/api';
import { ApiResponse } from 'apisauce';
import { TweenLite, Elastic } from 'gsap';

interface CombatRooms {
  [id: string]: CombatRoom;
}

@Component({
  components: { ActivityIndicator },
})
export default class Hub extends Vue {
  @State public world!: World;
  @State public user!: User;
  @State  public socket!: SocketState;
  @Action public SOCKET_EMIT: any;
  @State  public combatHub!: CombatHub;

  public combatHubConnection: -1 | 0 | 1 = -1; // -1 = err, 0 = pending, 1 = ok

  public availableCharacters = [
    {
      name: 'Adventurer',
      description: 'You\'re off on an adventure! But beware, here be dragons.',
      level: 0,
    },
    {
      name: 'Ninja',
      description: 'A sneaky ninja...',
      level: 3,
    },
  ];
  public currentCharacterIndex = 0;
  public combatData = {
    loaded: -1, // 1 = ok, 0 = pending, -1 = failed
  };

  public updated() {
    const { user, combatData, socket } = this;

    // on disconnect socket
    if (!socket.connected) {
      this.combatHubConnection = -1;
    }

    // combat hub connection attempt
    if (socket.connected && user.authenticated && this.combatHubConnection === -1) {
      this.combatHubConnection = 0;
      this.SOCKET_EMIT(['COMBAT_HUB_CONNECT', (err?: string) => {
        if (!err) {
          this.combatHubConnection = 1;
        } else {
          this.combatHubConnection = -1;
        }
      }])
    }
    // load combatData for user
    if (user.authenticated && combatData.loaded === -1) {
      this.combatData = { loaded: 0 };
      api.get(`combatant/${this.user.id}`)
      .then((res: ApiResponse<any>) => {
        const body = res.data;
        if (res.ok) {
          this.combatData = { ...body.data, loaded: 1 };
        } else {
          this.combatData = { loaded: -1 };
        }
      });
    }
  }
  public destroyed() {
    if (this.combatHubConnection === 1) {
      this.SOCKET_EMIT(['COMBAT_ROOM_DISCONNECT']);
    }
  }
  public setRoomsVisiblity(visibility: boolean) {
    const roomsContainerEl = document.getElementById('combat-rooms-container');
    const roomsEl = document.getElementById('combat-rooms');
    if (!roomsContainerEl || !roomsEl) {
      throw new Error('Missing elements to animate!');
    }

    if (visibility) {
      TweenLite.fromTo(roomsContainerEl, 0.2, { display: 'none', opacity: 0 }, { display: 'flex', opacity: 1 });
      TweenLite.fromTo(roomsEl, 1.2, { scale: 0 }, { scale: 1, ease: Elastic.easeOut.config(0.5, 0.5) });
    } else {
      TweenLite.fromTo(
        roomsContainerEl,
        0.25,
        { opacity: 1 },
        {
          opacity: 0,
          onComplete() {
            roomsContainerEl.style.display = 'none';
          },
        }
      );
      TweenLite.fromTo(roomsEl, 0.25, { scale: 1 }, { scale: 0 });
    }
  }
  public joinRoom(id: string) {
    this.$router.push(`/combat/${id}`);
  }
  public moveSelection(direction: number) {
    if (this.availableCharacters[this.currentCharacterIndex + direction]) {
      this.currentCharacterIndex += direction;
    }
  }
  get currentCharacter() {
    return this.availableCharacters[this.currentCharacterIndex];
  }
}
</script>
<style lang="scss" scoped>
#display {
  background-image: url('../../assets/img/combat.png');
}
#combat-rooms-container {
  position: absolute;
  // display: flex;
  display: none;
  opacity: 0;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 15;
  padding: 50px;
  overflow: hidden;
  #combat-rooms {
    position: relative;
    height: 100%;
    width: 100%;
    background: white;
    border-radius: 10px;
    font-family: 'Press Start 2P', monospace;
    overflow: hidden;
    .top-bar {
      width: 100%;
      background: #140c1c;
      color: white;
      height: 2.5em;
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1em;

      .exit-btn {
        cursor: pointer;
        height: 2em;
        transform:rotateZ(180deg);
        &:hover {
          transform:rotateZ(0deg);
        }
      }
    }
    .list-container {
      background: #30346d;
      height: calc(100% - 2.5em);
      width: 100%;
      overflow-y: scroll;
      ul {
        padding: 0;
        margin: 0;
      }
      .room-item {
        font-size: large;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        color: white;
        background-image: linear-gradient(to bottom, #6188e2 80%, #597dce);
        border-radius: 5px;
        min-height: 3em;
        margin: 5px 1em;
        padding: 0 1em;
        box-shadow: inset 1px 1px 1px #6dc2ca;
        cursor: pointer;
        transition: .2s all ease-in-out;
        transform-style: preserve-3d;
        perspective: 100px;
        &:hover {
          background-image: linear-gradient(to bottom, #597dce 80%, #6188e2);
          color: rgb(247, 247, 247);
        }
        &.disabled {
          .status-indicator {
            color: red;
            text-shadow: 0 1px 0 rgb(255, 0, 0);
          }
          &:hover {
            background-image: linear-gradient(to bottom, #6188e2 80%, #597dce);
          }
        }
        .status-indicator {
          font-size: large;
          color: limegreen;
          text-shadow: 0 1px 0 rgb(0, 255, 0);
        }
        .players {
          background: #4e4a4e;
          box-shadow: inset 1px 1px 1px #140c1c;
          border-radius: 2px;
          font-size: medium;
          padding: 5px;
          margin-left: auto;
        }
      }
    }
  }
}
</style>
