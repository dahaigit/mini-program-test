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
          console.log('授权成功')
          
        }
      }
    })
  },
  bindGetUserInfo(e) {
    console.log(e.detail.userInfo)
    console.log('222')
    getApp().checkIsLogin()
    .then(function(){
wx.navigateBack({
      delta: 2,
      success: function(data) {
        console.log('跳转成功')
        console.log(data)
      },
      error: function(error){
        console.log('跳转失败')
        console.log(error)
      }
    })
    console.log(333)
    })
    
  }
})