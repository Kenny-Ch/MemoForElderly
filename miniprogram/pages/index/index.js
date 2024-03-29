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
    things: [
    //   {
    //   id: 1,
    //   title: "这个是备忘事件的标题",
    //   time: "2021年3月2日 中午12点",
    // }, {
    //   id: 2,
    //   title: "这个是备忘事件的标题",
    //   time: "2021年3月2日 中午12点",
    // }, {
    //   id: 3,
    //   title: "这个是备忘事件的标题",
    //   time: "2021年3月2日 中午12点",
    // }, {
    //   id: 4,
    //   title: "这个是备忘事件的标题",
    //   time: "2021年3月2日 中午12点",
    // }
  ],
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
    reContent: "去医院取药",
    vioceTempFilePath: "", //生产录音时产生的临时路径，用于上传云存储
    detailed:false,
    detail_content:'去xxx医院的几号窗口去取药',
  },

  close:function(e){
    this.setData({
      detailed:false
    })
  },

  onLoad: function (param) {
    let that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //如果是消息订阅进入，需要进行一些设置
    if(param.jump) {
      let url = param.url;
      let content = param.content;
      let _id = param.id
      let time = param.time
      let finish = param.finish
      let isRegular = param.isRegular

      this.setData({
        detailed: true,
        detail_content: content,
        detail_url: url,
        detail_id: _id,
        detail_time: time,
        detail_finish: finish,
        detail_isRegular: isRegular
      })

    }
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
                case 1: //老人
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
                        let time
                        if (data[i].time) {
                          time = util.formatTime(data[i].time)
                        } else {
                          let dayToStr ={
                            "0": "日",
                            "1": "一",
                            "2": "二",
                            "3": "三",
                            "4": "四",
                            "5": "五",
                            "6": "六",
                          }
                          let str
                          if (data[i].regularType == 0) {
                            str = "每天"
                            let ttt = data[i].regularTime
                            let hour = Math.floor(ttt / 10000)
                            ttt = ttt - hour * 10000
                            let minute = Math.floor(ttt / 100)
                            str = str + (hour < 10 ? "0" + hour.toString() : hour.toString()) + ":" + (minute < 10 ? "0" + minute.toString() : minute.toString())
                          } else if (data[i].regularType == 1) {
                            str = "每周"
                            let ttt = data[i].regularTime
                            let week = Math.floor(ttt / 1000000)
                            ttt = ttt - week * 1000000
                            let hour = Math.floor(ttt / 10000)
                            ttt = ttt - hour * 10000
                            let minute = Math.floor(ttt / 100)
                            str = str + dayToStr[week.toString()] + (hour < 10 ? "0" + hour.toString() : hour.toString()) + ":" + (minute < 10 ? "0" + minute.toString() : minute.toString())
                          }
                          time = str
                        }
                        let obj = {
                          title: data[i].content,
                          time: time,
                          id: data[i]._id,
                          showAll: false,
                          isRegular:data[i].isRegular,
                          _leftTxt: '0rpx',
                          scrollFlag: false,
                          finish: data[i].finish,
                          height: 90,
                          recordUrl: data[i].recordUrl,
                          belong: data[i].belong,
                          creator: data[i].creator
                        }
                        things.push(obj)
                        //弹窗进入判断是否有完成
                        if(param.jump && data[i]._id == param.id){
                          that.setData({
                            detail_finish: data[i].finish
                          })
                        }
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
                case 2: //子女界面
                  that.setData({
                    isChild: true
                  })
                  wx.redirectTo({
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
  },

  //新人授权成功处理用户信息
  setNewUserInfo: function (res, identity) {
    let that = this
    if (identity == 0) {
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
      let userid = (new Date()).getTime().toString() + Math.ceil(Math.random() * 10).toString()
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
          console.log('新增用户至user数据库成功！', res)
          app.globalData.info.nickName = res.userInfo.nickName
          app.globalData.info.identity = 1
          app.globalData.info.userid = userid
        })
        .catch(console.error)
    } else if (identity == 1) {
      that.setData({
        avatarUrl: res.userInfo.avatarUrl,
        userInfo: res.userInfo,
        isChild: true
      })
      app.globalData.info = {}
      app.globalData.info.avatarUrl = res.userInfo.avatarUrl
      app.globalData.info.nickName = res.userInfo.nickName
      var mynickname=res.userInfo.nickName
      console.log(res)
      //存用户信息到数据库，并添加user记录
      let userid = (new Date()).getTime().toString() + Math.ceil(Math.random() * 10).toString()
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
          console.log('新增用户至user数据库成功！', res)
          app.globalData.info.nickName = mynickname
          app.globalData.info.identity = 2
          app.globalData.info.userid = userid
          wx.redirectTo({
            url: '../child/my/my',
          })
        })
        .catch(console.error)
    }
  },

  //播放自己录下的录音
  replayRecord:function(e) {
    let url = this.data.vioceTempFilePath
    console.log("url:",url)
    innerAudioContext.autoplay = true
    innerAudioContext.src = url
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      wx.showToast({
        title: '播放错误，请稍后再试~',
        duration: 2000,
        icon: 'none',
      })
    })
    innerAudioContext.onPause(
      () =>{
        console.log('停止播放')
      }
    )
  },

  //-------------------更多弹出框--------------------------------------------------
  async clickme(e) {
    let index = e.target.dataset.index
    var things = this.data.things
    if (things[index].scrollFlag == false) {
      for (let item in things) {
        if (things[item].scrollFlag == true) {
          things[item]._leftTxt = "0rpx"
          things[item].scrollFlag = false
        }
      }
      things[index]._leftTxt = "-220rpx"
      things[index].scrollFlag = true
      await this.queryHeight(index)
      this.setData({
        things: things
      })
    } else {
      things[index]._leftTxt = "0rpx"
      things[index].scrollFlag = false
      this.setData({
        things: things
      })
    }
    // let index = e.target.dataset.index
    // var things=this.data.things
    // things[index].showMore=!things[index].showMore
    // this.setData({
    //   things:things
    // })
  },
  async queryHeight(index) {
    var query = wx.createSelectorQuery();
    var things = this.data.things
    var that = this
    query.selectAll('#card').boundingClientRect()
    query.exec(function (res) {
      //res就是 所有标签为mjltest的元素的信息 的数组
      //取高度
      things[index].height = res[0][index].height
      that.setData({
        things: things
      })
    })
  },
  jumpRegular: function (e) {
    let title = e.target.dataset.title
    let belong = e.target.dataset.belong
    let openid = e.target.dataset.creator
    let _id =e.target.dataset.id
    let isRegular=e.target.dataset.isregular
    let ttime = e.target.dataset.time
    let time = ttime.substr(ttime.length-5,5)
    let week = null
    let strToDay ={
      "一" : 0,
      "二" : 1,
      "三" : 2,
      "四" : 3,
      "五" : 4,
      "六" : 5,
      "日" : 6,
    }
    if(ttime.substr(0,2) == "每周") {
      week = strToDay[ttime.substr(2,1)]
      console.log(week)
    }
    wx.navigateTo({
      url: '../oldMan/addReminder/addReminder?title=' + title
      + '&regularInfo=1'
      + '&belong=' + belong
      + '&openid=' + openid
      + '&id=' + _id
      + '&isRegular=' + isRegular
      + '&time=' + time
      + (week!=null?("&week="+week):"")
    })
  },
  //-------------------------------------------------------------------------------------------------
  showAll: function (e) {
    let index = e.target.dataset.index
    var things = this.data.things
    things[index].showAll = true
    this.setData({
      things: things
    })
  },
  hideAPart: function (e) {
    let index = e.target.dataset.index
    var things = this.data.things
    things[index].showAll = false
    this.setData({
      things: things
    })
  },
  oldToUse: function (e) {
    console.log(e)
    let that = this
    if (app.globalData.info) { //一般不可能进入这个分支
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
            if (typeof wx.getUserProfile == 'function') {
              console.log('调用getUserProfile')
              wx.getUserProfile({
                desc: '您的信息仅作为个人展示噢',
                success: (res) => {
                  console.log('获取用户信息成功', res)
                  that.setNewUserInfo(res, 0)
                },
                fail: (res) => {
                  console.log('获取用户信息失败', res)
                  wx.showToast({
                    title: '信息授权失败~',
                    duration: 1000,
                    icon: 'error',
                    mask: true
                  })
                }
              })
            } else {
              wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
              })
            }
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
    if (app.globalData.info) { //一般不可能进入这个分支
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
            if (typeof wx.getUserProfile == 'function') {
              wx.getUserProfile({
                desc: '您的信息仅作为个人展示噢',
                success: (res) => {
                  console.log('获取用户信息成功', res)
                  that.setNewUserInfo(res, 1)
                },
                fail: (res) => {
                  console.log('获取用户信息失败', res)
                  wx.showToast({
                    title: '信息授权失败~',
                    duration: 1000,
                    icon: 'error',
                    mask: true
                  })
                }
              })
            } else {
              wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
              })
            }
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
    wx.showLoading({
      title: '保存中~',
    })
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
                        belong: app.globalData.openid,
                        content: content,
                        creator: app.globalData.openid,
                        finish: 0,
                        recordUrl: recordurl,
                        time: startDate,
                        isRegular: 0
                      }
                    })
                    .then(res => {
                      console.log('添加文字版备忘成功', res)
                      let _id = res._id
                      let obj = {
                        title: content,
                        time: util.formatTime(startDate),
                        id: res._id,
                        showAll:false,
                        _leftTxt: '0rpx',
                        scrollFlag: false,
                        finish:0,
                        height:90,
                        recordUrl:recordurl
                      }
                      let things = that.data.things
                      things.push(obj)
                      that.setData({
                        content: '',
                        startDate: '点击选择提醒时间',
                        stdStartDate: null,
                        things: things
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
                          confirmText: '前往设置',
                          content: '保存成功！但您可能无法收到我们的备忘通知！',
                          showCancel: true,
                          title: '提示',
                          success: (result) => {
                            if(result.confirm) {
                            }
                          },
                          fail: (res) => {},
                          complete: (res) => {},
                        })
                        that.setData({
                          restatement:false
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
                        that.setData({
                          restatement:false
                        })
                      } else if(r=='accept') {
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
                        that.setData({
                          restatement:false
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
            wx.hideLoading({
              success: (res) => {},
            })
            console.log('文字转语音失败')
            wx.showToast({
              title: '保存失败！',
              duration: 1000,
              icon: 'error',
              mask: true
            })
          }

        },
        fail: err => {
          wx.hideLoading({
            success: (res) => {},
          })
          console.error('文字转语音失败失败', err)
          wx.showToast({
            title: '保存失败！',
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

  //播放备忘
  play: function (e) {
    let url = e.target.dataset.id
    console.log("url:",url)
    innerAudioContext.autoplay = true
    innerAudioContext.src = url
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      wx.showToast({
        title: '播放错误，请稍后再试~',
        duration: 2000,
        icon: 'none',
      })
    })
    innerAudioContext.onPause(
      () =>{
        console.log('停止播放')
      }
    )
  },

  //文字备忘录内容输入实时保存
  bindInputContent: function (e) {
    this.setData({
      content: e.detail.value
    })
  },

  //语音转文字备忘内容输入实时保存
  bindReContentChange: function (e) {
    this.setData({
      reContent: e.detail.value
    })
  },

  //备忘完成
  finish: function (e) {
    wx.showLoading({
      title: '完成中~',
      mask: true,
      success: (res) => {},
      fail: (res) => {},
      complete: (res) => {},
    })
    let _id = e.target.dataset.id
    let index = e.target.dataset.index
    let that = this
    wx.cloud.callFunction({
      name: 'finishMemo',
      data: {
        _id: _id
      },
      success: res => {
        console.log('备忘成功', res.result)
        if (res.result == 1) {
          let things = that.data.things
          things[index].finish = 1
          that.setData({
            things: things
          })
          wx.hideLoading({
            success: (res) => {},
          })
          wx.showToast({
            title: '完成备忘成功',
            duration: 1000,
            icon: 'success',
            mask: true,
            success: (res) => {},
            fail: (res) => {},
            complete: (res) => {},
          })
        } else {
          wx.hideLoading({
            success: (res) => {},
          })
          wx.showToast({
            title: '完成备忘失败',
            duration: 1000,
            icon: 'error',
            mask: true,
            success: (res) => {},
            fail: (res) => {},
            complete: (res) => {},
          })
        }

      },
      fail: err => {
        wx.hideLoading({
          success: (res) => {},
        })
        console.error('备忘失败', err)
      }
    })
  },

  //完成弹窗备忘
  finishJump: function (e) {
    wx.showLoading({
      title: '完成中~',
      mask: true,
      success: (res) => {},
      fail: (res) => {},
      complete: (res) => {},
    })
    let _id = e.target.dataset.id
    let that = this
    wx.cloud.callFunction({
      name: 'finishMemo',
      data: {
        _id: _id
      },
      success: res => {
        console.log('备忘成功', res.result)
        if (res.result == 1) {
          let things = that.data.things
          for(let i=0; i<things.length; i++){
            if(things[i].id == _id)
              things[i].finish = 1
          }
          that.setData({
            detail_finish: 1,
            things: things
          })
          wx.hideLoading({
            success: (res) => {},
          })
          wx.showToast({
            title: '完成成功',
            duration: 1000,
            icon: 'success',
            mask: true,
            success: (res) => {},
            fail: (res) => {},
            complete: (res) => {
              //如果是定期的话，弹窗订阅
              if(that.data.detail_isRegular == 1) {
                wx.showModal({
                  confirmText: '我已明白',
                  content: '请您允许消息推送，以便我们继续给您定期推送备忘信息，如您取消则会收不到我们的定期提醒！',
                  title: '提示',
                  showCancel: false,
                  success: (result) => {
                    wx.requestSubscribeMessage({
                      tmplIds: ['GnLGROy6j9ElGm0FNzXnF4k_0zZy1kWYHuwMJ2iez6s'],
                      //success: (res)=> { console.log(res)}
                      success: (res) => {
                        let r = res['GnLGROy6j9ElGm0FNzXnF4k_0zZy1kWYHuwMJ2iez6s']
                        if (r == 'reject') {
                          db.collection('memo').where({
                            _id:_id
                          }).update({
                            data:{
                              accept:false
                            }
                          })
                          wx.showModal({
                            confirmText: '前往设置',
                            content: '保存成功！但您可能无法收到我们的备忘通知！',
                            showCancel: true,
                            title: '提示',
                            success: (result) => {
                              if(result.confirm) {
                              }
                            },
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
                          that.setData({
                            restatement:false
                          })
                        } else if(r=='accept') {
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
                        
                      }
                    })
                  },
                  fail: (res) => {},
                  complete: (res) => {},
                })
              }
              
            },
          })
        } else {
          wx.hideLoading({
            success: (res) => {},
          })
          wx.showToast({
            title: '完成失败',
            duration: 1000,
            icon: 'error',
            mask: true,
            success: (res) => {},
            fail: (res) => {},
            complete: (res) => {},
          })
        }

      },
      fail: err => {
        wx.hideLoading({
          success: (res) => {},
        })
        console.error('备忘失败', err)
      }
    })
  },

  //删除备忘
  deleteMemo: function (e) {
    let _id = e.target.dataset.id
    let index = e.target.dataset.index
    let that = this
    wx.showLoading({
      title: '删除中',
      mask: true,
      success: (res) => {},
      fail: (res) => {},
      complete: (res) => {},
    })
    wx.cloud.callFunction({
      name: 'deleteMemo',
      data: {
        _id: _id
      },
      success: res => {
        console.log('删除备忘成功', res.result)
        let len = that.data.things.length
        let things = [].concat(that.data.things.slice(0, index))
        if (index + 1 != len) things = things.concat(that.data.things.slice(index + 1, len))
        if (res.result == 1) {
          that.setData({
            things: things
          })
          wx.showToast({
            title: '删除成功',
            duration: 1000,
            icon: 'success',
            mask: true,
            success: (res) => {},
            fail: (res) => {},
            complete: (res) => {},
          })
        } else {
          wx.showToast({
            title: '删除失败',
            duration: 1000,
            icon: 'error',
            mask: true,
            success: (res) => {},
            fail: (res) => {},
            complete: (res) => {},
          })
        }
        wx.hideLoading({
          success: (res) => {},
          fail: (res) => {},
          complete: (res) => {},
        })
      },
      fail: err => {
        wx.hideLoading({
          success: (res) => {},
        })
        wx.showToast({
          title: '删除失败',
          duration: 1000,
          icon: 'error',
          mask: true,
          success: (res) => {},
          fail: (res) => {},
          complete: (res) => {},
        })
        console.error('删除备忘失败', err)
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
    var that = this
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
            that.setData({
              vioceTempFilePath: tempFilePath
            })
            wx.showLoading({
              title: '语音检索中',
            })
            //上传录制的音频
            new Promise(() => {
              // 语音转文字
              const fs = wx.getFileSystemManager();
              console.log("fs：",fs)
              fs.readFile({
                filePath: tempFilePath,
                success(res) {
                  const base64 = wx.arrayBufferToBase64(res.data);
                  var fileSize = res.data.byteLength;
                  console.log("base64：",base64)
                  console.log("fileSize：",fileSize)
                  wx.cloud.callFunction({
                    name: 'sentenceRecognition',
                    data: {
                      data: base64,
                      dataLen: fileSize
                    },
                    success: res => {
                      console.log('语音转化文字成功:', res.result)
                      let content
                      if (res.result) {
                        content = res.result
                      } else {
                        content = "语音备忘"
                      }
                      wx.hideLoading()
                      that.setData({
                        restatement: true,
                        reContent: content
                      })


                    },
                    fail: err => {
                      wx.hideLoading()
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

  confirmVoiceMemo: function () {
    wx.showLoading({
      title: '保存中~',
    })
    let fileID
    let that = this
    let content = that.data.reContent
    let startTime = that.data.stdStartDate
    if (content && startTime) {
      that.uploadVioceFile(this.data.vioceTempFilePath, function (res) {
        console.log('上传语音到云存储成功：', res)
        fileID = res.fileID
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
                    belong: app.globalData.openid,
                    content: content,
                    creator: app.globalData.openid,
                    finish: 0,
                    recordUrl: fileID,
                    time: startTime,
                    isRegular: 0
                  }
                })
                .then(res => {
                  console.log('添加语音版备忘成功', res)
                  let _id = res._id
                  let obj = {
                    title: content,
                    time: util.formatTime(startTime),
                    id: res._id,
                    showAll:false,
                    _leftTxt: '0rpx',
                    scrollFlag: false,
                    finish:0,
                    height:90,
                    recordUrl:fileID
                  }
                  let things = that.data.things
                  things.push(obj)
                  that.setData({
                    restatement: false,
                    vioceTempFilePath: "",
                    reContent: "",
                    startDate: "点击选择提醒时间",
                    stdStartDate: null,
                    things: things
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
                      confirmText: '前往设置',
                      content: '保存成功！但您可能无法收到我们的备忘通知！',
                      showCancel: true,
                      title: '提示',
                      success: (result) => {
                        if(result.confirm) {
                        }
                      },
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
                  } else if(r=='accept') {
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
        
      }, function (err) {
        wx.hideLoading({
          success: (res) => {},
        })
        console.log('上传语音到云存储失败：', err)
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

  //上传语音文件到云存储
  uploadVioceFile: function (tempFilePath, successCallback, failCallback) {
    let timestamp = util.formatDate(new Date());
    wx.cloud.uploadFile({
      cloudPath: "uploadVoices/" + timestamp + '-' + this.randomNum(10000, 99999) + '.mp3',
      filePath: tempFilePath,
      success: successCallback,
      fail: failCallback
    })
  },

  cancelRestate: function (e) {
    this.setData({
      restatement: false,
      vioceTempFilePath: "",
      reContent: "",
      startDate: "点击选择提醒时间",
      stdStartDate: null
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