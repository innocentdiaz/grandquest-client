<template>
  <div class="user-control" v-if="player.authenticated">
      <h2>{{ player.username }}</h2>
      <p>Joined {{ userJoinDate() }}</p>
  </div>
  <div class="user-control" v-else>
      <h2>Have an account?</h2>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Player } from '@/types';
import moment from 'moment';

@Component
export default class UserControl extends Vue {
  @State public player!: Player;

  public userJoinDate() {
    return moment(this.player.created_at).fromNow();
  }
}
</script>

<style lang="scss">
$mainGreen: #9dff5c;

.user-control {
  padding: 12px;
  min-height: 150px;
  border-radius: 10px;
  background-color: $mainGreen;
  color: white;
  margin-bottom: 1em;
}
</style>
