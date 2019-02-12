<template>
  <div class="combat">
    <div class="side-menu">
      <div class="main-title">
        <h2>Journies</h2>
      </div>
      <div v-if="socket.loading">
        <ActivityIndicator />
      </div>
      <div v-else-if="!player.authenticated">
        <p><router-link to="/login">Log in</router-link> to view available journies</p>
      </div>
      <ul v-else-if="socket.connected">
        <li v-for="room in combatHub.rooms" :key="room.id" v-on:click="joinRoom(room.id)" 
          :class="room.playerCount + 1 > room.maxPlayers ? 'disabled' : ''"
        >
          <img src="@/assets/img/icon/1bit-swords.png" alt="battle icon">
          <div class="content">
            <h2 class="title">{{room.title}}</h2>
            <span>{{room.playerCount}}/{{room.maxPlayers}}</span>
          </div>
        </li>
      </ul>
      <div v-else>
        <p>You are not connected to the server</p>
      </div>
    </div>
    <!-- Main content -->
    <div class="main-container">
      <div class="container">
        <h1 class="header-title">COMBAT <br> ARENA</h1>
        <span class="subtitle">{{world.inCombat}} players in combat</span>
      </div>
    </div>
    <!-- Character selection -->
    <div class="character-selection" v-if="player.authenticated">
      <div class="img-container">
        <div class="cover" v-if="player.level < currentCharacter.level">
          <p>Unlocked at level {{currentCharacter.level}}</p>
        </div>
        <button :class="`chevron left ${currentCharacterIndex === 0 ? 'disabled' : ''}`" v-on:click="moveSelection(-1)"></button>
        <h2 class="character-name" v-if="player.level >= currentCharacter.level">{{currentCharacter.name}}</h2>
        <img :src="require(`@/assets/img/icon/people/${currentCharacter.name.toLowerCase()}.png`)" alt="character avatar">
        <button :class="`chevron right ${currentCharacterIndex === availableCharacters.length - 1 ? 'disabled' : ''}`" v-on:click="moveSelection(1)"></button>
      </div>
      <p v-if="player.level >= currentCharacter.level">{{currentCharacter.description}}</p>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
import ActivityIndicator from '@/components/ActivityIndicator.vue';
import { CombatRoom, CombatHub, SocketState, World, Player } from '@/types';
import api from '@/api';

interface CombatRooms {
  [id: string]: CombatRoom;
}

@Component({
  components: { ActivityIndicator },
})
export default class Hub extends Vue {
  @State public world!: World;
  @State public player!: Player;
  @State  public combatHub!: CombatHub;
  @State  public socket!: SocketState;
  @Action public socketJoinRoom: any;
  @Action public socketLeaveRoom: any;

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

  public mounted () {
    this.socketJoinRoom({ name: 'COMBAT_HUB'});
  }
  public destroyed() {
    this.socketLeaveRoom('COMBAT_HUB');
  }
  public joinRoom(roomID: string) {
    const chosenRoom = this.combatHub.rooms[roomID];
    if (chosenRoom.playerCount === chosenRoom.maxPlayers) {
      return;
    }

    this.$router.replace({
      name: 'combatRoom',
      params: {
        roomID,
      },
    });
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
<style lang="scss">
$mainBlue: #036ca5;
$mainBlack: rgb(24, 24, 24);
$mainGrey: rgb(179, 179, 179);
$mainBlueHover: #005e91;
$mainLightGrey: #e0e0e0;

.combat {
  height: 70vh;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;

  .side-menu {
    flex: 1;
    overflow-y: scroll;
    background: $mainLightGrey;
    .main-title {
      padding: 5px;
      color: white;
      background: black;
      h2 {
        margin: 0;
      }
    }
    ul {
      padding: 0;
      margin: 0;

      li {
        list-style: none;
        padding: 10px;
        background: $mainGrey;
        border-bottom: 1px solid grey;
        display: flex;
        flex-direction: row;
        align-items: center;
        cursor: pointer;
        user-select: none;

        &:hover {
          border-left: 5px solid black;
        }
        &.disabled {
          opacity: .85;
          background-color: grey;
          border-bottom: 1px solid black;
          cursor: default;
          &:hover {
            border-left: none;
          }
        }
        img {
          height: 40px;
          width: 40px;
          margin-right: 10px;
        }
        .content {
          .title {
            margin: 0;
            font-size: large;
          }
        }
      }
    }
  }
  .main-container {
    flex: 2;
    display: flex;
    flex-direction: row;
    align-items: stretch;

    .container {
      padding: 15px;
      flex: 3;

      .header-title {
        font-size: 3em;
        margin-bottom: 0;
      }
    }
    hr {
      background: white;
      border-color: white;
    }
  }
  .character-selection {
    flex: 1;
    padding: 25px;
    text-align: left;
    h1 {
      margin: 0;
    }
    .img-container {
      position: relative;
      height: 200px;
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      padding: 0 30px;
      img {
        height: 200px;
        width: 200px;
        background: #0d1c2c;
        border: 2px solid #454b40;
      }
      .cover {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 200px;
        background: rgba(10, 10, 10, 0.8);
        color: white;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .character-name {
        position: absolute;
        top: 0;
        width: 190px;
        color: white;
        border: 1px 0 solid white;
        background: rgba(10, 10, 10, 0.75);
        margin: 0;
        padding: 10px;
      }
      .chevron {
        height: 30px;
        width: 30px;
        border: none;
        background-color: transparent;
        background-image: url('../../../assets/img/icon/chevron.png');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center center;
        &.left {
          transform: rotateZ(-90deg);
        }
        &.right {
          transform: rotateZ(90deg);
        }
        &.disabled {
          opacity: 0.6;
          cursor: default;
          &:hover {
            opacity: 0.6;
          }
        }
        &:hover {
          opacity: 0.75;
        }
      }
    }
  }
}
</style>
