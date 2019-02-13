<template>
  <div class="user-control" v-if="player.authenticated">
    <img v-bind:src="require(`../assets/img/icon/people/${player.role}.png`)" :alt="`${player.role} avatar`">
    <h2>{{ player.username }}</h2>
    <small>Joined {{ userJoinDate() }}</small>
    <div id="stats">
      <h2>Stats</h2>
      <p>Gold: {{player.gold}}</p>
      <p>XP: {{player.xp}}</p>
      <p>Weapon health: {{player.weapon_health}}/{{weapon.stats.maxHealth}}hp</p>
    </div>
  </div>
  <div class="user-control" v-else>
      <h2>Have an account?</h2>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Player } from '@/types';
import items from '@/game/definitions/items';
import moment from 'moment';

@Component
export default class UserControl extends Vue {
  @State public player!: Player;

  public userJoinDate() {
    return moment(this.player.created_at).fromNow();
  }
  get weapon() {
    return items[this.player.weapon_id];
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
  border-radius: 5px;
  margin-bottom: 1em;
  img {
    float: right;
    border-radius: 2.5px;
    background: rgb(21, 201, 201);
    height: 3.85em;
    margin-left: 5px;
  }
  h2 {
    margin-bottom: 0 !important;
  }
  #stats {
    border-radius: 2.5px;
    margin-top: 10px;
    padding: 10px;
    background: saddlebrown;
    h2 {
      margin: 0 0;
      font-size: medium;
    }
    p {
      margin: 5px 0;
    }
  }
}
</style>
