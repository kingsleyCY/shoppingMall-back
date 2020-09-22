<template>
  <div class="box">
    <div class="activity-list">
      <div class="header">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="所有活动" name="first"></el-tab-pane>
          <el-tab-pane label="未开始" name="second"></el-tab-pane>
          <el-tab-pane label="进行中" name="third"></el-tab-pane>
          <el-tab-pane label="已结束" name="fourth"></el-tab-pane>
          <el-tab-pane label="已删除" name="five"></el-tab-pane>
        </el-tabs>
        <el-button type="text" @click="toAdd" class="add-btn">+添加活动</el-button>
        <el-table
          :data="activityList"
          style="width: 100%">
          <el-table-column
            prop="title"
            label="名称"
            min-width="80">
          </el-table-column>
          <el-table-column
            prop="created_time"
            label="创建时间"
            min-width="100">
            <template slot-scope="scope">
              {{common.timeTransfer(scope.row.created_time)}}
            </template>
          </el-table-column>
          <el-table-column
            label="活动时间"
            min-width="200">
            <template slot-scope="scope">
              {{common.timeTransfer(scope.row.sTime)}}<br>
              {{common.timeTransfer(scope.row.eTime)}}
            </template>
          </el-table-column>
          <el-table-column
            label="活动奖品"
            min-width="100">
            <template slot-scope="scope">
              {{scope.row.prizeDeatil.classifyName +'/'+scope.row.prizeDeatil.title}}
            </template>
          </el-table-column>
          <el-table-column
            label="结束时间"
            min-width="80">
            <template slot-scope="scope">
              {{common.timeTransfer(scope.row.end_time)}}
            </template>
          </el-table-column>
          <el-table-column
            label="中奖code"
            min-width="100">
            <template slot-scope="scope">
              {{scope.row.endCode || "--"}}
            </template>
          </el-table-column>
          <el-table-column
            label="中奖UserID"
            min-width="100">
            <template slot-scope="scope">
              {{scope.row.winUerId || "--"}}
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            min-width="80">
            <template slot-scope="scope">
              {{statusClassify(scope.row.status,scope.row.isDelete)}}
            </template>
          </el-table-column>
          <el-table-column
            prop="additionNum"
            label="增加量"
            min-width="80">
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            width="120">
            <template slot-scope="scope">
              <el-button type="text" size="small" v-if="scope.row.isDelete === 0 && scope.row.status===1"
                         @click="editActivity(scope.row)">编辑
              </el-button>
              <el-button type="text" size="small" v-if="scope.row.isDelete === 0"
                         @click="deleActivity(scope.row)">删除
              </el-button>
              <el-button type="text" size="small"
                         v-if="scope.row.isDelete === 0 && (scope.row.status===1 || scope.row.status===2)"
                         @click="overActivity(scope.row)">结束活动
              </el-button>
              <el-button type="text" size="small"
                         @click="oprnAdditonModel(scope.row)">修改增加量
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
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickeroptions"
            value-format="timestamp">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="活动奖品">
          <el-select v-model="form.prizeId" filterable placeholder="请选择">
            <el-option
              v-for="item in prizeArr"
              :key="item.id"
              :label="item.classifyName + '/' + item.title"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitActivity">提交</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-dialog
      custom-class="most-dislog" title="修改增加量"
      :visible.sync="bindUserDialog" width="30%">
      <div>
        <el-input v-model="additionNum" @keyup.enter.native="submitAddition" placeholder="请输入用户手机号"></el-input>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bindUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitAddition">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getCommodityList, creatActivity, getActiList, deleActivity, overActivity, addAddition } from '@/api/request'

  export default {
    name: "activityList",
    data() {
      return {
        isAdd: true,
        rowData: null,
        activeName: "first",
        form: {
          title: "",
          timeRange: [],
          prizeId: ""
        },
        prizeArr: [],
        activityList: [],
        pickeroptions: {
          disabledDate: time => {
            return time.getTime() < (Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        bindUserDialog: false,
        additionNum: 0,
      }
    },
    created() {
      this.getCommidityList()
      this.handleClick()
    },
    methods: {
      getCommidityList() {
        var param = {
          page: 1,
          pageSize: 1000,
        }
        getCommodityList(param).then(res => {
          this.prizeArr = res.data.list
        }).catch(res => {
          this.prizeArr = []
        })
      },
      getActiListMethods(type) {
        let param = {type}
        getActiList(param).then(res => {
          if (res.code === 1) {
            this.activityList = res.data;
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.activityList = [];
        })
      },
      handleClick() {
        if (this.activeName === "first") {
          this.getActiListMethods("all")
        } else if (this.activeName === "second") {
          this.getActiListMethods("ready")
        } else if (this.activeName === "third") {
          this.getActiListMethods("ing")
        } else if (this.activeName === "fourth") {
          this.getActiListMethods("over")
        } else if (this.activeName === "five") {
          this.getActiListMethods("delete")
        }
      },
      toAdd() {
        this.isAdd = true;
        this.form = {
          title: "",
          timeRange: [],
          prizeId: "",
        }
      },
      editActivity(row) {
        this.isAdd = false;
        this.rowData = row;
        this.form = {
          title: row.title,
          timeRange: [row.sTime, row.eTime],
          prizeId: row.prizeId,
        }
      },
      submitActivity() {
        let param = {
          title: this.form.title,
          prizeId: this.form.prizeId,
        }
        param.sTime = this.form.timeRange[0]
        param.eTime = this.form.timeRange[1]
        if (!this.isAdd) {
          param.id = this.rowData.id
        }
        creatActivity(param).then(res => {
          if (res.code === 1) {
            this.$message.success("操作成功")
            this.toAdd()
            this.handleClick()
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {

        })
      },
      statusClassify(type, isDelete) {
        if (isDelete === 1) {
          return "已删除"
        }
        switch (type) {
          case 1:
            return "未开始";
          case 2:
            return "进行中";
          case 3:
            return "已过期";
          case 4:
            return "已删除";
          default:
            return "未知"
        }
      },
      deleActivity(row) {
        this.$confirm('此操作将永久删除该活动, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleActivity({id: row.id}).then(res => {
            if (res.code === 1) {
              this.$message.success("操作成功")
              this.handleClick()
            } else {
              this.$message.error(res.mess)
            }
          }).catch(res => {

          })
        }).catch(res => {})
      },
      overActivity(row) {
        overActivity({id: row.id}).then(res => {
          if (res.code === 1) {
            this.$message.success("操作成功")
            this.handleClick()
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {

        })
      },
      oprnAdditonModel(row) {
        this.bindUserDialog = true;
        this.rowData = row;
        this.additionNum = this.rowData.additionNum || 0;
      },
      submitAddition() {
        let param = {
          id: this.rowData.id,
          additionNum: this.additionNum,
        }
        addAddition(param).then(res => {
          this.bindUserDialog = false;
          if (res.code === 1) {
            this.$message.success("操作成功")
            this.handleClick()
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.$message.error("操作失败")
        })
      },
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
      .header {
        position: relative;
        .add-btn {
          position: absolute;
          right: 8px;
          top: 0;
        }
      }
    }
    .activity-content {
      width: calc(100% - 550px);
      height: 100%;
    }
  }
</style>