<template>
  <div class="about">
    <img :src="require('@/assets/img/logo.png')" id="logo">
    <h1>About GrandQuest</h1>
    <h2 class="subtitle">V 0.0.1 (alpha)</h2>
    <p>
      GrandQuest is a multiplayer RPG and sequel to my text-based adventure game called EpiQuest. 
      GrandQuest has been in development for around {{ timeSince }} as a way to gain experience building real-time games using the latest 
      technologies, while building a world and community. GrandQuest is driven by contributors, like...
    </p>
    <h2>Contributors</h2>
    <ul>
      <li>
        <a href="https://www.artstation.com/olgaok" target="_blank">Olga Ok</a> (Art)
      </li>
      <li>
        <a href="https://cazwolf.itch.io/" target="_blank">Cazwolf</a> (Art)
      </li>
      <li>
        <a href="https://rvros.itch.io/" target="_blank">Rvros</a> (Art)
      </li>
      <li>
        <a href="https://tylerdiaz.com" target="_blank">Tyler Díaz</a> (Programming)
      </li>
      <li>
        <a href="https://thkaspar.itch.io/" target="_blank">Thkaspar</a> (Art)
      </li>
    </ul>
    <small>If you wish to contribute with your programming, art or other skills, shoot me a message!</small>
    <h1>Under development</h1>
    <ul>
      <li>Player guilds</li>
      <li>Player roles</li>
      <li>Friends / private messaging</li>
      <li>Player levels and upgrades</li>
      <li>New Shops</li>
      <li>Live feeds</li>
      <li>More games</li>
    </ul>
    <small>For any suggestions feel free to message us</small>
    <h1>Technologies</h1>
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
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import moment from 'moment';

@Component
export default class About extends Vue {
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
  p {
    max-width: 800px
  }
  small {
    color: lightgrey;
  }
  ul {
    li {
      margin: 5px 0;
    }
  }
}
</style>
