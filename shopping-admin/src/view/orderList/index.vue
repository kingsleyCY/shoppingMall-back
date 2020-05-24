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
        prop="total_fee"
        label="成交价格（￥）"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.total_fee / 100}}
        </template>
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
        prop="手机号"
        label="userId"
        min-width="100">
        <template slot-scope="scope">
          {{scope.row.userDetail.phoneNumber}}
        </template>
      </el-table-column>
      <el-table-column
        prop="commodityId"
        label="商品ID"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="commodityId"
        label="商品ID"
        min-width="100">
      </el-table-column>
      <el-table-column
        label="商品名称"
        min-width="100">
        <template slot-scope="scope">
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
        fixed="right"
        label="操作"
        width="120">
        <template slot-scope="scope">
          <el-button type="text" size="small" v-if="scope.row.isDelete === 0">
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
</template>

<script>
  import { getOrderList } from "@/api/request"
  export default {
    name: "orderList",
    data() {
      return {
        orderList: [],
        pageData: {
          page: 1,
          pageSize: 10,
          total: 0,
        },
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
    }
  }
</script>

<style scoped lang="scss">

</style>