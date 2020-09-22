<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="banner" name="banner"></el-tab-pane>
      <el-tab-pane label="热款" name="hot"></el-tab-pane>
      <el-tab-pane label="爆款" name="explosive"></el-tab-pane>
      <el-tab-pane label="新品" name="news"></el-tab-pane>
      <el-tab-pane label="折扣款" name="rebate"></el-tab-pane>
    </el-tabs>
    <div>
      <el-select v-model="selectArr" multiple filterable placeholder="请选择" style="width: 500px;">
        <el-option
          v-for="(item, index) in commodityList"
          :key="index"
          :label="item.classifyName + '/' + item.title"
          :value="item.id" :disabled="item.disabled">
        </el-option>
      </el-select>
      <el-button type="primary" @click="addToList">添加</el-button>
      <div>
        <ul class="list-box">
          <li v-for="(item, index) in activeList" :key="index" class="item-commo">
            <i class="el-icon-delete" @click="deleList(index)"></i>
            <img :src="item.logo" alt="">
            <el-tooltip effect="dark" :content="item.title" placement="top">
              <p class="title">
                {{item.title}}
              </p>
            </el-tooltip>
            <el-tooltip effect="dark" :content="item.introduction" placement="top">
              <div class="introduction">{{item.introduction}}</div>
            </el-tooltip>
            <div class="price">
              <span>原价：￥{{item.originPrice}}</span>
              <span>优惠价￥{{item.presentPrice}}</span>
            </div>
            <div class="over-price">实际价格：￥{{item.overPrice}}</div>
          </li>
        </ul>
      </div>
      <el-button type="primary" @click="submitList">确定</el-button>
    </div>
  </div>
</template>

<script>
  import { getCommodityList, getIndexList, updateIndexList } from '@/api/request'

  export default {
    name: "indexManage",
    data() {
      return {
        activeName: "banner",
        selectArr: [],
        commodityList: [],
        bannerList: [],
        hotList: [],
        explosiveList: [],
        newsList: [],
        rebateList: [],
        activeList: [],
      }
    },
    created() {
      this.getCommodityList(true)
    },
    methods: {
      async getCommodityList(flag) {
        if (flag) {
          var param = {
            page: 1,
            pageSize: 1000000
          }
          await new Promise((resolve, reject) => {
            getCommodityList(param).then(res => {
              this.commodityList = res.data.list
              resolve()
            }).catch(res => {})
          })
        }
        await new Promise((resolve, reject) => {
          getIndexList().then(res => {
            var data = res.data
            for (let key in data) {
              if (!Array.isArray(data[key])) {
                continue
              }
              this[key] = this.commodityList.filter(v => {
                var item = data[key].filter(vs => {
                  return vs === v.id
                })[0]
                return item
              })
            }
            resolve()
          }).catch(res => {})
        })
        this.handleClick()
      },
      handleClick() {
        let that = this
        that.selectArr = []
        if (this.activeName === "banner") {
          this.activeList = JSON.parse(JSON.stringify(this.bannerList))
        } else if (this.activeName === "hot") {
          this.activeList = JSON.parse(JSON.stringify(this.hotList))
        } else if (this.activeName === "explosive") {
          this.activeList = JSON.parse(JSON.stringify(this.explosiveList))
        } else if (this.activeName === "news") {
          this.activeList = JSON.parse(JSON.stringify(this.newsList))
        } else if (this.activeName === "rebate") {
          this.activeList = JSON.parse(JSON.stringify(this.rebateList))
        }
        this.commodityList.forEach(v => {
          var item = that.activeList.filter(vs => {
            return v.id === vs.id
          })[0]
          item ? v.disabled = true : v.disabled = false
        })
      },
      addToList() {
        let that = this
        let list = this.commodityList.filter(v => {
          return that.selectArr.indexOf(v.id) >= 0
        })
        that.activeList = [...that.activeList, ...list]
        that.selectArr = []
        that.initdisabled()
      },
      deleList(index) {
        let that = this
        that.activeList.splice(index, 1)
        that.selectArr = []
        that.initdisabled()
      },
      initdisabled() {
        let that = this
        let ids = that.activeList.map(v => {
          return v.id
        })
        that.commodityList.forEach(v => {
          if (ids.indexOf(v.id) >= 0) {
            that.$set(v, "disabled", true)
          } else {
            that.$set(v, "disabled", false)
          }
        })
      },
      submitList() {
        let param = {
          type: this.activeName
        }
        let arr = this.activeList.map(v => {
          return v.id
        })
        param.ids = arr
        updateIndexList(param).then(res => {
          if (res.code === 1) {
            this.$message.success(res.mess)
            this.getCommodityList()
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {})
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
      .el-icon-delete {
        position: absolute;
        right: 0;
        bottom: 0;
        color: #409EFF;
      }
      img {
        width: 100%;
        height: 150px;
      }
      .title {
        display: inline-block;
        white-space: nowrap;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 5px;
      }
      .introduction {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        height: 32px;
        font-size: 12px;
        padding: 0 5px;
      }
      .price {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        padding: 0 5px;
        padding-top: 5px;
      }
      .over-price {
        font-size: 12px;
        padding: 0 5px;
      }
    }
  }
</style>