<template>
  <div class="root">
    <Header v-if="headerVisibility"/>
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
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
  @State public headerVisibility!: boolean;
  @Action public OPEN_SOCKET: any;

  private async mounted() {
    this.OPEN_SOCKET();
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
.GUI li.disabled {
  color: rgb(87, 87, 87);
}
.GUI.disabled li.active {
  color: grey;
  padding-left: 2px;
}
.GUI .bar-container {
  height: 10px;
  width: 100%;
  max-width: 200px;
  border: 1px solid grey;
}
.GUI #health-bar {
  background: #56f33e;
  height: 10px;
}
.GUI #energy-bar {
  background: rgb(0, 218, 218);
  height: 10px;
}
.GUI.faded {
  opacity: 0.5;
}
.GUI.hidden {
  opacity: 0;
}
// canvas {
//   cursor: url('./assets/img/icon/select-target-hand.png'), auto;
// }
</style>
