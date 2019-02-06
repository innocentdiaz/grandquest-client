<template>
  <div class="combat">
    <div class="side-menu">
      <div class="main-title">
        <h2>Journies</h2>
      </div>
      <div v-if="socket.loading">
        <ActivityIndicator />
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
    <div class="main-container">
      <div class="container">
        <h1 class="header-title">COMBAT <br> ARENA</h1>
        <span class="subtitle">{{world.inCombat}} players in combat</span>
      </div>
      <aside>
        Live feed
        <hr>
      </aside>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
import ActivityIndicator from '@/components/ActivityIndicator.vue';
import { CombatRoom, CombatHub, SocketState, World } from '@/types';
import api from '@/api';

interface CombatRooms {
  [id: string]: CombatRoom;
}

@Component({
  components: { ActivityIndicator },
})
export default class Hub extends Vue {
  @State public world!: World;
  @State  public combatHub!: CombatHub;
  @State  public socket!: SocketState;
  @Action public socketJoinRoom: any;
  @Action public socketLeaveRoom: any;

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
}
</script>
<style lang="scss">
$mainBlue: #036ca5;
$mainBlack: rgb(24, 24, 24);
$mainGrey: rgb(179, 179, 179);
$mainBlueHover: #005e91;
$mainLightGrey: #e0e0e0;

.combat {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;

  .side-menu {
    overflow-y: scroll;
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
    flex: 1;
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
    aside {
      flex: 2;
      padding: 25px;
      color: white;
      background: 
        linear-gradient(black, rgba(0, 0, 0, 0), black), url('../../../assets/img/combat.png');
    }
    hr {
      background: white;
      border-color: white;
    }
  }
}
</style>
