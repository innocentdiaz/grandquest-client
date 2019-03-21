<template>
  <div class="sign-up-form">
    <div v-if="formLoading">
      <ActivityIndicator size=36 />
    </div>
    <form v-on:submit.prevent="onSubmit" v-else>
      <p class="form-error" v-if="apiError">
        {{ apiError }}
      </p>
      <label>Email: </label>
      <input type="email" name="email" placeholder="Your GrandQuest email" v-model='email' v-on:change="inputChange('email')"/>
      <div class="input-sub">
        <p v-if="!inputDirty.email"></p>
        <p class="error" v-else-if="isInvalid('email')">
          {{ isInvalid('email') }}
        </p>
        <p v-else>
          Cool email. Thanks!
        </p>
      </div>

      <label>Username: </label>
      <input :disabled='isInvalid("email")' type="text" name="username" placeholder="Your GrandQuest username" v-model='username' v-on:change="inputChange('username')"/>
      <div class="input-sub">
        <p v-if="!inputDirty.username"></p>
        <p class="error" v-else-if="isInvalid('username')">
          {{ isInvalid('username') }}
        </p>
        <p v-else>
          Best username ever!
        </p>
      </div>

      <label>Password: </label>
      <input :disabled='isInvalid("username") || isInvalid("email")' type="password" name="password" placeholder="Your GrandQuest password" v-model='password' v-on:change="inputChange('password')"/>
      <div class="input-sub">
        <p v-if="!inputDirty.password"></p>
        <p class="error" v-else-if="isInvalid('password')">
          {{ isInvalid('password') }}
        </p>
        <p v-else>
          Good job! Your password is OK.
        </p>
      </div>

      <label>Gender: </label>
      <select :disabled='isInvalid("password") || isInvalid("username") || isInvalid("email")' name="gender" v-model='gender'>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <button :disabled='isInvalid("password") || isInvalid("username") || isInvalid("email")'>
        Sign Up
      </button>
    </form>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ActivityIndicator from '@/components/ActivityIndicator.vue';
import { ApiResponse } from 'apisauce';
import api from '@/api';                     // No spaces

@Component({
  components: { ActivityIndicator },
})

export default class Home extends Vue {
  public email = '';
  public password = '';
  public gender = 'male';
  public username = '';

  public formLoading = false;
  public apiError: string | null = null;

  // keeps track of inputs and wether they are dirty or not
  public inputDirty: { [ref: string]: boolean } = {
    email: false,
    username: false,
    password: false,
  }

  public mounted() {
    this.resetInputDirty();
    this.apiError = null;
  }
  public destroyed() {
    this.resetInputDirty();
  }
  public onSubmit() {
    const { email, username, password, gender } = this.$data;

    this.formLoading = true;
    this.apiError = null;

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
  public inputChange(ref: string) {
    if (this.inputDirty.hasOwnProperty(ref) && !this.inputDirty[ref]) {
      this.inputDirty[ref] = true;
    }
  }
  public resetInputDirty() {
    this.inputDirty = {
      email: false,
      username: false,
      password: false,
    }
  }
  public isInvalid(ref: string) {
    switch (ref.toLowerCase()) {
      case 'email':
        const email = this.$data.email;
        const r = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return r.test(email)
          ? false
          : 'That doesn\'t seem like a valid email';
      case 'username':
        const username = this.$data.username;

        return username.trim().length >= 6
          ? false
          : 'Username must be at least 6 characters long';
      case 'password':
        const password = this.$data.password;
        const passwordContainsUppercase = /[A-Z]/.test(password);
        const passwordContainsLowercase = /[a-z]/.test(password);
        const passwordIsLongEnough = password.trim().length >= 8;

        if (!passwordIsLongEnough) {
          return `Password must be at least 8 characters long. ${8 - password.trim().length} more to go`;
        } else if (!passwordContainsUppercase) {
          return 'Password must contain at least one uppercase letter';
        } else if (!passwordContainsLowercase) {
          return 'Password must contains at least one lowercase letter';
        } else {
          return false;
        }
      case 'gender':
        const gender = this.$data.gender;
        return gender === 'male' || gender === 'female'
          ? false
          : 'Please select a gender';
    }
  }
}
</script>