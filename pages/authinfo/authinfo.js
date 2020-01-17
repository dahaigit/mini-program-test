Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，跳转到首页
          
        }
      }
    })
  },
  bindGetUserInfo(e) {
    getApp().checkIsLogin()
    .then(function(){
wx.navigateBack({
      delta: 2,
      success: function(data) {
      },
      error: function(error){
      }
    })
    })
    
  }
})