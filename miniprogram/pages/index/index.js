//index.js
const app = getApp()
const db = wx.cloud.database()
const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
var util = require('../../utils/util.js');
var date = new Date();
var currentHours = date.getHours();
var currentMinute = date.getMinutes();
Page({
  data: {
    isOld: false,
    isChild: false, //当 isOld 和 isChild 都是fasle时是启动页，当isOld是true时是老人首页
    things: [{
      id: 1,
      title: "这个是备忘事件的标题",
      time: "2021年3月2日 中午12点",
    }, {
      id: 2,
      title: "这个是备忘事件的标题",
      time: "2021年3月2日 中午12点",
    }, {
      id: 3,
      title: "这个是备忘事件的标题",
      time: "2021年3月2日 中午12点",
    }, {
      id: 4,
      title: "这个是备忘事件的标题",
      time: "2021年3月2日 中午12点",
    }],
    say: false,
    is_clock: false,
    restatement: false,
    edit: false,
    startDate: "点击选择提醒时间",
    stdStartDate: '',
    content: "",
    recordAuth: false,
    multiArray: [
      ['今天', '明天', '3-2', '3-3', '3-4', '3-5'],
      [0, 1, 2, 3, 4, 5, 6],
      [0, 10, 20]
    ],
    multiIndex: [0, 0, 0],
    reContent:"去医院取药",
  },

  onLoad: function () {
    let that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //获取用户openid
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('获取openid成功', res.result)
        app.globalData.openid = res.result.openid
        //利用openid获取用户在user的记录
        db.collection('user').where({
          openid: res.result.openid
        }).get({
          success: function (res) {
            if (res.data.length == 0) {
              //新用户，无记录
              wx.hideLoading({})
            } else {
              app.globalData.info = res.data[0]
              switch (res.data[0].identity) {
                case 0:
                  break;
                case 1://老人
                  that.setData({
                    isOld: true
                  })
                  //获取老人的所有备忘
                  wx.cloud.callFunction({
                    name: 'getMemo',
                    data: {
                      openid: app.globalData.openid,
                      type: 0
                    },
                    success: (res) => {
                      console.log('获取备忘成功：', res.result.data, res.result.errMsg)
                      let things = []
                      let data = res.result.data
                      for (var i = 0; i < data.length; i++) {
                        let obj = {
                          title: data[i].content,
                          time: util.formatTime(data[i].time),
                          id: data[i]._id,
                          showAll:false,
                          showMore:false,
                          finish: data[i].finish,
                          recordUrl: data[i].recordUrl
                        }
                        things.push(obj)
                      }
                      that.setData({
                        things: things
                      })
                    },
                    fail: (res) => {
                      console.log('获取备忘失败', res)
                    }
                  })
                  break;
                case 2://子女界面
                  that.setData({
                    isChild: true
                  })
                  wx.navigateTo({
                    url: '../child/my/my',
                  })
                  break;
              }
              wx.hideLoading({})
            }

          },
          fail: console.error
        })

      },
      fail: err => {
        console.error('获取openiid失败', err)
        wx.hideLoading({})
      }
    })
    //检查是否有录音权限
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.record']) {
          this.setData({
            recordAuth: true
          })
        }
      }
    })

    // wx.scanCode({
    //   success (res) {
    //     console.log(res)
    //   },fail: res => {
    //     console.log(res)
    //   }
    // })
  },
  //-------------------更多弹出框--------------------------------------------------
  clickme:function(e){
    let index = e.target.dataset.index
    var things=this.data.things
    things[index].showMore=!things[index].showMore
    this.setData({
      things:things
    })
  },
  jumpRegular:function(e){
    let title = e.target.dataset.title
    wx.navigateTo({
      url: '../oldMan/addReminder/addReminder?title='+title,
    })
  },
  //-------------------------------------------------------------------------------------------------
  showAll:function(e){
    let index = e.target.dataset.index
    var things=this.data.things
    things[index].showAll=true
    this.setData({
      things:things
    })
  },
  hideAPart:function(e){
    let index = e.target.dataset.index
    var things=this.data.things
    things[index].showAll=false
    this.setData({
      things:things
    })
  },
  oldToUse: function (e) {
    let that = this
    if (app.globalData.info) {//一般不可能进入这个分支
      this.setData({
        isOld: ture
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '是否注册为老人，如果点击确定则不可再更改！',
        showCancel: true,
        confirmText: '确定',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.getSetting({
              success: res => {
                if (res.authSetting['scope.userInfo']) {
                  // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                  wx.getUserInfo({
                    success: res => {
                      that.setData({
                        avatarUrl: res.userInfo.avatarUrl,
                        userInfo: res.userInfo,
                        isOld: true
                      })
                      app.globalData.info = {}
                      app.globalData.info.avatarUrl = res.userInfo.avatarUrl
                      console.log(res)
                      //存用户信息到数据库，并添加user记录
                      let userid = (new Date()).getTime().toString() + Math.ceil(Math.random()*10).toString()
                      db.collection('user').add({
                        // data 字段表示需新增的 JSON 数据
                        data: {
                          avatarUrl: res.userInfo.avatarUrl,
                          nickName: res.userInfo.nickName,
                          identity: 1,
                          openid: app.globalData.openid,
                          userid: userid
                        }
                      })
                      .then(res => {
                        console.log('新增用户至user数据库成功！',res)
                        app.globalData.info.nickName = res.userInfo.nickName
                        app.globalData.info.identity = 1
                        app.globalData.info.userid = userid
                      })
                      .catch(console.error)
                    }
                  })
                } else {
                  wx.showModal({
                    title: '提示',
                    confirmText: '去设置',
                    cancelText: '取消',
                    content: '请授权方便您的使用噢~',
                    success: function (res) {
                      if (res.confirm) {
                        wx.openSetting({
                          success: (res) => {
                            if (res.authSetting['scope.userInfo']) {
                              that.setData({
                                avatarUrl: res.userInfo.avatarUrl,
                                userInfo: res.userInfo,
                                isOld: true
                              })
                              app.globalData.info = {}
                              app.globalData.info.avatarUrl = res.userInfo.avatarUrl
                              app.globalData.info.nickName = res.userInfo.nickName
                              console.log(res)
                              //存用户信息到数据库，并添加user记录
                              let userid = (new Date()).getTime().toString() + Math.ceil(Math.random()*10).toString()
                              db.collection('user').add({
                                // data 字段表示需新增的 JSON 数据
                                data: {
                                  avatarUrl: res.userInfo.avatarUrl,
                                  nickName: res.userInfo.nickName,
                                  identity: 1,
                                  openid: app.globalData.openid,
                                  userid: userid
                                }
                              })
                              .then(res => {
                                console.log('新增用户至user数据库成功！',res)
                                app.globalData.info.nickName = res.userInfo.nickName
                                app.globalData.info.identity = 1
                                app.globalData.info.userid = userid
                              })
                              .catch(console.error)
                            } else {
                              //失败了。。。。
                            }
                          }
                        })
                      } else if (res.cancel) {
      
                      }
                    }
                  })
                }
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })          
    }
  },
  jumpMy: function (e) {
    wx.navigateTo({
      url: '../oldMan/my/my',
    })
  },
  childToUse: function (e) {
    let that = this
    if (app.globalData.info) {//一般不可能进入这个分支
      this.setData({
        isChild: ture
      })

    } else {
      wx.showModal({
        title: '提示',
        content: '是否注册为子女，如果点击确定则不可再更改！',
        showCancel: true,
        confirmText: '确定',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            // 获取用户信息
            wx.getSetting({
              success: res => {
                if (res.authSetting['scope.userInfo']) {
                  // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                  wx.getUserInfo({
                    success: res => {
                      that.setData({
                        avatarUrl: res.userInfo.avatarUrl,
                        userInfo: res.userInfo,
                        isChild: true
                      })
                      app.globalData.info = {}
                      app.globalData.info.avatarUrl = res.userInfo.avatarUrl
                      console.log(res)
                      //存用户信息到数据库，并添加user记录
                      let userid = (new Date()).getTime().toString() + Math.ceil(Math.random()*10).toString()
                      db.collection('user').add({
                        // data 字段表示需新增的 JSON 数据
                        data: {
                          avatarUrl: res.userInfo.avatarUrl,
                          nickName: res.userInfo.nickName,
                          identity: 2,
                          openid: app.globalData.openid,
                          userid: userid
                        }
                      })
                      .then(res => {
                        console.log('新增用户至user数据库成功！',res)
                        app.globalData.info.nickName = res.userInfo.nickName
                        app.globalData.info.identity = 2
                        app.globalData.info.userid = userid
                        wx.navigateTo({
                          url: '../child/my/my',
                        })
                      })
                      .catch(console.error)
                    }
                  })
                } else {
                  wx.showModal({
                    title: '提示',
                    confirmText: '去设置',
                    cancelText: '取消',
                    content: '请授权方便您的使用噢~',
                    success: function (res) {
                      if (res.confirm) {
                        wx.openSetting({
                          success: (res) => {
                            if (res.authSetting['scope.userInfo']) {
                              that.setData({
                                avatarUrl: res.userInfo.avatarUrl,
                                userInfo: res.userInfo,
                                isChild: true
                              })
                              app.globalData.info = {}
                              app.globalData.info.avatarUrl = res.userInfo.avatarUrl
                              app.globalData.info.nickName = res.userInfo.nickName
                              console.log(res)
                              //存用户信息到数据库，并添加user记录
                              let userid = (new Date()).getTime().toString() + Math.ceil(Math.random()*10).toString()
                              db.collection('user').add({
                                // data 字段表示需新增的 JSON 数据
                                data: {
                                  avatarUrl: res.userInfo.avatarUrl,
                                  nickName: res.userInfo.nickName,
                                  identity: 2,
                                  openid: app.globalData.openid,
                                  userid: userid
                                }
                              })
                              .then(res => {
                                console.log('新增用户至user数据库成功！',res)
                                app.globalData.info.nickName = res.userInfo.nickName
                                app.globalData.info.identity = 2
                                app.globalData.info.userid = userid
                                wx.navigateTo({
                                  url: '../child/my/my',
                                })
                              })
                              .catch(console.error)
                            } else {
                              //失败了。。。。
                            }
                          }
                        })
                      } else if (res.cancel) {

                      }
                    }
                  })
                }
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })  
    }
  },
  //点击我显示底部弹出框
  user_input: function () {
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
      edit: true,
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
        edit: false
      })
    }.bind(this), 200)
  },
  //数据保存
  saveData: function () {
    let that = this
    let content = this.data.content
    let startDate = this.data.stdStartDate
    this.setData({
      edit: false,
    })
    if (content && startDate) {
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
                time: startDate
              }
            })
            .then(res => {
              console.log('添加文字版备忘成功', res)
              that.setData({
                content: '',
                startDate: '',
                stdStartDate: null
              })
              wx.showToast({
                title: '添加成功！',
                duration: 1000,
                icon: 'success',
                mask: true
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

  //播放备忘
  play: function(e) {
    let url = e.target.dataset.id
    innerAudioContext.src = null
    innerAudioContext.src = url
    innerAudioContext.play()
    innerAudioContext.onError((res)=>{
      wx.showToast({
        title: '播放错误，请稍后再试~',
        duration: 1000,
        icon: 'error',
        mask: true
      })
    })
  },

  //备忘录内容输入实时保存
  bindInputContent: function (e) {
    this.setData({
      content: e.detail.value
    })
  },

  //备忘完成
  finish: function(e) {
    let _id = e.target.dataset.id
    wx.cloud.callFunction({
      name: 'finishMemo',
      data: {
        _id: _id
      },
      success: res => {
        console.log('备忘成功', res.result)

      },
      fail: err => {
        console.error('备忘失败', err)
      }
    })
  },

  //-----------------录音模块---------------------------------------
  handleRecordStart: function (e) {
    let that = this
    if (!this.data.recordAuth) {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.record']) {
            // 已经授权
            that.setData({
              recordAuth: true
            })
          } else {
            wx.authorize({
              scope: "scope.record",
              success: (res) => {
                that.setData({
                  recordAuth: true
                })
              },
              fail: (res) => {
                wx.showModal({
                  title: '提示',
                  confirmText: '去设置',
                  cancelText: '取消',
                  content: '请授权录音权限才能使用该功能噢~',
                  success: function (res) {
                    if (res.confirm) {
                      wx.openSetting({
                        success: (res) => {
                          if (res.authSetting['scope.record']) {
                            that.setData({
                              recordAuth: true
                            })
                          } else {
                            //失败了。。。。
                          }
                        }
                      })
                    } else if (res.cancel) {

                    }
                  }
                })
              }
            })

          }
        }
      })
    } else {
      this.setData({
        is_clock: true, //长按时应设置为true，为可发送状态
        startPoint: e.touches[0], //记录触摸点的坐标信息
      })
      this.setData({
        say: true
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
      recorderManager.onStart((res) => {
        console.log(res)
      })
    }
  },
  handleRecordStop: function (e) {
    var that=this
    if (this.data.recordAuth) {
      recorderManager.stop() //结束录音
      this.setData({
        say: false
      })
      //此时先判断是否需要发送录音
      if (this.data.is_clock == true) {
        var that = this
        //对停止录音进行监控
        recorderManager.onStop((res) => {
          //对录音时长进行判断，少于2s的不进行发送，并做出提示
          if (res.duration < 2000) {
            wx.showToast({
              title: '录音时间太短，请长按录音',
              icon: 'none',
              duration: 1000
            })
          } else {
            //进行语音发送
            console.log(res)
            var tempFilePath = res.tempFilePath;
            wx.showLoading({
              title: '语音检索中',
            })
            let timestamp = util.formatDate(new Date());
            //上传录制的音频
            new Promise(() => {
              let fileID
              wx.cloud.uploadFile({
                cloudPath: "uploadVoices/" + timestamp + '-' + this.randomNum(10000, 99999) + '.mp3',
                filePath: tempFilePath,
                success: function (event) {
                  wx.hideLoading()
                  console.log("上传成功", event)
                  fileID = event.fileID
                },
                fail: function (e) {
                  wx.hideLoading()
                  console.log(e)
                }
              })
              // 语音转文字
              const fs = wx.getFileSystemManager();
              fs.readFile({
                filePath: tempFilePath,
                success(res) {
                  const base64 = wx.arrayBufferToBase64(res.data);
                  var fileSize = res.data.byteLength;
                  wx.cloud.callFunction({
                    name: 'sentenceRecognition',
                    data: {
                      data: base64,
                      dataLen: fileSize
                    },
                    success: res => {
                      console.log('语音转化文字成功:', res.result)
                      let content
                      if(res.result) {
                        content = res.result
                      } else {
                        content = "语音备忘"
                      }
                      that.setData({
                        restatement:true,
                        reContent:content
                      })
                      console.log(content,fileID)


                    },
                    fail: err => {
                      console.error('语音转化失败', err)
                    }
                  })
                }
              })

            })

          }
        })
      }
    }
  },
  cancelRestate:function(e){
    this.setData({
      restatement:false,
    })
  },
  handleTouchMove: function (e) {
    if (this.data.recordAuth) {
      //计算距离，当滑动的垂直距离大于25时，则取消发送语音
      if (Math.abs(e.touches[e.touches.length - 1].clientY - this.data.startPoint.clientY) > 25) {
        wx.showToast({
          title: '录音取消',
          icon: 'none',
          duration: 1000
        })
        this.setData({
          is_clock: false, //设置为不发送语音
          say: false
        })
      }
    }
  },
  start: function (e) {
    this.setData({
      say: true
    })
  },
  end: function (e) {
    this.setData({
      say: false
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
      stdStartDate: choose_time
    })
  },
  //---------------------------------------------------------------------------------



})