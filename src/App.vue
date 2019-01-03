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
import VueSocketIO from 'vue-socket.io';
import Header from './components/Header.vue';
import api from '@/api';
import store from '@/store.ts';

Vue.use(new VueSocketIO({
  // debug: process.env.NODE_ENV === 'development',
  connection: `${api.getBaseURL()}/game`,
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_',
  },
}));

@Component({
  components: {
    Header,
  },
})
export default class App extends Vue {
  @State    public user!: User;
  @Action   public fetchUser: any;
  @Mutation public setUser: any;
  @Mutation public setUserUnauthorized: any;
  @Mutation public setWorldConnected: any;
  @Mutation public setWorldLoading: any;

  private async mounted() {
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

    this.$socket.on('connect', () => {
      this.setWorldConnected(true);
      this.setWorldLoading(false);

      console.log('SOCKET: connected !');
      if (this.user.authenticated) {
        console.log('SOCKET: authenticating');
        this.$socket.emit('AUTHENTICATE_SOCKET', this.user.currentJWT);
      }
    });
    this.$socket.on('connect_error', (error) => {
      this.setWorldConnected(false);
      this.setWorldLoading(false);
      console.log('SOCKET: Connection Error');
    });
    this.$socket.on('reconnect_attempt', () => {
      console.log('SOCKET: Recon attempt');
    });
    this.$socket.on('reconnect_error', () => {
      console.log('SOCKET: Recon FAIL!');
    });
    this.$socket.on('disconnect', () => {
      this.setWorldConnected(false);
      console.log('SOCKET: Disconnect');
    });

    const JWT = localStorage.getItem('grandquest:jwt');

    if (JWT) {
      this.fetchUser(JWT);
      this.$socket.emit('AUTHENTICATE_SOCKET', JWT);
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
  height: 100vh;
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
</style>
