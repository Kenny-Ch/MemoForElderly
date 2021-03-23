// miniprogram/pages/oldMan/addReminder/addReminder.js
const app = getApp()
const db = wx.cloud.database()
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

  //保存备忘
  saveData: function() {
    let that = this
    let content = this.data.title
    let frequencyIndex = this.data.frequencyIndex
    let dateIndex = this.data.dateIndex
    let memtionTime = this.data.times    

    if (content && memtionTime.length == 5) {
      //处理
      let weekday = (dateIndex+1)%7
      let regularTime
      if(frequencyIndex == 0) {
        regularTime =  parseInt(memtionTime.slice(0,2))*10000 + parseInt(memtionTime.slice(3,5))*100
      } else if(frequencyIndex == 1) {
        regularTime =  weekday*1000000 + parseInt(memtionTime.slice(0,2))*10000 + parseInt(memtionTime.slice(3,5))*100
      }

      wx.cloud.callFunction({
        name: 'textToVoice',
        data: {
          text: content,
          openid: app.globalData.openid
        },
        success: res => {
          console.log('文字转化语音成功', res.result)
          if(res.result != null) {
            db.collection('memo').add({
              // data 字段表示需新增的 JSON 数据
              data: {
                belong: app.globalData.openid,
                content: content,
                creator: app.globalData.openid,
                finish: 0,
                recordUrl: res.result,
                isRegular: 1,
                finish: 0,
                regularType: frequencyIndex,
                regularTime: regularTime
              }
            })
            .then(res => {
              console.log('添加文字版备忘成功', res)
              that.setData({
                content: '',
              })
              wx.showToast({
                title: '添加成功！',
                duration: 1000,
                icon: 'success',
                mask: true,
                success:()=>{
                  let pages = getCurrentPages(); // 当前页，
                  let prevPage = pages[pages.length - 2]; // 上一页
                  prevPage.setData({
                    freshNow: 1,
                  })

                  wx.navigateBack({
                    delta: 1,
                  })
                }
              })
            })
            .catch(console.error)
          } else {
            console.log('文字转语音失败')
            wx.showToast({
              title: '保持失败！',
              duration: 1000,
              icon: 'error',
              mask: true
            })
          }
          
        },
        fail: err => {
          console.error('文字转语音失败失败', err)
          wx.showToast({
            title: '保持失败！',
            duration: 1000,
            icon: 'error',
            mask: true
          })
        }
      })
      
    } else {
      wx.showToast({
        title: '输入不完整噢！',
        duration: 1000,
        icon: 'error',
        mask: true
      })
    }
  },

  //备忘内容输入更新
  bindTitleInput: function(e){
    this.setData({
      title: e.detail.value
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