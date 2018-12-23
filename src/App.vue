<template>
  <div class="root">
    <Header />
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Action, Mutation } from 'vuex-class';
import Header from './components/Header.vue';

@Component({
  components: {
    Header,
  },
})
export default class App extends Vue {
  @Action   public fetchUser: any;
  @Mutation public setUser: any;
  @Mutation public setUserUnauthorized: any;

  private mounted() {
    const JWT = localStorage.getItem('grandquest:jwt');
    const cachedUser = localStorage.getItem('grandquest:cache_user');

    if (JWT) {
      this.fetchUser(JWT);
    } else if (cachedUser) {
      this.setUser(JSON.parse(cachedUser));
    } else {
      this.setUserUnauthorized();
    }
  }
}
</script>

<style lang="scss">
$mainBlue: #036ca5;
$mainBlack: rgb(24, 24, 24);
$mainGrey: rgb(179, 179, 179);

body {
  padding: 0;
  margin: 0;

  font-family: 'Roboto', sans-serif;
}

.root {
  height: 100vh;
  width: 100%;
}

.admin-label {
  background-color: gold;
  color: white;
  border-radius: 5px;
  padding: 5px;
}
  a{
    color: $mainBlue;
    font-decoration: none;
  }
</style>
