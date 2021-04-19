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
      // {
      //   avarurl:'../../../images/my/testAvarurl.jpg',
      //   name:'李桂明-儿子',
      // },{
      //   avarurl:'../../../images/my/testAvarurl.jpg',
      //   name:'李桂明-儿子',
      // },{
      //   avarurl:'../../../images/my/testAvarurl.jpg',
      //   name:'李桂明-儿子',
      // }
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
        wx.cloud.callFunction({
          name: 'getBindList',
          data: {
            userid: app.globalData.info.userid,
            type: 0
          },
          success: res => {
            console.log('获取绑定用户列表成功', res)
            resolve(res.result.list)
          },
          fail: err => {
            console.error('备忘失败', err)
          }
        })
      }).then(res => {
        let family = []
        for(let i=0; i<res.length; i++) {
          let map = {}
          map.avarurl = res[0].observerInfo[0].avatarUrl,
          map.name = res[0].observerInfo[0].nickName + " - " + res[0].observerIdentity
          map.userid = res[0].observerInfo[0].userid
          family.push(map)
        }
        that.setData({
          family: family
        })
      })
    })
    wx.hideLoading({
      success: (res) => {},
    })
  },

  //取消关系
  cancleBinding: function(e) {
    let that = this
    let userid = e.target.dataset.userid
    let index = e.target.dataset.index
    wx.showModal({
      cancelText: '取消',
      confirmText: '确定',
      content: '您确定要接触关系嘛？所有Ta给您设置的备忘也将会清空！',
      showCancel: true,
      title: '提示',
      success: (result) => {
        if(result.confirm) {
          wx.cloud.callFunction({
            name: 'cancelBinding',
            data: {
              observer: userid,
              observed: app.globalData.info.userid
            },
            success: res => {
              console.log('取消绑定成功', res)
              let family = []
              family = family.concat(that.data.family.slice(0,index))
              if(index != that.data.family.length-1) {
                family = family.concat(that.data.family.slice(index+1))
              }
              that.setData({
                family: family
              })
              
              wx.showToast({
                title: '取消绑定成功！',
                duration: 1000,
                icon: 'success',
                mask: true,
                success: (res) => {},
                fail: (res) => {},
                complete: (res) => {},
              })
            },
            fail: err => {
              wx.showToast({
                title: '取消绑定失败！',
                duration: 1000,
                icon: 'error',
                mask: true,
                success: (res) => {},
                fail: (res) => {},
                complete: (res) => {},
              })
              console.error('取消绑定失败', err)
            }
          })
        }
      },
      fail: (res) => {},
      complete: (res) => {},
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