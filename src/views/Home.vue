<template>
  <div class="landing">
    <div id="combat-img"></div>
    <div class="container">
      <aside>
        You've stumbled onto a great quest. Mountains range as far as 
        the eye can see. Ahead of you stand walls of a great empire,
        and you can feel the adventure calling you. What will you do 
        with the skills, tools and alliences you build?
      </aside>
      <div class="content">
        <h1>Want to try our world? <br/> Join us!</h1>
        <h2 class="subtitle">Make new friends, participate in forums, and explore our world</h2>
        <SignUpForm />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SignUpForm from '@/components/forms/SignUp.vue';

@Component({
  components: { SignUpForm },
})

export default class Home extends Vue {}
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
    min-height: 42rem;
    width: 100%;
    top: 0;
    
    position: absolute;
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
      color: $mainGrey;
      font-weight: lighter;
      line-height: 2rem;
    }
    .content {
      text-align: right;
      padding: 1em;
    }
  }
}
</style>

