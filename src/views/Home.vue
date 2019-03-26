<template>
  <div class="landing">
    <div class="container">
      <aside>
        <img :src="require('@/assets/img/icon/gq.png')" id="logo">
        <p>
          <strong>You've stumbled onto a great quest.</strong> Mountains range as far as 
          the eye can see. Surrounding you is the unexplored world,
          and you hear adventure calling you. What will you do 
          with the skills, rewards and experience you earn?
        </p>
        <hr>
        <p id="news">
          Latest News
        </p>
        <p>
          <strong>GrandQuest has just opened up to play-testers!</strong>
          GrandQuest beta is now available online for users to play games and report 
          issues in exchange for gold. <strong>Start saving up for when the game launches!</strong>
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
  #logo {
    height:100px;
    border-radius: 5px;
  }

  .container {
    background-image: url('../assets/img/combat.png');
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    min-height: 90vh;
    padding: 1em;
    display: flex;
    flex-direction: row;
    align-items: stretch;

    aside {
      background: white;
      border-radius: 10px;
      margin-right: 50px;
      width: 30%;
      padding: 1em;
      line-height: 2rem;
      #news {
        background: $mainBlue;
        border: none;
        color: white;
        padding: 5px 8px;
        border-radius: 2px;
      }
    }
    .content {
      flex: 1;
      text-align: right;
      padding: 1em;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.95);
    }
  }
}
</style>

