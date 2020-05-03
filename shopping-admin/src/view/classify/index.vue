<template>
  <div>
    <el-button size="mini" @click="addClassifyMethods(0)">添加一级分类</el-button>
    <el-tree :data="treeData" :props="defaultProps" :expand-on-click-node="false" :default-expand-all="true">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span class="text">{{ data.title }}</span>
        <span>
          <el-button
            type="text"
            size="mini" @click="addClassifyMethods(data.id)">
            添加子节点
          </el-button>
          <el-button
            type="text"
            size="mini" @click="editClassifyMethods(data)">
            编辑
          </el-button>
          <el-button
            type="text"
            size="mini" @click="deleteClassifyMethods(data.id)">
            删除
          </el-button>
        </span>
      </span>
    </el-tree>

    <el-dialog
      :title="isAdd?'添加':'编辑'"
      :visible.sync="dialogVisible"
      width="600px"
      :before-close="handleClose">
      <div>
        <el-input v-model="input" placeholder="请输入内容"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="submitClassify">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  import { getClassifyList, addClassify, editClassify, deleteClassify } from '@/api/request'

  export default {
    name: "classify",
    data() {
      return {
        treeData: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        dialogVisible: false,
        isAdd: true,
        input: "",
        rowData: null,
        parentId: "0"
      }
    },
    mounted() {
      this.getClassifyList()
    },
    methods: {
      handleClose() {
        this.input = "";
        this.rowData = null
        this.dialogVisible = false;
      },
      addClassifyMethods(id) {
        this.dialogVisible = true;
        this.isAdd = true;
        this.parentId = id;
      },
      editClassifyMethods(data) {
        this.dialogVisible = true;
        this.isAdd = false;
        this.input = data.title;
        this.rowData = data;
      },
      deleteClassifyMethods(id) {
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
      submitClassify() {
        if (!this.input) {
          this.$message.info("不能为空")
          return
        }
        if (this.isAdd) {
          addClassify({
            title: this.input,
            parentId: this.parentId,
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
            title: this.input,
            id: this.rowData.id,
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
      getClassifyList() {
        getClassifyList().then(res => {
          this.treeData = res.data
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .el-tree {
    padding-top: 15px;
    .text {
      display: inline-block;
      width: 150px;
    }
  }
</style>