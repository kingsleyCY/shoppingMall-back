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
  </div>
</template>

<script>
  import { getCustomer } from "@/api/request"

  export default {
    name: "proxyList",
    data() {
      return {
        tableData: [],
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