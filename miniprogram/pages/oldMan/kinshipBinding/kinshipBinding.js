// miniprogram/pages/oldMan/kinshipBinding/kinshipBinding.js
import drawQrcode from '../../../utils/weapp.qrcode.esm'
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    QRNum:'',
    family:[
      {
        avarurl:'../../../images/my/testAvarurl.jpg',
        name:'李桂明-儿子',
      },{
        avarurl:'../../../images/my/testAvarurl.jpg',
        name:'李桂明-儿子',
      },{
        avarurl:'../../../images/my/testAvarurl.jpg',
        name:'李桂明-儿子',
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    this.setData({
      QRNum: app.globalData.info.userid
    })
    new Promise(function(resolve,reject){
      wx.getSystemInfo({
      success (res) {
        let widthpx = res.windowWidth
        let width = 474*widthpx/750
        resolve(width)
      }
      })
    }).then((res)=>{
      drawQrcode({
        width: res,
        height: res,
        canvasId: 'myQrcode',
        // ctx: wx.createCanvasContext('myQrcode'),
        text: 'userid:' + app.globalData.info.userid,
        // v1.0.0+版本支持在二维码上绘制图片
        // image: {
        //   imageResource: getApp().globalData.userInfo.avatarUrl,
        //   dx: 70,
        //   dy: 70,
        //   dWidth: 60,
        //   dHeight: 60
        // }
      })
      new Promise(function(resolve, reject) {
        let res = db.collection('bindingRelation').where({
          observed: app.globalData.openid
        }).get()
        resolve(res)
      }).then(res => {
        console.log(res)
        that.setData({
          
        })
      })
    })
    wx.hideLoading({
      success: (res) => {},
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