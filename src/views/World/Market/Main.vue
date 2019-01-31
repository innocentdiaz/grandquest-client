<template>
  <div class="market-main">
    <div class="img-container">
      <header>
        <h1>Marketplace</h1>
      </header>
    </div>
    <aside>
      <label>Shops</label>
      <div class="shop-container" v-on:click="goToShop('blacksmith')">
        <h1 class="title">Blacksmith shop</h1>
        <p>Lorem ipsum this is a blacksmith shop</p>
      </div>
    </aside>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Market extends Vue {
  goToShop(name: string) {
    this.$router.replace({
      name: 'shop',
      params: {
        name,
      },
    });
  }
}
</script>
<style lang="scss" scoped>
.market-main {
  height: calc(100vh - 12rem);
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  .img-container {
    flex: 2;
    background: url('../../../assets/img/backgrounds/market.jpg') rgb(29, 29, 29);
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    header {
      background: linear-gradient(to bottom, rgb(22, 22, 22), rgba(24, 24, 24, 0.6), rgba(24, 24, 24, 0.4), rgba(0, 0, 0, 0));
      color: white;
      padding: 10px;
    }
  }
  aside {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: white;
    color: black;
    border-left: 5px inset rgb(189, 189, 189);
    overflow-y: scroll;

    label {
      background: rgb(170, 170, 170);
      color: black;
      padding: 5px;
    }
    .shop-container {
      border-bottom: 1px solid rgb(170, 170, 170);
      padding: 10px;
      cursor: pointer;

      .title {
        margin: 0;
      }
      p {
        margin: 0;
      }
    }
  }
}
</style>
