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
              label="用户手机号"
              min-width="120">
              <template slot-scope="scope">
                {{scope.row.crowdData?scope.row.crowdData.phoneNumber:"--"}}
              </template>
            </el-table-column>
          </div>
          <el-table-column
            fixed="right"
            label="操作"
            width="120">
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
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="activity-content">
      <p style="padding: 15px 0 15px 10px;font-size: 20px;font-weight: bold;border-bottom: 1px solid #717171">
        {{isAdd?"添加":"编辑"}}</p>
      <el-form ref="form" :model="form" label-width="120px" size="small" style="width: 500px;padding-top: 20px">
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
        <div v-if="form.type === 2">
          <el-form-item label="抽奖code">
            <el-input v-model="form.lotteryCode"></el-input>
          </el-form-item>
        </div>
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
    <el-dialog
      custom-class="most-dislog" title="绑定手机号"
      :visible.sync="bindUserDialog" width="30%">
      <div>
        <el-input v-model="bindPhone" placeholder="请输入用户手机号"></el-input>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bindUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitBindUser">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getCommodityList, getCounponList, createdCoupon, deleteCoupon, couponBindUser } from '@/api/request'

  export default {
    name: "couponList",
    data() {
      return {
        isAdd: true,
        rowData: null,
        activeName: "first",
        form: {
          title: "",
          type: 1,
          useType: 1,
          lotteryCode: "",
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
        this.isAdd = true;
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
        }
        if (this.form.fullFee && this.form.decre) {
          param.fullFee = this.form.fullFee
          param.decre = this.form.decre
        }
        if (this.form.timeRange && this.form.timeRange.length > 0) {
          param.sTime = this.form.timeRange[0]
          param.eTime = this.form.timeRange[1]
        }
        if (!this.isAdd) {
          param.id = this.rowData._id
        }
        createdCoupon(param).then(res => {
          if (res.code === 1) {
            this.$message.success("操作成功")
            this.toAdd()
            this.handleClick()
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.$message.error("操作失败")
        })
      },
      editCoupon(row) {
        this.isAdd = false;
        this.rowData = row;
        this.form.title = row.title;
        this.form.type = row.type;
        this.form.useType = row.useType;
        this.form.lotteryCode = row.lotteryCode;
        this.form.fullFee = row.fullDecre.fullFee;
        this.form.decre = row.fullDecre.decre;
        row.timeRange && row.timeRange.sTime && row.timeRange.eTime ? this.form.timeRange = [row.timeRange.sTime, row.timeRange.eTime] : "";
      },
      deleCoupon(row) {
        deleteCoupon({id: row._id}).then(res => {
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