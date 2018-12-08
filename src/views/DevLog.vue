<template>
  <div class="devlog">
    <div class="main-thumb"></div>
    <div class="main">
      <div class="content">
        <h1 class="title">GrandQuest - Devlog</h1>
        <div id="devlog-container">
          <div v-if="loading">
            <span>
              Now loading devlogs
              <ActivityIndicator/>
            </span>
          </div>
          <div v-else-if="devLogs.length">
            <div v-for="log in devLogs" :key="log.id" class="devlog-item" v-on:click="navigateTo(log.id)">
              <h2 class="title">{{log.title}}</h2>
              <span>Created {{new Date(log.ts).toLocaleDateString()}}</span>
            </div>
          </div>
          <div v-else>
            <p>D'oh! No devlogs are available at the moment.</p>
          </div>
        </div>
        <div :if="!loading && devLogs.length">
          <p id="end-text">You've made it to the end of the log!</p>
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
  methods: {
    navigateTo: function (devLogId) {
      this.$router.push(`/devlog/${devLogId}`)
    },
    setLog: function(id) {
      api.get(`/devlog/${id}`)
      .then((res) => {
        if (res.ok) {
          // set html
        }
      });
    }
  }
})

export default class DevLog extends Vue {
  private mounted() {
    const { id } = this.$route.params

    if (id) {
      // request and show the devlog html!
    } else {
      api.get('/devlog')
      .then((res) => {
        const body = {...res.data};

        if (res.ok) {
          this.devLogs = body.data;
        }

        this.loading = false
      });
    }
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
    min-height: 70vh;

    .devlog-item {
      border-bottom: 1px solid $mainGrey;
      padding-bottom: 1em;
      width: 100%;
      cursor: pointer;
      user-select: none;
      .title {
        font-weight: lighter;
        margin-bottom: 10px;
        transition: .25s all ease-in-out;
      }
    }
    .devlog-item:hover {
      .title {
        color: $mainBlue;
      }
    }
  }

  #end-text {
    color: $mainGrey;
    font-size: large;
    font-weight: lighter;

    margin-top: 2em;
  }
}
</style>
