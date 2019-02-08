<template>
  <div class="world-main">
    <div class="aside">
      <UserControl />
    </div>
    <div class="container">
      <header>
        <div class="landscape">
          <h1>GrandQuest World</h1>
        </div>
        <div class="stats" v-if="socket.loading">
          <h2>Connecting to the world <ActivityIndicator /></h2>
        </div>
        <div class="stats" v-else-if="socket.connected">
          <h2>GrandQuest World</h2>
          <p>Current time: {{ readableTimeOfDay }}</p>
          <p>Players Online: {{ world.connections }}</p>
        </div>
        <div class="stats" v-else>
          <h2>GrandQuest World</h2>
          <h3>You are currently offline</h3>
        </div>
      </header>
      <div class="content">
        <h2>Games</h2>
        <div class="games-container">
          <div class="game-item" id="combat" v-on:click="setGame('combat')">
            <h1 class="title">Combat</h1>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import moment from 'moment';
import { World, SocketState } from '@/types';
import api from '@/api';
import UserControl from '@/components/UserControl.vue';
import ActivityIndicator from '@/components/ActivityIndicator.vue';

@Component({
  components: { ActivityIndicator, UserControl },
})
export default class Main extends Vue {
  @State public socket!: SocketState;
  @State public world!: World;

  public setGame(name: string) {
    this.$router.replace(name);
  }
  get readableTimeOfDay() {
    return moment(this.world.timeOfDay).format('LT'); ;
  }
}
</script>

<style lang="scss">
  $mainGrey: rgb(179, 179, 179);
  .world-main {
    min-height: 100vh;
    max-width: 100%;
    background: $mainGrey;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 1.5em;

    .aside { 
      flex: 1;
    }
    .container {
      flex: 3;
      margin-left: 2em;
      display: flex;
      flex-direction: column;
      align-items: stretch;

      header {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        height: 240px;

        .landscape {
          background-image: url('../../assets/img/landscapes/fort.jpg');
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          margin-right: 1em;
          border-radius: 15px;
          flex: 3;
          padding: 20px;
          user-select: none;
          background-color: white;
          cursor: pointer;
          transition: .2s all ease-in-out;

          h1 {
            color: white;
            margin: 0;
            font-family: serif;
          }
          &:hover {
            opacity: .7
          }
        }
        .stats {
          background: white;
          color: black;
          padding: 5px;
          border-radius: 15px;
          flex: 1;
        }
      }
      .content {
        min-height: 500px;
        background: white;
        color: black;
        border-radius: 15px;
        padding: 1em;
        margin-top: 1em;

        .games-container {
          display: grid;
          grid-gap: 20px;
          grid-template-columns: auto auto auto;

          .game-item {
            border-radius: 15px;
            height: 130px;
            background-color: greenyellow;
            padding: 10px;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            cursor: pointer;

            .title {
              font-size: medium;
              color: white;
            }

            &#combat {
              background-image: url('../../assets/img/combat.png');
            }
          }
        }
      }
    }
  }
</style>
