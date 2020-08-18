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
        <el-button type="primary" @click="openMoreSearch" size="mini">更多查询条件</el-button>
        <el-button type="primary" @click="formSearch" size="mini">查询</el-button>
        <el-button type="primary" @click="openExportModel" size="mini">导出表格</el-button>
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
          width="100">
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
          width="50">
        </el-table-column>
        <el-table-column
          prop="transaction_id"
          label="微信支付订单号"
          min-width="100">
        </el-table-column>
        <el-table-column
          label="用户手机号"
          min-width="110">
          <template slot-scope="scope">
            {{scope.row.phoneNumber?scope.row.phoneNumber:(scope.row.userDetail?scope.row.userDetail.phoneNumber:"--")}}
          </template>
        </el-table-column>
        <el-table-column
          label="商品名称"
          min-width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.commodityDetail">
              {{scope.row.commodityDetail.classifyName +'/'+scope.row.commodityDetail.title}}
            </span>
            <span v-else>--</span>
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
            <span v-if="scope.row.addressDetail">
              {{scope.row.addressDetail.provinceName
            +'/'+scope.row.addressDetail.cityName+"/"+scope.row.addressDetail.countyName +'/'+
            scope.row.addressDetail.detailInfo}}<br>
            {{scope.row.addressDetail.telNumber}}<br>
            {{scope.row.addressDetail.userName}}
            </span>
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
            <!--申请售后-->
            <el-button type="text" size="small" @click="openApplyAfterModel(scope.row)"
                       v-if="(scope.row.orderStatus === 'delivered' || scope.row.orderStatus === 'over') && !scope.row.applyAfterDetail">
              申请售后
            </el-button>
            <!--退/换货录入客户物流信息-->
            <el-button type="text" size="small"
                       v-if="scope.row.orderStatus === 'applyAfter' && ['applying', 'backing'].indexOf(scope.row.applyAfterStatus) >= 0"
                       @click="openMailModel(scope.row, 'mailOrder')">
              修改用户物流
            </el-button>
            <!--退货退款-->
            <el-button type="text" size="small"
                       v-if="scope.row.orderStatus==='applyAfter' && scope.row.applyAfterStatus === 'backing' && scope.row.applyAfterDetail.applyType === 1"
                       @click="openApplyRefoundModel(scope.row)">
              退货退款
            </el-button>
            <!--换货物流信息-->
            <el-button type="text" size="small"
                       v-if="scope.row.orderStatus==='applyAfter' && scope.row.applyAfterDetail.applyType === 2 && ['backing', 'reMailing'].indexOf(scope.row.applyAfterStatus) >= 0"
                       @click="openMailModel(scope.row, 'manuMail')">
              修改换货物流
            </el-button>
            <!--完成订单-售后-->
            <el-button type="text" size="small"
                       v-if="(scope.row.orderStatus==='applyAfter' && scope.row.applyAfterStatus === 'refund') || (scope.row.orderStatus==='applyAfter' && scope.row.applyAfterStatus === 'reMailing')"
                       @click="overOrderMethods(scope.row)">
              完成订单
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
    <el-dialog title="退货退款" :visible.sync="refounddialogVisible" width="30%">
      <el-form ref="form" label-width="80px">
        <el-form-item label="退款备注">
          <el-input type="textarea" v-model="refoundRemark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="refounddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="applyRefoundMethods">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="申请售后" :visible.sync="applydialogVisible" width="30%">
      <el-form ref="form" label-width="80px">
        <el-form-item label="申请类型">
          <el-select v-model="applyForm.applyType" placeholder="请选择申请类型">
            <el-option label="退货" :value="1"></el-option>
            <el-option label="换货" :value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="form" label-width="80px">
        <el-form-item label="申请备注">
          <el-input type="textarea" v-model="applyForm.applyRemark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="applydialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitApplyAfter">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="导出" :visible.sync="exportdialogVisible" width="40%">
      <el-form ref="exportForm" label-width="80px">
        <el-select v-model="exportForm.orderStatus" placeholder="选择订单状态">
          <el-option :label="item.label" :value="item.value" v-for="(item,index) in orderStatusArr"
                     :key="index"></el-option>
        </el-select>
      </el-form>
      <el-checkbox v-if="exportForm.orderStatus === 'undeliver'" v-model="exportForm.checked">是否转为待发货(已提交给商家)
      </el-checkbox>
      <div slot="footer" class="dialog-footer">
        <el-button @click="exportdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitExport">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getOrderList, checkOrderToBus,
    setMail, afterSalesSetMail,
    applyRefound, setExchangeMail,
    overOrder, applyAfter, exportOrder
  } from "@/api/request"

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
        mailType: "",
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
        visible: false,
        refounddialogVisible: false,
        refoundRemark: "",
        applydialogVisible: false,
        applyForm: {
          applyType: 1,
          applyRemark: ""
        },
        exportdialogVisible: false,
        exportForm: {
          orderStatus: "",
          checked: true
        }
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
      openMailModel(row, type) {
        this.maildialogVisible = true;
        this.checkedItem = row;
        this.mailType = type
        if (row.orderStatus === 'deliver') {
          this.mailForm = {
            mailOrder: row.mailOrder,
            mailRemark: row.mailRemark
          }
        } else if (row.orderStatus === 'applyAfter') {
          var mailOrder = "", mailRemark = "";
          if (row.applyAfterDetail.applyType === 1) {
            mailOrder = row.applyAfterDetail.returnGoods ? row.applyAfterDetail.returnGoods.mailOrder : ""
            mailRemark = row.applyAfterDetail.returnGoods ? row.applyAfterDetail.returnGoods.mailRemark : ""
          } else if (row.applyAfterDetail.applyType === 2) {
            if (type === 'mailOrder') {
              mailOrder = row.applyAfterDetail.exchangeGoods ? row.applyAfterDetail.exchangeGoods.mailOrder : ""
              mailRemark = row.applyAfterDetail.exchangeGoods ? row.applyAfterDetail.exchangeGoods.mailRemark : ""
            } else if (type === 'manuMail') {
              mailOrder = row.applyAfterDetail.exchangeGoods ? row.applyAfterDetail.exchangeGoods.manuMail : ""
              mailRemark = row.applyAfterDetail.exchangeGoods ? row.applyAfterDetail.exchangeGoods.manuMailRemark : ""
            }
          }
          this.mailForm = {
            mailOrder: mailOrder,
            mailRemark: mailRemark
          }
        }
      },
      submitMail() {
        if (this.mailForm.mailOrder) {
          var requestMethods = null
          if (this.checkedItem.orderStatus === "deliver") {
            requestMethods = setMail
          } else if (this.checkedItem.orderStatus === "applyAfter") {
            console.log(this.mailType);
            if (this.mailType === 'mailOrder') {
              requestMethods = afterSalesSetMail
            } else if (this.mailType === 'manuMail') {
              requestMethods = setExchangeMail
            }
          } else {
            return
          }
          let parm = JSON.parse(JSON.stringify(this.mailForm));
          parm.out_trade_no = this.checkedItem.out_trade_no
          requestMethods(parm).then(res => {
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
            var obj = {
              created_time: this.common.timeTransfer(row.created_time),
              time_end: row.time_end.slice(0, 4) + "-" + row.time_end.slice(4, 6) + "-" + row.time_end.slice(6, 8) + " " + row.time_end.slice(8, 10) + ":" + row.time_end.slice(10, 12) + ":" + row.time_end.slice(12, 14),
              out_trade_no: row.out_trade_no,
              transaction_id: row.transaction_id,
              mess: row.mess,
              size: row.size,
              original_fee: row.original_fee,
              classifyName: row.commodityDetail.classifyName,
              commoditytitle: row.commodityDetail.title,
              addressUserName: row.addressDetail.userName,
              addressPhone: row.addressDetail.telNumber,
              provinceName: row.addressDetail.provinceName,
              cityName: row.addressDetail.cityName,
              countyName: row.addressDetail.countyName,
              detailInfo: row.addressDetail.detailInfo,
              userPhone: row.userDetail.phoneNumber,
              userId: row.userDetail.userId
            }
            this.tableToExcel([obj], row.commodityDetail.title)
            this.getOrderList();
          } else {
            this.$message.error(res.mess);
          }
        }).catch(res => {
          this.$message.error("操作失败")
        })
      },
      openApplyAfterModel(row) {
        this.applydialogVisible = true;
        this.checkedItem = row;
        this.applyForm = {
          applyType: 1,
          applyRemark: ""
        }
      },
      submitApplyAfter() {
        if (!this.applyForm.applyType || !this.applyForm.applyRemark) {
          this.$message.info("表单必填")
          return
        }
        this.$confirm('确认申请售后此订单, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var param = {
            out_trade_no: this.checkedItem.out_trade_no,
            applyType: this.applyForm.applyType,
            applyRemark: this.applyForm.applyRemark
          }
          applyAfter(param).then(res => {
            if (res.code === 1) {
              this.applydialogVisible = false;
              this.$message.success(res.mess)
              this.getOrderList();
            } else {
              this.$message.error(res.mess)
            }
          }).catch(reds => {
            this.$message.error("操作失败")
          })
        })
      },
      openApplyRefoundModel(row) {
        this.refounddialogVisible = true;
        this.checkedItem = row;
        this.refoundRemark = "";
      },
      applyRefoundMethods() {
        if (!this.refoundRemark) {
          this.$message.info("备注必填")
          return
        }
        this.$confirm('确定退款, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let param = {
            out_trade_no: this.checkedItem.out_trade_no,
            remark: this.refoundRemark
          }
          applyRefound(param).then(res => {
            if (res.code === 1) {
              this.$message.success(res.mess)
              this.refounddialogVisible = false;
              this.getOrderList();
            } else {
              this.$message.error(res.mess)
            }
          }).catch(reds => {
            this.$message.error("操作失败")
          })
        })
      },
      overOrderMethods(row) {
        this.$confirm('确认完成此订单, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var param = {
            out_trade_no: row.out_trade_no,
            remark: "完成订单"
          }
          overOrder(param).then(res => {
            if (res.code === 1) {
              this.$message.success(res.mess)
              this.getOrderList();
            } else {
              this.$message.error(res.mess)
            }
          }).catch(reds => {
            this.$message.error("操作失败")
          })
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
      },
      openExportModel() {
        this.exportdialogVisible = true
        this.exportForm.checked = true
        this.exportForm.orderStatus = "undeliver"
      },
      submitExport() {
        exportOrder({
          orderStatus: this.exportForm.orderStatus,
          isNext: this.exportForm.checked
        }).then(res => {
          this.exportdialogVisible = false
          if (res.code === 1) {
            this.tableToExcel(res.data)
            if (this.exportForm.orderStatus === "undeliver" && this.exportForm.checked) {
              this.getOrderList()
            }
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.$message.error("操作失败")
        })
      },
      tableToExcel(jsonData, name) {
        console.log(jsonData);
        //要导出的json数据
        //列标题，逗号隔开，每一个逗号就是隔开一个单元格
        let zhArr = ['订单创建时间', '支付时间', '订单号', '微信订单号', '备注', '尺码', '支付金额', '商品分类名称', '商品名称', '收件人', '地址预留号码', '省', '市', '区', '地址详情', '用户手机号', 'userId'];
        var str = zhArr.join(',');
        str += "\n"
        // let str = `姓名,电话,邮箱\n`;
        //增加\t为了不让表格显示科学计数法或者其他格式
        for (let i = 0; i < jsonData.length; i++) {
          for (let item in jsonData[i]) {
            str += `${jsonData[i][item] + '\t'},`;
          }
          str += '\n';
        }
        //encodeURIComponent解决中文乱码
        let uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
        //通过创建a标签实现
        var link = document.createElement("a");
        link.href = uri;
        //对下载的文件命名
        link.download = (name ? name : this.exportForm.orderStatus + "--订单数据.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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