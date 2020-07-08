<template>
  <div>
    <el-form :inline="true" :model="formInline" class="demo-form-inline" size="mini">
      <el-form-item label="手机号">
        <el-input clearable v-model="formInline.phoneNumber" placeholder="手机号"></el-input>
      </el-form-item>
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
          {{timeTransfer(scope.row.created_time)}}
        </template>
      </el-table-column>
      <el-table-column
        prop="phoneNumber"
        label="手机号"
        min-width="180">
      </el-table-column>
      <el-table-column
        prop="userId"
        label="userId"
        min-width="180">
      </el-table-column>
      <el-table-column
        prop="recommendId"
        label="推荐人手机号"
        min-width="180">
      </el-table-column>
      <el-table-column
        prop="integral"
        label="积分"
        min-width="180">
      </el-table-column>
      <el-table-column
        label="最后活动时间"
        width="100">
        <template slot-scope="scope">
          {{timeTransfer(scope.row.lastActTime)}}
        </template>
      </el-table-column>
      <el-table-column
        prop="qrCode"
        label="qrCode"
        min-width="100">
        <template slot-scope="scope">
          <img :src="scope.row.qrCode" v-image>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        min-width="120">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.qrCode" type="text" size="small" @click="setQrcode(scope.row.userId)">
            生成二维码
          </el-button>
          <el-button type="text" size="small" @click="toDetail(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageData.page"
      :page-sizes="[10, 20, 40, 100]"
      :page-size="pageData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageData.total">
    </el-pagination>
    <el-drawer
      title="我是标题"
      size="60%"
      :visible.sync="drawer"
      :with-header="false" custom-class="auto-drawer">
      <div>
        <el-table :data="orderTable" border style="width: 100%">
          <el-table-column
            prop="date"
            label="日期"
            min-width="150">
            <template slot-scope="scope">
              {{timeTransfer(scope.row.created_time)}}
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
            label="尺码"
            min-width="50">
            <template slot-scope="scope">
              {{scope.row.size}}
            </template>
          </el-table-column>
          <el-table-column
            prop="total_fee"
            label="价格"
            min-width="80">
            <template slot-scope="scope">
              {{scope.row.total_fee / 100}}
            </template>
          </el-table-column>
          <el-table-column
            prop="total_fee"
            label="商品详情"
            min-width="150">
            <template slot-scope="scope">
              {{scope.row.commodityDetail?scope.row.commodityDetail.title:"--"}}
            </template>
          </el-table-column>
          <el-table-column
            prop="total_fee"
            label="地址详情"
            min-width="200">
            <template slot-scope="scope">
              <span v-if="scope.row.addressDetail">
                {{scope.row.addressDetail.provinceName
              +'/'+scope.row.addressDetail.cityName+"/"+scope.row.addressDetail.countyName +'/'+
              scope.row.addressDetail.detailInfo}}<br>
              {{scope.row.addressDetail.telNumber}}<br>
              {{scope.row.addressDetail.userName}}
              </span>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="mess"
            label="备注"
            min-width="150">
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="orderSizeChange"
          @current-change="orderCurrentChange"
          :current-page="orderPage.page"
          :page-sizes="[10, 20, 40, 100]"
          :page-size="orderPage.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="orderPage.total">
        </el-pagination>
      </div>
    </el-drawer>
  </div>
</template>

<script>
  import { getCustomer, setQrcode, getOrderList } from "@/api/request"

  export default {
    name: "userList",
    data() {
      return {
        formInline: {
          phoneNumber: ""
        },
        tableData: [],
        pageData: {
          page: 1,
          pageSize: 10,
          page: 1,
        },
        orderTable: [],
        drawer: false,
        detailItem: null,
        orderPage: {
          page: 1,
          pageSize: 10,
          page: 1,
        },
      }
    },
    mounted() {
      this.getCustomerMethods()
    },
    methods: {
      onSubmit() {
        this.pageData.page = 1
        this.getCustomerMethods()
      },
      getCustomerMethods() {
        let param = {
          page: this.pageData.page,
          pageSize: this.pageData.pageSize
        }
        if (this.formInline.phoneNumber) {
          param.phoneNumber = this.formInline.phoneNumber
        }
        getCustomer(param).then(res => {
          this.tableData = res.data.list;
          this.pageData.total = res.data.total;
        }).catch(res => {

        })
      },
      handleSizeChange(val) {
        this.pageData.pageSize = val
        this.pageData.page = 1
        this.getCustomerMethods()
      },
      handleCurrentChange(val) {
        this.pageData.page = val
        this.getCustomerMethods()
      },
      setQrcode(id) {
        setQrcode({ id }).then(res => {
          if (res.code === 1) {
            this.$message.success(res.mess)
            this.getCustomerMethods()
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.$message.error("操作失败")
        })
      },
      toDetail(row) {
        this.drawer = true;
        this.detailItem = row;
        this.getOrderList()
      },
      getOrderList() {
        let param = {
          page: this.orderPage.page,
          pageSize: this.orderPage.pageSize,
          userId: this.detailItem.userId
        }
        getOrderList(param).then(res => {
          this.orderTable = res.data.list;
          this.orderPage.total = res.data.total;
        }).catch(res => {
          this.orderTable = [];
          this.orderPage.total = 0;
        })
      },
      orderSizeChange(val) {
        this.orderPage.pageSize = val
        this.orderPage.page = 1
        this.getOrderList()
      },
      orderCurrentChange(val) {
        this.orderPage.page = val
        this.getOrderList()
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
      }
    }
  }
</script>

<style scoped lang="scss">
  .el-table {
    img {
      display: block;
      width: 80px;
    }
  }
</style>