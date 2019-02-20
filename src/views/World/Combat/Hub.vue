<template>
  <div class="display">
    <header>
      <img src="@/assets/img/icon/heros-trial.png" alt="" class="display-title">
    </header>
    <div class="body">
      <div class="panel">
        <section>
          <p>Skepdimi's battle information:</p>
        </section>
        <section>
          <div class="character" v-if="player.authenticated">
            <div class="selection">
              <div class="img-container">
                <img :src="require(`@/assets/img/icon/people/${currentCharacter.name.toLowerCase()}.png`)" alt="character avatar">
                <div class="cover" v-if="player.level < currentCharacter.level">
                  <p>Unlocked at level {{currentCharacter.level}}</p>
                </div>
              </div>
              <div class="control">
                <button :class="`chevron left ${currentCharacterIndex === 0 ? 'disabled' : ''}`" v-on:click="moveSelection(-1)"></button>
                <span class="character-name">{{player.level >= currentCharacter.level ? currentCharacter.name : '???'}}</span>
                <button :class="`chevron right ${currentCharacterIndex === availableCharacters.length - 1 ? 'disabled' : ''}`" v-on:click="moveSelection(1)"></button>
              </div>
              <p>{{player.level >= currentCharacter.level ? currentCharacter.description : ''}}</p>
            </div>
            <div class="info" v-if="combatData.loaded">
              <div class="hp-container">
                <header>
                  <p>HP</p><p>{{combatData.health}}/{{combatData.max_health}}</p>
                </header>
                <div class="bar">
                  <div class="juice" :style="{width:`${(combatData.health/combatData.max_health)*100}%`}"></div>
                </div>
              </div>
              <p>Wins: <span class="green">{{combatData.levels_won}}</span></p>
              <p>Loses: <span class="red">{{combatData.levels_lost}}</span></p>
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
        <button class="play-multiplayer" :disabled="!socket.connected || !player.authenticated" v-on:click="startMultiplayer">
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
import { CombatRoom, CombatHub, SocketState, World, Player } from '@/types';
import api from '@/api';
import { ApiResponse } from 'apisauce';

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
  @Action public SOCKET_EMIT: any;

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
    loaded: false,
  };

  public mounted() {
    if (this.player.authenticated) {
      api.get(`player/${this.player.id}/combat`)
      .then((res: ApiResponse<any>) => {
        const body = res.data;
        if (res.ok) {
          this.combatData = {...body.data, loaded: true};
        } else {
          console.log('err');
        }
      });
    }
  }
  public startMultiplayer() {
    this.SOCKET_EMIT({
      name: 'COMBAT_ROOM_CONNECT',
      params: [(err: any, roomID?: string) => {
        if (err || !roomID) {
          console.log('Combat room connect err ', err);
        } else {
          console.log('Connected to ', roomID);
          this.$router.replace({
            name: 'combatRoom',
            params: {
              roomID,
            },
          });
        }
      }],
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
<style lang="scss" scoped>
$mainBlue: #036ca5;
$mainBlack: rgb(24, 24, 24);
$mainGrey: rgb(179, 179, 179);
$mainBlueHover: #005e91;
$mainLightGrey: #e0e0e0;

.display {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 2em;

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
        padding: 1em 2em;
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
</style>
