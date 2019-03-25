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
            <router-link to="/forum">Community</router-link> •
          </li>
          <li>
            <router-link to="/donate">Donate</router-link>
          </li>
        </ul>
      </div>
      <div id="center">
        <a href="http://discord.gg/hU29ZUK" target="_blank">Staff Support</a>
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
    #center {
      a {
        color: white;
        background-image: linear-gradient(to bottom, #7B75A8 80%, rgb(84, 79, 128));
        border: none;
        border-radius: 5px;
        padding: 6px 8px;
        &:hover {
          background-image: linear-gradient(to bottom, rgb(84, 79, 128) 80%, #7B75A8);
        }
      }
    }
  }
}
</style>
