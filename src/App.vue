<template>
  <div class="root">
    <Header />
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { User } from '@/types';
import { State, Action, Mutation } from 'vuex-class';
import Header from './components/Header.vue';
import api from '@/api';
import store from '@/store.ts';

@Component({
  components: {
    Header,
  },
})
export default class App extends Vue {
  @Action public INIT_AUTH: any;

  private async mounted() {
    /*
      Pending logout request
    */
    let pendingLogoutJWT = localStorage.getItem('grandquest:pending_logout');

    if (pendingLogoutJWT) {
      console.log('pending jwt logout');
      let res = await api.delete(`/auth/${pendingLogoutJWT}`)
      if (res.ok) {
        localStorage.removeItem('grandquest:pending_logout');
        location.reload();
      } else {
        console.log('could not request log out');
      }
    }

    this.INIT_AUTH();
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Press+Start+2P');

$mainBlue: #036ca5;
$mainBlack: rgb(24, 24, 24);
$mainGrey: rgb(179, 179, 179);
$mainBlueHover: #005e91;
$mainLightGrey: #e0e0e0;

body {
  padding: 0;
  margin: 0;

  font-family: 'Roboto', sans-serif;
}

button {
  cursor: pointer;
}

.root {
  min-height: 100vh;
  width: 100%;
}

a {
  color: $mainBlue;
  text-decoration: none;
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
  textarea {
    margin-top: 5px;
    border: 1px solid $mainLightGrey;
    border-bottom: 2px solid $mainBlue;
    min-height: 4em;
    padding: 5px;
    font-family: sans-serif;
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
// canvas {
//   cursor: url('./assets/img/icon/select-target-hand.png'), auto;
// }
</style>
