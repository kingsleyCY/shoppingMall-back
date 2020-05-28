<template>
  <div>
    <el-table
      :data="orderList" border
      style="width: 100%">
      <el-table-column
        prop="out_trade_no"
        label="订单ID"
        width="150">
      </el-table-column>
      <el-table-column
        prop="orderStatus"
        label="状态"
        width="80">
        <template slot-scope="scope">
          <span :class="[scope.row.orderStatus, 'orde-status']">
            {{computedStatus(scope.row.orderStatus)}}
          </span>
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
        fixed="right"
        label="操作"
        width="120">
        <template slot-scope="scope">
          <!-- 未发货订单可退货 -->
          <el-button type="text" size="small" v-if="scope.row.orderStatus==='paid'">
            取消订单
          </el-button>
          <!-- 已收到订单信息联系卖方 -->
          <el-button type="text" size="small" v-if="scope.row.orderStatus==='paid'">
            确认订单
          </el-button>
          <!-- 录入订单物流信息 -->
          <el-button type="text" size="small"
                     v-if="scope.row.orderStatus==='undeliver'"
                     @click="openMailModel(scope.row)">
            录入物流信息
          </el-button>
          <el-button type="text" size="small"
                     v-if="scope.row.orderStatus==='deliver'"
                     @click="openMailModel(scope.row)">
            修改物流信息
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
  import { getOrderList, setMail } from "@/api/request"

  export default {
    name: "orderList",
    data() {
      return {
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
        }
      }
    },
    mounted() {
      this.getOrderList()
    },
    methods: {
      getOrderList() {
        let param = {
          page: this.pageData.page,
          pageSize: this.pageData.pageSize
        }
        getOrderList(param).then(res => {
          this.orderList = res.data.list;
          this.pageData.total = res.data.total;
        }).catch(res => {
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
      computedStatus(type) {
        switch (type) {
          case "none":
            return "初始化";
          case "unpaid":
            return "待支付";
          case "paid":
            return "已支付成功";
          case "paiderror":
            return "已支付失败";
          case "undeliver":
            return "待发货";
          case "deliver":
            return "已发货";
          case "over":
            return "已完成";
          case "refund":
            return "已退款成功";
          case "unrefund":
            return "退款失败";
        }
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

          })
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .el-table {
    .orde-status {
      font-weight: bold;
    }
    .unpaid {
      color: #ada7a1;
    }
    .paid {
      color: #4bff65;
    }
    .paiderror {
      color: #ff3100;
    }
    .undeliver {
      color: #6eb1ff;
    }
    .deliver {
      color: #3d75ff;
    }
    .over {
      color: #ff00ec;
    }
    .refund {
      color: #54fdff;
    }
    .unrefund {
      color: #ffa037;
    }
  }
</style>