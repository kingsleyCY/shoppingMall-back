<template>
  <div class="box">
    <div class="left-tree">
      <el-button size="mini" @click="getAgentMehtods">刷新</el-button>
      <ul class="tree-list">
        <li v-for="(item, index) in treeData">
          <span class="text">{{ item.title }}</span>
          <div>
            <el-button type="text" size="mini"
                       @click="addAgentMethods(item, 'edit')">编辑
            </el-button>
          </div>
        </li>
      </ul>
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
              <el-input v-model="item.min" class="number-input" type="number"></el-input>
              <span class="tip">≤ 区间 <</span>
              <el-input v-model="item.max" class="number-input" type="number"></el-input>
              单价：
              <el-input v-model="item.price" class="number-input" type="number"></el-input>
              <i class="el-icon-remove-outline" @click="delAgentItem(index)"></i>
              <i class="el-icon-circle-plus-outline" @click="addAgentItem" v-if="index === 0"></i>
            </li>
          </ul>
          <p style="color: red">注：默认第一区间无法提取</p>
        </el-form-item>
        <el-form-item label="下线收益(￥)">
          <ul class="agentmodel-data">
            <li v-for="(item, index) in form.childProfit" :key="index">
              <el-input v-model="item.val" class="number-input" type="number"></el-input>
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
        parentId: 0,
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
          this.parentId = row === 0 ? row : row.id;
          this.cancel()
        } else {
          this.isAdd = false;
          this.rowData = row;
          this.fillForm()
        }
      },
      delAgentMethods(id) {
        this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delAgent({ id }).then(res => {
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
      },
      fillForm() {
        this.form.title = this.rowData.title;
        this.form.agentModelData = this.rowData.agentModelData;
        this.form.childProfit = this.rowData.childProfit.map(v => {
          return {
            val: v
          }
        });
        this.form.childProfit.length === 0 ? this.form.childProfit = [{ val: "" }] : ""
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
          max: Number(last.max) + 10,
          price: Number(last.price) + 10,
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
        var flag = true;
        for (let i = 0; i < this.form.agentModelData.length; i++) {
          this.$set(this.form.agentModelData[i], "min", parseInt(this.form.agentModelData[i]["min"]))
          this.$set(this.form.agentModelData[i], "max", parseInt(this.form.agentModelData[i]["max"]))
          this.$set(this.form.agentModelData[i], "price", parseInt(this.form.agentModelData[i]["price"]))
          if (Number(this.form.agentModelData[i]["min"]) >= Number(this.form.agentModelData[i]["max"])) {
            flag = false
          }
          if (
            (i < this.form.agentModelData.length - 1) &&
            (Number(this.form.agentModelData[i]["max"]) !== Number(this.form.agentModelData[i + 1]["min"]))
          ) {
            flag = false
          }
        }
        if (flag) {
          return this.form.agentModelData
        } else {
          return flag
        }
      },
      validAgentLevel() {
        var arr = []
        for (let i = 0; i < this.form.childProfit.length; i++) {
          this.form.childProfit[i]["val"] ? arr.push(parseInt(this.form.childProfit[i]["val"])) : ""
        }
        return arr
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
      width: 400px;
      height: 100%;
      border-right: 1px solid #bababa;
      .tree-list {
        list-style: none;
        li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
        }
      }
    }
    .right-content {
      width: calc(100% - 400px);
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