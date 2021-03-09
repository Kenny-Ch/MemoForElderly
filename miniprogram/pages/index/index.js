//index.js
const app = getApp()
const recorderManager = wx.getRecorderManager()
var util = require('../../utils/util.js');
var date = new Date();
var currentHours = date.getHours();
var currentMinute = date.getMinutes();
Page({
  data: {
    isOld:false,
    isChild:false,      //当 isOld 和 isChild 都是fasle时是启动页，当isOld是true时是老人首页
    things:[{
     id:1,
     title:"这个是备忘事件的标题",
     time:"2021年3月2日 中午12点",
    },{
      id:2,
      title:"这个是备忘事件的标题",
      time:"2021年3月2日 中午12点",
     },{
      id:3,
      title:"这个是备忘事件的标题",
      time:"2021年3月2日 中午12点",
     },{
      id:4,
      title:"这个是备忘事件的标题",
      time:"2021年3月2日 中午12点",
     }],
     say:false,
     is_clock:false,
     restatement:false,
     edit:false,
     startDate: "选择您的定期提醒时间",
    multiArray: [['今天', '明天', '3-2', '3-3', '3-4', '3-5'], [0, 1, 2, 3, 4, 5, 6], [0, 10, 20]],
    multiIndex: [0, 0, 0],
  },

  onLoad: function() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },
  oldToUse:function(e){
    this.setData({
      isOld:true,
    })
  },
  jumpMy:function(e){
    wx.navigateTo({
      url: '../oldMan/my/my',
    })
  },

  //点击输入按钮
  user_input:function(){
    this.setData({
      edit:true,
    })
  },

  //数据保存
  saveData:function(){
    this.setData({
      edit:false,
    })
  },

  //-----------------录音模块---------------------------------------
  handleRecordStart: function(e) {
    this.setData({
      is_clock:true,//长按时应设置为true，为可发送状态
      startPoint: e.touches[0],//记录触摸点的坐标信息
    })
    this.setData({
      say:true
    })
    //设置录音参数
    const options = {
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    }
    //开始录音
    recorderManager.start(options);
  },
  handleRecordStop:function(e){
    recorderManager.stop()//结束录音
    this.setData({
      say:false
    })
    //此时先判断是否需要发送录音
    if (this.data.is_clock == true) {
      var that = this
		  //对停止录音进行监控
      recorderManager.onStop((res) => {
        //对录音时长进行判断，少于2s的不进行发送，并做出提示
        if(res.duration<2000){
          wx.showToast({
            title: '录音时间太短，请长按录音',
            icon: 'none',
            duration: 1000
          })
        }else{
        //进行语音发送
          console.log(res)
          var tempFilePath = res.tempFilePath;
          wx.showLoading({
            title: '语音检索中',
          })
          let timestamp = util.formatDate(new Date());
          //上传录制的音频
          wx.cloud.uploadFile({
            cloudPath: "uploadVoices/"+timestamp + '-' + this.randomNum(10000, 99999) + '.mp3',
            filePath: tempFilePath,
            success: function(event) {
              wx.hideLoading()
              console.log("上传成功")
            },fail:function(e){
              wx.hideLoading()
              console.log(e)
            }
          })
        }
      })
    }
  },
  handleTouchMove:function(e){
    //计算距离，当滑动的垂直距离大于25时，则取消发送语音
     if (Math.abs(e.touches[e.touches.length - 1].clientY - this.data.startPoint.clientY)>25){
      wx.showToast({
        title: '录音取消',
        icon: 'none',
        duration: 1000
      }) 
      this.setData({
         is_clock: false,//设置为不发送语音
          say:false
       })
     }
   },
  start:function(e){
    this.setData({
      say:true
    })
  },
  end:function(e){
    this.setData({
      say:false
    })
  },
  //生成从minNum到maxNum的随机数
  randomNum(minNum, maxNum) {
    switch (arguments.length) {
      case 1:
        return parseInt(Math.random() * minNum + 1, 10);
        break;
      case 2:
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        break;
      default:
        return 0;
        break;
    }
  },
  //-----------------------------------------------------------------------------------
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

    if (monthDay === "今天") {
      var month = date.getMonth()+1;
      var day = date.getDate();
      monthDay = month + "月" + day + "日";
    } else if (monthDay === "明天") {
      var date1 = new Date(date);
      date1.setDate(date.getDate() + 1);
      monthDay = (date1.getMonth() + 1) + "月" + date1.getDate() + "日";

    } else {
      var month = monthDay.split("-")[0]; // 返回月
      var day = monthDay.split("-")[1]; // 返回日
      monthDay = month + "月" + day + "日";
    }

    var startDate = monthDay + " " + hours + ":" + minute;
    that.setData({
      startDate: startDate
    })
  },
  //---------------------------------------------------------------------------------

  

})
