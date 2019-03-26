<template>
  <div id="display">
    <header class="display-header">
      <img src="@/assets/img/icon/leaderboards.png" alt="" class="display-title">
    </header>
    <div class="body">
      <div class="leaderboards-container">
        <div class="tab-family">
          <div :class="`tab ${active === 'gold' ? 'active' : ''}`" v-on:click="setTab('gold')">
            <img src="@/assets/img/items/coins.png"> <span>Gold</span>
          </div>
          <div :class="`tab ${active === 'combat' ? 'active' : ''}`" v-on:click="setTab('combat')">
            <img src="@/assets/img/icon/monokai-village/ht.png"> <span>Hero's Trial</span>
          </div>
          <div class="tab disabled">
            <img src="@/assets/img/icon/gq.png"><span>Community</span>
          </div>
        </div>
        <div class="main-container">
          <div class="leaderboards-content">
            <ActivityIndicator v-if="results.loaded === 0" />
            <div class="error" v-else-if="results.loaded === -1">
              <p>Failed to load the leaderboards</p>
              <button v-on:click="setTab(active)" class="retry">RETRY</button>
            </div>
            <!-- Gold leaderboards -->
            <ul v-else-if="active === 'gold'" >
              <li v-for="(user, index) in results.data" :key="user.id">
                <div class="leaderboards-item-index">
                  {{index+1}}
                </div>
                <div class="leaderboards-item">
                  <div class="thumbnail">
                    <img src="@/assets/img/icon/gq.png">
                  </div>
                  <div class="leaderboards-item-content">
                    <span>{{user.username}} <span class="online-banner" v-if="world.connectedUsers[user.id]">• online</span></span>
                    <img style="margin-left: auto" src="@/assets/img/items/coins.png">
                    <span style="color: gold">{{user.gold}}</span>
                  </div>
                </div>
              </li>
            </ul>
            <!-- Combat leaderboards -->
            <ul v-else-if="active === 'combat'" >
              <div class="list-labels">
                <img style="margin-left: auto" src="@/assets/img/icon/select-target.png">
                    <span style="color: gold">highest lvl</span>
                    <img src="@/assets/img/icon/1bit-swords.png">
                    <span style="color: #01d801">lvls won</span>
                    <img src="@/assets/img/icon/1bit-shield.png">
                    <span style="color: rgb(236, 8, 8)">lvls lost</span>
              </div>
              <li v-for="(user, index) in results.data" :key="user.id">
                <div class="leaderboards-item-index">
                  {{index+1}}
                </div>
                <div class="leaderboards-item">
                  <div class="thumbnail">
                    <img src="@/assets/img/icon/gq.png">
                  </div>
                  <div class="leaderboards-item-content">
                    <span>{{user.username}} <span class="online-banner" v-if="world.connectedUsers[user.id]">• online</span></span>
                    <img style="margin-left: auto" src="@/assets/img/icon/select-target.png">
                    <span style="color: gold">{{user.max_level}}</span>
                    <img src="@/assets/img/icon/1bit-swords.png">
                    <span style="color: #01d801">{{user.levels_won}}</span>
                    <img src="@/assets/img/icon/1bit-shield.png">
                    <span style="color: rgb(236, 8, 8)">{{user.levels_lost}}</span>
                  </div>
                </div>
              </li>
            </ul>
            <div v-else-if="active === 'combat'" class="list">

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import api from '@/api';
import { ApiResponse } from 'apisauce';
import ActivityIndicator from '@/components/ActivityIndicator.vue';
import { World } from '@/types';

@Component({
  components: { ActivityIndicator },
})
export default class Leaderboards extends Vue {
  @State public world!: World;

  public active = 'gold';
  public results = {
    data: [],
    loaded: -1,
  }

  public mounted() {
    this.setTab('gold');
  }
  public setTab(newTab: string) {
    this.active = newTab;
    this.results.data = [];
    this.results.loaded = 0;

    api.get(`/leaderboards/${newTab}`)
    .then((res: ApiResponse<any>) => {
      if (this.active !== newTab) {
      // the tab was changed while we loaded
        return;
      }

      if (res.ok) {
        const body = res.data;
        this.results.loaded = 1;
        this.results.data = body.data;
      } else {
        this.results.loaded = -1;
      }
    })
  }
}
</script>
<style lang="scss" scoped>
#display {
  background-image: url('../../assets/img/textures/dark-noise.png');
  background-size: cover;
  overflow-y: scroll;
}
.leaderboards-container {
  width: 100%;
  .tab-family {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    .tab {
      padding: 6px 8px;
      background: #597dce;
      box-shadow: inset 2px 2px 2px #4669b9;
      color: white;
      font-size: large;
      display: flex;
      flex-direction: row;
      align-items: center;
      flex: 1;
      cursor: pointer;
      &:nth-child(1) {
        border-radius: 5px 0 0 0;
      }
      &:nth-last-child(1) {
        border-radius: 0 5px 0 0;
      }
      &.active {
        border-radius: 5px 5px 0 0;
        background: #6188e2;
        padding: 10px 10px;
        box-shadow: none;
      }
      img {
        height: 1.25em;
        margin-right: 10px;
      }
    }
  }
  .main-container {
    background: #6188e2;
    padding: 2em;
    border-radius: 0 0 10px 10px;
    margin-bottom: 10em;
    .leaderboards-content {
      background: #4e4a4e;
      box-shadow: inset 4px 4px 4px #140c1c;
      border-radius: 10px;
      font-size: medium;
      padding: 5px;
      position: relative;
      .activity-indicator {
        margin: auto;
      }
      .error {
        margin: auto;
        max-width: 400px;
        padding: 1em;
        background: white;
        text-align: center;
        border-radius: 1em;
        width: 75%;
        color: black;
        font-family: 'Press Start 2P', monospace;
        .retry {
          font-family: 'Press Start 2P', monospace;
          background: #d30938;
          color: white;
          border: none;
          box-shadow: 0px 0px 5px white;
          padding: 1em 2em;
          border-radius: 5px;
          &:hover {
            transform: scale(1.1);
          }
        }
      }
      ul {
        width: 100%;
        padding: 0 1em;
        .list-labels {
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
          padding: 10px;
          background: #fefefe;
          border-radius: 50px;
          margin-bottom: 1em;

          img { height: 1em; padding-left: 1em; margin-right: 5px; }
        }
        
        li {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          overflow: hidden;
          padding: 0 1em;
          border-radius: 10px;

          // style for the first player
          &:nth-of-type(1) {
            background-image: linear-gradient(to bottom, gold 80%, rgb(226, 193, 2));

            .leaderboards-item-index {
              background: #4e4a4e;
              box-shadow: inset 4px 4px 4px #140c1c;
            }
            .leaderboards-item-content {
              background: #fefefe;
              color: black;
              box-shadow: inset 4px 4px 4px #140c1c;
            }
          }

          .leaderboards-item-index {
            border-radius: 10px;
            padding: 1em 0.5em;
            margin-right: 1em;
            font-size: larger;
            align-self: center;
          }
          .leaderboards-item {
            flex: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
            border-bottom: 1px solid grey;
            padding: 8px 0;

            .thumbnail {
              height: 4em;
              width: 4em;
              background: #54a2bf;
              border-radius: 2em;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 1em;
              img { height: 2em; }
            }
            .leaderboards-item-content {
              flex: 1;
              border-radius: 10px;
              align-self: stretch;
              padding: 1em;
              display: inline-flex;
              justify-content: space-between;
              align-items: center;
              .online-banner { color: rgb(22, 206, 22); }
              img { height: 1em; padding-left: 1em; margin-right: 5px; }
            }
          }
        }
      }
    }
  }
}
</style>
