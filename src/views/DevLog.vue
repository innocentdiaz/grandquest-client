<template>
  <div class="devlog">
    <div class="main-thumb"></div>
    <div class="main">
      <div class="content">
        <h1>GrandQuest - Devlog</h1>
        <div id="devlog-container">
          <div v-if="loading">
            <span>
              Now loading devlogs
              <ActivityIndicator/>
            </span>
          </div>
          <div v-else-if="devLogs.length">

          </div>
          <div v-else>
            <p>No devlogs are available at the moment!</p>
          </div>
        </div>
      </div>
      <aside>
        <h2>RECENT ACTIVITY</h2>
        <hr/>
        <p>no recent activity</p>
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ActivityIndicator from '../components/ActivityIndicator.vue';
import api from '../api';

@Component({
  components: {
    ActivityIndicator,
  },
  data() {
    return {
      loading: true,
      devLogs: [],
    };
  },
})

export default class DevLog extends Vue {
  private mounted() {
    if (true) return

    api.get('/devlog')
    .then((res) => {
      const ok = res.ok;
      const body = {...res.data};

      if (ok) {
        this.devLogs = body.data;
      }

      this.loading = false
    });
  }
}
</script>

<style lang="scss">
$mainBlue: #036ca5;
$mainBlack: rgb(24, 24, 24);
$mainGrey: rgb(179, 179, 179);

.devlog {
  min-height: 100vh;

  .main-thumb {
    min-height: 10rem;
    background-image: url('../assets/img/devlog.jpeg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    background-attachment: fixed;
  }
  .main {
    background-image: white;
    padding: 1em;
    .content {
      float: left;
    }
    aside {
      float: right;
      max-width: 400px;

      hr {
        border: 2px solid $mainBlack;
      }
    } 
  }

  #devlog-container {
    .devlog-item {
      border-bottom: 1px solid $mainGrey;
      padding: .5em 0;
      cursor: pointer;
      user-select: none;
    }
    .devlog-item:hover {
      .title {
        color: $mainBlue;
      }
    }
  }
}
</style>
