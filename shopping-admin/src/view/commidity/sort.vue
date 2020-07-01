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
    <el-button type="primary" @click="submitSort" size="mini" :loading="loading">确定</el-button>
    <div class="sortable-box">
      <SlickList :lockToContainerEdges="true" axis="xy" lockAxis="xy" v-model="commodityList" class="sortable-list">
        <SlickItem v-for="(item, index) in commodityList" class="sortable-item" :index="index" :key="item.id">
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
    getClassifyList,
    setSortIndex
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
        commodityList: [],
        loading: false
      }
    },
    mounted() {
      this.getClassifyList();
      this.$nextTick(() => {
        var height = document.getElementsByClassName('right-content')[0].clientHeight - 120;
        document.getElementsByClassName('sortable-list')[0].style.height = height + "px";
      })

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
      submitSort() {
        this.$confirm('此操作将保存当前排序, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var list = this.commodityList.map((v, i) => {
            return {
              id: v.id,
              sortIndex: this.commodityList.length - i
            }
          })
          var param = {}
          if (this.search.classifyId.length > 0) {
            param.classifyId = this.search.classifyId[this.search.classifyId.length - 1]
            param.sortJson = JSON.stringify(list)
          } else {
            this.$message.error("请选择分类")
            return
          }
          this.loading = true
          setSortIndex(param).then(res => {
            this.loading = false
            if (res.code === 1) {
              this.$message.success(res.mess)
              this.searchList()
            } else {
              this.$message.error(res.mess)
            }
          }).catch(res => {
            this.loading = false
            this.$message.error("操作失败")
          })
        })
      }
    },
    components: {
      SlickItem,
      SlickList
    },
  }
</script>

<style scoped lang="scss">
</style>