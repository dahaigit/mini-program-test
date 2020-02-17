 import {http} from '../../utils/http.js';
 Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    // 自定义httpjs的请求案例
    http.get('app/user/info').then(function(res){
      console.log('我去，请求ok和预想的一样')
      console.log(res)
    })
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