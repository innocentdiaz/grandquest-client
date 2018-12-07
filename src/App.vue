<template>
  <div class="root">
    <Header />
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Header from './components/Header.vue';

@Component({
  components: {
    Header,
  },
})
export default class App extends Vue {}
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
  width: 100vw;
}
</style>
