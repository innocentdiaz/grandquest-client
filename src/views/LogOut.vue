<template>
  <div class="log-out">
    <h1>Logging out</h1>
    <p>{{ message() }} <ActivityIndicator /></p>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ActivityIndicator from '@/components/ActivityIndicator.vue';
import api from '@/api';
import { State } from 'vuex-class';
import { Player } from '@/types';

@Component({
  components: { ActivityIndicator },
})
export default class LogOut extends Vue {
  @State public player!: Player;

  public async mounted() {
    const jwt = this.player.token;

    if (jwt) {
      console.log('delete auth using jwt ', api.headers)
      const res = await api.delete(`/auth/${jwt}`);
      
      // if (!res.ok) {
      //   console.log('there is a pending logout request');
      //   localStorage.setItem('grandquest:pending_logout', jwt);
      // }

      localStorage.removeItem('grandquest:jwt');
      location.reload();
    } else {
      this.$router.replace('/');
    }
  }
  public message() {
    const messages = [
      'Attempting to escape...',
      'Bidding farewell to the world...',
      'Spreading the news of your embarking...',
    ];

    let i = Math.floor(Math.random() * messages.length);
    return messages[i];
  }
}
</script>
<style>
.log-out {
  padding: 1em;
}
</style>
