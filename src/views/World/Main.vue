<template>
  <div class="world-main">
    <div class="container">
      <!-- <header>
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
      </header> -->
      <div class="content">
        <Combat />
        <div class="side-menu">
          <ul>
            <li>
              <img src="@/assets/img/icon/bag.png" alt="Shop">Shops
            </li>
            <li>
              <img src="@/assets/img/icon/scroll.png" alt="Character">Character
            </li>
            <li>
              <img src="@/assets/img/icon/chest.png" alt="Games">Games
            </li>
            <li class="disabled">
              <img src="@/assets/img/icon/guild.png" alt="Guild">Guild
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import moment from 'moment';
import { World, SocketState, Player } from '@/types';
import api from '@/api';
import ActivityIndicator from '@/components/ActivityIndicator.vue';
import Combat from './Combat/Hub.vue';

@Component({
  components: { ActivityIndicator, Combat },
})
export default class Main extends Vue {
  @State public socket!: SocketState;
  @State public world!: World;
  @State public player!: Player;

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
    min-height: 90vh;
    max-width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 1em 2em;

    .container {
      max-width: 900px;
      padding: 5px;
      border-radius: 5px;
      background-image: url('../../assets/img/combat.png');
      width: 100%;
      color: white;

      .content {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: space-between;
        min-height: 450px;

        .side-menu {
          font-family: 'Lora', serif;
          background-image: url('../../assets/img/backgrounds/map-bg.png');
          background-blend-mode: darken;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          border-radius: 2px;
          ul {
            list-style: none;
            margin: 0;
            padding: 0.5em 1em;
            li {
              position: relative;
              display: flex;
              flex-direction: row;
              align-items: center;
              color: rgb(243, 243, 243);
              font-size: x-large;
              font-weight: bold;
              padding: 10px;

              border-bottom: 1px solid #9f966a;
              text-shadow: 1px 1px rgb(73, 73, 73);
              cursor: pointer;
              &:hover {
                color: white;
              }
              &.disabled {
                opacity: 0.6;
                cursor: default;
                &:after {
                  content: 'Coming Soon!';
                  font-size: small;
                  position: absolute;
                  top: 0;
                  right: 0;
                  background: rgb(27, 27, 27);
                  text-shadow: none;
                  border-radius: 2px;
                  padding: 2px;
                }
              }
              img {
                height: 2.5em;
              }
            }
            li:nth-last-child(1) {
              border: none;
            }
          }
        }
      }
    }
  }
</style>
