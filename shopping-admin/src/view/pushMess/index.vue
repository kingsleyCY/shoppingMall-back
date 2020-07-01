<template>
  <div class="box">
    <div class="activity-list">
      <div class="header">
        <el-button type="text" @click="toAdd" class="add-btn">+添加活动</el-button>
        <el-table
          :data="pushMessList"
          style="width: 100%">
          <el-table-column
            prop="content"
            label="内容"
            min-width="80">
          </el-table-column>
          <el-table-column
            label="状态"
            width="50">
            <template slot-scope="scope">
              <span>
                {{scope.row.isShow===1?"启用":"禁用"}}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            width="100">
            <template slot-scope="scope">
              <span>
                {{common.timeTransfer(scope.row.created_time)}}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="150">
            <template slot-scope="scope">
              <el-button type="text" size="small"
                         @click="editPushMess(scope.row)">编辑
              </el-button>
              <el-button type="text" size="small"
                         @click="delePushMess(scope.row)">删除
              </el-button>
              <el-button type="text" size="small" v-if="scope.row.isShow===1"
                         @click="changPushMessStatus(scope.row)">禁用
              </el-button>
              <el-button type="text" size="small" v-if="scope.row.isShow===0"
                         @click="changPushMessStatus(scope.row)">启用
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
        <el-form-item label="活动名称">
          <el-input v-model="form.content"></el-input>
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
  import { pushMessList, addPushMess, delPushMess, changPushMessStatus } from '@/api/request'

  export default {
    name: "pushMess",
    data() {
      return {
        isAdd: true,
        rowData: null,
        form: {
          content: "",
          isShow: 1
        },
        pushMessList: []
      }
    },
    created() {
      this.pushMessListMehtods()
    },
    methods: {
      pushMessListMehtods(type) {
        pushMessList().then(res => {
          if (res.code === 1) {
            this.pushMessList = res.data;
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.pushMessList = [];
        })
      },
      toAdd() {
        this.isAdd = true;
        this.form = {
          content: "",
          isShow: 1,
        }
      },
      changPushMessStatus(row) {
        changPushMessStatus({
          id: row.id,
          isShow: row.isShow === 0
        }).then(res => {
          if (res.code === 1) {
            this.$message.success(res.mess)
            this.pushMessListMehtods()
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.$message.error("操作失败")
        })
      },
      editPushMess(row) {
        this.isAdd = false;
        this.rowData = row;
        this.form = {
          content: row.content,
          isShow: row.isShow === 1 ? true : false,
        }
      },
      submitPushMess() {
        let param = {
          content: this.form.content,
          isShow: this.form.isShow === 1 ? true : false,
        }
        if (!this.isAdd) {
          param.id = this.rowData.id
        }
        addPushMess(param).then(res => {
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
        this.$confirm('此操作将永久删除该消息推送, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delPushMess({id: row.id}).then(res => {
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