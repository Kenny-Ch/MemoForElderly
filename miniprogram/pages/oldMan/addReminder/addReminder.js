// miniprogram/pages/oldMan/addReminder/addReminder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    times:"选择您的定期提醒时间",
    frequencyIndex:0,
    frequencyList:['每天一次','每周一次'],
    dateList:['星期一','星期二','星期三','星期四','星期五','星期六','星期天'],
    dateIndex:0,
    isOn:false,
    title:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.title!=undefined){
      this.setData({
        title:options.title
      })
    }
  },
  changeFrequency(e){
    console.log("选择的频率为",this.data.frequencyList[e.detail.value])
    this.setData({ 
      frequencyIndex: e.detail.value
    });
  },
  changeDate(e){
    console.log("选择的日期为",this.data.dateList[e.detail.value])
    this.setData({ 
      dateIndex: e.detail.value
    });
  },
  switchChange(e){
    console.log("该备忘事项需要完成",!this.data.isOn)
    this.setData({
      isOn:!this.data.isOn
    })
  },
  bindTimeChange:function(e){
    console.log("提醒时间：",e.detail.value)
    this.setData({
      times:e.detail.value
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