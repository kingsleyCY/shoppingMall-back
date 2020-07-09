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
        label="推荐人手机号"
        min-width="180">
      </el-table-column>
      <el-table-column
        prop="agentId"
        label="级别"
        min-width="100">
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
          <img :src="scope.row.qrCode" v-image>
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
      :with-header="false" custom-class="auto-drawer">
      <div style="height: 100%;padding: 15px;">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="下线列表" name="first">
            <el-form ref="form" :model="firstForm" label-width="80px" :inline="true" size="mini">
              <el-form-item>
                <el-select v-model="firstForm.agentLevel" @change="agentLevelChange">
                  <el-option :label="item.title" :value="item.val" v-for="(item, index) in levelArr"
                             :key="index" :disabled="setProxyDisabled(item)"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-select v-model="firstForm.agentType" :disabled="agentTypeDisabled">
                  <el-option :label="item.title" :value="item.val" v-for="(item, index) in typeArr"
                             :key="index"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="getRecommDetail">查询</el-button>
              </el-form-item>
            </el-form>
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
                prop="agentId"
                label="级别"
                min-width="100">
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="流水查看" name="second">
            <el-table :data="orderTable" border style="width: 100%">
              <el-table-column
                prop="date"
                label="日期"
                min-width="150">
                <template slot-scope="scope">
                  {{common.timeTransfer(scope.row.created_time)}}
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
                  {{scope.row.commodityDetail.title}}
                </template>
              </el-table-column>
              <el-table-column
                prop="total_fee"
                label="地址详情"
                min-width="200">
                <template slot-scope="scope">
                  {{scope.row.addressDetail.provinceName
                  +'/'+scope.row.addressDetail.cityName+"/"+scope.row.addressDetail.countyName +'/'+
                  scope.row.addressDetail.detailInfo}}<br>
                  {{scope.row.addressDetail.telNumber}}<br>
                  {{scope.row.addressDetail.userName}}
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
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script>
  import { getCustomer, getProxy, getProxyOrder } from "@/api/request"

  export default {
    name: "proxyList",
    data() {
      return {
        formInline: {
          phoneNumber: ""
        },
        tableData: [],
        detailTable: [],
        orderTable: [],
        pageData: {
          pageSize: 10,
          page: 1,
        },
        orderPage: {
          pageSize: 10,
          page: 1,
        },
        drawer: false,
        detailItem: null,
        proxyLevel: 1,
        agentTypeDisabled: false,
        activeName: "first",
        firstForm: {
          agentLevel: 0,
          agentType: 0,
        },
        levelArr: [
          {
            val: 0,
            title: "全部"
          },
          {
            val: 1,
            title: "一级"
          },
          {
            val: 2,
            title: "二级"
          },
          {
            val: 3,
            title: "三级"
          }
        ],
        typeArr: [
          /*{
            val: 0,
            title: "全部"
          },*/
          {
            val: 1,
            title: "代理"
          },
          {
            val: 2,
            title: "用户"
          }
        ]
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
          pageSize: this.pageData.pageSize,
          listType: "proxy"
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
        this.proxyLevel = row.agentId
        this.handleClick()
      },

      getRecommDetail() {
        let param = {
          agentLevel: this.firstForm.agentLevel,
          agentType: this.firstForm.agentType,
          agentId: this.detailItem.agentId,
          phoneNumber: this.detailItem.phoneNumber
        }
        getProxy(param).then(res => {
          if (res.code === 1) {
            this.detailTable = res.data;
          } else {
            this.detailTable = [];
          }
        }).catch(res => {
          this.detailTable = [];
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
      handleClick() {
        if (this.activeName === "first") {
          this.getRecommDetail();
          this.firstForm.agentLevel = this.proxyLevel
          this.agentLevelChange()
        } else if (this.activeName === "second") {
          this.getOrderList()
          this.orderPage = {
            page: 1,
            pageSize: 10
          }
        }
      },
      setProxyDisabled(item) {
        if (item.val === 0) {
          return false
        }
        if (item.val >= this.proxyLevel) {
          return false
        } else {
          return true
        }
      },
      agentLevelChange() {
        if (this.firstForm.agentLevel === this.proxyLevel) {
          this.firstForm.agentType = 2;
          this.agentTypeDisabled = true
        } else {
          this.agentTypeDisabled = false
        }
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