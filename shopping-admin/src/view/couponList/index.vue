<template>
  <div class="box">
    <div class="activity-list">
      <div class="header">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="通用" name="first"></el-tab-pane>
          <el-tab-pane label="抽奖" name="second"></el-tab-pane>
        </el-tabs>
        <el-button type="text" @click="toAdd" class="add-btn">+添加优惠券</el-button>
        <el-table
          :data="couponList"
          style="width: 100%">
          <el-table-column
            prop="title"
            label="名称"
            min-width="100">
          </el-table-column>
          <el-table-column
            label="优惠券类型"
            min-width="80">
            <template slot-scope="scope">
              {{scope.row.type === 1 ? "通用" : "抽奖"}}
            </template>
          </el-table-column>
          <el-table-column
            label="优惠券使用类型"
            min-width="80">
            <template slot-scope="scope">
              满减
            </template>
          </el-table-column>
          <el-table-column
            label="优惠券code"
            min-width="80">
            <template slot-scope="scope">
              {{scope.row.type === 2 ? scope.row.lotteryCode : "--"}}
            </template>
          </el-table-column>
          <el-table-column
            label="满足金额"
            min-width="80">
            <template slot-scope="scope">
              {{scope.row.fullDecre && scope.row.fullDecre.fullFee || "--"}}
            </template>
          </el-table-column>
          <el-table-column
            label="减免金额"
            min-width="80">
            <template slot-scope="scope">
              {{scope.row.fullDecre && scope.row.fullDecre.decre || "--"}}
            </template>
          </el-table-column>
          <el-table-column
            label="有效期"
            min-width="150">
            <template slot-scope="scope">
              <div v-if="scope.row.timeRange">
                {{timeTransfer(scope.row.timeRange.sTime)}}<br>
                {{timeTransfer(scope.row.timeRange.eTime)}}
              </div>
              <div v-else>--</div>
            </template>
          </el-table-column>
          <div v-if="activeName==='second'">
            <el-table-column
              label="人数限制"
              min-width="100">
              <template slot-scope="scope">
                {{scope.row.usageLimit}}
              </template>
            </el-table-column>
            <el-table-column
              label="已绑定人数"
              min-width="100">
              <template slot-scope="scope">
                {{scope.row.usageIds.length}}
              </template>
            </el-table-column>
          </div>
          <el-table-column
            fixed="right"
            label="操作"
            width="200">
            <template slot-scope="scope">
              <!--<el-button type="text" size="small"
                         @click="editCoupon(scope.row)">编辑
              </el-button>-->
              <el-button type="text" size="small"
                         @click="deleCoupon(scope.row)">删除
              </el-button>
              <el-button type="text" size="small" v-if="scope.row.type === 2"
                         @click="bindUserModel(scope.row)">绑定用户
              </el-button>
              <el-button type="text" size="small" v-if="scope.row.type === 2"
                         @click="getbindUserModel(scope.row)">查看绑定用户数据
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-drawer
      :with-header="false" size="500"
      :visible.sync="drawer">
      <div v-if="contentType === 'add'" class="activity-content">
        <p style="padding: 15px 0 15px 10px;font-size: 20px;font-weight: bold;border-bottom: 1px solid #717171">添加</p>
        <el-form ref="form" :model="form" label-width="120px" size="small" style="width: 100%;padding-top: 20px">
          <el-form-item label="名称">
            <el-input v-model="form.title"></el-input>
          </el-form-item>
          <el-form-item label="优惠券类型">
            <el-select v-model="form.type" placeholder="请选择优惠券类型">
              <el-option label="通用" :value="1"></el-option>
              <el-option label="抽奖" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="优惠券使用类型">
            <el-select v-model="form.useType" placeholder="请选择优惠券使用类型">
              <el-option label="满减" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <!--优惠券类型-->
          <div v-if="form.type === 2">
            <el-form-item label="抽奖code">
              <el-input v-model="form.lotteryCode"></el-input>
            </el-form-item>
            <el-form-item label="限制人数">
              <el-input v-model="form.usageLimit"></el-input>
            </el-form-item>
          </div>

          <!--优惠券使用类型-->
          <div v-if="form.useType === 1">
            <el-form-item label="满足金额">
              <el-input v-model="form.fullFee"></el-input>
            </el-form-item>
            <el-form-item label="减免金额">
              <el-input v-model="form.decre"></el-input>
            </el-form-item>
          </div>
          <el-form-item label="使用时间">
            <el-date-picker
              v-model="form.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="timestamp">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitActivity">提交</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-if="contentType === 'usageIds'" class="activity-content">
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column
            prop="date"
            label="日期"
            min-width="180">
            <template slot-scope="scope">
              {{timeTransfer(scope.row.created_time)}}
            </template>
          </el-table-column>
          <el-table-column
            prop="phoneNumber"
            label="手机号"
            min-width="180">
          </el-table-column>
          <el-table-column
            prop="integral"
            label="积分"
            min-width="180">
          </el-table-column>
          <el-table-column
            label="操作"
            min-width="100">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="deleteUser(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
    <el-dialog
      custom-class="most-dislog" title="绑定手机号"
      :visible.sync="bindUserDialog" width="30%">
      <div>
        <el-input v-model="bindPhone" @keyup.enter.native="submitBindUser" placeholder="请输入用户手机号"></el-input>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bindUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitBindUser">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getCommodityList,
    getCounponList,
    createdCoupon,
    deleteCoupon,
    couponBindUser,
    getCouponBindUser,
    delCouponBindUser,
  } from '@/api/request'

  export default {
    name: "couponList",
    data() {
      return {
        contentType: "add",
        rowData: null,
        activeName: "first",
        drawer: false,
        form: {
          title: "",
          type: 1,
          useType: 1,
          lotteryCode: "",
          usageLimit: "",
          fullFee: "",
          decre: "",
          timeRange: [],
        },
        prizeArr: [],
        couponList: [],
        pickeroptions: {
          disabledDate: time => {
            return time.getTime() < (Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        bindUserDialog: false,
        bindPhone: "",
        tableData: []
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
        let param = { type }
        getCounponList(param).then(res => {
          if (res.code === 1) {
            this.couponList = res.data;
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.couponList = [];
        })
      },
      handleClick() {
        if (this.activeName === "first") {
          this.getActiListMethods("all")
        } else if (this.activeName === "second") {
          this.getActiListMethods("lottery")
        }
      },
      toAdd() {
        this.contentType = "add";
        this.drawer = true;
        this.form = {
          title: "",
          type: 1,
          useType: 1,
          lotteryCode: "",
          fullFee: "",
          decre: "",
          timeRange: [],
        }
      },
      submitActivity() {
        let param = {
          title: this.form.title,
          type: this.form.type,
          useType: this.form.useType,
        }
        if (param.type === 2) {
          param.code = this.form.lotteryCode
          param.usageLimit = this.form.usageLimit
        }
        if (this.form.fullFee && this.form.decre) {
          param.fullFee = this.form.fullFee
          param.decre = this.form.decre
        }
        if (this.form.timeRange && this.form.timeRange.length > 0) {
          param.sTime = this.form.timeRange[0]
          param.eTime = this.form.timeRange[1]
        }
        createdCoupon(param).then(res => {
          if (res.code === 1) {
            this.$message.success("操作成功")
            this.handleClick()
            this.drawer = false;
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.$message.error("操作失败")
        })
      },
      deleCoupon(row) {
        deleteCoupon({ id: row._id }).then(res => {
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
      bindUserModel(row) {
        this.bindUserDialog = true
        this.rowData = row;
        this.bindPhone = ""
      },
      submitBindUser() {
        couponBindUser({
          phone: this.bindPhone,
          couponId: this.rowData._id,
        }).then(res => {
          if (res.code === 1) {
            this.$message.success("操作成功")
            this.bindUserDialog = false
            this.handleClick()
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.$message.error("操作失败")
        })
      },
      getbindUserModel(row) {
        this.rowData = row
        var param = {
          couponId: row._id,
          page: 1,
          pageSize: 1000,
        }
        getCouponBindUser(param).then(res => {
          if (res.code === 1) {
            this.tableData = res.data
            this.contentType = "usageIds";
            this.drawer = true;
          } else {
            this.tableData = []
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.$message.error("获取失败")
        })
      },
      deleteUser(row) {
        this.$confirm('此操作将永久删除该用户绑定, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var obj = {
            couponId: this.rowData._id,
            userId: row.userId,
          }
          delCouponBindUser(obj).then(res => {
            if (res.code === 1) {
              this.$message.success("操作成功！")
              this.getbindUserModel(this.rowData)
            } else {
              this.$message.error(res.mess)
            }
          }).catch(res => {
            this.$message.error("操作失败！")
          })
        })
      },

      timeTransfer(data) {
        if (!data) {
          return "--"
        }
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
      }
    }
  }
</script>

<style scoped lang="scss">
  .box {
    width: 100%;
    height: 100%;
    .activity-list {
      height: 100%;
      width: 100%;
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
      height: 100%;
      overflow-y: auto;
      padding: 10px 20px;
      .el-table__body {
        img {
          display: block;
          width: 100%;
        }
      }
    }
  }
</style>