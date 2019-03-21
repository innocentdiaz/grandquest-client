<template>
  <div class="about">
    <img :src="require('@/assets/img/icon/gq.png')" id="logo">
    <h1>About GrandQuest</h1>
    <h2 class="subtitle">V 0.1.0 (beta)</h2>
    <p>
      GrandQuest is a multiplayer, community-based RPG and sequel to the text-based adventure game EpiQuest. It has been in development for around {{ timeSince }} and is driven by community and contributors.
    </p>
    <h1>The world</h1>
    <p>
      Players are free to explore the <router-link to="/world">world</router-link> and interact with different locations. Currently only one world is open for exploration, but others are in development and soon to be released.
    </p>
    <p class="subtitle">-</p>
    <p>
      For the time being, <strong>an exciting adventure awaits you</strong> if you venture into <router-link to="/world/games">Hero's Trial</router-link> - an endless multiplayer turn-based combat experience. Whoever dies with the highest level wins!
    </p>
    <div class="row">
      <div class="col">
        <h2>Developers</h2>
        <ul>
          <li>
            <a href="https://github.com/skepdimi">Skepdimi - <strong>Owner</strong></a>
          </li>
          <li>
            <a href="https://tylerdiaz.com" target="_blank">Tyler Díaz - <strong>Programming sage</strong></a>
          </li>
        </ul>
      </div>
      <div class="col">
        <h2>Artists</h2>
        <ul>
          <li>
            <a href="https://rvros.itch.io/" target="_blank">Rvros - <strong>Combat sprites</strong></a>
          </li>
          <li>
            <a href="https://cazwolf.itch.io/" target="_blank">Cazwolf - <strong>Character icons</strong></a>
          </li>
        </ul>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <h2>Under development</h2>
        <ul>
          <li>Player guilds</li>
          <li>Player avatars</li>
          <li>New worlds</li>
          <li>Combat roles</li>
          <li>Friends / private messaging</li>
          <li>New Shops</li>
          <li>More games</li>
        </ul>
      </div>
      <div class="col">
        <h2>Tech Stack</h2>
        <ul>
          <li>
            <a href="https://vuejs.org" target="_blank">Vue.js</a> (Client-side framework)
          </li>
          <li>
            <a href="https://typescriptlang.org/" target="_blank">TypeScript</a> (Client-side scripting)
          </li>
          <li>
            <a href="https://phaser.io" target="_blank">Phaser 3</a> (Game engine)
          </li>
          <li>
            <a href="https://nodejs.org" target="_blank">Node.js</a> (Server and Restful API)
          </li>
          <li>
            <a href="https://socket.io" target="_blank">Socket.io </a> (Real-time library)
          </li>
          <li>
            <a href="https://www.postgresql.org/" target="_blank">PostgreSQL</a> (Database)
          </li>
          <li>
            <a href="https://heroku.com" target="_blank">Heroku</a> (Server deployment)
          </li>
          <li>
            <a href="https://netlify.com" target="_blank">Netlify</a> (Web hosting)
          </li>
          <li>
            <a href="https://redis.io" target="_blank">Redis</a> (Caching)
          </li>
        </ul>
      </div>
    </div>
    <div>
      <h1>Contact us</h1>
      <p>
        For support, help, contributions or just to chat, you can contact the team in the 'Staff Support' channel on the <a href="http://discord.gg/hU29ZUK" target="_blank">Discord server</a>.
      </p>
    </div>
    <div v-if="!user.authenticated" class="auth-banner">
      <h2 class="main-title">Join the community!</h2>
      <div class="auth">
        <h2>Are you new to GrandQuest?</h2>
        <router-link to='/signup'>Join for free!</router-link>
      </div>
    </div>
    <div v-else>
      <h3 class="subtitle">Go out there and venture into the unknown!</h3>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import moment from 'moment';
import { User } from '@/types';

@Component
export default class About extends Vue {
  @State public user!: User;
  public timeSince: string = moment(new Date(2018, 12, 1, 1, 1, 1, 1)).toNow();
}
</script>

<style lang="scss" scoped>
.about {
  padding: 1em;

  #logo {
    float: right;
    height: 5.75em;
    border-radius: 4px;
  }
  .row {
    display: inline-flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    max-width: 950px;
    .col {
      flex: 1;
    }
  }
  p {
    max-width: 800px;
  }
  small {
    color: lightgrey;
  }
  ul {
    margin: 0;
    padding: 1em;
    border-left: 5px solid #036ca5;
    li {
      list-style: none;
      margin: 5px 0;
      a {
        transition: .2s all ease-in-out;
        &:hover {
          margin-left: 8px;
          color: rgb(177, 200, 230);
        }
      }
    }
  }
  .auth-banner {
    padding: 2em;
    margin: 1em;
    border-radius: 5px;
    background-image: linear-gradient(to bottom, #bdedff 80%, #5bd0ff);
    color: #006e9c;
    text-align: center;
    font-size: small;
    .main-title {
      color: black;
      margin: 0;
    }
    a {
      box-shadow: inset 0px 1px 0px 0px #b8fff2;
      border-radius: .5rem;
      border: 1px solid #4355b0;
      font-size: 12px;
      font-weight: bold;
      padding: 14px 7px;
      text-shadow: 1px 1px 0px #154682;
      background-image: linear-gradient(to bottom, #6ebee7, #29489e);
      color: white;
      &:hover {
        background-image: linear-gradient(to top, #6ebee7, #29489e);
      }
    }
  }
}
</style>
