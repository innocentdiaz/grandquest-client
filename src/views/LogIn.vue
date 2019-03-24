<template>
  <div class="log-in" v-if="!user.authenticated">
    <router-link to="/">
      <img src="@/assets/img/icon/grandquest.png" id="icon" alt="GrandQuest">
    </router-link>
    <div v-if="formLoading">
      <ActivityIndicator />
    </div>
    <form v-on:submit.prevent="onSubmit" v-else>
      <p class="form-error" v-if="apiError">
        {{ apiError }}
      </p>
      <label>Email</label>
      <input type="email" placeholder="GrandQuest email" v-model="email">
      <div class="input-sub"></div>

      <label>Password</label>
      <input type="password" placeholder="GrandQuest password" v-model="password">
      <div class="input-sub"></div>

      <button :disabled="formLoading">
        Log In
      </button>
    </form>
  </div>
  <div class="log-in" v-else>
    <router-link to="/">
      <img src="@/assets/img/icon/grandquest.png" id="icon" alt="GrandQuest">
    </router-link>
    <div class="content">
      <h1>Congrats!</h1>
      <h2 class="subtitle">You're already authenticated! Go and have some fun.</h2>
      <router-link to="/world">Back home</router-link>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Mutation, Action, State } from 'vuex-class';
import ActivityIndicator from '@/components/ActivityIndicator.vue';

import api from '@/api';
import { ApiResponse } from 'apisauce';
import { User } from '@/types';

@Component({
  components: { ActivityIndicator },
})
export default class LogIn extends Vue {
  @State public user!: User;
  @Mutation public SET_HEADER_VISIBILITY: any;
  @Mutation public UPDATE_SOCKET_PLAYER: any;
  @Action public INIT_SOCKET: any;

  public email = '';
  public password = '';

  public formLoading = false;
  public apiError: string | null = null;

  public mounted() {
    this.apiError = null;
    this.SET_HEADER_VISIBILITY(false);
  }
  public destroyed() {
    this.SET_HEADER_VISIBILITY(true);
  }
  public onSubmit() {
    const { email, password } = this;

    this.formLoading = true;
    this.apiError = null;

    // request creation of new JWT token
    api.post('/auth', { email, password })
    .then((res: ApiResponse<any>) => {
      const body = res.data;

      if (res.ok) {
        if (!res.headers) return;
        const headers: any = {...res.headers};
        const JWT = headers.authorization;

        localStorage.setItem('grandquest:jwt', JWT);

        this.INIT_SOCKET();

        this.$router.push('/forum');
      } else {
        this.apiError = body.errors
          ? body.errors.join(', ') + '.'
          : 'Failed to communicate with our servers. Please try again later';
      }

      this.formLoading = false;
    });
  }
}
</script>
<style lang="scss">
.log-in {
  height: 100vh;
  width: 100%;
  background-image: linear-gradient(to bottom, #5bd0ff 20%, #bdedff 80%, #5bd0ff);
  text-align: center;
  #icon {
    height: 4em;
    margin: 5em auto 3em auto;
  }
  form, .content {
    padding: 1em;
    margin: auto auto;
    width: 75%;
    border-radius: 6px;
    box-shadow: 0px 0px 10px #00000085;
    background-image: linear-gradient(to bottom, rgb(236, 244, 244) 50%, rgb(195, 218, 236) 100%);;
    input {
      padding: 6px 8px;
      color: white;
      background: #006e9c;
      border: 1px solid #000527;
      border-radius: 5px;
    }
    button {
      margin: auto;
      width: 40%;
    }
  }
}
</style>
