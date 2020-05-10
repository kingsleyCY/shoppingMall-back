<template>
  <div>
    <p></p>
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm" size="mini">
      <el-form-item label="名称：" prop="title">
        <el-input v-model="ruleForm.title"></el-input>
      </el-form-item>
      <el-form-item label="logo：">
        <div>
          <el-button type="primary" @click="openImgModel('logo')">上传图片</el-button>
        </div>
        <div class="upload-img">
          <img :src="ruleForm.logo" alt="" class="">
          <div class="cover"><i class="el-icon-delete" @click="deleLogo"></i></div>
        </div>
      </el-form-item>
      <el-form-item label="简介：" prop="introduction">
        <el-input type="textarea" v-model="ruleForm.introduction"></el-input>
      </el-form-item>
      <el-form-item label="分类：" prop="classifyId">
        <el-cascader :props="cascaderProps" v-model="ruleForm.classifyId" :options="treeData"></el-cascader>
      </el-form-item>

      <el-form-item label="原价：" prop="originPrice">
        <el-input v-model="ruleForm.originPrice"></el-input>
      </el-form-item>
      <el-form-item label="优惠价：" prop="presentPrice">
        <el-input v-model="ruleForm.presentPrice"></el-input>
      </el-form-item>
      <el-form-item label="实际价格：" prop="overPrice">
        <el-input v-model="ruleForm.overPrice"></el-input>
      </el-form-item>
      <el-form-item label="" prop="overPrice">
        <el-checkbox v-model="ruleForm.isHot">是否热款</el-checkbox>
        <el-checkbox v-model="ruleForm.isExplosive">是否爆款</el-checkbox>
        <el-checkbox v-model="ruleForm.isNews">是否为新品</el-checkbox>
        <el-checkbox v-model="ruleForm.isRebate">是否为折扣款</el-checkbox>
      </el-form-item>
      <el-form-item label="图片合集：">
        <div>
          <el-button type="primary" @click="openImgModel('imgList')">上传图片</el-button>
        </div>
        <div class="upload-img" v-for="(item, index) in ruleForm.imgList" :key="index">
          <img :src="item" alt="" class="">
          <div class="cover"><i class="el-icon-delete" @click="deleimgList(index)"></i></div>
        </div>
      </el-form-item>
      <el-form-item label="尺码：" class="size-box">
        <i class="el-icon-circle-plus-outline" @click="addSize"></i>
        <div v-for="(item, index) in ruleForm.sizeCollet" :key="index">
          尺码：
          <el-input v-model="item[0]" placeholder="请输入尺码" type="number"></el-input>
          数量：
          <el-input v-model="item[1]" placeholder="请输入数量" type="number"></el-input>
          <i class="el-icon-remove-outline" @click="deleteSize(index)"></i>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </el-form-item>
    </el-form>

    <el-dialog
      title="图片剪裁"
      :visible.sync="dialogVisible"
      width="800px" :before-close="beforeClose">
      <div v-show="partIndex == 1" class="step-one">
        <div class="base-content">
          <i class="el-icon-upload"></i>
          <p>点击上传图片</p>
        </div>
        <input ref="fileInput" type="file" class="upload-file-btn" @change="uploadImg($event,1)">
      </div>
      <div v-show="partIndex == 2">
        <VueCropper
          ref="cropper" :img="option.img" :output-size="option.size" :output-type="option.outputType"
          :info="true" :full="option.full" :can-move="option.canMove" :can-move-box="option.canMoveBox"
          :fixed-box="option.fixedBox" :original="option.original" :auto-crop="option.autoCrop"
          :auto-crop-width="option.autoCropWidth" :auto-crop-height="option.autoCropHeight"
          :center-box="option.centerBox" :high="option.high"></VueCropper>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button v-show="partIndex == 2" type="primary" @click="submitUploadFile">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getClassifyList, addCommodity, commodityDetail } from '@/api/request'

  const OSS = require('ali-oss');

  export default {
    name: "addcommidity",
    data() {
      return {
        editId: "",
        editRow: null,
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
          autoCropWidth: 375,
          autoCropHeight: 234,
          centerBox: true,
          high: true
        },
        ruleForm: {
          title: "",
          logo: "",
          introduction: "",
          classifyId: "",
          imgList: [],
          originPrice: "",
          presentPrice: "",
          overPrice: "",
          isHot: "",
          isExplosive: "",
          isNews: "",
          isRebate: "",
          sizeCollet: [[]]
        },
        rules: {
          title: ""
        },
        dialogVisible: false,
        imgFlag: 'logo',
        partIndex: 1,
        fileName: "",
        treeData: [],
        cascaderProps: {
          value: "id",
          label: "title",
        }
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
      this.getClassifyList()
      this.editId = this.$route.query.id
      if (this.editId) {
        commodityDetail(this.editId).then(res => {
          if (res.code === 1) {
            const detail = res.data
            this.editRow = detail
            this.fillForm(detail)
          } else {
            this.$message.error(res.mess)
          }
        })
      }
    },
    methods: {
      getClassifyList() {
        getClassifyList().then(res => {
          this.treeData = res.data
        })
      },
      openImgModel(flag) {
        this.dialogVisible = true
        this.imgFlag = flag
      },
      beforeClose() {
        this.option.img = null
        this.dialogVisible = false
        this.partIndex = 1
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
        this.$refs.cropper.getCropData(async (data) => {
          const base64File = data.replace(/^data:\w+\/\w+;base64,/, "");
          var file_re = new OSS.Buffer(base64File, "base64")
          var store = 'shop/commodity/' + (Date.parse(new Date()) / 1000) + '-' + that.fileName
          that.client.put(store, file_re).then(res => {
            if (that.imgFlag === 'logo') {
              that.ruleForm.logo = res.url
            } else {
              that.ruleForm.imgList.push(res.url)
            }
            that.beforeClose()
          })
        })
      },
      deleLogo() {
        this.ruleForm.logo = ""
      },
      deleimgList(index) {
        this.ruleForm.imgList = this.ruleForm.imgList.splice(index - 1, 1)
      },
      submitForm() {
        if (!this.ruleForm.title || !this.ruleForm.logo || !this.ruleForm.introduction || this.ruleForm.classifyId.length <= 0 || !this.ruleForm.originPrice || !this.ruleForm.presentPrice || !this.ruleForm.overPrice) {
          this.$message.info("未填写完整")
          return
        }
        if (this.ruleForm.sizeCollet.length <= 0) {
          this.$message.info("未填写尺码数据")
          return
        }
        let sizeFlag = false
        let sizeCollet = {}
        for (let i = 0; i < this.ruleForm.sizeCollet.length; i++) {
          let item = this.ruleForm.sizeCollet[i];
          if (!item[0] || !item[1]) {
            sizeFlag = true
            break;
          }
          if (item[1] % 1 !== 0 || item[1] <= 0) {
            sizeFlag = true
            break;
          }
          if (item[0] % 0.5 !== 0 || item[0] <= 0) {
            sizeFlag = true
            break;
          }
          sizeCollet[item[0]] = item[1];
        }
        if (sizeFlag) {
          this.$message.info("尺码数据填写数据有误！")
          return
        }
        var param = JSON.parse(JSON.stringify(this.ruleForm));
        param.classifyId = this.ruleForm.classifyId[this.ruleForm.classifyId.length - 1]
        param.sizeCollet = sizeCollet
        if (this.editId) {
          param.id = this.editId
        }
        addCommodity(param).then(res => {
          if (res.code === 1) {
            this.$message.success(res.mess)
            this.fillForm(res.data)
          } else {
            this.$message.error(res.mess)
          }
        })
      },
      cancel() {
        this.$router.push("/admin/commidity")
      },
      fillForm(detail) {
        this.ruleForm.title = detail.title
        this.ruleForm.logo = detail.logo
        this.ruleForm.classifyId = detail.classifyId.split("-")
        this.ruleForm.introduction = detail.introduction
        this.ruleForm.imgList = detail.imgList
        this.ruleForm.originPrice = detail.originPrice
        this.ruleForm.presentPrice = detail.presentPrice
        this.ruleForm.overPrice = detail.overPrice
        this.ruleForm.isHot = detail.isHot ? true : false
        this.ruleForm.isExplosive = detail.isExplosive ? true : false
        this.ruleForm.isNews = detail.isNews ? true : false
        this.ruleForm.isRebate = detail.isRebate ? true : false
        var sizeCollet = detail.sizeCollet ? detail.sizeCollet : [[]];
        let newsizeCollet = []
        for (var key in sizeCollet) {
          newsizeCollet.push([key, sizeCollet[key]])
        }
        this.ruleForm.sizeCollet = newsizeCollet
      },
      deleteSize(index) {
        if (this.ruleForm.sizeCollet.length <= 1) {
          return
        }
        this.ruleForm.sizeCollet.splice(index, 1)
      },
      addSize() {
        this.ruleForm.sizeCollet.push([])
      }
    }
  }
</script>

<style scoped lang="scss">
  .vue-cropper {
    height: 500px;
  }
  /deep/ .demo-ruleForm {
    width: 600px;
    .upload-img {
      display: inline-block;
      width: 150px;
      height: 92px;
      margin-top: 8px;
      position: relative;
      &:hover {
        .cover {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      .cover {
        width: 100%;
        height: 100%;
        display: none;
        position: absolute;
        left: 0px;
        top: 0;
        background-color: transparent;
        i {
          font-size: 20px;
          cursor: pointer;
          opacity: 1;
        }
      }
      img {
        display: block;
        height: 100%;
      }
    }
    .size-box {
      .el-input {
        width: 100px;
      }
      i {
        font-size: 16px;
        cursor: pointer;
      }
    }
  }
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
</style>