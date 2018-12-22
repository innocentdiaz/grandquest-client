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
</style>

