// miniprogram/pages/oldMan/regReminder/regReminder.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reminders:[
      {
        id:1,
        title:'标题',
        time:'每周三提醒',
        on:false,
      },{
        id:2,
        title:'标题',
        time:'每周三提醒',
        on:true,
      }
    ],
    freshNow: 0
  },
  switchChange:function(e){
    let that = this
    var id=e.currentTarget.dataset.id
    var on=e.currentTarget.dataset.on
    var index=e.currentTarget.dataset.index
    console.log("id为",id,"，提醒状态为：",!on,"，下标为：",index)
    wx.showModal({
      cancelText: '取消',
      confirmText: '确定',
      content: (!on)?"确定开启提醒吗？":"确定关闭提醒吗？",
      showCancel: true,
      title: '提示',
      success: (result) => {
        if(result.confirm) {
          wx.cloud.callFunction({
            name: 'setRegularMemo',
            data: {
              _id: id,
              isOn: !on
            },
            success: res => {
              console.log('设置成功', res.result)
              var list=that.data.reminders
              list[index].on=!on
              that.setData({
                reminders:list
              })
            },
            fail: err => {
              console.error('备忘失败', err)
              wx.showToast({
                title: '设置失败',
                duration: 1000,
                icon: error,
                mask: true,
                success: (res) => {},
                fail: (res) => {},
                complete: (res) => {},
              })
            }
          })
        } else {
          that.setData({
            reminders: that.data.reminders
          })
        }
      },
      fail: (res) => {},
      complete: (res) => {},
    })
    
    
  },
  jumpAdd:function(e){
    wx.navigateTo({
      url: '../addReminder/addReminder?isOld=1',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中~',
    })
    this.getMemoData()
    wx.hideLoading({
      success: (res) => {},
    })
  },

  getMemoData(){
    let that = this
    wx.cloud.callFunction({
      name: 'getMemo',
      data: {
        openid: app.globalData.openid,
        type: 2
      },
      success: res => {
        console.log('备忘成功', res.result)
        let data = res.result.data
        let memos = []
        let dayToStr ={
          "0": "日",
          "1": "一",
          "2": "二",
          "3": "三",
          "4": "四",
          "5": "五",
          "6": "六",
        }
        for(let i=0; i<data.length; i++) {
          let str
          if(data[i].regularType == 0) {
            str = "每天"
            let ttt = data[i].regularTime
            let hour = Math.floor(ttt/10000)
            ttt = ttt-hour*10000
            let minute = Math.floor(ttt/100)
            str = str + (hour<10?"0"+hour.toString():hour.toString()) + ":" + (minute<10?"0"+minute.toString():minute.toString()) + "提醒"
          } else if(data[i].regularType == 1){
            str = "每周"
            let ttt = data[i].regularTime
            let week = Math.floor(ttt/1000000)
            ttt = ttt-week*1000000
            let hour = Math.floor(ttt/10000)
            ttt = ttt-hour*10000
            let minute = Math.floor(ttt/100)
            str = str + dayToStr[week.toString()]+(hour<10?"0"+hour.toString():hour.toString()) + ":" + (minute<10?"0"+minute.toString():minute.toString()) + "提醒"
          }
          let obj = {
            id:data[i]._id,
            title:data[i].content,
            time:str,
            on:data[i].isRegular == 1?true:false
          }
          memos.push(obj)
        }
        that.setData({
          reminders: memos
        })
      },
      fail: err => {
        console.error('备忘失败', err)
      }
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
    if(this.data.freshNow == 1) {
      console.log("刷新")
      wx.showLoading({
        title: '加载中~',
      })
      this.getMemoData()
      wx.hideLoading({
        success: (res) => {},
      })
      this.setData({
        freshNow: 0
      })
    }
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