<template>
  <div>
    <div>
      <el-form :model="search" ref="ruleForm" label-width="60px" class="demo-ruleForm" size="mini" :inline="true">
        <el-form-item label="名称：">
          <el-input size="mini" v-model="search.title" clearable></el-input>
        </el-form-item>
        <el-form-item label="分类：">
          <el-cascader size="mini" :props="cascaderProps" v-model="search.classifyId" :options="treeData"
                       clearable></el-cascader>
        </el-form-item>
        <el-form-item label="排序：">
          <el-select v-model="search.sortBy" placeholder="请选择排序方式" clearable>
            <el-option
              v-for="(item, index) in sortArr"
              :key="item.val"
              :label="item.label"
              :value="item.val">
            </el-option>
          </el-select>
          <el-select v-model="search.sortType" placeholder="请选择排序方式" clearable>
            <el-option
              v-for="(item, index) in sortTypeArr"
              :key="item.val"
              :label="item.label"
              :value="item.val">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchList" size="mini">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-button type="primary" @click="addCommodity" size="mini">添加商品</el-button>
    <el-button type="primary" @click="deleCommodity" size="mini">删除选中</el-button>
    <el-button type="primary" @click="openBathExport" size="mini">批量上传</el-button>
    <el-button type="primary" @click="batchMove" size="mini">批量移动</el-button>
    <el-button type="primary" @click="bathSetAdd" size="mini">批量设置增加量</el-button>
    <el-button type="primary" @click="bathSetPriceModel" size="mini">批量设置价格</el-button>
    <el-button type="primary" @click="toSort" size="mini">排序</el-button>
    <el-button type="primary" @click="selectAll" size="mini">全选</el-button>
    <el-button type="primary" @click="reverseSelect" size="mini">反选</el-button>
    <ul class="list-box">
      <li v-for="(item, index) in commodityList" :key="index" class="item-commo" @click="editCommodity(item.id)">
        <el-checkbox v-model="item.checked" @click.native.stop.self="checkedCommodity(item)"
                     class="checkbox"></el-checkbox>
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
        <div class="num">
          <span>销售量：{{item.saleNum}}</span>
          <span>查看量：{{item.consultNum}}</span>
        </div>
        <div class="num">
          <span>销售量增加：{{item.addSaleNum}}</span>
        </div>
        <div class="num">
          <span>查看量增加：{{item.addConsultNum}}</span>
        </div>
      </li>
    </ul>
    <el-pagination
      v-if="!listLoading"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageData.page"
      :page-sizes="[10, 20, 50]"
      :page-size="pageData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageData.total">
    </el-pagination>

    <el-dialog
      custom-class="most-dislog"
      title="批量上传"
      :visible.sync="bathdialogVisible"
      width="50%">
      <el-upload
        class="upload-demo" :limit="1"
        drag :auto-upload="false"
        action=""
        :on-change="fileChange"
        :multiple="false">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bathdialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="uploadFile" size="small">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="批量移动"
      :visible.sync="batchMoveVisible"
      width="350px">
      <div>
        <el-cascader size="mini" :props="cascaderProps" v-model="batchMoveValue" :options="treeData"
                     clearable></el-cascader>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="batchMoveVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitBatchMove">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="修改增加量"
      :visible.sync="batchSetAddVisible"
      width="350px">
      <div>
        <el-form ref="form" :model="batchSetAddForm" label-width="80px">
          <el-form-item label="销售量">
            <el-input v-model="batchSetAddForm.addSaleNum"></el-input>
          </el-form-item>
          <el-form-item label="查看量">
            <el-input v-model="batchSetAddForm.addConsultNum"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="batchSetAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddSet">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="批量设置价格"
      :visible.sync="batchSetPriceVisible"
      width="350px">
      <div>
        <el-form ref="form" label-width="80px" :model="bathPriceForm">
          <el-form-item label="原价">
            <el-input v-model="bathPriceForm.originPrice"></el-input>
          </el-form-item>
          <el-form-item label="优惠价">
            <el-input v-model="bathPriceForm.presentPrice"></el-input>
          </el-form-item>
          <el-form-item label="实际价格">
            <el-input v-model="bathPriceForm.overPrice"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="batchSetPriceVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitPriceSet">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getCommodityList,
    deleCommodity,
    getClassifyList,
    bathExportCommodity,
    batchMoveCommdity,
    commodityAddition,
    bathSetPrice,
  } from '@/api/request'

  export default {
    name: "commidity",
    data() {
      return {
        listLoading: false,
        selectArr: [],
        sortArr: [
          {
            val: "sortIndex",
            label: "自定义序号"
          },
          {
            val: "saleNume",
            label: "销售量"
          },
          {
            val: "seeNum",
            label: "查看量"
          },
        ],
        sortTypeArr: [
          {
            val: "sequence",
            label: "正序"
          },
          {
            val: "reverse",
            label: "倒序"
          },
        ],
        pageData: {
          page: 1,
          pageSize: 10,
          total: 0,
        },
        search: {
          classifyId: [],
          title: "",
          sortBy: "",
          sortType: "",
        },
        commodityList: [],
        treeData: [],
        cascaderProps: {
          value: "id",
          label: "title",
        },
        bathdialogVisible: false,
        bathFile: null,
        batchMoveVisible: false,
        batchMoveValue: [],
        batchSetAddVisible: false,
        batchSetAddForm: {
          addSaleNum: "",
          addConsultNum: "",
        },
        batchSetPriceVisible: false,
        bathPriceForm: {
          originPrice: "",
          presentPrice: "",
          overPrice: "",
        },
      }
    },
    mounted() {
      this.getList()
      this.getClassifyList()
    },
    methods: {
      searchList() {
        this.pageData.page = 1
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
        param.title = this.search.title.trim();
        param.sortBy = this.search.sortBy;
        param.sortType = this.search.sortType;
        this.listLoading = true
        getCommodityList(param).then(res => {
          this.listLoading = false
          this.commodityList = res.data.list
          this.pageData.total = res.data.total
          this.commodityList.forEach(item => {
            this.$set(item, "checked", false)
          });
        }).catch(res => {
          this.listLoading = false
        })
      },
      getClassifyList() {
        getClassifyList().then(res => {
          this.treeData = res.data
        })
      },
      handleSizeChange(val) {
        this.pageData.pageSize = val
        this.pageData.page = 1
        this.getList()
      },
      handleCurrentChange(val) {
        this.pageData.page = val
        this.getList()
      },
      addCommodity() {
        this.$router.push('/admin_html/addcommidity')
      },
      toSort() {
        this.$router.push('/admin_html/sortcommidity')
      },
      editCommodity(id) {
        this.$router.push('/admin_html/addcommidity?id=' + id)
      },
      checkedCommodity(item) {
        this.$set(item, "checked", !item.checked)
      },
      deleCommodity() {
        var arr = []
        this.commodityList.forEach(v => {
          if (v.checked) {
            arr.push(v.id)
          }
        })
        if (arr.length > 0) {
          this.$confirm('此操作将永久删除选中商品, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            deleCommodity({id: arr}).then(res => {
              if (res.code === 1) {
                this.$message.success(res.mess)
                this.getList()
              } else {
                this.$message.error(res.mess)
              }
            })
          })
        } else {
          this.$message.info("请选择")
        }
      },
      openBathExport() {
        this.bathdialogVisible = true
      },
      fileChange(file, fileList) {
        this.bathFile = file;
      },
      uploadFile() {
        console.log(this.bathFile);
        let param = new FormData();
        console.log(this.bathFile.raw);
        param.append("file", this.bathFile.raw);
        bathExportCommodity(param).then(res => {
          console.log(res);
        })
      },

      batchMove() {
        var arr = []
        this.commodityList.forEach(v => {
          if (v.checked) {
            arr.push(v.id)
          }
        });
        this.selectArr = arr
        if (arr.length > 0) {
          this.batchMoveVisible = true;
          this.batchMoveValue = this.search.classifyId;
        } else {
          this.$message.info("请选择")
        }
      },
      submitBatchMove() {
        var param = {ids: this.selectArr}
        if (this.batchMoveValue.length > 0) {
          param.classifyId = this.batchMoveValue[this.batchMoveValue.length - 1]
        }
        batchMoveCommdity(param).then(res => {
          if (res.code === 1) {
            this.$message.success(res.mess)
            this.batchMoveVisible = false;
            this.getList()
          } else {
            this.$message.error(res.mess)
          }
        })
      },
      selectAll() {
        this.commodityList.forEach(item => {
          this.$set(item, "checked", true)
        })
      },
      reverseSelect() {
        this.commodityList.forEach(item => {
          this.$set(item, "checked", !item.checked)
        })
      },
      bathSetAdd() {
        var arr = []
        this.commodityList.forEach(v => {
          if (v.checked) {
            arr.push(v.id)
          }
        });
        this.selectArr = arr
        if (arr.length <= 0) {
          this.$message.info("请选择")
          return
        }
        this.batchSetAddVisible = true;
        this.batchSetAddForm = {
          addSaleNum: "",
          addConsultNum: ""
        }
      },
      submitAddSet() {
        var param = {ids: this.selectArr}
        this.batchSetAddForm.addSaleNum ? param.addSaleNum = this.batchSetAddForm.addSaleNum : "";
        this.batchSetAddForm.addConsultNum ? param.addConsultNum = this.batchSetAddForm.addConsultNum : "";
        commodityAddition(param).then(res => {
          this.batchSetAddVisible = false;
          if (res.code === 1) {
            this.$message.success(res.mess)
            this.getList()
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.batchSetAddVisible = false;
          this.$message.error("操作失败")
        })
      },
      bathSetPriceModel() {
        var arr = []
        this.commodityList.forEach(v => {
          if (v.checked) {
            arr.push(v.id)
          }
        });
        this.selectArr = arr;
        if (arr.length <= 0) {
          this.$message.info("请选择")
          return
        }
        this.batchSetPriceVisible = true;
        this.bathPrice = 0;
      },
      submitPriceSet() {
        var param = {
          ids: this.selectArr,
          originPrice: this.bathPriceForm.originPrice,
          presentPrice: this.bathPriceForm.presentPrice,
          overPrice: this.bathPriceForm.overPrice,
        }
        if (!this.bathPriceForm.originPrice || !this.bathPriceForm.originPrice || !this.bathPriceForm.originPrice) {
          this.$message.info("参数错误")
          return
        }
        bathSetPrice(param).then(res => {
          this.batchSetPriceVisible = false;
          if (res.code === 1) {
            this.$message.success(res.mess)
            this.getList();
          } else {
            this.$message.error(res.mess)
          }
        }).catch(res => {
          this.batchSetPriceVisible = false;
          this.$message.error("操作失败");
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .list-box {
    width: 100%;
    list-style: none;
    li {
      width: 200px;
      height: 300px;
      overflow: hidden;
      display: inline-block;
      margin: 10px 15px;
      border: 1px solid #d7d7d7;
      cursor: pointer;
      position: relative;
      font-size: 12px;
      .checkbox {
        position: absolute;
        left: 0;
        top: 0;
        width: 20px;
        height: 20px;
        /deep/ .el-checkbox__input {
          width: 100%;
          height: 100%;
          display: inline-block;
          .el-checkbox__inner {
            width: 100%;
            height: 100%;
            display: inline-block;
            &::after {
              height: 10px;
              left: 6px;
              width: 5px;
            }
          }
        }
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
      .num {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        padding: 0 5px;
      }
    }
  }
  .upload-demo {
    text-align: center;
  }
</style>