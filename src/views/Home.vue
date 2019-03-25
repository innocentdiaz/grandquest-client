<template>
  <div class="landing">
    <div id="combat-img"></div>
    <div class="container">
      <aside>
        <img :src="require('@/assets/img/icon/gq.png')" id="logo">
        <p>
          <strong>You've stumbled onto a great quest.</strong> Mountains range as far as 
          the eye can see. Surrounding you is the unexplored world,
          and you hear adventure calling you. What will you do 
          with the skills, rewards and experience you earn?
        </p>
      </aside>
      <div class="content" v-if="!user.authenticated">
        <h1>Want to try our world? <br/> Join us!</h1>
        <h2 class="subtitle">Make new friends, participate in forums, and explore our world</h2>
        <SignUpForm />
      </div>
      <div class="content" v-else>
        <h1>Great to see you are onboard!</h1>
        <h2 class="subtitle">Here are some useful links</h2>
        <p><router-link to="/about">About GrandQuest</router-link></p>
        <p><router-link to="/world">Our World</router-link></p>
        <p><router-link to="/forum">Community Forums</router-link></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import SignUpForm from '@/components/forms/SignUp.vue';
import { User } from '@/types';

@Component({
  components: { SignUpForm },
})

export default class Home extends Vue {
  @State public user!: User;
}
</script>

<style lang="scss">
$mainBlue: #036ca5;
$mainBlueHover: #005e91;
$mainBlack: rgb(24, 24, 24);
$mainGrey: rgb(179, 179, 179);

.landing {
  #combat-img {
    z-index: -1;
    background-image: url('../assets/img/combat.png');
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    height: 600px;
    width: 100%;
    top: 0;
    
    position: absolute;
  }
  #logo {
    height:100px;
    border-radius: 5px;
  }

  .container {
    background: white;
    z-index: 30;
    margin-top: 75vh;
    min-height: 90vh;

    aside {
      clear:right;
      margin-right: 2.75em;
      float: left;
      width: 30%;

      padding: 1em;
      line-height: 2rem;
    }
    .content {
      text-align: right;
      padding: 1em;
    }
  }
}
</style>

