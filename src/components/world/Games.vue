<template>
  <div class="display">
    <header>
      <img src="@/assets/img/icon/heros-trial.png" alt="" class="display-title">
    </header>
    <div class="body">
      <div class="panel" v-if="player.authenticated">
        <section>
          <h3>{{player.username}}'s battle information:</h3>
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
            <div class="info" v-if="combatData.loaded === 0">
              <ActivityIndicator />
            </div>
            <div class="info" v-else-if="combatData.loaded === 1">
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
        <button v-if="combatData.loaded && combatData.health === 0" class="need-health main-start" disabled="true">
          PLAY MULTIPLAYER
        </button>
        <button v-else :class="`${player.authenticated ? '' : 'need-auth'} main-start`" :disabled="!socket.connected || !player.authenticated" v-on:click="startMultiplayer">
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
    loaded: -1, // 1 = ok, 0 = pending, -1 = failed
  };

  public updated() {
    if (this.player.authenticated && this.combatData.loaded === -1) {
      this.combatData = { loaded: 0 };
      api.get(`player/${this.player.id}/combat`)
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
    this.combatData = { loaded: -1 };
  }
  public startMultiplayer() {
    this.SOCKET_EMIT(['COMBAT_ROOM_CONNECT', (err: any, roomID?: string) => {
      if (err || !roomID) {
        console.log('Combat room connect err ', err);
      } else {
        console.log('Connected to ', roomID);
        this.$router.push(`/combat/${roomID}`);
      }
    }]);
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
<style scoped>
.display {
  background-image: url('../../assets/img/combat.png');
}
</style>
