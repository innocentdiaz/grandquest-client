<template>
  <div class="footer-container">
    <footer id="app-footer">
      <div id="left">
        <ul>
          <li>
            <router-link to="/">Home</router-link>  •
          </li>
          <li>
            <router-link to="/about">About</router-link> •
          </li>
          <li>
            <router-link to="/world">World</router-link> •
          </li>
          <li>
            <router-link to="/community">Community</router-link> •
          </li>
          <li>
            <router-link to="/donate">Donate</router-link>
          </li>
        </ul>
      </div>
      <div id="center">
        <button>Staff Support</button>
      </div>
      <div id="right">
        <p>
          ©2019 GrandQuest
        </p>
      </div>
    </footer>
  </div>
</template>
<style lang="scss" scoped>
.footer-container {
  background: black;
  padding-bottom: 20px;
  #app-footer {
    font-size: smaller;
    background: #1D0F35;
    width: 100%;
    padding: 15px;
    display: flex;
    flex-direction: row;
    align-items: center;
    color: white;
    &> div {
      flex: 1;
      text-align: center;
    }
    #left {
      ul {
        li {
          display: inline;
          a {
            color: #7B75A8;
          }
        }
      }
    }
  }
}
</style>
