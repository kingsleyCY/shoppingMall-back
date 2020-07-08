<template>
  <div class="box">
    <div class="left-tree">
      <el-button size="mini" @click="addAgentMethods('0', 'add')">添加一级分类</el-button>
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
            size="mini" @click="addAgentMethods(data, 'add')">
            添加子节点
          </el-button>
          <el-button
            v-if="data.id !== '-1'"
            type="text"
            size="mini" @click="addAgentMethods(data, 'edit')">
            编辑
          </el-button>
          <el-button
            v-if="data.id !== '-1'"
            type="text"
            size="mini" @click="delAgentMethods(data)">
            删除
          </el-button>
        </span>
      </span>
      </el-tree>
    </div>
    <div class="right-content">
      <p style="padding: 15px 0 15px 10px;font-size: 20px;font-weight: bold;border-bottom: 1px solid #717171">
        {{isAdd?"添加":"编辑"}}</p>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-form-item label="节点名称">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="数量区间(双)">
          <ul v-for="(item, index) in form.agentModelData" :key="index" class="agentmodel-data">
            <li>
              <el-input v-model="item.min" @keyup.native="validNumber($event)" class="number-input"></el-input>
              <span class="tip">≤</span>
              <el-input v-model="item.max" @keyup.native="validNumber($event)" class="number-input"></el-input>
               单价：<el-input v-model="item.price" @keyup.native="validNumber($event)" class="number-input"></el-input>
              <i class="el-icon-remove-outline" @click="delAgentItem(index)"></i>
              <i class="el-icon-circle-plus-outline" @click="addAgentItem" v-if="index === 0"></i>
            </li>
          </ul>
        </el-form-item>
        <el-form-item label="下线收益(￥)">
          <ul class="agentmodel-data">
            <li v-for="(item, index) in form.childProfit" :key="index">
              <el-input @keyup.native="validNumber($event)" v-model="item.val" class="number-input"></el-input>
              <i class="el-icon-remove-outline" @click="delAgentLevel(index)"></i>
              <i class="el-icon-circle-plus-outline" @click="addAgentLevel" v-if="index === 0"></i>
            </li>
          </ul>
        </el-form-item>
        <el-form-item>
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitAgent">提交</el-button>
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
              max: 5,
              price: 40,
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
      addAgentMethods(row, type) {
        if (type === 'add') {
          this.isAdd = true;
          this.parentId = row === '0' ? row : row.id;
        } else {
          this.isAdd = false;
          this.rowData = row;
        }
      },
      delAgentMethods(id) {
        this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteClassify({ id }).then(res => {
            if (res.code === 1) {
              this.$message.success("删除成功")
              this.getClassifyList()
            } else {
              this.$message.error(res.mess)
            }
          })
        })
      },
      cancel() {
        this.isAdd = true;
        this.form = {
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
      },
      submitAgent() {
        if (!this.form.title || this.form.agentModelData.length <= 0 || this.form.childProfit.length <= 0) {
          this.$message.info("不能为空")
          return
        }
        var obj = { title: this.form.title }
        if (this.isAdd) {
          obj.parentId = this.parentId
        } else {
          obj.id = this.rowData.id
        }
        obj.agentModelData = this.validAgentData()
        obj.childProfit = this.validAgentLevel()
        if (!obj.agentModelData || !obj.childProfit) {
          this.$message.info("数据填写错误")
          return
        }
        editAgent(obj).then(res => {
          if (res.code === 1) {
            this.$message.success("操作成功")
            this.getAgentMehtods()
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.$message.error("操作失败")
        })
      },
      delAgentItem(index) {
        if (this.form.agentModelData.length <= 1) {
          this.$message.info("最少添加一个")
          return
        }
        this.form.agentModelData.splice(index, 1)
      },
      addAgentItem() {
        var last = this.form.agentModelData[this.form.agentModelData.length - 1];
        this.form.agentModelData.push({
          min: last.max,
          max: last.max + 10,
          price: last.price + 10,
        })
      },
      delAgentLevel(index) {
        if (this.form.childProfit.length <= 1) {
          this.$message.info("最少添加一个")
          return
        }
        this.form.childProfit.splice(index, 1)
      },
      addAgentLevel() {
        this.form.childProfit.push({ val: 20 })
      },
      validAgentData() {

      },
      validAgentLevel() {

      },
      validNumber(e) {
        let flag = new RegExp("^[1-9]([0-9])*$").test(e.target.value);
        if (!flag) {
          this.$message.info("请输入正整数");
        }
      },
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