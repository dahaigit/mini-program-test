//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 初始化全局变量
    this.initGlobalData()
    // 登录
    this.checkIsAuthUserInfo()
      .then(function (isAuth) {
        if (isAuth) {
          getApp().checkIsLogin()
        } else {
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
      express_at: 0,
      is_db_user: 0
    }
  },
  initGlobalData: function () {
    const app = this
    try {
      if (wx.getStorageSync('user:auth') === '') {
        app.globalData.auth = {}
      } else {
        app.globalData.auth = wx.getStorageSync('user:auth')
      }
    } catch (e) {

    }
    try {
      if (wx.getStorageSync('user:info') === '') {
        app.globalData.userInfo = null
      } else {
        app.globalData.userInfo = wx.getStorageSync('user:info')
      }
    } catch (e) {

    }
  },
  // 检查用户是否授权获取用户信息
  checkIsAuthUserInfo: function() {
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
    return new Promise(function (resolve, reject){
        wx.checkSession({
          success() {
            //session_key 未过期，并且在本生命周期一直有效
            // 验证auth.token是否失效，在路由守卫中验证接口返回状态码是否为401。401表示登陆token已失效
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
                if (getApp().globalData.auth.is_db_user === 0) {
                  return getApp().parseUser(user)
                }
              })
          }
        })
    })
  },
  // 微信登陆
  login: function () {
     return new Promise(function(resolve, reject){
       wx.login({
         success: res => {
           wx.request({
             url: 'http://dev.hyperf-wechat.com:9501/app/auth/login?code=' + res.code,
             success(res) {
               if (res.data.data) {
                 getApp().globalData.auth.token = res.data.data.token
                 getApp().globalData.auth.express_at = res.data.data.express_at
                 getApp().globalData.auth.is_db_user = res.data.data.is_db_user
                 // 把获取的授权数据存储到缓存中
                 wx.setStorage({
                   key: 'user:auth',
                   data: getApp().globalData.auth,
                 })
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
  http: function (url, method,) {

  },
  // 微信获取用户详情
  getUserInfo : function () {
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
                  // 把获取的用户存储到缓存中
                  wx.setStorage({
                    key: 'user:info',
                    data: res.userInfo,
                  })
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