<template>
    <div class="submit-container" v-if="!user.loading && !user.authenticated">
        <h1>Just one second..</h1>
        <p>You need to be
            <router-link to="/login">logged in</router-link>
            in order to create a post.
        </p>
    </div>
    <div class="submit-container .loading" v-else-if="board.status === null">
        <ActivityIndicator size="36"/>
    </div>
    <div class="submit-container" v-else-if="board.status !== 200">
        <h1>This is unexpected</h1>
        <p>We could not find the board you are trying to post to. Please try again later.</p>
    </div>
    <div class="submit-container" v-else>
        <aside>
            <h1>{{ board.title }}</h1>
            {{ board.description }}
        </aside>
        <div v-if="post.loading">
           <h2>Attempting to upload your work of art... <ActivityIndicator size="20"/></h2>
        </div>
        <div v-else>
            <router-link :to="'/board/' + board.id " class="forum-link back">Back to {{board.title}}</router-link>
            <h1>Create post</h1>
            <p>Helpful links: <router-link to="wip">Guidelines</router-link> - <router-link to="/login">Login</router-link></p>
            <form v-on:submit.prevent="onSubmit">
                <label>
                    Title
                </label>
                <input type="text" v-model="post.title">
                <label>
                    Body
                </label>
                <textarea v-model="post.body"></textarea>
                <button>
                    Submit topic
                </button>
                <p class="error">{{ post.apiError }}</p>
            </form>
        </div>
    </div>
</template>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import { State } from 'vuex-class';
  import { User } from '@/types';
  import { ApiResponse } from 'apisauce';
  import api from '@/api';
  import ActivityIndicator from '@/components/ActivityIndicator.vue';

  interface Board {
      id:     null|number;
      title:  string;
      status: null|number;
  }
  @Component({
    components: {ActivityIndicator},
  })
  export default class Post extends Vue {
    @State public user!: User;

    public board: Board = {
      id: null,
      title: '',
      status: null,
    };
    public post = {
      title: '',
      body: '',
      loading: false,
      apiError: '',
    };

    public mounted() {
      api.get(`/boards/${this.$route.params.board_id}`)
      .then((res: ApiResponse<any>) => {
        if (res.ok) {
          this.board = res.data.payload;
        }
        this.board.status = res.status || 500;
      });
    }

    // TODO: add requirements for posting fields like length
    public onSubmit() {
      this.post.apiError = '';
      this.post.loading = true;

      api.post(`/posts/${this.board.id}`, this.post)
        .then((res: ApiResponse<any>) => {
          const body = res.data;

          if (res.ok) {
            this.$router.push({
              name: 'post',
              params: {
                post_id: body.payload.id,
              },
            });
          } else {
            this.post.apiError = body.errors
              ? body.errors.join(', ') + '.'
              : 'Failed to communicate with our servers. Please try again later.';
          }

          this.post.loading = false;
        });
    }
  }
</script>
<style lang="scss">
    $mainLightGrey: #e0e0e0;
    .submit-container {
        padding: 1em;

        aside {
            float: right;
            min-height: 150px;
            max-width: 25%;
            padding: 1.2em;
            background: $mainLightGrey;
            border-radius: 10px;
            margin-left: 3em;
        }

        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
</style>