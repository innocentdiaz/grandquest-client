<template>
  <div class="combat">
    <div class="side-menu">
      <div class="main-title">
        <h2>Journies</h2>
      </div>
      <div v-if="socketStatus === -1">
        Attempting connection <ActivityIndicator />
      </div>
      <ul v-else-if="socketStatus === 1">
        <li v-for="room in rooms" :key="room.id" v-on:click="joinRoom(room.id)" 
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
        you are not connected :(
      </div>
    </div>
    <div class="main-container">
      <div class="container">
        <h1 class="header-title">COMBAT <br> ARENA</h1>
        <span class="subtitle">13 players online</span>
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
import ActivityIndicator from '@/components/ActivityIndicator.vue';
import io from 'socket.io-client';
import api from '@/api';

const socket = io(`${api.getBaseURL()}/combat`, { autoConnect: false });

@Component({
  components: { ActivityIndicator },
})
export default class Combat extends Vue {
  public socketStatus = -1;
  public rooms = {};

  public mounted() {
    socket.open();
    socket.on('connect', () => {
      console.log('status combat = 1');
      this.socketStatus = 1;
    });
    socket.on('disconnect', () => {
      console.log('status combat = 0');
      this.socketStatus = 0;
    });
    socket.on('reconnect_attempt', () => {
      console.log('status combat =-1');
      this.socketStatus = -1;
    });
    socket.on('COMBAT_GAME_STATE', (combatState) => {
      this.rooms = combatState.rooms;
    });
  }
  public destroyed() {
    socket.close();
  }
  public joinRoom(roomID: string) {
    let chosenRoom = this.rooms[roomID];
    if (chosenRoom.players + 1 > chosenRoom.maxPlayers) {
      return console.log('the selected room is already full');
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
        linear-gradient(black, rgba(0, 0, 0, 0), black), url('../../assets/img/combat.png');
    }
    hr {
      background: white;
      border-color: white;
    }
  }
}
</style>
