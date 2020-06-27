<template>
  <div class="search-box">
    <div class="search-header">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline" size="mini">
        <el-form-item label="订单状态：">
          <el-select v-model="searchForm.orderStatus" placeholder="选择订单状态" clearable>
            <el-option :label="item.label" :value="item.value" v-for="(item,index) in orderStatusArr"
                       :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openMoreSearch">更多查询条件</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="formSearch">查询</el-button>
        </el-form-item>
        <el-popover
          placement="right"
          width="600"
          trigger="manual" v-model="visible">
          <div>
            <el-form :inline="true" :model="searchForm" class="demo-form-inline more-search" size="mini">
              <el-form-item label="订单ID">
                <el-input v-model="searchForm.orderId" clearable></el-input>
              </el-form-item>
              <el-form-item label="订单价格">
                <el-input v-model="searchForm.totalFeeMin" clearable></el-input>
                至
                <el-input v-model="searchForm.totalFeeMax" clearable></el-input>
              </el-form-item>
              <el-form-item label="订单创建时间">
                <el-date-picker
                  v-model="searchForm.timeRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期" value-format="timestamp">
                </el-date-picker>
              </el-form-item>
              <!--<el-form-item label="支付时间">
                <el-date-picker
                  v-model="searchForm.orderTimeRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期" value-format="timestamp">
                </el-date-picker>
              </el-form-item>-->
              <el-form-item label="手机号">
                <el-input v-model="searchForm.phone" clearable></el-input>
              </el-form-item>
              <div>
                <el-form-item>
                  <el-button @click="initMoreSearch">清空</el-button>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="formSearch">确定</el-button>
                </el-form-item>
              </div>
            </el-form>
          </div>
        </el-popover>
      </el-form>
    </div>
    <div class="search-content">
      <el-table
        :data="orderList" border class="search-table" ref="searchTable" :height="tableHeight" v-loading="loading">
        <el-table-column
          prop="out_trade_no"
          label="订单ID"
          width="150">
        </el-table-column>
        <el-table-column
          label="创建时间"
          width="100">
          <template slot-scope="scope">
            {{common.timeTransfer(scope.row.created_time).slice(0,10)}}<br>
            {{common.timeTransfer(scope.row.created_time).slice(10)}}
          </template>
        </el-table-column>
        <el-table-column
          prop="orderStatus"
          label="状态"
          width="80">
          <template slot-scope="scope">
          <span :class="[scope.row.orderStatus, 'orde-status']">
            {{common.computedStatus(scope.row.orderStatus)}}
          </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="original_fee"
          label="原价（￥）"
          min-width="80">
          <template slot-scope="scope">
            {{scope.row.original_fee || scope.row.total_fee / 100 }}
          </template>
        </el-table-column>
        <el-table-column
          prop="total_fee"
          label="成交价格（￥）"
          min-width="80">
          <template slot-scope="scope">
            {{scope.row.total_fee / 100}}
          </template>
        </el-table-column>
        <el-table-column
          label="支付时间"
          min-width="100">
          <template slot-scope="scope">
            {{scope.row.time_end?scope.row.time_end.slice(0,4)+"-"+scope.row.time_end.slice(4,6)+"-"+scope.row.time_end.slice(6,8):"--"}}<br>
            {{scope.row.time_end?scope.row.time_end.slice(8,10)+":"+scope.row.time_end.slice(10,12)+":"+scope.row.time_end.slice(12,14):"--"}}
          </template>
        </el-table-column>
        <el-table-column
          prop="size"
          label="尺码"
          width="80">
        </el-table-column>
        <el-table-column
          prop="transaction_id"
          label="微信支付订单号"
          min-width="100">
        </el-table-column>
        <el-table-column
          prop="userId"
          label="userId"
          min-width="100">
        </el-table-column>
        <el-table-column
          label="用户手机号"
          min-width="100">
          <template slot-scope="scope">
            {{scope.row.userDetail.phoneNumber}}
          </template>
        </el-table-column>
        <el-table-column
          label="商品名称"
          min-width="100">
          <template slot-scope="scope">
            ID：{{scope.row.commodityId}}<br>
            {{scope.row.commodityDetail.classifyName +'/'+scope.row.commodityDetail.title}}
          </template>
        </el-table-column>
        <el-table-column
          label="商品logo"
          min-width="100">
          <template slot-scope="scope">
            <img v-image :src="scope.row.commodityDetail.logo" style="width: 100%;height: auto">
          </template>
        </el-table-column>
        <el-table-column
          label="地址详情"
          min-width="150">
          <template slot-scope="scope">
            {{scope.row.addressDetail.provinceName
            +'/'+scope.row.addressDetail.cityName+"/"+scope.row.addressDetail.countyName +'/'+
            scope.row.addressDetail.detailInfo}}<br>
            {{scope.row.addressDetail.telNumber}}<br>
            {{scope.row.addressDetail.userName}}
          </template>
        </el-table-column>
        <el-table-column
          label="物流号"
          min-width="150">
          <template slot-scope="scope">
            {{scope.row.mailOrder || "--"}}
          </template>
        </el-table-column>
        <el-table-column
          label="物流备注"
          min-width="150">
          <template slot-scope="scope">
            {{scope.row.mailRemark || "--"}}
          </template>
        </el-table-column>
        <el-table-column
          prop="mess"
          label="下单备注"
          min-width="120">
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="150">
          <template slot-scope="scope">
            <!-- 已收到订单信息联系卖方 -->
            <el-button type="text" size="small" v-if="scope.row.orderStatus==='undeliver'"
                       @click="checkOrderToBus(scope.row)">
              确认订单
            </el-button>
            <!-- 录入订单物流信息 -->
            <el-button type="text" size="small" v-if="scope.row.orderStatus==='deliver'"
                       @click="openMailModel(scope.row)">
              录入/修改物流信息
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageData.page"
        :page-sizes="[10, 20, 50]"
        :page-size="pageData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageData.total">
      </el-pagination>
    </div>
    <el-dialog title="物流信息" :visible.sync="maildialogVisible" width="30%">
      <el-form ref="form" :model="mailForm" label-width="80px">
        <el-form-item label="快递单号">
          <el-input v-model.trim="mailForm.mailOrder"></el-input>
        </el-form-item>
        <el-form-item label="快递备注">
          <el-input type="textarea" v-model="mailForm.mailRemark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitMail">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getOrderList, checkOrderToBus, setMail } from "@/api/request"

  export default {
    name: "orderList",
    data() {
      return {
        loading: false,
        orderList: [],
        checkedItem: null,
        pageData: {
          page: 1,
          pageSize: 10,
          total: 0,
        },
        maildialogVisible: false,
        mailForm: {
          mailOrder: "",
          mailRemark: "",
        },
        tableHeight: 0,
        searchForm: {
          orderStatus: "",
          orderId: "",
          timeRange: [],
          orderTimeRange: [],
          totalFeeMin: "",
          totalFeeMax: "",
          phone: "",
        },
        visible: false
      }
    },
    mounted() {
      this.getOrderList();
      this.$nextTick(() => {
        this.tableHeight = document.getElementsByClassName('search-content')[0].clientHeight - 50
      })
    },
    methods: {
      getOrderList() {
        let param = {
          page: this.pageData.page,
          pageSize: this.pageData.pageSize,
        }
        this.searchForm.orderStatus ? param.orderStatus = this.searchForm.orderStatus : "";
        this.searchForm.orderId ? param.orderId = this.searchForm.orderId : "";
        this.searchForm.timeRange[0] ? param.createStime = this.searchForm.timeRange[0] : "";
        this.searchForm.timeRange[1] ? param.createEtime = this.searchForm.timeRange[1] : "";
        this.searchForm.orderTimeRange[0] ? param.orderStime = this.searchForm.orderTimeRange[0] : "";
        this.searchForm.orderTimeRange[1] ? param.orderEtime = this.searchForm.orderTimeRange[1] : "";
        this.searchForm.totalFeeMin ? param.totalFeeMin = Number(this.searchForm.totalFeeMin) : "";
        this.searchForm.totalFeeMax ? param.totalFeeMax = Number(this.searchForm.totalFeeMax) : "";
        this.searchForm.phone ? param.phone = this.searchForm.phone : "";
        this.loading = true;
        this.visible = false;
        getOrderList(param).then(res => {
          this.loading = false
          this.orderList = res.data.list;
          this.pageData.total = res.data.total;
        }).catch(res => {
          this.loading = false
          this.orderList = [];
          this.pageData.total = 0;
        })
      },
      handleSizeChange(val) {
        this.pageData.pageSize = val
        this.pageData.page = 1
        this.getOrderList()
      },
      handleCurrentChange(val) {
        this.pageData.page = val
        this.getOrderList()
      },
      openMailModel(row) {
        this.maildialogVisible = true;
        this.checkedItem = row;
        if (row.orderStatus === 'undeliver') {
          this.mailForm = {
            mailOrder: "",
            mailRemark: "",
          }
        } else if (row.orderStatus === 'deliver') {
          this.mailForm = {
            mailOrder: row.mailOrder,
            mailRemark: row.mailRemark
          }
        }
      },
      submitMail() {
        if (this.mailForm.mailOrder) {
          let parm = JSON.parse(JSON.stringify(this.mailForm));
          parm.out_trade_no = this.checkedItem.out_trade_no
          setMail(parm).then(res => {
            if (res.code === 1) {
              this.$message.success(res.mess)
              this.maildialogVisible = false;
              this.getOrderList();
            } else {
              this.$message.error(res.mess)
            }
          }).catch(reds => {
            this.$message.error("操作失败")
          })
        }
      },
      checkOrderToBus(row) {
        let parm = {
          out_trade_no: row.out_trade_no
        }
        checkOrderToBus(parm).then(res => {
          if (res.code === 1) {
            this.$message.success(res.mess);
            this.getOrderList();
          } else {
            this.$message.error(res.mess);
          }
        }).catch(reds => {
          this.$message.error("操作失败")
        })
      },
      formSearch() {
        this.pageData.page = 1
        this.getOrderList()
      },
      openMoreSearch() {
        this.visible = !this.visible
      },
      initMoreSearch() {
        this.searchForm.orderId = "";
        this.searchForm.timeRange = [];
        this.searchForm.orderTimeRange = [];
        this.searchForm.totalFeeMin = "";
        this.searchForm.totalFeeMax = "";
        this.searchForm.phone = "";
      }
    },
    computed: {
      orderStatusArr() {
        return this.common.orderStatusArr
      }
    }
  }
</script>

<style scoped lang="scss">
  .more-search {
    .el-input {
      width: 120px;
    }
  }
</style>