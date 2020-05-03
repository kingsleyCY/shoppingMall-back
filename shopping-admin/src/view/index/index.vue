<template>
  <div class="box">
    <div class="left-nav">
      <el-menu
        default-active="2"
        class="el-menu-vertical-demo">
        <el-menu-item v-for="(item, index) in mainRouter" :key="index" v-if="!item.hidden">
          <router-link :to="{ path: '/admin/' + item.path }">{{item.tilte}}</router-link>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="right-content">
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
        mainRouter
      }
    },
    mounted() {

    },
    methods: {}
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
      .el-menu {
        height: 100%;
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
      padding: 20px 25px;
    }
  }
</style>