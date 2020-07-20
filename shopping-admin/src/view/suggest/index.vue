<template>
  <div>
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column
        prop="date"
        label="日期"
        min-width="180">
        <template slot-scope="scope">
          {{common.timeTransfer(scope.row.created_time)}}
        </template>
      </el-table-column>
      <el-table-column
        prop="userId"
        label="userId"
        min-width="180">
      </el-table-column>
      <el-table-column
        prop="content"
        label="内容"
        min-width="180">
      </el-table-column>
      <el-table-column
        label="类型"
        min-width="180">
        <template slot-scope="scope">
          {{scope.row.type === 1?"投诉":"建议"}}
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
  import { getSuggestList } from "@/api/request"

  export default {
    name: "userList",
    data() {
      return {
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
      this.getSuggestList()
    },
    methods: {
      getSuggestList() {
        let param = {
          page: this.pageData.page,
          pageSize: this.pageData.pageSize
        }
        getSuggestList(param).then(res => {
          this.tableData = res.data.list;
          this.pageData.total = res.data.total;
        }).catch(res => {
          this.$message.error("查询错误")
        })
      },
      handleSizeChange(val) {
        this.pageData.pageSize = val
        this.pageData.page = 1
        this.getSuggestList()
      },
      handleCurrentChange(val) {
        this.pageData.page = val
        this.getSuggestList()
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