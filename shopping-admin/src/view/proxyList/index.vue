<template>
  <div>
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
        prop="phone"
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
        label="推荐人ID"
        min-width="180">
      </el-table-column>
      <el-table-column
        prop="qrCode"
        label="qrCode"
        min-width="100">
        <template slot-scope="scope">
          <img :src="scope.row.qrCode" alt="">
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="120">
        <template slot-scope="scope">
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
      :with-header="false">
      <div>
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="下线列表" name="first">
            <el-table :data="detailTable" border style="width: 100%">
              <el-table-column
                prop="date"
                label="日期"
                min-width="180">
                <template slot-scope="scope">
                  {{timeTransfer(scope.row.created_time)}}
                </template>
              </el-table-column>
              <el-table-column
                prop="phone"
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
                label="推荐人ID"
                min-width="180">
              </el-table-column>
              <el-table-column
                prop="qrCode"
                label="qrCode"
                min-width="100">
                <template slot-scope="scope">
                  <img :src="scope.row.qrCode" alt="">
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              @size-change="detailSizeChange"
              @current-change="detailCurrentChange"
              :current-page="detailPage.page"
              :page-sizes="[10, 20, 40, 100]"
              :page-size="detailPage.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="detailPage.total">
            </el-pagination>
          </el-tab-pane>
          <el-tab-pane label="流水查看" name="second">
            <el-table :data="orderTable" border style="width: 100%">
              <el-table-column
                prop="date"
                label="日期"
                min-width="180">
                <template slot-scope="scope">
                  {{timeTransfer(scope.row.created_time)}}
                </template>
              </el-table-column>
              <el-table-column
                prop="userId"
                label="userId"
                min-width="180">
              </el-table-column>
              <el-table-column
                prop="price"
                label="价格"
                min-width="180">
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
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script>
  import { getCustomer, getProxyOrder } from "@/api/request"

  export default {
    name: "proxyList",
    data() {
      return {
        tableData: [],
        detailTable: [],
        orderTable: [],
        pageData: {
          page: 1,
          pageSize: 10,
          page: 1,
        },
        detailPage: {
          page: 1,
          pageSize: 10,
          page: 1,
        },
        orderPage: {
          page: 1,
          pageSize: 10,
          page: 1,
        },
        drawer: false,
        detailItem: null,
        activeName: "first"
      }
    },
    mounted() {
      this.getCustomerMethods()
    },
    methods: {
      getCustomerMethods() {
        let param = {
          page: this.pageData.page,
          pageSize: this.pageData.pageSize,
          listType: "proxy"
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
      detailSizeChange(val) {
        this.pageData.pageSize = val
        this.pageData.page = 1
        this.getCustomerMethods()
      },
      detailCurrentChange(val) {
        this.pageData.page = val
        this.getCustomerMethods()
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
      toDetail(row) {
        this.drawer = true;
        this.detailItem = row
        this.handleClick()
      },
      getRecommDetail() {
        let param = {
          page: this.detailPage.page,
          pageSize: this.detailPage.pageSize,
          listType: "recommend",
          id: this.detailItem.userId
        }
        getCustomer(param).then(res => {
          this.detailTable = res.data.list;
          this.detailPage.total = res.data.total;
        }).catch(res => {

        })
      },
      getOrderList() {
        let param = {
          page: this.orderPage.page,
          pageSize: this.orderPage.pageSize,
          id: this.detailItem.userId
        }
        getProxyOrder(param).then(res => {
          this.orderTable = res.data.list;
          this.orderPage.total = res.data.total;
        }).catch(res => {
          this.orderTable = [];
          this.orderPage.total = 0;
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
      handleClick() {
        if (this.activeName === "first") {
          this.getRecommDetail()
        } else if (this.activeName === "second") {
          this.getOrderList()
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .el-table {
    img {
      display: block;
      width: 100%;
    }
  }
</style>