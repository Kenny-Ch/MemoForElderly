// miniprogram/pages/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appId: "wx8abaf00ee8c3202e",
    extraData: {
      // 把1221数字换成你的产品ID，否则会跳到别的产品
      id: "314443",
      // 自定义参数，具体参考文档
      customData: {
        clientInfo: ' iPhone OS 10.3.1 / 3.2.0.43 / 0 ',
        imei: ' 7280BECE2FC29544172A2B858E9E90D0 '
      }
    },
    sub: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  jumpkefu:function(e){
    this.setData({
      sub: true,
    })
  },
  cancel:function(e){
    this.setData({
      sub: false,
    })
  },
  jumpReminder:function(e){
    wx.navigateTo({
      url: '../regReminder/regReminder',
    })
  },
  jumpBinding:function(e){
    wx.navigateTo({
      url: '../kinshipBinding/kinshipBinding',
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