import {apiHost} from '../env.js'

class Http
{
  apiHost = ''

  constructor() {
    this.apiHost = apiHost
  }

  get(url, params = {})
  {
    var theHttp = this
    console.log(theHttp.apiHost + url)
    return new Promise(function(resolve, reject){
      wx.request({
        url: theHttp.apiHost + url,
        data: params,
        header: {},
        success: function(res) {
          console.log(1111)
          console.log(res)
          if (res.data.code === 401) {
            console.log('用户没有接口请求权限，需要重新授权登录')
            // 出错了，停止当前请求。
            return
          }
          resolve(res)
        },
        fail: function(error){
          console.log('调用失败了')
          reject
        }
      })
    })
    console.log(this.apiHost)
    console.log(url);
    console.log(params)
  }
}

export var http = new Http()
