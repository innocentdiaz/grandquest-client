<template>
  <img
    v-bind:src="require('../assets/img/nebula.png')"
    class="activity-indicator" 
    v-bind:style="{ height: chosenSize + 'px', width: chosenSize + 'px' }"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class ActivityIndicator extends Vue {
  data() {
    return {
      chosenSize: 30 || this.$props.size
    }
  }
  @Prop(Number) size!: number | string
}
</script>

<style lang="scss">
.activity-indicator {
  max-height: 500px;
  max-width: 500px;

  animation: 1s spinning infinite;
   animation-timing-function: linear;
}
@keyframes spinning {
  0% {
    transform: rotateZ(0deg)
  }
  100% {
    transform: rotateZ(360deg)
  }
}
</style>
