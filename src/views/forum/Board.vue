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
            <div class="selected-board-control" v-if="!board.loading">
                <h2>{{board.title}}</h2>
                <span v-if="board.admin_managed" class="admin-label">
                    Admin managed
                    <br>
                </span>
                <h3>Live chat coming soon</h3>
            </div>
            <div class="selected-board-control" v-else>
                <ActivityIndicator/>
            </div>
        </div>

        <div class="forum-content">
            <div class="forum-main">
                <!-- header rendering -->
                <div class="header">
                    <router-link to="/forum" class="forum-link">FORUMS - {{ selectedForumTitle() }} / </router-link>
                    <span>{{ board.title }}</span>
                </div>

                <div
                        class="mainBoard"
                >
                    <router-link to="/forum" class="forum-link back">
                        Back to forums
                    </router-link>
                    <router-link
                            v-if="board.id && !board.admin_managed || board.admin_managed && user.is_admin"
                            :to="'/submit/post/' + board.id "
                            class="forum-link back create-post-btn"
                    >
                        Create Post
                    </router-link>

                    <h1>{{ board.title }}</h1>
                    <p>{{ board.description }}</p>
                    <div class="board-posts">
                        <div v-if="board.loading">
                            <ActivityIndicator size="36"/>
                        </div>
                        <div v-else class="post">
                            <div v-if="board.posts.length">
                                <div v-for="post in board.posts" :key="post.id" class="post-link-container" v-on:click="setPost(post)">
                                    <h1 class="title">{{ post.title }}</h1>
                                    <p class="preview">{{ post.body }}</p>
                                    <span class="footer">Submitted {{sinceDate(post.created_at)}} by {{ post.user ? post.user.username : ' an anonymous user' }}</span>
                                </div>
                            </div>
                            <div v-else>
                                <p>There are no posts in this board.</p>
                                <router-link v-if="!board.admin_managed">Be the first!</router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, State } from 'vuex-class';
import { User } from '@/types';
import ActivityIndicator from '../../components/ActivityIndicator.vue';
import api from '../../api';
import { ApiResponse } from 'apisauce';
import moment from 'moment';

@Component({
  components: { ActivityIndicator },
})

export default class Board extends Vue {
  @State public user!: User;
  @Getter public userJoinDate!: string;

  public board = {
    title: '',
    description: '',
    posts: [],
    admin_managed: false,
    loading: true,
  };

  public mounted() {
    this.board.loading = true;

    api.get(`/boards/${this.$route.params.board_id}`)
    .then((res: ApiResponse<any>) => {
      if (res.ok) {
        this.board = res.data.payload;
      }

      this.board.loading = false;
    });
  }

  public selectedForumTitle() {
    return this.$route.params.forum;
  }
  public sinceDate(d: Date) {
    return moment(d).fromNow();
  }

  public setPost(post: { id: number }) {
    this.$router.push({
      name: 'post',
      params: {
        forum_title: this.selectedForumTitle(),
        board_id: this.board.id,
        post_id: String(post.id),
      },
    });
  }
}
</script>
<style lang="scss">
    $mainBlue: #036ca5;
    $mainBlack: rgb(24, 24, 24);
    $mainGrey: rgb(179, 179, 179);
    $mainBlueHover: #005e91;

    .create-post-btn {
        background-color: $mainBlue !important;
        color: white !important;
        border: none;
        margin-left: 10px;

        &:hover {
            background-color: $mainBlueHover !important;
        }
    }
</style>