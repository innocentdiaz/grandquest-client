<template>
  <div>
    <!-- LOADING SCREEN -->
    <div v-if="!gameInterface.gameLoaded" id="loading-screen">
      <img src="@/assets/img/icon/monokai-village/monokai-village.png" alt="Monokai Village" class="icon" v-on:click="$router.push(`/world`)">
      <div class="tip">Fun fact: <br/> More shops, games and worlds are soon coming to GrandQuest!</div>
      <div class="loading-text">Loading assets <ActivityIndicator/></div>
    </div>
    <div class="main-view">
      <button class="exit-button" v-on:click="() => $router.replace({ name: 'world' })">
        EXIT
      </button>
      <div id="map-container"
        v-on:mousemove="gameInterface.mouseMonitor"
        v-on:mouseleave="gameInterface.pointer.hovering = false"
      >
        <div id="map"></div>
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
import { User, SocketState, World } from '@/types';
import Shop from '@/components/Shop.vue';
import ActivityIndicator from '@/components/ActivityIndicator.vue';

@Component({
  components: { ActivityIndicator, Shop }
})
export default class Map extends Vue {
  @State public user!: User;
  @State public socket!: SocketState;
  @State public world!: World;
  @Mutation public SET_HEADER_VISIBILITY: any;

  public gameInterface = gameInterface();
  public mounted() {
    if (!this.socket.connected || !this.user.authenticated) {
      return this.$router.push({ name: 'world' });
    }
    this.SET_HEADER_VISIBILITY(false);
    this.gameInterface.launch();
  }
  public destroyed() {
    this.SET_HEADER_VISIBILITY(true);
    this.gameInterface.destroyGame();
  }
}
</script>
<style lang="scss" scoped>
.main-view {
  background: black;
  .exit-button {
    z-index: 10;
    position: absolute;
    top: 10px;
    left: 10px;
    font-family: 'Lora', serif;
    background: #d30938;
    border-radius: 2px;
    color: white;
    font-weight: bold;
    border: none;
    padding: 1em 2em;
    transition: .2s all ease-in-out;
  }
  .tool-tip {
    z-index: 10;
    position: absolute;
    max-width: 425px;
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
  #map-container {
    z-index: 5;
    height: 100vh;
    width: 100vw;
    position: relative;
    overflow: hidden;
    #map {
      position: absolute;
      top: 0;
      left: 0;
      width: calc(1000px * 1.2);
      height: calc(889px * 1.2);
      background-repeat: no-repeat;
      background-position: 0 0;
      background-size: 100% 100%;
      background-image: url('../assets/img/backgrounds/monokai-village/monokai-village.png');
    }
  }
  .shop {
    z-index: 15;
  }
}
</style>
