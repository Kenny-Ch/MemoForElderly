// miniprogram/pages/child/my/my.js
var date = new Date();
var currentHours = date.getHours();
var currentMinute = date.getMinutes();
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    familys:[
      {
        relationship:'爸爸',
        taskNum:5,
        finishNum:2,
        name:'李大明',
        portrait:'../../../images/my/touxiang.png',
        reminders:[{
          id:'21212',
          thing:'午饭后吃药',
          time:'2021/3/2 12:00',
          isfinish:true,
        },{
          id:'21212',
          thing:'午饭后吃药',
          time:'2021/3/2 12:00',
          isfinish:false,
        },]
      },{
        relationship:'妈妈',
        taskNum:5,
        finishNum:2,
        name:'李大明',
        portrait:'../../../images/my/touxiang.png',
        reminders:[{
          id:'21212',
          thing:'午饭后吃药',
          time:'2021/3/2 12:00',
          isfinish:true,
        },{
          id:'21212',
          thing:'午饭后吃药',
          time:'2021/3/2 12:00',
          isfinish:false,
        },]
      }
    ],
    person:[],
    startDate: "选择您的定期提醒时间",
    multiArray: [['今天', '明天', '3-2', '3-3', '3-4', '3-5'], [0, 1, 2, 3, 4, 5, 6], [0, 10, 20]],
    multiIndex: [0, 0, 0],
    showModalStatus: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
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
        for(let i=0; i<pre.length; i++) {
          let reminderss = []
          let finishNum = 0
          for(let j=0; j<pre[i].memos.length; j++) {
            if(pre[i].memos[j].finish == 1) finishNum++;
            let o = {
              id: pre[i].memos[j]._id,
              thing: pre[i].memos[j].content,
              time: pre[i].memos[j].time?that.timeToFormat(pre[i].memos[j].time,2):that.timeToFormat(pre[i].memos[j].regularTime,pre[i].memos[j].regularType),
              isfinish: pre[i].memos[j].finish
            }
            reminderss.push(o)
          }
          let obj = {
            relationship: pre[i].observedIdentity,
            taskNum:pre[i].memos.length,
            finishNum:finishNum,
            name: pre[i].observedInfo[0].nickName,
            portrait:pre[i].observedInfo[0].avatarUrl,
            reminders:reminderss
          }
          familyArr.push(obj)
        }
        that.setData({
          familys: familyArr
        })
        if(that.data.familys.length>0){
          var one=[]
          that.setData({
            person:one.concat(that.data.familys[0])
          })
        }
      },
      fail: err => {
        console.error('获取备忘失败', err)
      }
    })
    
    
  },
  //点击我显示底部弹出框
  clickme:function(){
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
  pickerTap:function() {
    date = new Date();
    var monthDay = ['今天','明天'];
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

    if(data.multiIndex[0] === 0) {
      if(data.multiIndex[1] === 0) {
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
  bindMultiPickerColumnChange:function(e) {
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
        if(data.multiIndex[1] === 0) {
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

  loadHoursMinute: function (hours, minute){
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
    var month   //选择的月份
    var day       //选择的日期
    if (monthDay === "今天") {
      month = date.getMonth() + 1;
      day = date.getDate();
      monthDay = month + "月" + day + "日";
    } else if (monthDay === "明天") {
      var date1 = new Date(date);
      date1.setDate(date.getDate() + 1);
      month=date1.getMonth() + 1
      day=date1.getDate()
      monthDay = month + "月" + day + "日";

    } else {
      month = monthDay.split("-")[0]; // 返回月
      day = monthDay.split("-")[1]; // 返回日
      monthDay = month + "月" + day + "日";
    }
    var year=date.getFullYear()
    if(month<date.getMonth()+1)
      year=year+1
    if(month<10)
      month='0'+month
    if(day<10)
      day='0'+day
    if(hours<10)
      hours='0'+hours
    if(minute<10)
      minute='0'+minute
    var reptime=year+'/'+month+'/'+day+' '+hours+':'+minute+':00'
    console.log("日期：",reptime)
    var choose_time=new Date(reptime)        //标准化Date时间
    console.log("日期：",choose_time)
    var startDate = monthDay + " " + hours + ":" + minute;
    that.setData({
      startDate: startDate
    })
  },

  //数据库拿取的时间转换成输出格式字符串
  timeToFormat(time,type) {
    let dayToStr ={
      "0": "日",
      "1": "一",
      "2": "二",
      "3": "三",
      "4": "四",
      "5": "五",
      "6": "六",
    }
    if(type == 0) {
      //regularType = 0 每天类型
      let t = time.toString()
      let hour = t.slice(0,2)
      let minute = t.slice(2,4)
      return "每日" + hour + ":" + minute
    } else if(type == 1){
      //regularType = 1 每周类型
      let t = time.toString()
      let week = t.slice(0,1)
      let hour = t.slice(1,3)
      let minute = t.slice(3,5)
      return "每周" + dayToStr[week] + " " + hour + ":" + minute
    } else if(type == 2) {
      //一次性备忘
      let t = new Date(time)
      return t.getFullYear() + "年" + (t.getMonth()+1) + "月" + t.getDate() + "日 " + (t.getHours()<10?"0"+t.getHours():t.getHours()) + ":" + (t.getMinutes()<10?"0"+t.getMinutes():t.getHours())
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