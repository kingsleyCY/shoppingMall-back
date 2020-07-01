<template>
  <div>
    <div>
      <el-form :model="search" ref="ruleForm" label-width="60px" class="demo-ruleForm" size="mini" :inline="true">
        <el-form-item label="分类：">
          <el-cascader size="mini" :props="cascaderProps" v-model="search.classifyId" :options="treeData"
                       clearable></el-cascader>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchList" size="mini">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-button @click="cancel" size="mini">取消</el-button>
    <el-button type="primary" @click="" size="mini">确定</el-button>
    <div>
      <SlickList :lockToContainerEdges="true" axis="y" lockAxis="" v-model="commodityList" class="sortable-list" @input="getChangeLists">
        <SlickItem v-for="(item, index) in commodityList" class="sortable-item" :index="index" :key="index">
          <div>
            <img :src="item.logo" alt="">
            <p>{{ item.title }}</p>
          </div>
        </SlickItem>
      </SlickList>
    </div>
  </div>
</template>

<script>
  import {
    getCommodityList,
    getClassifyList
  } from '@/api/request';
  import { SlickList, SlickItem } from 'vue-slicksort';

  export default {
    name: "sortcommidity",
    data() {
      return {
        search: {
          classifyId: [],
        },
        pageData: {
          page: 1,
          pageSize: 50,
          total: 0,
        },
        treeData: [],
        cascaderProps: {
          value: "id",
          label: "title",
        },
        commodityList:[],
      }
    },
    mounted() {
      this.getClassifyList()
    },
    methods: {
      cancel() {
        this.$router.push('/admin_html/commidity')
      },
      searchList() {
        this.getList()
      },
      getList() {
        var param = {
          page: this.pageData.page,
          pageSize: this.pageData.pageSize,
        }
        if (this.search.classifyId.length > 0) {
          param.classifyId = this.search.classifyId[this.search.classifyId.length - 1]
        }
        if (!param.classifyId) {
          this.$message.error("请选择分类")
          return
        }
        param.sortBy = "sortIndex";
        getCommodityList(param).then(res => {
          this.commodityList = res.data.list
          this.pageData.total = res.data.total
        }).catch(res => {

        })
      },
      getClassifyList() {
        getClassifyList().then(res => {
          this.treeData = res.data;
        })
      },
      getChangeList (val) {
        console.log(val, 'val')
      },
      getChangeLists (vals) {
        console.log(vals, 'vals')
      }
    },
    components: {
      SlickItem,
      SlickList
    },
  }
</script>

<style scoped lang="scss">
  .sortable-list {
    .sortable-item {
      width: 200px;
      height: 265px;
      overflow: hidden;
      display: inline-block;
      border: 1px solid #d7d7d7;
      font-size: 12px;
      img {
        display: block;
        width: 100%;
        height: auto;
      }
    }
  }
</style>