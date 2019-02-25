<template>
    <!-- Change background color (sky) depending on time of day) -->
  <div class="display" :style="{ backgroundImage: `url(` + require('../../assets/img/backgrounds/monokai-village/monokai-village.png') + `), ${bgColor}` }">
    <header>
      <img src="@/assets/img/icon/monokai-village/monokai-village.png" alt="" class="display-title">
    </header>
    <div class="body">
      <div class="panel">
        <section>
          <p>{{player.username}}'s travel log: </p>
        </section>
      </div>
      <div class="buttons">
        <button class="play-multiplayer" :disabled="!socket.connected || !player.authenticated" v-on:click="() => $router.replace({ name: 'map' })">
          EXPLORE MONOKAI
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Player, SocketState, World } from '@/types';

@Component
export default class Travel extends Vue {
  @State public player!: Player;
  @State public socket!: SocketState;
  @State public world!: World;

  get bgColor() {
    // number from 0-23 relating to the hour of the day in the world
    const worldHour = new Date(this.world.timeOfDay).getHours();
    if (worldHour >= 5 && worldHour < 9) {
      // morning
      return 'linear-gradient(#89b8ff, #fdaea3)';
    } else if (worldHour >= 9 && worldHour < 19) {
      // day
      return 'linear-gradient(#1c6fcf, #95d6f8)';
    } else if (worldHour >= 19 && worldHour < 21) {
      // evening
      return 'linear-gradient(#52adff, #ed8d45)';
    } else {
      // night
      return 'linear-gradient(#01071f, #663c94)'
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
