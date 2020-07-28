<template>
  <div>
    <el-form :inline="true" class="demo-form-inline" size="mini">
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column
        prop="date"
        label="日期"
        width="100">
        <template slot-scope="scope">
          {{common.timeTransfer(scope.row.exten_time)}}
        </template>
      </el-table-column>
      <el-table-column
        prop="phoneNumber"
        label="手机号"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="mark"
        label="备注"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="recommendId"
        label="推荐人手机号"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="childExtenNum"
        label="推广人数"
        min-width="80">
      </el-table-column>
      <el-table-column
        label="最后活动时间"
        width="100">
        <template slot-scope="scope">
          {{common.timeTransfer(scope.row.lastActTime)}}
        </template>
      </el-table-column>
      <el-table-column
        prop="qrCode"
        label="qrCode"
        min-width="100">
        <template slot-scope="scope">
          <img :src="scope.row.qrCode" v-image :phoneNumber="scope.row.phoneNumber">
        </template>
      </el-table-column>
      <el-table-column
        prop="qrCode"
        label="qrCode"
        min-width="100">
        <template slot-scope="scope">
          <img :src="common.addExtensionn(scope.row.qrCode,scope.row.phoneNumber)" v-image>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="120">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="toDetail(scope.row)">查看详情</el-button>
          <el-button type="text" size="small" @click="closeExtenMethods(scope.row)">结算</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-drawer
      title="我是标题"
      size="60%"
      :visible.sync="drawer"
      :with-header="false" custom-class="auto-drawer">
      <div style="height: 100%;padding: 15px;">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="下线列表" name="first">
            <div class="detail">
              <span>
                手机号：{{detailItem?detailItem.phoneNumber:""}}
              </span>
              <span>
                实际总数：{{detailTable.length}}
              </span>
              <span>
                活跃过用户数：{{notSameNum}}
              </span>
              <span>
                总数：{{allTotal}}
              </span>
            </div>
            <el-table :data="detailTable" border style="width: 100%">
              <el-table-column
                prop="date"
                label="日期"
                min-width="180">
                <template slot-scope="scope">
                  {{common.timeTransfer(scope.row.created_time)}}
                </template>
              </el-table-column>
              <el-table-column
                prop="phoneNumber"
                label="手机号"
                min-width="180">
              </el-table-column>
              <el-table-column
                prop="recommendId"
                label="最后活动时间"
                min-width="180">
                <template slot-scope="scope">
                  <span :class="[scope.row.lastActTime === scope.row.created_time?'same':'not-same']">
                    {{common.timeTransfer(scope.row.lastActTime)}}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="提款记录" name="second">
            <el-table :data="logTable" border style="width: 100%">
              <el-table-column
                prop="date"
                label="日期"
                min-width="180">
                <template slot-scope="scope">
                  {{common.timeTransfer(scope.row.created_time)}}
                </template>
              </el-table-column>
              <el-table-column
                prop="closeNum"
                label="结算人数"
                min-width="180">
              </el-table-column>
              <el-table-column
                prop="notcloseNum"
                label="未结算人数"
                min-width="180">
              </el-table-column>
              <!--<el-table-column
                label="结算手机号"
                min-width="180">
                <template slot-scope="scope">
                  {{scope.row.closelist.join("、")}}
                </template>
              </el-table-column>-->

            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script>
  import { getCustomer, closeExtened, closeExtenedLog } from "@/api/request"

  export default {
    name: "proxyList",
    data() {
      return {
        tableData: [],
        detailTable: [],
        logTable: [],
        activeName: "first",
        drawer: false,
        detailItem: null,
        notSameNum: 0,
        allTotal: 0,
      }
    },
    mounted() {
      this.getCustomerMethods()
    },
    methods: {
      onSubmit() {
        this.getCustomerMethods()
      },
      getCustomerMethods() {
        let param = {
          page: 1,
          pageSize: 1,
          listType: "extension"
        }
        getCustomer(param).then(res => {
          if (res.code === 1) {
            this.tableData = res.data.list;
          } else {
            this.tableData = [];
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.$message.error("获取数据失败")
          this.tableData = [];
        })
      },
      closeExtenMethods(row) {
        this.$confirm('确认清算当前推广', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          closeExtened({
            userId: row.userId
          }).then(res => {
            if (res.code === 1) {
              this.$message.success("操作成功！")
              this.getCustomerMethods()
            } else {
              this.$message.error(res.mess)
            }
          }).catch(res => {
            this.$message.error("操作失败！")
          })
        }).catch(() => {

        });
      },
      toDetail(row) {
        this.drawer = true;
        this.detailItem = row;
        this.activeName = "first";
        this.getRecommDetail();
      },
      handleClick() {
        if (this.activeName === "first") {
          this.getRecommDetail()
        } else if (this.activeName = "second") {
          this.getCloseExtenLog()
        }
      },
      getRecommDetail() {
        let param = {
          page: 1,
          pageSize: 1,
          listType: "extensioned",
          id: this.detailItem.userId
        }
        getCustomer(param).then(res => {
          if (res.code === 1) {
            this.detailTable = res.data.list;
            this.allTotal = res.data.allTotal;
            let notSameNum = 0;
            this.detailTable.forEach(v => {
              if (v.lastActTime !== v.created_time) {
                ++notSameNum
              }
            })
            this.notSameNum = notSameNum;
          } else {
            this.detailTable = [];
          }
        }).catch(res => {
          this.detailTable = [];
        })
      },
      getCloseExtenLog() {
        let param = {
          userId: this.detailItem.userId
        }
        closeExtenedLog(param).then(res => {
          if (res.code === 1) {
            this.logTable = res.data;
          } else {
            this.detailTable = [];
          }
        }).catch(res => {
          this.detailTable = [];
        })
      },
    }
  }
</script>

<style scoped lang="scss">
  .el-table {
    img {
      display: block;
      width: 80px;
    }
    .not-same {
      font-weight: bold;
      color: black;
    }
  }
  .detail {
    padding-bottom: 10px;
  }
  .detail > span {
    display: inline-block;
    padding-right: 15px;
  }
</style>