<template>
  <div class="sign-up-form">
    <div v-if="formLoading">
      <ActivityIndicator size=36 />
    </div>
    <form v-on:submit.prevent="onSubmit" v-else>
      <p class="display">{{ displayMessage() }}</p>
      <label>Email: </label>
      <input type="email"    name="email"    placeholder="Your GrandQuest email"    v-model='email'/>
      
      <label>Username: </label>
      <input :disabled='disabledInput("username")' type="text"     name="username" placeholder="Your GrandQuest username" v-model='username'/>
      
      <label>Password: </label>
      <input :disabled='disabledInput("password")' type="password" name="password" placeholder="Your GrandQuest password" v-model='password'/>
      
      <label>Gender: </label>
      <select :disabled='disabledInput("gender")' name="gender" v-model='gender'>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <button :disabled='displayMessage() !== "All set!"'>
        Sign Up
      </button>
      <p class="error">
        {{ apiError }}
      </p>
    </form>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ActivityIndicator from '@/components/ActivityIndicator.vue';
import passwordValidator from 'password-validator';
import { ApiResponse } from 'apisauce';
import api from '@/api';

const passSchema = new passwordValidator()
  .is().min(8)                                    // Minimum length 8
  .is().max(100)                                  // Maximum length 100
  .has().uppercase()                              // Must have uppercase letters
  .has().lowercase()                              // Must have lowercase letters
  .has().digits()                                 // Must have digits
  .has().not().spaces();                          // No spaces

@Component({
  components: { ActivityIndicator },
})

export default class Home extends Vue {
  public email = '';
  public password = '';
  public gender = 'male';
  public username = '';

  public formLoading = false;
  public apiError = '';

  public onSubmit() {
    const { email, username, password, gender } = this.$data;

    this.formLoading = true;
    this.apiError = '';

    api.post('/auth/default', { email, username, password, gender })
    .then((res: ApiResponse<any>) => {
      const body = res.data;

      if (res.ok) {
        this.$router.replace('/login');
      } else {
        this.apiError = body.errors
          ? body.errors.join(', ') + '.'
          : 'Failed to communicate with our servers. Please try again later';
      }

      this.formLoading = false;
    });
  }
  public displayMessage() {
    const refs = [
      'email',
      'username',
      'password',
      'gender',
      'submit',
    ];

    for (const ref of refs) {
      const message = this.disabledInput(ref);

      if (message) {
        return message;
      }
    }

    return 'All set!';
  }
  public disabledInput(ref: string) {
    switch (ref.toLowerCase()) {
      case 'email':
        return '';
      case 'username':
        const email = this.$data.email;
        const validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);

        return validEmail
          ? false
          : 'Please enter a correctly formatted email address';
      case 'password':
        const username = this.$data.username;

        return username.trim().length > 5
          ? false
          : 'Username must be at least 6 characters long';
      case 'gender':
        const password = this.$data.password;
        const validPasword = passSchema.validate(password);

        return validPasword
          ? false
          : `Password must be between 8 to 80 characters,
              contain at least one digit,
              and upper and lowercase letters and no spaces`;
      case 'submit':
        const gender = this.$data.gender;

        return gender === 'male' || gender === 'female'
          ? false
          : 'Please select a gender';
    }
  }
}
</script>