<template>
  <div class="main-header">
    <div class="header-main">
      <div class="title-container">
        <img src="../assets/img/icon/grandquest.png" alt="GrandQuest">
      </div>
      <div class="auth-container">
        <div v-if="player.loading">
          <ActivityIndicator size=40 />
        </div>
        <div v-else-if="player.authenticated">
          <div class="sign">
            <h2>{{player.username}}</h2>
            <hr>
            <div>
              <p>{{socket.connected ? '' : socket.loading ? 'Connecting to server...' : 'Disconnected from server'}}</p>
              <p class="gold"><img src="../assets/img/items/coins.png" alt="">{{player.gold.toLocaleString()}}</p>
              <div class="level-container">
                <span class="icon">
                  {{player.level}}
                </span>
                <div class="progress">
                  <span class="label">{{player.xp}}/{{player.nextLevelXp}}</span>
                  <div class="juice" :style="`width: ${(player.xp / player.nextLevelXp) * 100}%;`"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="banner">
          <router-link to="/register">Register</router-link>
          <router-link to="/login">Log In</router-link> 
          <img v-if="!socket.connected"
            src="https://cdn2.iconfinder.com/data/icons/prohibitions/105/12-512.png" 
            title="Not connected to the server. Sorry :(" 
            alt="" 
            height="20"
          />
        </div>
      </div>
    </div>
    <div class="header-sub">
      <ul>
        <li>
          <router-link to="/" exact active-class="active-link">Home</router-link>
        </li>
        <li>
          <router-link to="/about" active-class="active-link">About</router-link>
        </li>
        <li>
          <router-link to="/forum" active-class="active-link">Forum</router-link>
        </li>
        <li>
          <router-link to="/world" active-class="active-link">World</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ActivityIndicator from '@/components/ActivityIndicator.vue';
import { State } from 'vuex-class';
import { Player, SocketState } from '../types';

@Component({
  components: { ActivityIndicator },
})

export default class Header extends Vue {
  @State public player!: Player;
  @State public socket!: SocketState;
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

      padding: 1em 5em 1em .75em;
      color: white;
      font-family: 'Lora', serif;
      background-image: linear-gradient(to right, white 30%, rgba(255, 255, 255, 0.5) 70%,transparent 90%);

      img {
        height: 70px;
      }
    }

    .auth-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      padding: 0 0.75em 1em 6em;
      background-image: linear-gradient(to left, white 70%, transparent);
      .banner {
        align-self: flex-start;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        a {
          padding: 0.75em 1em;
          box-shadow: inset 0px 1px 0px 0px #b8fff2;
          border-radius: 0 0 .5rem .5rem;
          border: 1px solid #4355b0;
          font-weight: bold;
          text-shadow: 1px 1px 0px #154682;
          background-image: linear-gradient(to bottom, #6ebee7, #29489e);
          color: white;
          &:hover {
            background-image: linear-gradient(to top, #6ebee7, #29489e);
          }
          &:last-of-type {
            margin-left: 1em;
          }
        }
      }
      .sign {
        min-width: 180px;
        height: 100%;
        padding: 10px;

        color: #bbbdaf;
        border-radius: 1em;
        hr {
          border: 0.5px solid #bbbdaf;
        }
        h2 {
          font-weight: normal;
          margin: 5px 0;
        }
        p {
          margin: 5px 0;
        }
        .gold {
          height: 1em;
          color: #d6ce59;
          display: flex;
          flex-direction: row;
          align-items: center;
          img {
            height: 1.5em;
            margin-right: 0.75em;
          }
        }
        .level-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          .icon {
            height: 20px;
            width: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            background-image: url('../assets/img/misc/gold-frame.png');
            background-position: center center;
            background-repeat: no-repeat;
            background-size: contain;
            height: 45px;
            font-size: 15px;
            margin-right: 10px;
          }
          .progress {
            flex: 1;
            position: relative;
            background: #424242;
            border: 2px solid #3b3b3b;
            height: 1.5em;
            border-radius: 2px;

            .label {
              position: absolute;
              display: flex;
              justify-content: center;
              align-items: center;
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
              color: white;
              font-size: 0.8em;
              text-shadow: 0 0px 2px #d401d4;
            }
            .juice {
              background-image: linear-gradient(to bottom, #a700a7 80%, #800080);
              height: 100%;
              width: 50%;
            }
          }
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
