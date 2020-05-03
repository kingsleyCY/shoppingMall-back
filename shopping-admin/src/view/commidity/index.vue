<template>
  <div>
    <el-button type="primary" @click="addCommodity" size="mini">添加商品</el-button>
    <el-button type="primary" @click="deleCommodity" size="mini">删除选中</el-button>
    <ul class="list-box">
      <li v-for="(item, index) in commodityList" :key="index" class="item-commo" @click="editCommodity(item.id)">
        <el-checkbox v-model="item.checked" @click.native.stop="checkedCommodity(item)" class="checkbox"></el-checkbox>
        <img :src="item.logo" alt="">
        <p>{{item.title}}</p>
        <div class="introduction">{{item.introduction}}</div>
        <div class="price">
          <span>原价：￥{{item.originPrice}}</span>
          <span>优惠价￥{{item.presentPrice}}</span>
        </div>
        <div class="over-price">实际价格：￥{{item.overPrice}}</div>
      </li>
    </ul>
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
  import { getCommodityList, deleCommodity } from '@/api/request'

  export default {
    name: "commidity",
    data() {
      return {
        pageData: {
          page: 1,
          pageSize: 10,
          total: 0,
        },
        commodityList: []
      }
    },
    mounted() {
      this.getList()
    },
    methods: {
      getList() {
        var param = {
          page: this.pageData.page,
          pageSize: this.pageData.pageSize,
        }
        getCommodityList(param).then(res => {
          this.commodityList = res.data.list
          this.pageData.total = res.data.total
        }).catch(res => {

        })
      },
      handleSizeChange() {
        this.getList()
      },
      handleCurrentChange() {
        this.getList()
      },
      addCommodity() {
        this.$router.push('/admin/addcommidity')
      },
      editCommodity(id) {
        this.$router.push('/admin/addcommidity?id=' + id)
      },
      checkedCommodity(item) {
        item.checked = !item.checked
      },
      deleCommodity() {
        var arr = []
        this.commodityList.forEach(v => {
          if (v.checked) {
            arr.push(v.id)
          }
        })
        if (arr.length > 0) {
          deleCommodity({ id: arr }).then(res => {
            if (res.code === 1) {
              this.$message.success(res.mess)
              this.getList()
            } else {
              this.$message.error(res.mess)
            }
          })
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .list-box {
    width: 100%;
    list-style: none;
    li {
      width: 180px;
      height: 250px;
      overflow: hidden;
      display: inline-block;
      margin: 10px 15px;
      border: 1px solid #d7d7d7;
      cursor: pointer;
      position: relative;
      .checkbox {
        position: absolute;
        left: 0;
        top: 0;
      }
      img {
        width: 100%;
        height: 150px;
      }
      .introduction {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        height: 32px;
        font-size: 12px;
      }
      .price {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        padding-top: 5px;
      }
      .over-price {
        font-size: 12px;
      }
    }
  }
</style>