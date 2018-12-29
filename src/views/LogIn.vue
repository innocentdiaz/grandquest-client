<template>
  <div class="log-in">
    <aside>
      <h1>GrandQuest: live feed!</h1>

      [ Feed coming soon ]
    </aside>
    <div class="content">
      <h1>Welcome back!</h1>
      <h2 class="subtitle">Long time no see</h2>
      <div v-if="formLoading">
        <ActivityIndicator />
      </div>
      <form v-on:submit.prevent="onSubmit" v-else>
        <label>Email</label>
        <input type="email" placeholder="GrandQuest email" v-model="email">
        <label>Password</label>
        <input type="password" placeholder="GrandQuest password" v-model="password">
        <button :disabled="formLoading">
          Log In
        </button>
        <p class="error">
          {{ apiError }}
        </p>
      </form>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Mutation, Action } from 'vuex-class';
import ActivityIndicator from '@/components/ActivityIndicator.vue';

import api from '@/api';
import { ApiResponse } from 'apisauce';

@Component({
  components: { ActivityIndicator },
})
export default class LogIn extends Vue {
  @Mutation public setUser: any;
  @Mutation public setJWT: any;

  public email = '';
  public password = '';

  public formLoading = false;
  public apiError = '';

  public onSubmit() {
    const { email, password } = this;

    this.formLoading = true;
    this.apiError = '';

    api.post('/auth', { email, password })
    .then((res: ApiResponse<any>) => {
      const body = res.data;

      if (res.ok) {
        const JWT = res.headers.authorization;
        const user = res.data.payload;

        localStorage.setItem('grandquest:jwt', JWT);

        this.setUser(user);
        this.setJWT(JWT);

        this.$router.replace('/forum');
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
  padding: 1em;

  aside {
    margin-right: 3em;
    float: left;
    clear: right;
    min-height: 50vh;
  }
  .content {
  }
}
</style>
