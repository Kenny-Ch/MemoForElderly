// miniprogram/pages/oldMan/addReminder/addReminder.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    times: "选择您的定期提醒时间",
    frequencyIndex: 0,
    frequencyList: ['每天一次', '每周一次'],
    dateList: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天'],
    dateIndex: 0,
    isOn: false,
    title: "",
    belongOpenid: "",
    fromOld: false,
    regularInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.title != undefined) {
      this.setData({
        title: options.title
      })
    }
    //亲属给老人添加定期传入参数
    if (options.belongOpenid) {
      this.setData({
        belongOpenid: options.belongOpenid
      })
    }
    //老人我的处添加定期提醒传入参数
    if (options.isOld) {
      this.setData({
        fromOld: true
      })
    }
    //老人首页页面点击改成定期提醒传入参数
    if (options.regularInfo) {
      this.setData({
        regularInfo: {
          belong: options.belong,
          openid: options.openid,
          _id: options.id 
        }
      })
      //已经是定期提醒，显示定期提醒时间
      console.log("isRegular:",options.isRegular)
      if(options.isRegular==1){
        this.setData({
          dateIndex:2,     //需要换为动态的
          times:'04:08',    //需要换为动态的
        })
      }
      
    }
  },
  changeFrequency(e) {
    console.log("选择的频率为", this.data.frequencyList[e.detail.value])
    this.setData({
      frequencyIndex: e.detail.value
    });
  },
  changeDate(e) {
    console.log("选择的日期为", this.data.dateList[e.detail.value])
    this.setData({
      dateIndex: e.detail.value
    });
  },
  switchChange(e) {
    console.log("该备忘事项需要完成", !this.data.isOn)
    this.setData({
      isOn: !this.data.isOn
    })
  },
  bindTimeChange: function (e) {
    console.log("提醒时间：", e.detail.value)
    this.setData({
      times: e.detail.value
    })
  },

  //保存备忘
  saveData: function () {
    wx.showLoading({
      title: '保存中~',
    })
    let that = this
    let content = this.data.title
    let frequencyIndex = this.data.frequencyIndex
    let dateIndex = this.data.dateIndex
    let memtionTime = this.data.times

    if (content && memtionTime.length == 5) {
      //处理
      let weekday = (dateIndex + 1) % 7
      let regularTime
      if (frequencyIndex == 0) {
        regularTime = parseInt(memtionTime.slice(0, 2)) * 10000 + parseInt(memtionTime.slice(3, 5)) * 100
      } else if (frequencyIndex == 1) {
        regularTime = weekday * 1000000 + parseInt(memtionTime.slice(0, 2)) * 10000 + parseInt(memtionTime.slice(3, 5)) * 100
      }

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
                if (result.confirm || result.cancel) {
                  wx.requestSubscribeMessage({
                    tmplIds: ['GnLGROy6j9ElGm0FNzXnF4k_0zZy1kWYHuwMJ2iez6s'],
                    //success: (res)=> { console.log(res)}
                    success: (res) => {
                      let r = res['GnLGROy6j9ElGm0FNzXnF4k_0zZy1kWYHuwMJ2iez6s']
                      if (that.data.regularInfo) { //首页非备忘修改成备忘
                        db.collection('memo').add({
                            // data 字段表示需新增的 JSON 数据
                            data: {
                              belong: that.data.regularInfo.belong,
                              content: content,
                              creator: that.data.regularInfo.openid,
                              finish: 0,
                              recordUrl: recordurl,
                              isRegular: 1,
                              regularType: frequencyIndex,
                              regularTime: regularTime
                            }
                          })
                          .then(res => {
                            console.log('添加文字版备忘成功', res)
                            let _id = res._id
                            that.setData({
                              content: '',
                            })
                            wx.cloud.callFunction({
                              name: 'deleteMemo',
                              data: {
                                _id: that.data.regularInfo._id
                              },
                              success: res => {
                                console.log("删除旧的备忘成功", res)

                              },
                              fail: err => {
                                console.error('删除旧的备忘失败', err)
                              },
                              complete: res => {
                                let pages = getCurrentPages(); // 当前页，
                                let prevPage
                                prevPage = pages[pages.length - 2]
                                prevPage.onLoad()



                                if (r == 'reject') {
                                  db.collection('memo').where({
                                    _id: _id
                                  }).update({
                                    data: {
                                      accept: false
                                    }
                                  })
                                  wx.showModal({
                                    confirmText: '确认',
                                    content: '保存成功！但您可能无法收到我们的备忘通知！',
                                    showCancel: false,
                                    title: '提示',
                                    success: (result) => {
                                      wx.navigateBack({
                                        delta: 1,
                                      })
                                      if (result.confirm) {}
                                    },
                                    fail: (res) => {},
                                    complete: (res) => {},
                                  })
                                } else if (r == 'ban') {
                                  db.collection('memo').where({
                                    _id: _id
                                  }).update({
                                    data: {
                                      accept: false
                                    }
                                  })
                                  wx.showToast({
                                    title: '保存成功！但消息推送设置出错！',
                                    duration: 1000,
                                    icon: 'error',
                                    mask: true,
                                    success: res => {
                                      wx.navigateBack({
                                        delta: 1,
                                      })
                                    }
                                  })
                                } else if (r == 'accept') {
                                  db.collection('memo').where({
                                    _id: _id
                                  }).update({
                                    data: {
                                      accept: true
                                    }
                                  })
                                  wx.showToast({
                                    title: '保存成功！',
                                    duration: 1000,
                                    icon: 'success',
                                    mask: true,
                                    success: res => {
                                      wx.navigateBack({
                                        delta: 1,
                                      })
                                    }
                                  })
                                }
                              }
                            })

                          })
                          .catch(console.error)
                      } else { //正常添加备忘
                        db.collection('memo').add({
                            // data 字段表示需新增的 JSON 数据
                            data: {
                              belong: that.data.belongOpenid ? that.data.belongOpenid : app.globalData.openid,
                              content: content,
                              creator: app.globalData.openid,
                              finish: 0,
                              recordUrl: recordurl,
                              isRegular: 1,
                              regularType: frequencyIndex,
                              regularTime: regularTime
                            }
                          })
                          .then(res => {
                            console.log('添加文字版备忘成功', res)
                            let _id = res._id
                            that.setData({
                              content: '',
                            })
                            let pages = getCurrentPages(); // 当前页，
                            let prevPage
                            if (that.data.fromOld) {
                              prevPage = pages[pages.length - 4]
                              prevPage.onLoad()
                            }
                            prevPage = pages[pages.length - 2]; // 上一页
                            prevPage.setData({
                              freshNow: 1,
                            })


                            if (r == 'reject') {
                              db.collection('memo').where({
                                _id: _id
                              }).update({
                                data: {
                                  accept: false
                                }
                              })
                              wx.showModal({
                                confirmText: '确认',
                                content: '保存成功！但您可能无法收到我们的备忘通知！',
                                showCancel: false,
                                title: '提示',
                                success: (result) => {
                                  wx.navigateBack({
                                    delta: 1,
                                  })
                                  if (result.confirm) {}
                                },
                                fail: (res) => {},
                                complete: (res) => {},
                              })
                            } else if (r == 'ban') {
                              db.collection('memo').where({
                                _id: _id
                              }).update({
                                data: {
                                  accept: false
                                }
                              })
                              wx.showToast({
                                title: '保存成功！但消息推送设置出错！',
                                duration: 1000,
                                icon: 'error',
                                mask: true,
                                success: res => {
                                  wx.navigateBack({
                                    delta: 1,
                                  })
                                }
                              })
                            } else if (r == 'accept') {
                              db.collection('memo').where({
                                _id: _id
                              }).update({
                                data: {
                                  accept: true
                                }
                              })
                              wx.showToast({
                                title: '保存成功！',
                                duration: 1000,
                                icon: 'success',
                                mask: true,
                                success: res => {
                                  wx.navigateBack({
                                    delta: 1,
                                  })
                                }
                              })
                            }
                          })
                          .catch(console.error)
                      }
                    }
                  })
                }
              },
              fail: (res) => {},
              complete: (res) => {

              },
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
          console.error('文字转语音失败失败', err)
          wx.hideLoading({
            success: (res) => {},
          })
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

  //备忘内容输入更新
  bindTitleInput: function (e) {
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