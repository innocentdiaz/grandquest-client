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
        <Games v-if="view==='games'"/>
        <Travel v-if="view==='travel'"/>
        <div class="side-menu">
          <ul>
            <li v-on:click="view = 'travel'">
              <img src="@/assets/img/icon/bag.png" alt="Travel">Explore
            </li>
            <li class="disabled">
              <img src="@/assets/img/icon/scroll.png" alt="Leaderboards">Leaderboards
            </li>
            <li v-on:click="view = 'games'">
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
import Travel from '@/components/world/Travel.vue';
import Games from '@/components/world/Games.vue';

@Component({
  components: {
    ActivityIndicator,
    Games,
    Travel,
  },
})
export default class Main extends Vue {
  @State public socket!: SocketState;
  @State public world!: World;
  @State public player!: Player;

  public view = 'games';

  public setGame(name: string) {
    this.$router.replace(name);
  }
  get readableTimeOfDay() {
    return moment(this.world.timeOfDay).format('LT'); ;
  }
}
</script>

<style lang="scss">
  $mainBlue: #036ca5;
  $mainBlack: rgb(24, 24, 24);
  $mainGrey: rgb(179, 179, 179);
  $mainBlueHover: #005e91;
  $mainLightGrey: #e0e0e0;

  .world-main {
    min-height: 90vh;
    max-width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 1em 2em;

    .container {
      max-width: 900px;
      width: 100%;
      color: white;
      overflow: hidden;
      border-radius: 5px;

      .content {
        padding: 10px;
        border-radius: 5px;
        // same height as .display (absolutely positioned child element)
        height: 500px;
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;

        .side-menu {
          z-index: 10;
          float: right;
          font-family: 'Lora', serif;
          background-image: url('../assets/img/backgrounds/map-bg.png');
          background-blend-mode: darken;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          border-radius: 2px;
          width: 30%;
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

        /*
          Styles for display components
        */
        .display {
          z-index: 5;
          // same height as .content (parent element)
          height: 500px;
          display: flex;
          flex-direction: column;
          padding: 0 35% 0 3em;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;

          header {
            display: block;
            text-align: center;
            .display-title {
              margin: 1.75em 0;
              height: 4.20em;
            }
          }
          .body {
            flex: 1;
            display: flex;
            flex-direction: row;
            align-items: stretch;
            justify-content: space-between;
            padding-bottom: 2em;
            .panel {
              background: rgba(27, 27, 27, 0.9);
              padding: 10px 8px;
              border-radius: 2px;
              margin-right: 2em;
              flex: 2;
              section {
                border-bottom: 1px solid rgba(240, 240, 240, 0.8);
                .character {
                  display: flex;
                  flex-direction: row;
                  align-items: stretch;
                  padding: 10px 0;
                  .selection {
                    margin-right: 1em;
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    width: 100px;
                    .img-container {
                      text-align: center;
                      position: relative;
                      img {
                        width: 100px;
                        background: #0d1c2c;
                        border: 2px solid #454b40;
                      }
                      .cover {
                        padding: 5px;
                        text-align: center;
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        width: inherit;
                        background: rgba(10, 10, 10, 0.8);
                        color: white;
                        margin: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      }
                    }
                    .control {
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                      height: 30px;
                      .chevron {
                        margin: 0;
                        height: 30px;
                        width: 30px;
                        border: none;
                        background-color: transparent;
                        background-image: url('../assets/img/icon/chevron.png');
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
                  .info {
                    flex: 1;
                    .hp-container {
                      display: flex;
                      flex-direction: column;
                      align-items: stretch;
                      margin-bottom: 5px;
                      header {
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                        margin-bottom: 2px;
                      }
                      .bar {
                        background: black;
                        height: 1.5em;
                        border: 1px solid white;
                        display: flex;
                        flex-direction: row;
                        align-items: stretch;

                        .juice {
                          width: 80%;
                          background: #56F33E;
                        }
                      }
                    }
                  }
                }
                p {
                  margin: 0;
                }
              }
            }
            .buttons {
              display: flex;
              flex-direction: column;
              justify-content: center;
              .play-multiplayer {
                font-family: 'Lora', serif;
                font-size: larger;
                background: #d30938;
                color: white;
                font-weight: bold;
                border: none;
                box-shadow: 0px 0px 5px white;
                padding: 1em 1em;
                transition: .2s all ease-in-out;
                &[disabled] {
                  background: grey;
                  opacity: 0.95;
                  cursor: default;
                  &:hover {
                    box-shadow: 0px 0px 5px white;
                  }
                }
                &:hover {
                  box-shadow: 0px 0px 10px white;
                }
              }
              .play-singleplayer {
                color: #ddc86c;
                background: transparent;
                border: none;
                font-size: large;
                &:hover {
                  color: #f0da77;
                }
              }
            }
          }
        }
      }
    }
  }
  @media screen and (max-width: 800px) {
    .container {
      .display {
        margin-top: 5em;
        width: 100%;
        position: static !important;
        padding: 0 3em !important;
      }
      .side-menu {
        float: none;
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        width: 100% !important;
        display: flex !important;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        ul {
          li {
            img {
              height: 2em !important;
            }
            border-bottom: none !important;
            display: inline-flex !important;
            font-size: medium !important;
          }
        }
      }
    }
  }
</style>
