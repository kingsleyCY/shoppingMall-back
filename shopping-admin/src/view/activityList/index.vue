<template>
  <div class="box">
    <div class="activity-list">
      <div class="header">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="所有活动" name="first"></el-tab-pane>
          <el-tab-pane label="进行中" name="second"></el-tab-pane>
          <el-tab-pane label="已过期" name="third"></el-tab-pane>
        </el-tabs>
        <el-button type="text" @click="toAdd" class="add-btn">+添加活动</el-button>
        <el-table
          :data="activityList"
          style="width: 100%">
          <el-table-column
            prop="title"
            label="名称"
            min-width="30">
          </el-table-column>
          <el-table-column
            prop="created_time"
            label="创建时间"
            min-width="50">
            <template slot-scope="scope">
              {{timeTransfer(scope.row.created_time)}}
            </template>
          </el-table-column>
          <el-table-column
            label="活动时间"
            min-width="50">
            <template slot-scope="scope">
              {{timeTransfer(scope.row.sTime)}}<br>
              {{timeTransfer(scope.row.eTime)}}
            </template>
          </el-table-column>
          <el-table-column
            label="活动奖品"
            min-width="50">
            <template slot-scope="scope">
              {{scope.row.prizeDeatil.classifyName +'/'+scope.row.prizeDeatil.title}}
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            min-width="50">
            <template slot-scope="scope">
              {{statusClassify(scope.row.status)}}
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            width="120">
            <template slot-scope="scope">
              <el-button type="text" size="small" v-if="scope.row.status === 1 || scope.row.status === 2"
                         @click="editActivity(scope.row)">编辑
              </el-button>
              <el-button type="text" size="small"
                         @click="deleActivity(scope.row)">删除
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
  </div>
</template>

<script>
  import { getCommodityList, creatActivity, getActiList, deleActivity } from '@/api/request'

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
            return time.getTime() < (Date.now() - 24 * 60 * 60 * 1000) // 返回所有时间小于当前时间的值
          }
        }
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
          this.getActiListMethods("ing")
        } else if (this.activeName === "third") {
          this.getActiListMethods("over")
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
      statusClassify(type) {
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
        deleActivity({id: row.id}).then(res => {
          if (res.code === 1) {
            this.$message.success("操作成功")
            this.getActiListMethods()
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {

        })
      },


      timeTransfer(data) {
        function add0(m) {
          return m < 10 ? '0' + m : m
        }
        var time = new Date(data);
        var y = time.getFullYear();
        var m = time.getMonth() + 1;
        var d = time.getDate();
        var h = time.getHours();
        var mm = time.getMinutes();
        var s = time.getSeconds();
        return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
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