<template>
    <div class="forum">
        <div class="control">
            <div class="user-control" v-if="user.authenticated">
                <h2>{{user.username}}</h2>
                <p>Joined {{userJoinDate}}</p>
            </div>
            <div class="user-control" v-else>
                <h2>Have an account?</h2>
            </div>
            <div class="selected-board-control">
                <h2>Side info...</h2>
            </div>
        </div>

        <div class="forum-content">
            <div class="forum-main">
                <!-- header rendering -->
                <div class="header">
                    <router-link to="/forum" class="forum-link">FORUMS - </router-link>
                </div>

                <div v-if="post.status == null" class="mainBoard">
                    <ActivityIndicator/>
                </div>
                <div v-else-if="post.status === 404" class="mainBoard">
                    <h1>404!</h1>
                    <p>Whoops! Looks like this post does not exist!</p>
                </div>
                <div v-else-if="post.status !== 200" class="mainBoard">
                    <h1>Something went wrong</h1>
                    <p>Whoops! Something is wrong with our servers. Our code dwarves are working on fixing it as soon as possible.</p>
                    <router-link to="/">Back home</router-link>
                </div>
                <div
                        v-else
                        class="mainBoard post-container"
                >
                    <span class="forum-link back" v-on:click="() => this.$router.back()">
                        Back to boards
                    </span>

                    <div class="post-content">
                        <h1 class="title">{{ post.title }}</h1>
                        <span class="subtitle">Created {{sinceDate(post.created_at)}} by {{ post.user ? post.user.username : 'an anonymous user' }}</span>
                        <p class="body">
                            {{ post.body }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import { State, Getter } from 'vuex-class';
  import { User } from '@/types';
  import api from '@/api';
  import {ApiResponse} from 'apisauce';
  import ActivityIndicator from '@/components/ActivityIndicator.vue';
  import moment from 'moment';

  @Component({
    components: { ActivityIndicator }
  })
  export default class Post extends Vue {
    @State public user!: User;
    @Getter userJoinDate: string;

    public post = {
      title: '',
      body: '',
      user: null,
      created_at: '',
      status: null,
    };

    public mounted() {
      api.get(`/posts/${this.$route.params.post_id}`)
        .then((res: ApiResponse<any>) => {
          if (res.ok) {
            this.post = res.data.payload;
          }

          this.post.status = res.status || 500;
        });
    }
    public sinceDate(d: Date) {
      return moment(d).fromNow();
    }
  }
</script>
<style lang="scss">
    .post-container {
        .post-content {
            padding: .5em 0;
            min-height: 50vh;

            .title {

            }
            .body {

            }
        }
    }
</style>