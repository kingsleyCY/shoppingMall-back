<template>
  <div>
    <el-button size="mini" @click="addClassifyMethods(0)">添加一级分类</el-button>
    <el-button size="mini" @click="getClassifyList">刷新</el-button>
    <el-tree :data="treeData" :props="defaultProps" :expand-on-click-node="false" :default-expand-all="true">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span class="left">
          <div class="img">
            <img :src="data.logo || 'http://lioncc.oss-cn-beijing.aliyuncs.com/shop/config/1.png'" v-image>
          </div>
          <span class="text">{{ data.title }}</span>
        </span>
        <span class="right">
          <el-button
            v-if="data.id !== '-1'"
            type="text"
            size="mini" @click="addClassifyMethods(data.id)">
            添加子节点
          </el-button>
          <el-button
            type="text"
            size="mini" @click="editLogo(data)">
            修改logo
          </el-button>
          <el-button
            v-if="data.id !== '-1'"
            type="text"
            size="mini" @click="editClassifyMethods(data)">
            编辑
          </el-button>
          <el-button
            v-if="data.id !== '-1'"
            type="text"
            size="mini" @click="deleteClassifyMethods(data.id)">
            删除
          </el-button>
        </span>
      </span>
    </el-tree>

    <el-dialog
      :title="isAdd?'添加':'编辑'"
      :visible.sync="dialogVisible"
      width="600px"
      :before-close="handleClose">
      <div>
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="分类名称">
            <el-input v-model="form.input" @keyup.enter.native="submitClassify" placeholder="请输入分类名称"></el-input>
          </el-form-item>
          <el-form-item label="排序">
            <el-input v-model="form.sort" @keyup.enter.native="submitClassify" placeholder="请输入排序"
                      type="number"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitClassify">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="图片剪裁"
      :visible.sync="dialogVisible1"
      width="800px" :before-close="beforeClose">
      <div v-show="partIndex == 1" class="step-one">
        <div class="base-content">
          <i class="el-icon-upload"></i>
          <p>点击上传图片</p>
        </div>
        <input ref="fileInputs" type="file" class="upload-file-btn" @change="uploadImg($event,1)">
      </div>
      <div v-show="partIndex == 2">
        <VueCropper
          ref="croppers" :img="option.img" :output-size="option.size" :output-type="option.outputType"
          :info="true" :full="option.full" :can-move="option.canMove" :can-move-box="option.canMoveBox"
          :fixed-box="option.fixedBox" :original="option.original" :auto-crop="option.autoCrop"
          :auto-crop-width="option.autoCropWidth" :auto-crop-height="option.autoCropHeight"
          :center-box="option.centerBox" :high="option.high"></VueCropper>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="beforeClose">取 消</el-button>
        <el-button v-show="partIndex == 2" type="primary" @click="submitUploadFile">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getClassifyList, addClassify, editClassify, deleteClassify } from '@/api/request'

  const OSS = require('ali-oss');

  export default {
    name: "classify",
    data() {
      return {
        treeData: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        dialogVisible: false,
        dialogVisible1: false,
        isAdd: true,
        form: {
          input: "",
          sort: "",
        },
        rowData: null,
        parentId: "0",
        partIndex: 1,
        option: {
          img: '',
          size: 1,
          full: false,
          outputType: 'png',
          canMove: true,
          fixedBox: true,
          original: false,
          canMoveBox: true,
          autoCrop: true,
          // 只有自动截图开启 宽度高度才生效
          autoCropWidth: 150,
          autoCropHeight: 150,
          centerBox: true,
          high: true
        },
        logoImg: "",
        fileName: "",
      }
    },
    created() {
      this.client = new OSS({
        region: "oss-cn-beijing",
        accessKeyId: "LTAItgsu4ay1NGxG",
        accessKeySecret: "jghqG85XZnvMs0u2vvgejo7DLuGV2b",
        // stsToken: oss_obj.SecurityToken,
        bucket: "lioncc",
      });
    },
    mounted() {
      this.getClassifyList()
    },
    methods: {
      handleClose() {
        this.input = "";
        this.rowData = null
        this.dialogVisible = false;
      },
      addClassifyMethods(id) {
        this.dialogVisible = true;
        this.isAdd = true;
        this.parentId = id;
        this.form.input = "";
        this.form.sort = "";
      },
      editLogo(data) {
        this.rowData = data;
        this.dialogVisible1 = true;
      },
      beforeClose() {
        this.option.img = null
        this.$refs.fileInputs.value = ""
        this.dialogVisible1 = false
        this.partIndex = 1
      },
      editClassifyMethods(data) {
        this.dialogVisible = true;
        this.isAdd = false;
        this.form.input = data.title;
        this.form.sort = data.sort;
        this.rowData = data;
      },
      deleteClassifyMethods(id) {
        this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteClassify({id}).then(res => {
            if (res.code === 1) {
              this.$message.success("删除成功")
              this.getClassifyList()
            } else {
              this.$message.error(res.mess)
            }
          })
        })
      },
      submitClassify() {
        if (!this.form.input) {
          this.$message.info("不能为空")
          return
        }
        if (this.isAdd) {
          addClassify({
            title: this.form.input,
            parentId: this.parentId,
            sort: this.form.sort,
          }).then(res => {
            if (res.code === 1) {
              this.handleClose()
              this.$message.success("添加成功")
              this.getClassifyList()
            } else {
              this.$message.error(res.mess)
            }
          })
        } else {
          editClassify({
            title: this.form.input,
            id: this.rowData.id,
            sort: this.form.sort,
          }).then(res => {
            if (res.code === 1) {
              this.handleClose()
              this.$message.success("修改成功")
              this.getClassifyList()
            } else {
              this.$message.error(res.mess)
            }
          })
        }
      },
      getClassifyList() {
        getClassifyList().then(res => {
          this.treeData = res.data
        })
      },
      uploadImg(e, num) {
        var that = this;
        //上传图片
        var file = e.target.files[0]
        that.fileName = file.name;
        if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
          alert('图片类型必须是.gif,jpeg,jpg,png,bmp中的一种')
          return false
        }
        var reader = new FileReader();
        reader.onload = (e) => {
          let data;
          if (typeof e.target.result === 'object') {
            // 把Array Buffer转化为blob 如果是base64不需要
            data = window.URL.createObjectURL(new Blob([e.target.result]))
          } else {
            data = e.target.result
          }
          that.partIndex = 2
          that.option.img = data
        }
        // 转化为base64
        reader.readAsDataURL(file)
        // 转化为blob
        /*reader.readAsArrayBuffer(file);*/
      },
      submitUploadFile() {
        var that = this
        this.$refs.croppers.getCropData(async (data) => {
          const base64File = data.replace(/^data:\w+\/\w+;base64,/, "");
          var file_re = new OSS.Buffer(base64File, "base64")
          var store = 'shop/classify/' + (Date.parse(new Date()) / 1000) + '-' + that.fileName
          that.client.put(store, file_re).then(res => {
            that.logoImg = res.url
            editClassify({
              logo: that.logoImg,
              id: that.rowData.id,
            }).then(res => {
              if (res.code === 1) {
                that.beforeClose()
                that.$message.success("修改成功")
                that.getClassifyList()
              } else {
                that.$message.error(res.mess)
              }
            })
          })
        })
      },
    }
  }
</script>

<style scoped lang="scss">
  .vue-cropper {
    height: 500px;
  }
  .el-tree {
    padding-top: 15px;
    /deep/ .el-tree-node__content {
      height: auto !important;
      .custom-tree-node {
        .left {
          .img {
            width: 50px;
            height: 50px;
            vertical-align: middle;
            display: inline-block;
            img {
              display: block;
              width: 100%;
              height: 100%;
            }
          }
          .text {
            display: inline-block;
            width: 150px;
            padding-left: 15px;
          }
        }
        .right {

        }
      }
    }
  }
  .el-dialog {
    .step-one {
      background-color: #ededed;
      position: relative;
      .base-content {
        height: 100%;
        text-align: center;
        i {
          font-size: 60px;
          font-weight: 600;
          padding: 50px 0 45px 0;
        }
        p {
          color: #409EFF;
          font-size: 18px;
        }
      }
      .upload-file-btn {
        cursor: pointer;
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        width: 100%;
        height: 100%;
        opacity: 0;
      }
    }
  }
</style>