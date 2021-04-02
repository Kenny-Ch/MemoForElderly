// miniprogram/pages/child/kinshipBinding/kinshipBinding.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    relationshipIndex: -1,
    relationshipList: ['父子', '母子', '父女', '母女'],
    userid: "",
    relationshipValue: "",
    relationshipMap: {
      '父子': {
        observed: '父亲',
        observer: '儿子'
      },
      '母子': {
        observed: '母亲',
        observer: '儿子'
      },
      '父女': {
        observed: '父亲',
        observer: '女儿'
      },
      '母女': {
        observed: '母亲',
        observer: '女儿'
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  changeRelationship(e) {
    console.log("选择的关系为", this.data.relationshipList[e.detail.value])
    this.setData({
      relationshipIndex: e.detail.value,
      relationshipValue: this.data.relationshipList[e.detail.value]
    });
  },

  //调用扫码相机扫码
  scanQRcode: function (e) {
    let that = this
    wx.scanCode({
      success(res) {
        console.log('扫码结果：', res)
        if (res.result) {
          var regex = /userid:\d{14}/g;
          if (regex.test(res.result)) {
            console.log('二维码可识别!')
            let userid = res.result.slice(7)
            that.setData({
              userid: userid
            })
          } else {
            console.log('二维码不可识别')
          }
        }
      },
      fail: res => {
        console.log(res)
      }
    })
  },

  //绑定关系
  bindRelation: function (e) {
    let that = this
    if (this.data.userid && this.data.relationshipValue) {
      console.log(that.data.relationshipMap[that.data.relationshipValue].observed)
      db.collection('user').where({
        userid: that.data.userid
      }).count().then(res => {
        if (res.total == 0) {
          console.log('绑定失败：userid不存在')
          wx.showToast({
            title: '识别码不存在！',
            duration: 1000,
            icon: 'error',
            mask: true
          })
        } else {
          db.collection('bindingRelation').add({
              // data 字段表示需新增的 JSON 数据
              data: {
                observed: that.data.userid,
                observedIdentity: that.data.relationshipMap[that.data.relationshipValue].observed,
                observer: app.globalData.info.userid,
                observerIdentity: that.data.relationshipMap[that.data.relationshipValue].observer
              }
            })
            .then(res => {
              console.log('新增关系至bindingRealtion数据库成功！', res)
              wx.showToast({
                title: '绑定成功！',
                duration: 1000,
                icon: 'success',
                mask: true,
                success: ()=>{
                  let pages = getCurrentPages() // 当前页，
                  let prevPage = pages[pages.length - 2]
                  prevPage.onLoad()
                  wx.navigateBack({
                    delta: 1,
                  })
                }
              })
            })
            .catch(err => {
              console.log('绑定失败：', err)
              wx.showToast({
                title: '绑定失败！',
                duration: 1000,
                icon: 'error',
                mask: true
              })
            })
        }
      })

    } else {
      wx.showToast({
        title: '信息填写不完整！',
        duration: 1000,
        icon: 'error',
        mask: true
      })
    }

  },

  //
  bindinputchange: function (e) {
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