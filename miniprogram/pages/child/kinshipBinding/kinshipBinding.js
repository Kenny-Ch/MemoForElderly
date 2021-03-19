// miniprogram/pages/child/kinshipBinding/kinshipBinding.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    relationshipIndex:-1,
    relationshipList:['子女','儿媳','女婿','伴侣','其他家属'],
    userid: "",
    relationshipValue: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  changeRelationship(e){
    console.log("选择的关系为",this.data.relationshipList[e.detail.value])
    this.setData({ 
      relationshipIndex: e.detail.value,
      relationshipValue: this.data.relationshipList[e.detail.value]
    });
  },

  //调用扫码相机扫码
  scanQRcode: function(e) {
    let that = this
    wx.scanCode({
      success (res) {
        console.log('扫码结果：',res)
        if(res.result) {
          var regex = /userid:\d{14}/g;
          if(regex.test(res.result)){
            console.log('二维码可识别!')
            let userid = res.result.slice(7)
            that.setData({
              userid: userid
            })
          }else{
            console.log('二维码不可识别')
          }
        }
      },fail: res => {
        console.log(res)
      }
    })
  },

  //绑定关系
  bindRelation:function(e) {
    if(this.data.userid && this.data.relation) {

    }
    db.collection('bindingRelation').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        observed:userid,
        observedIdentity:"",
        observer: app.globalData.info.userid,
        observerIdentity:""
      }
    })
    .then(res => {
      console.log('新增关系至bindingRealtion数据库成功！',res)
      wx.showToast({
        title: '绑定成功！',
        duration: 1000,
        icon: 'success',
        mask: true
      })
    })
    .catch(err =>{
      console.log('绑定失败：',err)
      wx.showToast({
        title: '绑定失败！',
        duration: 1000,
        icon: 'error',
        mask: true
      })
    })
  },

  //
  bindinputchange:function(e){
    this.setData({
      userid: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})