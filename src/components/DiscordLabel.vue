<template>
  <a href="http://discord.gg/hU29ZUK" target="_blank">
    <div class="discord-container">
      <img class="icon" src="@/assets/img/icon/discord.png" alt="">
      <div class="label">
        {{
          fetchStatus === -1 || fetchStatus === 0
            ? 'GrandQuest server'
            : fetchStatus
        }}
      </div>
    </div>
  </a>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Axios from 'axios';
import _ from 'underscore';

@Component
export default class DiscordLabel extends Vue {
  public fetchStatus: -1 | 0 | string = -1;
  public lastFetch = Date.now();
  
  public mounted() {
    this.fetch();
  }
  public fetch() {
    this.lastFetch = Date.now();
    this.fetchStatus = 0;
    Axios.get('https://discordapp.com/api/guilds/557628151837229074/widget.json')
    .then((res) => {
      const body = res.data as {
        channels: any,
        id: number;
        name: string;
        members: Array<{ username: string; status: 'online' | 'offline' }>;
      };

      let onlineMembers = 0;
      _.each(body.members, (user) => {
        if (user.status === 'online') {
          onlineMembers++;
        }
      });
      this.fetchStatus = `${onlineMembers} USERS ONLINE`;
    })
    .catch(() => {
      this.fetchStatus = -1;
    });
  }
  public updated() {
    const deltaTime = Date.now() - this.lastFetch;

    // fetch every 8 seconds
    if (deltaTime >= 8000 && this.fetchStatus !== 0) {
      this.fetch();
    }
  }
}
</script>
<style lang="scss" scoped>
.discord-container {
  border-radius: calc(1.5em /2);
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  margin-bottom: 1em;
  cursor: pointer;
  .icon {
    height: 1.5em;
    padding: 4px;
    background: #687fbf;
  }
  .label {
    background: #7289da;
    align-self: stretch;
    color: white;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: small;
  }
}
</style>
