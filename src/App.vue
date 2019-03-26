<template>
  <div class="root">
    <Header v-if="headerVisibility"/>
    <div id="app-body">
      <router-view/>
    </div>
    <Footer v-if="headerVisibility"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State, Action, Mutation } from 'vuex-class';
import Header from './components/Header.vue';
import Footer from '@/components/Footer.vue';
import api from '@/api';
import store from '@/store.ts';

@Component({
  components: {
    Header,
    Footer,
  },
})
export default class App extends Vue {
  @State public headerVisibility!: boolean;
  @Action public OPEN_SOCKET: any;

  private async mounted() {
    this.OPEN_SOCKET();
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Press+Start+2P');
@import url('https://fonts.googleapis.com/css?family=Lora');

$mainBlue: #036ca5;
$mainBlack: rgb(24, 24, 24);
$mainGrey: rgb(179, 179, 179);
$mainBlueHover: #005e91;
$mainLightGrey: #e0e0e0;

* {
  box-sizing: border-box;
}

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
  &.active-link {
    color: $mainGrey !important;
  }
}

.hr-text {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 2px 0;
  span {
    margin: 0 5px;
    color: rgba(255, 255, 255, 0.925);
  }
  hr {
    flex: 1;
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.925);
  }
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

  .form-error {
    background: rgb(255, 49, 49);
    color: white;
    padding: 1em;
    border-radius: 5px;
  }
  label {
    color: $mainBlue;
    font-size: medium;
  }
  input {
    border: 0px;
    padding: .5rem .25rem .5rem .1rem;
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
  .input-sub {
    margin-bottom: 1.8em;
    p {
      margin: 0;
      color: $mainGrey;
      &.error {
        color: rgb(255, 49, 49);
      }
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
}
span, p {
  &.green {
    color: #56F33E;
  }
  &.red {
    color: #ca4249;
  }
}
.GUI {
  background: rgba(24, 24, 24, 0.856);
  display: inline-flex;
  align-items: stretch;
  justify-content: space-between;
  height: 27vh;
  font-family: 'Press Start 2P', monospace;
  padding: 10px;
  color: white;

  transition: .75s height ease-in-out;
}
.GUI > div {
  flex: 1;
}
.GUI li {
  list-style-type: none;
  transition: .1s all ease-in-out;
}
.GUI li.active {
  color: rgb(199, 199, 199);
  padding-left: 2px;
  list-style-image: url('./assets/img/icon/select-hand.png');
}
.GUI .left {
  border-right: 2px solid white
}
.GUI .right {
  border-left: 2px solid white
}
.GUI li {
  user-select: none;
  cursor: pointer;
}
.GUI li.disabled {
  color: rgb(87, 87, 87);
  cursor: default;
}
.GUI.disabled li.active {
  color: grey;
  padding-left: 2px;
}
.GUI.GUI.disabled li {
  cursor: default;
}
.stats-container {
  padding: 10px 20px 10px 0;

  .energy-container {
    header {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .bar {
      padding: 0;
      height: 1.5em;
      display: flex;
      flex-direction: row;
      align-items: stretch;
      .juice {
        background: linear-gradient(to bottom, rgb(0, 218, 218) 60%, rgb(21, 182, 182));
      }
    }
  }
}
.GUI #gui-description-container {
  ul {
    padding-left: 1em;
    border-left: 5px solid gray;
  }
}
.GUI.faded {
  & > div:nth-child(1) {
    opacity: 0.5;
  }
  & > div:nth-child(2) {
    opacity: 0.5;
  }
}
.GUI.hidden {
  opacity: 0;
}
.hp-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;

  header {
    display: inline-flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }
  .bar {
    padding: 0;
    background: black;
    height: 1.5em;
    display: flex;
    flex-direction: row;
    align-items: stretch;

    .juice {
      background-image: linear-gradient(to bottom, #56F33E 60%, rgb(66, 206, 44));
    }
  }
}

#loading-screen {
  background: rgb(19, 19, 19);
  color: white;
  position: absolute;
  width: 100%;
  height: 100vh;
  z-index: 50;
  &.blur {
    .icon {
      filter: blur(20px);
    }
    .tip {
      filter: blur(20px);
    }
    .loading-text {
      filter: blur(20px);
    }
  }
  .icon {
    cursor: pointer;
    position: absolute;
    top: 1em;
    left: 1em;
    height: 3rem;
  }
  .tip {
    position: absolute;
    top: 1em;
    right: 1em;
    max-width: 30%;
    font-size: larger;
    font-weight: bold;
  }
  .loading-text {
    position: absolute;
    bottom: 1em;
    left: 1em;
    display: inline-flex;
    align-items: center;
  }
  #loading-error-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: black;
    #loading-error {
      padding: 1em;
      background: white;
      text-align: center;
      border-radius: 1em;
      width: 50%;
    }
  }
}
.framed {
  background: #000 url('./assets/img/textures/dark-noise.png');
  padding: 4px 5px;
  border: 2px solid transparent;
  border-image: url('./assets/img/textures/frame-border.png');
  border-image-outset: 0;
  border-image-repeat: round;
  border-image-slice: 3;
  border-radius: 2px;
}
// canvas {
//   cursor: url('./assets/img/icon/select-target-hand.png'), auto;
// }
</style>
