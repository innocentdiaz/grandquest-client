<template>
  <div class="main-header">
    <div class="main-header__content">
      <router-link title="Looking for a logo!" id="title" to="/">GRANDQUEST</router-link>
      <div class="main-header__navigation">
        <a href="forum">Forum</a>
        <a href="signup">Register</a>
        <a href="login">Log In</a>
      </div>
    </div>
    <div class="main-header__sub">
      <router-link to="about">about</router-link>
      <a href="contributing">contributing</a>
      <router-link to="devlog">devlog</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component

export default class Header extends Vue {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
$mainBlue: #036ca5;
$mainBlack: rgb(24, 24, 24);
$mainGrey: rgb(179, 179, 179);

.main-header {
  background: white;
  z-index: 100;
  
  #title { 
    margin: 0;
    margin-right: auto;
    font-size: larger;
    text-decoration: none;
    color: $mainBlue;
  }
  .main-header__content {
    // background: #005485;
    display: flex;
    align-items: center;
    padding: 0 10px;
    .main-header__navigation {
      flex: 1;
      text-align: right;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      min-height: 4rem;
  
      a {
        color: $mainGrey;
        text-decoration: none;
        margin-right: 5px;
        transition: .2s all ease-in-out;
      }
  }
    a:hover {
      color: $mainBlack;
    }
  }
  .main-header__sub {
    align-self: stretch;
    background: $mainBlack;
    padding: 5px 10px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
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
