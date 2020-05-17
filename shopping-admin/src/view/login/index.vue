<template>
  <div class="box">
    <el-form class="login-form" ref="form" :model="form" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="form.username"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" @keyup.enter.native="onSubmit"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { loginAdmin } from "@/api/request"

  export default {
    name: "login",
    data() {
      return {
        form: {
          username: "",
          password: ""
        }
      }
    },
    methods: {
      onSubmit() {
        let param = {
          username: this.form.username,
          password: this.form.password
        }
        loginAdmin(param).then(res => {
          if (res.code === 1) {
            this.$message.success("登陆成功")
            sessionStorage.setItem("token", res.data.token);
            this.$router.push("/admin_html/commidity")
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.$message.error(res.mess)
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .box {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    .login-form {
      padding-top: 200px;
      width: 300px;
    }
  }
</style>