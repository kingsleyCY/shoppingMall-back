<template>
  <div class="box">
    <div class="left-tree">
      <el-button size="mini" @click="addClassifyMethods(0)">添加一级分类</el-button>
      <el-button size="mini" @click="getAgentMehtods">刷新</el-button>
      <el-tree :data="treeData" :props="defaultProps" :expand-on-click-node="false" :default-expand-all="true">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span class="left">
          <div class="img">
            <img :src="data.logo || 'http://lioncc.oss-cn-beijing.aliyuncs.com/shop/config/1.png'" v-image>
          </div>
          <span class="text">{{ data.title }}</span>
        </span>
        <span class="right">
          <el-button
            v-if="data.id !== '-1'"
            type="text"
            size="mini" @click="addClassifyMethods(data.id)">
            添加子节点
          </el-button>
          <el-button
            v-if="data.id !== '-1'"
            type="text"
            size="mini" @click="editClassifyMethods(data)">
            编辑
          </el-button>
          <el-button
            v-if="data.id !== '-1'"
            type="text"
            size="mini" @click="deleteClassifyMethods(data.id)">
            删除
          </el-button>
        </span>
      </span>
      </el-tree>
    </div>
    <div class="right-content">
      <p style="padding: 15px 0 15px 10px;font-size: 20px;font-weight: bold;border-bottom: 1px solid #717171">
        {{isAdd?"添加":"编辑"}}</p>
      <el-form ref="form" :model="form" label-width="80px" size="mini">
        <el-form-item label="节点名称">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="数量区间">
          <ul v-for="(item, index) in form.agentModelData" :key="index" class="agentmodel-data">
            <li>
              <el-input v-model="item.min" @keyup.native="number($event)" class="number-input"></el-input>
              <span class="tip">≤</span>
              <el-input v-model="item.max" @keyup.native="number($event)" class="number-input"></el-input>
              <i class="el-icon-remove-outline" @click="delAgentItem(index)"></i>
              <i class="el-icon-circle-plus-outline" @click="addAgentItem" v-if="index === 0"></i>
            </li>
          </ul>
        </el-form-item>
        <el-form-item label="下线收益">
          <el-input v-for="(item, index) in form.childProfit" :key="index" @keyup.native="number($event)" v-model="item.val" class="number-input"></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import { getAgent, editAgent, delAgent } from '@/api/request'

  export default {
    name: "classify",
    data() {
      return {
        treeData: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        isAdd: true,
        rowData: null,
        parentId: "0",
        partIndex: 1,
        form: {
          title: "",
          agentModelData: [
            {
              min: 0,
              max: 10,
            }
          ],
          childProfit: [
            {
              val: 20
            }
          ]
        }
      }
    },
    mounted() {
      this.getAgentMehtods()
    },
    methods: {
      getAgentMehtods() {
        getAgent().then(res => {
          this.treeData = res.data
        })
      },
      addClassifyMethods(id) {
        this.isAdd = true;
        this.parentId = id;
      },
      editClassifyMethods(data) {
        this.dialogVisible = true;
        this.isAdd = false;
        this.form.input = data.title;
        this.form.sort = data.sort;
        this.rowData = data;
      },
      deleteClassifyMethods(id) {
        this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteClassify({id}).then(res => {
            if (res.code === 1) {
              this.$message.success("删除成功")
              this.getClassifyList()
            } else {
              this.$message.error(res.mess)
            }
          })
        })
      },
      submitClassify() {
        if (!this.form.input) {
          this.$message.info("不能为空")
          return
        }
        if (this.isAdd) {
          addClassify({
            title: this.form.input,
            parentId: this.parentId,
            sort: this.form.sort,
          }).then(res => {
            if (res.code === 1) {
              this.handleClose()
              this.$message.success("添加成功")
              this.getClassifyList()
            } else {
              this.$message.error(res.mess)
            }
          })
        } else {
          editClassify({
            title: this.form.input,
            id: this.rowData.id,
            sort: this.form.sort,
          }).then(res => {
            if (res.code === 1) {
              this.handleClose()
              this.$message.success("修改成功")
              this.getClassifyList()
            } else {
              this.$message.error(res.mess)
            }
          })
        }
      },
      number(e) {
        let flag = new RegExp("^[1-9]([0-9])*$").test(e.target.value);
        if (!flag) {
          this.$message.info("请输入正整数");
        }
      },
      delAgentItem(index) {
        if (this.form.agentModelData.length <= 1) {
          this.$message.info("最少添加一个")
          return
        }
        this.form.agentModelData.splice(index, 1)
      },
      addAgentItem() {
        var max = this.form.agentModelData[this.form.agentModelData.length - 1].max;
        this.form.agentModelData.push({
          min: max,
          max: max + 10,
        })
      },
      validAgentData() {

      }
    }
  }
</script>

<style scoped lang="scss">
  .vue-cropper {
    height: 500px;
  }
  .el-tree {
    padding-top: 15px;
    /deep/ .el-tree-node__content {
      height: auto !important;
      .custom-tree-node {
        .left {
          .img {
            width: 50px;
            height: 50px;
            vertical-align: middle;
            display: inline-block;
            img {
              display: block;
              width: 100%;
              height: 100%;
            }
          }
          .text {
            display: inline-block;
            width: 150px;
            padding-left: 15px;
          }
        }
        .right {

        }
      }
    }
  }
  .el-dialog {
    .step-one {
      background-color: #ededed;
      position: relative;
      .base-content {
        height: 100%;
        text-align: center;
        i {
          font-size: 60px;
          font-weight: 600;
          padding: 50px 0 45px 0;
        }
        p {
          color: #409EFF;
          font-size: 18px;
        }
      }
      .upload-file-btn {
        cursor: pointer;
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        width: 100%;
        height: 100%;
        opacity: 0;
      }
    }
  }
  .box {
    .left-tree {
      width: 550px;
      height: 100%;
      border-right: 1px solid #bababa;
    }
    .right-content {
      width: calc(100% - 550px);
      height: 100%;
      .el-form {
        padding: 15px 20px;
      }
      .el-input {
        width: 250px;
      }
      .number-input {
        width: 100px;
      }
      .agentmodel-data {
        list-style: none;
        .tip {
          display: inline-block;
          padding: 0px 15px;
        }
        i {
          margin-left: 10px;
          cursor: pointer;
          font-size: 20px;
        }
      }
    }
  }
</style>