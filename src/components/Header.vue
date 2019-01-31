<template>
  <div class="main-header">
    <div class="header-main">
      <div class="title-container">
        <h1>GRANDQUEST</h1>
      </div>
      <div class="auth-container">
        <div v-if="player.loading">
          <ActivityIndicator size=40 />
        </div>
        <div v-else-if="player.authenticated">
          <div class="sign">
            <h2>{{player.username}}</h2>
            <div>

            </div>
          </div>
        </div>
        <div v-else class="banner">
          <router-link to="/register">Register</router-link>
          <router-link to="/login">Log In</router-link>
        </div>
      </div>
    </div>
    <div class="header-sub">
      <ul>
        <li>
          <router-link to="/">Home</router-link>
        </li>
        <li>
          <router-link to="/forum">Forum</router-link>
        </li>
        <li>
          <router-link to="/market">Shops</router-link>
        </li>
        <li>
          <router-link to="/world">World</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ActivityIndicator from '@/components/ActivityIndicator.vue';
import { State } from 'vuex-class';
import { Player } from '../types';

@Component({
  components: { ActivityIndicator },
})

export default class Header extends Vue {
  @State public player!: Player;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
$mainBlue: #036ca5;
$mainBlack: rgb(24, 24, 24);
$mainGrey: rgb(179, 179, 179);
$mainGreen: #9dff5c;

.main-header {
  background: white;
  z-index: 100;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  .header-main {
    height: 10rem;
    background-image: url('../assets/img/landscapes/fort.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: space-between;

    .title-container {
      display: flex;
      align-items: center;
      justify-content: center;

      padding: 1em 2em 1em .75em;
      color: white;
      background: #111;
    }

    .auth-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      margin-right: 1.5em;

      .banner {
        align-self: flex-start;

        a {
          background-color: $mainGreen;
          color: white;
          text-decoration: none;
          display: inline-block;
          padding: 8px;
          font-size: large;
          border-radius: 0 0 5px 5px;
          border: none;
          transition: .2s all ease-in-out;

          &:hover {
            opacity: .9;
            cursor: pointer;
          }
          &:last-of-type {
            margin-left: 1em;
          }
        }
      }
      .sign {
        text-align: right;
        min-width: 180px;
        height: 100%;
        padding: 10px;

        color: white;
        background: saddlebrown;
        border-radius: 1em;
        h2 {
          margin: 5px;
        }
      }
    }
  }
  .header-sub ul {
    font-size: large;
    align-self: stretch;
    background: $mainBlack;
    margin: 0;
    padding: 5px 10px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    li {
      list-style: none;
    }
    a {
      color: white;
      text-decoration: none;
      margin-right: 8px;

      transition: .2s all ease-in-out;
    }
    a:hover {
      color: $mainGrey;
    }
  }
}
</style>
