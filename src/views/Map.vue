<template>
  <div>
    <!-- LOADING SCREEN -->
    <div v-if="!gameInterface.gameInitialized" id="loading-screen">
      <img src="@/assets/img/icon/monokai-village/monokai-village.png" alt="Monokai Village" class="icon" v-on:click="$router.push(`/world`)">
      <div class="tip">Fun fact: <br/> More shops, games and worlds are soon coming to GrandQuest!</div>
      <div class="loading-text">Loading assets <ActivityIndicator/></div>
    </div>
    <div class="map">
      <button class="exit-button" v-on:click="() => $router.replace({ name: 'world' })">
        EXIT
      </button>
      <!-- Parent for the Phaser.Game canvas -->
      <div id="canvas-parent">
      </div>
      <div class="tool-tip" v-if="gameInterface.tooltip.title">
        <h2>{{gameInterface.tooltip.title}}</h2>
        <p>{{gameInterface.tooltip.description}}</p>
      </div>
      <Shop v-if="gameInterface.chosenShop" v-bind:shopName="gameInterface.chosenShop" v-bind:exitShop="gameInterface.exitShop"/>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class'
import gameInterface from '@/game/places/map.ts';
import { Player, SocketState } from '@/types';
import Shop from '@/components/Shop.vue';
import ActivityIndicator from '@/components/ActivityIndicator.vue';

@Component({
  components: { ActivityIndicator, Shop }
})
export default class Map extends Vue {
  @State public player!: Player;
  @State public socket!: SocketState;
  @Mutation public SET_HEADER_VISIBILITY: any;

  public gameInterface = gameInterface();
  public mounted() {
    if (!this.socket.connected || !this.player.authenticated) {
      return this.$router.replace({ name: 'world' });
    }
    this.SET_HEADER_VISIBILITY(false);
    this.gameInterface.launch();
    document.addEventListener('wheel', this.gameInterface.scrollMonitor, true);
  }
  public destroyed() {
    this.SET_HEADER_VISIBILITY(true);
    document.removeEventListener('wheel', this.gameInterface.scrollMonitor, true);
    this.gameInterface.destroyGame();
  }
}
</script>
<style lang="scss" scoped>
.map {
  background: black;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  .exit-button {
    position: absolute;
    top: 10px;
    left: 10px;
    font-family: 'Lora', serif;
    background: #d30938;
    color: white;
    font-weight: bold;
    border: none;
    padding: 1em 2em;
    transition: .2s all ease-in-out;
  }
  .tool-tip {
    position: absolute;
    max-width: 225px;
    top: 10px;
    right: 10px;
    background: rgba(24, 24, 24, 0.856);
    min-height: 50px;
    font-family: 'Press Start 2P', monospace;
    padding: 25px 10px;
    color: white;
    h2 {
      margin: 0;
    }
  }
}
</style>
