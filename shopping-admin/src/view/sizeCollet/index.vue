<template>
  <div class="box">
    <div class="activity-list">
      <div class="header">
        <el-button type="text" @click="toAdd" class="add-btn">+添加集合</el-button>
        <el-table
          :data="sizeColletList"
          style="width: 100%">
          <el-table-column
            prop="title"
            label="名称"
            width="100">
          </el-table-column>
          <el-table-column
            label="集合内容"
            min-width="150">
            <template slot-scope="scope">
              <span>
                {{scope.row.sizes.join(",")}}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            width="100">
            <template slot-scope="scope">
              <span>
                {{scope.row.created_time?common.timeTransfer(scope.row.created_time):"--"}}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="100">
            <template slot-scope="scope">
              <el-button type="text" size="small"
                         @click="editPushMess(scope.row)">编辑
              </el-button>
              <el-button type="text" size="small"
                         @click="delePushMess(scope.row)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="activity-content">
      <p style="padding: 15px 0 15px 10px;font-size: 20px;font-weight: bold;border-bottom: 1px solid #717171">
        {{isAdd?"添加":"编辑"}}</p>
      <el-form ref="form" :model="form" label-width="80px" size="small" style="width: 500px;padding-top: 20px">
        <el-form-item label="集合名称">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="集合选择">
          <el-select v-model="form.sizes" multiple placeholder="请选择">
            <el-option
              v-for="item in sizeList"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitPushMess">提交</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </div>

  </div>
</template>

<script>
  import { addCollet, getCollet, delCollet } from '@/api/request'

  export default {
    name: "sizeCollet",
    data() {
      return {
        isAdd: true,
        rowData: null,
        form: {
          title: "",
          sizes: [],
        },
        sizeColletList: [],
        sizeList: [],
      }
    },
    created() {
      this.pushMessListMehtods()
    },
    methods: {
      pushMessListMehtods(type) {
        getCollet().then(res => {
          if (res.code === 1) {
            this.sizeColletList = res.data.model;
            this.sizeList = res.data.arr;
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.sizeColletList = [];
        })
      },
      toAdd() {
        this.isAdd = true;
        this.form = {
          title: "",
          sizes: [],
        }
      },
      editPushMess(row) {
        this.isAdd = false;
        this.rowData = row;
        var sizeList = row.sizes.map(v => {
          return Number(v)
        })

        this.form = {
          title: row.title,
          sizes: sizeList
        }
      },
      submitPushMess() {
        let param = {
          title: this.form.title,
          sizes: this.form.sizes.sort()
        }
        if (!this.isAdd) {
          param.id = this.rowData.id
        }
        addCollet(param).then(res => {
          if (res.code === 1) {
            this.$message.success(res.mess)
            this.toAdd()
            this.pushMessListMehtods()
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.$message.error("操作失败")
        })
      },
      delePushMess(row) {
        this.$confirm('此操作将永久删除该尺码集合, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delCollet({ id: row.id }).then(res => {
            if (res.code === 1) {
              this.$message.success("操作成功")
              this.pushMessListMehtods()
            } else {
              this.$message.error(res.mess)
            }
          }).catch(res => {

          })
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .box {
    width: 100%;
    height: 100%;
    .activity-list {
      width: 550px;
      height: 100%;
      border-right: 1px solid #bababa;
    }
    .activity-content {
      width: calc(100% - 550px);
      height: 100%;
    }
  }
</style>