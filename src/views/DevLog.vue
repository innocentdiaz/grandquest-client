<template>
  <div class="devlog">
    <div class="main-thumb"></div>
    <div class="main">
      <div class="content">
        <h1 v-if="!selectedBlog" class="title" >GrandQuest - Devlog</h1>
        <h2 v-else class="subtitle-back" v-on:click="navigateTo(false)">Back</h2>
        <div id="devlog-container">
          <div v-if="loading">
            <span>
              Now loading 
              <ActivityIndicator/>
            </span>
          </div>
          <div v-else-if="selectedBlog">
            <h1 class="log-title">{{ selectedBlog.title }}</h1>
            <h2 class="date">Created {{new Date(selectedBlog.ts).toLocaleDateString()}}</h2>
            <div class="log-single" v-html="selectedBlog.html">
            </div>
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
import { ApiResponse } from 'apisauce';
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
      selectedBlog: null,
      devLogs: [],
    };
  },
})

export default class DevLog extends Vue {
  private mounted() {
    const id = typeof this.$route.params.id === 'string' && !isNaN(Number(this.$route.params.id))
      ? Number(this.$route.params.id)
      : false;

    if (id) {
      this.setLog(id);
    } else {
      this.fetchBlogs();
    }
  }
  private navigateTo(id: any) {
    if (!id) {
      this.$router.replace(`/devlog`);
      this.fetchBlogs();
    } else {
      this.$router.replace(`/devlog/${id}`);
      this.setLog(id);
    }
  }
  private fetchBlogs() {
    this.$data.loading = false;
    this.$data.selectedBlog = null;
    this.$data.devLogs = [];

    api.get('/devlog')
    .then((res: ApiResponse<any>) => {
      const body = res.data;

      if (res.ok) {
        this.$data.devLogs = body.data;
      }

      this.$data.loading = false;
    });
  }
  private setLog(id: any) {
    this.$data.loading = true;
    api.get(`/devlog/${id}`)
    .then((res: ApiResponse<any>) => {
      this.$data.loading = false;
      if (res.ok) {
        const body = res.data;
        this.$data.selectedBlog = body.data;
      } else {
        this.showError('Could not load html');
      }
    });
  }
  private showError(err: string) {
    alert(err);
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
  .subtitle-back {
    transition: .2s all ease-in-out;
  }
  .subtitle-back:hover {
    color: $mainBlue;
    cursor: pointer;
    padding-left: 2px;
    border-left: 5px solid $mainBlue;
  }

  #devlog-container {
    min-height: 70vh;

    .log-title {
      margin-bottom: 0;
    }
    .date {
      margin-bottom: 2em;
      color: $mainGrey;
      font-size: large;
      font-weight: lighter;
    }
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
