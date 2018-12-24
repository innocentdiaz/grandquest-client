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
    } else if (cachedUser /* make sure the user is not online */) {
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
$mainBlueHover: #005e91;

body {
  padding: 0;
  margin: 0;

  font-family: 'Roboto', sans-serif;
}

button {
  cursor: pointer;
}

.root {
  height: 100vh;
  width: 100%;
}

a {
  color: $mainBlue;
  font-decoration: none;
}

.admin-label {
  background-color: gold;
  color: white;
  border-radius: 5px;
  padding: 5px;
}
.subtitle {
  color: $mainGrey;
  font-weight: lighter;
}

form {
  display: flex;
  flex-direction: column;
  align-items: left;
  text-align: left;
  label {
    color: $mainBlue;
    font-size: medium;
  }

  input {
    border: 0px;
    padding: .5rem .25rem .5rem .1rem;
    margin-bottom: 1.8em;
    font-size: 1rem;

    transition: .2s all ease-in-out;
    border-bottom: 2px solid $mainBlue;
    &:disabled {
      background: rgb(216, 216, 216);
    }
    &:invalid {
      border-bottom: 2px solid red;
      box-shadow: none;
    }
  }
  select {
    border: 0;
    background: rgb(228, 228, 228);
    padding: .5rem;
    border-radius: 5px;
  }
  button {
    background: $mainBlue;
    color: white;
    font-size: large;
    border-radius: 5px;
    border: 0;
    margin-top: 1em;
    padding: .5rem;

    transition: .1s all ease-in-out;

    &:hover {
      cursor: pointer;
      background: $mainBlueHover;
    }
    &:disabled {
      cursor: default !important;
      background: $mainGrey;
    }
  }
  .error {
    color: rgb(255, 49, 49);
  }
}
</style>
