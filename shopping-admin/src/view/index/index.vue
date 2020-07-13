<template>
  <div class="box">
    <div :class="['left-nav', isPC?'':'mobile-client']">
      <el-menu
        default-active="2"
        class="el-menu-vertical-demo">
        <el-menu-item v-for="(item, index) in mainRouter" :key="index" v-if="!item.hidden">
          <router-link :to="{ path: '/admin_html/' + item.path }">{{item.tilte}}</router-link>
        </el-menu-item>
      </el-menu>
    </div>
    <div :class="['right-content', isPC?'':'mobile-client']">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import { mainRouter } from "../../router";

  export default {
    name: "index",
    data() {
      return {
        mainRouter,
        isPC: true
      }
    },
    mounted() {
      var flag = this.isPcMethods();
      this.isPC = flag;
      this.$store.commit('changeIsPc', flag);
    },
    methods: {
      isPcMethods() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone",
          "SymbianOS", "Windows Phone",
          "iPad", "iPod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
          if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
          }
        }
        return flag;
      }
    }
  }
</script>

<style scoped lang="scss">
  .box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    .left-nav {
      width: 200px;
      height: 100%;
      &.mobile-client {
        width: 90px;
      }
      .el-menu {
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        .el-menu-item {
          padding: 0 !important;
          width: 100%;
          height: 50px;
          line-height: 50px;
          a {
            padding-left: 20px;
            display: block;
            width: 100%;
            height: 100%;
            text-decoration: none;
            color: #939393;
            box-sizing: border-box;
            &.router-link-active {
              background-color: rgb(236, 245, 255);
            }
          }
        }
      }
    }
    .right-content {
      height: 100%;
      width: calc(100% - 200px);
      overflow-y: auto;
      box-sizing: border-box;
      padding: 10px 15px;
      &.mobile-client {
        width: calc(100% - 90px);
      }
    }
  }
</style>