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
          <el-button v-if="!scope.row.qrCode" type="text" size="small" @click="setQrcode(scope.row.userId)">生成二维码</el-button>
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
  </div>
</template>

<script>
  import { getCustomer, setQrcode } from "@/api/request"

  export default {
    name: "proxyList",
    data() {
      return {
        tableData: [],
        pageData: {
          page: 1,
          pageSize: 10,
          page: 1,
        }
      }
    },
    mounted() {
      this.getCustomer()
    },
    methods: {
      getCustomer() {
        let param = {
          page: this.pageData.page,
          pageSize: this.pageData.pageSize
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
        this.getCustomer()
      },
      handleCurrentChange(val) {
        this.pageData.page = val
        this.getCustomer()
      },
      setQrcode(id) {
        setQrcode({ id }).then(res => {
          if (res.code === 1) {
            this.$message.success(res.mess)
            this.getCustomer()
          } else {
            this.$message.error(res.mess)
          }
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