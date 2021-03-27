// miniprogram/pages/child/my/my.js
var date = new Date();
var currentHours = date.getHours();
var currentMinute = date.getMinutes();
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    familys: [{
      relationship: '爸爸',
      taskNum: 5,
      finishNum: 2,
      name: '李大明',
      portrait: '../../../images/my/touxiang.png',
      reminders: [{
        id: '21212',
        thing: '午饭后吃药',
        time: '2021/3/2 12:00',
        isfinish: true,
      }, {
        id: '21212',
        thing: '午饭后吃药',
        time: '2021/3/2 12:00',
        isfinish: false,
      }, ]
    }, {
      relationship: '妈妈',
      taskNum: 5,
      finishNum: 2,
      name: '李大明',
      portrait: '../../../images/my/touxiang.png',
      reminders: [{
        id: '21212',
        thing: '午饭后吃药',
        time: '2021/3/2 12:00',
        isfinish: true,
      }, {
        id: '21212',
        thing: '午饭后吃药',
        time: '2021/3/2 12:00',
        isfinish: false,
      }, ]
    }],
    person: [],
    startDate: "选择您的定期提醒时间",
    multiArray: [
      ['今天', '明天', '3-2', '3-3', '3-4', '3-5'],
      [0, 1, 2, 3, 4, 5, 6],
      [0, 10, 20]
    ],
    multiIndex: [0, 0, 0],
    showModalStatus: false,
    content: "",
    stime: null,
    freshNow: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMemoData()
  },

  //获取备忘并设置的封装
  getMemoData:function() {
    var that = this
    wx.cloud.callFunction({
      name: 'getMemo',
      data: {
        type: 1,
        userid: app.globalData.info.userid
      },
      success: res => {
        console.log('获取备忘成功', res.result)
        let familyArr = []
        let pre = res.result
        for (let i = 0; i < pre.length; i++) {
          let reminderss = []
          let finishNum = 0
          for (let j = 0; j < pre[i].memos.length; j++) {
            if (pre[i].memos[j].finish == 1) finishNum++;
            let o = {
              id: pre[i].memos[j]._id,
              thing: pre[i].memos[j].content,
              time: pre[i].memos[j].time ? that.timeToFormat(pre[i].memos[j].time, 2) : that.timeToFormat(pre[i].memos[j].regularTime, pre[i].memos[j].regularType),
              isfinish: pre[i].memos[j].finish == 1 ? true:false
            }
            reminderss.push(o)
          }
          let obj = {
            relationship: pre[i].observedIdentity,
            taskNum: pre[i].memos.length,
            finishNum: finishNum,
            name: pre[i].observedInfo[0].nickName,
            portrait: pre[i].observedInfo[0].avatarUrl,
            reminders: reminderss,
            openid: pre[i].observedInfo[0].openid
          }
          familyArr.push(obj)
        }
        that.setData({
          familys: familyArr
        })
        if (that.data.familys.length > 0) {
          var one = []
          that.setData({
            person: one.concat(that.data.familys[0])
          })
        }
      },
      fail: err => {
        console.error('获取备忘失败', err)
      }
    })
  },

  //添加备忘
  oldToUse: function (e) {
    wx.showLoading({
      title: '保存中~',
    })
    let that = this
    let iindex = e.target.dataset.index
    let content = this.data.content
    let openid = e.target.dataset.openid
    let time = this.data.stime
    let startTime = this.timeToFormat(time, 2)

    if (content && time) { //文字备忘
      wx.cloud.callFunction({
        name: 'textToVoice',
        data: {
          text: content,
          openid: openid
        },
        success: res => {
          console.log('文字转化语音成功', res.result)
          if (res.result != null) {
            let recordurl = res.result
            wx.hideLoading({
              success: (res) => {},
            })
            wx.showModal({
              confirmText: '我已明白',
              content: '请您允许消息推送，以便我们给您定期推送备忘信息，如您取消则会收不到我们的定期提醒！',
              title: '提示',
              showCancel: false,
              success: (result) => {
                wx.requestSubscribeMessage({
                  tmplIds: ['GnLGROy6j9ElGm0FNzXnF4k_0zZy1kWYHuwMJ2iez6s'],
                  //success: (res)=> { console.log(res)}
                  success: (res) => {
                    let r = res['GnLGROy6j9ElGm0FNzXnF4k_0zZy1kWYHuwMJ2iez6s']
                    db.collection('memo').add({
                        // data 字段表示需新增的 JSON 数据
                        data: {
                          belong: openid,
                          content: content,
                          creator: app.globalData.openid,
                          finish: 0,
                          recordUrl: recordurl,
                          time: time,
                          isRegular: 0
                        }
                      })
                      .then(res => {
                        console.log('添加文字版备忘成功', res)
                        let arr = that.data.familys[iindex].reminders
                        let _id = res._id
                        arr.push({
                          id: res._id,
                          thing: content,
                          time: startTime,
                          isfinish: false
                        })
                        let obj = {
                          relationship: that.data.familys[iindex].relationship,
                          taskNum: that.data.familys[iindex].taskNum,
                          finishNum: that.data.familys[iindex].finishNum,
                          name: that.data.familys[iindex].name,
                          portrait: that.data.familys[iindex].portrait,
                          reminders: arr,
                          openid: that.data.familys[iindex].openid
                        }
                        let familyy = that.data.familys
                        familyy[iindex] = obj
                        let personn = that.data.person
                        personn[0] = obj
                        that.setData({
                          content: "",
                          startDate: '选择您的定期提醒时间',
                          stime: null,
                          familys: familyy,
                          person: personn
                        })
                        if (r == 'reject') {
                          db.collection('memo').where({
                            _id:_id
                          }).update({
                            data:{
                              accept:false
                            }
                          })
                          wx.showModal({
                            confirmText: '确认',
                            content: '保存成功！但您可能无法收到我们的备忘通知！',
                            showCancel: false,
                            title: '提示',
                            success: (result) => {},
                            fail: (res) => {},
                            complete: (res) => {},
                          })
                        } else if (r == 'ban') {
                          db.collection('memo').where({
                            _id:_id
                          }).update({
                            data:{
                              accept:false
                            }
                          })
                          wx.showToast({
                            title: '保存成功！但消息推送设置出错！',
                            duration: 1000,
                            icon: 'error',
                            mask: true
                          })
                        } else if (r == 'accept') {
                          db.collection('memo').where({
                            _id:_id
                          }).update({
                            data:{
                              accept:true
                            }
                          })
                          wx.showToast({
                            title: '保存成功！',
                            duration: 1000,
                            icon: 'success',
                            mask: true
                          })
                        }
                      })
                      .catch(console.error)


                  }
                })
              },
              fail: (res) => {},
              complete: (res) => {},
            })

          } else {
            console.log('文字转语音失败')
            wx.hideLoading({
              success: (res) => {},
            })
            wx.showToast({
              title: '添加失败！',
              duration: 1000,
              icon: 'error',
              mask: true
            })
          }

        },
        fail: err => {
          console.error('文字转语音失败失败', err)
          wx.hideLoading({
            success: (res) => {},
          })
          wx.showToast({
            title: '添加失败！',
            duration: 1000,
            icon: 'error',
            mask: true
          })
        }
      })
    } else {
      wx.hideLoading({
        success: (res) => {},
      })
      wx.showToast({
        title: '输入不完整噢！',
        duration: 1000,
        icon: 'error',
        mask: true
      })
    }
  },

  //content内容
  bindinputchange: function (e) {
    let val = e.detail.value
    this.setData({
      content: val
    })
  },

  jumpReminder: function (e) {
    wx.navigateTo({
      url: '../../oldMan/addReminder/addReminder?belongOpenid='+e.target.dataset.openid,
    })
  },

  //点击我显示底部弹出框
  clickme: function () {
    this.showModal();
  },
  //显示对话框
  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  //隐藏对话框
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  //-----------------时间选择器---------------------------------------------------------
  pickerTap: function () {
    date = new Date();
    var monthDay = ['今天', '明天'];
    var hours = [];
    var minute = [];
    currentHours = date.getHours();
    currentMinute = date.getMinutes();
    // 月-日
    for (var i = 2; i <= 28; i++) {
      var date1 = new Date(date);
      date1.setDate(date.getDate() + i);
      var md = (date1.getMonth() + 1) + "-" + date1.getDate();
      monthDay.push(md);
    }

    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };

    if (data.multiIndex[0] === 0) {
      if (data.multiIndex[1] === 0) {
        this.loadData(hours, minute);
      } else {
        this.loadMinute(hours, minute);
      }
    } else {
      this.loadHoursMinute(hours, minute);
    }
    data.multiArray[0] = monthDay;
    data.multiArray[1] = hours;
    data.multiArray[2] = minute;
    this.setData(data);
  },
  bindMultiPickerColumnChange: function (e) {
    date = new Date();
    var that = this;
    var monthDay = ['今天', '明天'];
    var hours = [];
    var minute = [];
    currentHours = date.getHours();
    currentMinute = date.getMinutes();
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    // 把选择的对应值赋值给 multiIndex
    data.multiIndex[e.detail.column] = e.detail.value;
    // 然后再判断当前改变的是哪一列,如果是第1列改变
    if (e.detail.column === 0) {
      // 如果第一列滚动到第一行
      if (e.detail.value === 0) {

        that.loadData(hours, minute);

      } else {
        that.loadHoursMinute(hours, minute);
      }
      data.multiIndex[1] = 0;
      data.multiIndex[2] = 0;
      // 如果是第2列改变
    } else if (e.detail.column === 1) {
      // 如果第一列为今天
      if (data.multiIndex[0] === 0) {
        if (e.detail.value === 0) {
          that.loadData(hours, minute);
        } else {
          that.loadMinute(hours, minute);
        }
        // 第一列不为今天
      } else {
        that.loadHoursMinute(hours, minute);
      }
      data.multiIndex[2] = 0;

      // 如果是第3列改变
    } else {
      // 如果第一列为'今天'
      if (data.multiIndex[0] === 0) {

        // 如果第一列为 '今天'并且第二列为当前时间
        if (data.multiIndex[1] === 0) {
          that.loadData(hours, minute);
        } else {
          that.loadMinute(hours, minute);
        }
      } else {
        that.loadHoursMinute(hours, minute);
      }
    }
    data.multiArray[1] = hours;
    data.multiArray[2] = minute;
    this.setData(data);
  },

  loadData: function (hours, minute) {

    var minuteIndex;
    if (currentMinute > 0 && currentMinute <= 10) {
      minuteIndex = 10;
    } else if (currentMinute > 10 && currentMinute <= 20) {
      minuteIndex = 20;
    } else if (currentMinute > 20 && currentMinute <= 30) {
      minuteIndex = 30;
    } else if (currentMinute > 30 && currentMinute <= 40) {
      minuteIndex = 40;
    } else if (currentMinute > 40 && currentMinute <= 50) {
      minuteIndex = 50;
    } else {
      minuteIndex = 60;
    }

    if (minuteIndex == 60) {
      // 时
      for (var i = currentHours + 1; i < 24; i++) {
        hours.push(i);
      }
      // 分
      for (var i = 0; i < 60; i += 10) {
        minute.push(i);
      }
    } else {
      // 时
      for (var i = currentHours; i < 24; i++) {
        hours.push(i);
      }
      // 分
      for (var i = minuteIndex; i < 60; i += 10) {
        minute.push(i);
      }
    }
  },

  loadHoursMinute: function (hours, minute) {
    // 时
    for (var i = 0; i < 24; i++) {
      hours.push(i);
    }
    // 分
    for (var i = 0; i < 60; i += 10) {
      minute.push(i);
    }
  },

  loadMinute: function (hours, minute) {
    var minuteIndex;
    if (currentMinute > 0 && currentMinute <= 10) {
      minuteIndex = 10;
    } else if (currentMinute > 10 && currentMinute <= 20) {
      minuteIndex = 20;
    } else if (currentMinute > 20 && currentMinute <= 30) {
      minuteIndex = 30;
    } else if (currentMinute > 30 && currentMinute <= 40) {
      minuteIndex = 40;
    } else if (currentMinute > 40 && currentMinute <= 50) {
      minuteIndex = 50;
    } else {
      minuteIndex = 60;
    }

    if (minuteIndex == 60) {
      // 时
      for (var i = currentHours + 1; i < 24; i++) {
        hours.push(i);
      }
    } else {
      // 时
      for (var i = currentHours; i < 24; i++) {
        hours.push(i);
      }
    }
    // 分
    for (var i = 0; i < 60; i += 10) {
      minute.push(i);
    }
  },

  bindStartMultiPickerChange: function (e) {
    var that = this;
    var monthDay = that.data.multiArray[0][e.detail.value[0]];
    var hours = that.data.multiArray[1][e.detail.value[1]];
    var minute = that.data.multiArray[2][e.detail.value[2]];
    var month //选择的月份
    var day //选择的日期
    if (monthDay === "今天") {
      month = date.getMonth() + 1;
      day = date.getDate();
      monthDay = month + "月" + day + "日";
    } else if (monthDay === "明天") {
      var date1 = new Date(date);
      date1.setDate(date.getDate() + 1);
      month = date1.getMonth() + 1
      day = date1.getDate()
      monthDay = month + "月" + day + "日";

    } else {
      month = monthDay.split("-")[0]; // 返回月
      day = monthDay.split("-")[1]; // 返回日
      monthDay = month + "月" + day + "日";
    }
    var year = date.getFullYear()
    if (month < date.getMonth() + 1)
      year = year + 1
    if (month < 10)
      month = '0' + month
    if (day < 10)
      day = '0' + day
    if (hours < 10)
      hours = '0' + hours
    if (minute < 10)
      minute = '0' + minute
    var reptime = year + '/' + month + '/' + day + ' ' + hours + ':' + minute + ':00'
    console.log("日期：", reptime)
    var choose_time = new Date(reptime) //标准化Date时间
    console.log("日期：", choose_time)
    var startDate = monthDay + " " + hours + ":" + minute;
    that.setData({
      startDate: startDate,
      stime: choose_time
    })
  },

  //数据库拿取的时间转换成输出格式字符串
  timeToFormat(time, type) {
    let dayToStr = {
      "0": "日",
      "1": "一",
      "2": "二",
      "3": "三",
      "4": "四",
      "5": "五",
      "6": "六",
    }
    let str
    if (type == 0) {
      str = "每天"
      let ttt = time
      let hour = Math.floor(ttt / 10000)
      ttt = ttt - hour * 10000
      let minute = Math.floor(ttt / 100)
      str = str + (hour < 10 ? "0" + hour.toString() : hour.toString()) + ":" + (minute < 10 ? "0" + minute.toString() : minute.toString())
      return str
    } else if (type == 1) {
      str = "每周"
      let ttt = time
      let week = Math.floor(ttt / 1000000)
      ttt = ttt - week * 1000000
      let hour = Math.floor(ttt / 10000)
      ttt = ttt - hour * 10000
      let minute = Math.floor(ttt / 100)
      str = str + dayToStr[week.toString()] + (hour < 10 ? "0" + hour.toString() : hour.toString()) + ":" + (minute < 10 ? "0" + minute.toString() : minute.toString())
      return str
    } else if (type == 2) {
      //一次性备忘
      let t = new Date(time)
      return t.getFullYear() + "年" + (t.getMonth() + 1) + "月" + t.getDate() + "日 " + (t.getHours() < 10 ? "0" + t.getHours() : t.getHours()) + ":" + (t.getMinutes() < 10 ? "0" + t.getMinutes() : t.getMinutes())
    }
  },
  //---------------------------------------------------------------------------------
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