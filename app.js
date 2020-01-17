//app.js
App({
  onShow: function () {
    
  },
  onLaunch: function () {
    console.log('页面初始化功能执行')
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 登录
    this.checkIsAuthUserInfo()
      .then(function (isAuth) {
        if (isAuth) {
          console.log('已经授权')
          getApp().checkIsLogin()
        } else {
          console.log('没有授权，跳转到授权页面')
          // 弹出授权按钮
          wx.navigateTo({
            url: '/pages/authinfo/authinfo'
          })
        }
      })
   
  },
  globalData: {
    userInfo: null,
    auth: {
      token: '',
      express_at: 0
    }
  },
  // 检查用户是否授权获取用户信息
  checkIsAuthUserInfo: function() {
    console.log('检查是否授权')
    return new Promise(function (resolve, reject) {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            resolve(true)
          } else {
            resolve(false)
          }
        },
        fail: error => {
          reject(error);
        }
      })
    })
  },
  // 检查微信是否已经登陆
  checkIsLogin: function() {
    console.log('检查是否登陆')
    return new Promise(function (resolve, reject){
        wx.checkSession({
          success() {
            //session_key 未过期，并且在本生命周期一直有效
            console.log(1)
            resolve(true)
          },
          fail() {
            // session_key 已经失效，需要重新执行登录流程
            resolve()
            return getApp().login()
              .then(function () {
                return getApp().getUserInfo()
              })
              .then(function (user) {
                return getApp().parseUser(user)
              })
          }
        })
    })
  },
  // 微信登陆
  login: function () {
    console.log('开始登陆')
     return new Promise(function(resolve, reject){
       wx.login({
         success: res => {
           // 发送 res.code 到后台换取 openId, sessionKey, unionId
           wx.request({
             url: 'http://dev.hyperf-wechat.com:9501/app/auth/login?code=' + res.code,
             success(res) {
               console.log('登陆ok')
               if (res.data.data) {
                 getApp().globalData.auth.token = res.data.data.token
                 getApp().globalData.auth.express_at = res.data.data.express_at
                 resolve(res)
               } else {
                 /* 异步操作失败 */
                 reject(error);
               }
             },
             fail (error) {
               reject(error);
             }
           })
         }
       })
     });
  },
  // 微信获取用户详情
  getUserInfo : function () {
    console.log('获取用户详情')
    return new Promise(function (resolve, reject) {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                if (res) {
                  // 可以将 res 发送给后台解码出 unionId
                  getApp().globalData.userInfo = res.userInfo
                  console.log('获取用户详情成功')
                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (getApp().userInfoReadyCallback) {
                    getApp().userInfoReadyCallback(res)
                  }
                  resolve(res)
                } else {
                  /* 异步操作失败 */
                  reject(error);
                }
              }
            })
          } else {
            console.log('用户还未授权,跳到授权页面。')
          }
        },
        fail: error => {
          reject(error);
        }
      })
    })
  },
  // 解析用户，把用户信息回传给服务器
  parseUser : function (user) {
    return new Promise(function (resolve, reject) {
      console.log('开始解析用户')
      wx.request({
        url: 'http://dev.hyperf-wechat.com:9501/user/parse',
        header: {
         
        },
        method: 'post',
        data: {
          'encryptedData': encodeURI(user.encryptedData),
          'iv': encodeURI(user.iv),
          'token': getApp().globalData.auth.token
        }
      })
    })
  }
})