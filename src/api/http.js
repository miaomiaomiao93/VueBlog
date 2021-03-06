import router from "../router.js";
// 配置API接口地址
var root = `http://localhost:54891/api`;
// var root2 = "http://123.206.33.109:8081/api/";//没有代理的服务器api地址
//var root = "/api"; //配置 proxy 代理的api地址，也可以写成http://localhost:6688/apb/api
// 引用axios
import axios from 'axios';
// 自定义判断元素类型JS
function toType(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}
// 参数过滤函数
function filterNull(o) {
  for (var key in o) {
    if (o[key] === null) {
      delete o[key]
    }
    if (toType(o[key]) === 'string') {
      o[key] = o[key].trim()
    } else if (toType(o[key]) === 'object') {
      o[key] = filterNull(o[key])
    } else if (toType(o[key]) === 'array') {
      o[key] = filterNull(o[key])
    }
  }
  return o;
}

// http request 拦截器
axios.interceptors.request.use(
  config => {
    if (window.localStorage.Token && window.localStorage.Token.length >= 128) { //store.state.token 获取不到值
      // 判断是否存在token，如果存在的话，则每个http header都加上token
      config.headers.Authorization = window.localStorage.Token;
    }

    if(config.method === 'post') {
      console.log(config.method);
      config.headers={
        'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
      }
      config.transformRequest = [function (data) {
        // Do whatever you want to transform the data
        let newData = ''
        for (let k in data) {
        newData += encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) + '&'
        }
        return newData
        }];
  }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);
// http response 拦截器
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 返回 401 清除token信息并跳转到登录页面
          router.replace({
            path: "login",
            query: {
              redirect: router.currentRoute.fullPath
            }
          });
      }
    }
    return Promise.reject(error.response.data); // 返回接口返回的错误信息
  }
);
/*
  接口处理函数
  这个函数每个项目都是不一样的，我现在调整的是适用于
  https://cnodejs.org/api/v1 的接口，如果是其他接口
  需要根据接口的参数进行调整。参考说明文档地址：
  https://cnodejs.org/topic/5378720ed6e2d16149fa16bd
  主要是，不同的接口的成功标识和失败提示是不一致的。
  另外，不同的项目的处理方法也是不一致的，这里出错就是简单的alert
*/

function apiAxios(method, url, params, success) {
  if (params) {
    params = filterNull(params)
  }
  axios({
      method: method,
      url: url,
      data: method === 'POST' || method === 'PUT' ? params : null,
      params: method === 'GET' || method === 'DELETE' ? params : null,
      baseURL: root,
      withCredentials: false
      // headers:{"Authorization":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxIiwiUm9sZSI6IkFkbWluIiwiaWF0IjoiMjAxOC8xMC8zMCDmmJ_mnJ_kuowg5LiL5Y2IIDE6NDk6NTgiLCJleHAiOjE1NDA5MTQ1OTgsImlzcyI6IkJsb2cuQ29yZSJ9.EbJ9qLyArVxF0_CtA4AUrkYgNk5NUoOX2lvG31hd1vs"}
    })
    .then(function (res) {
      if (res.data.data.success === true) {
        success(res.data);
      }
    })
    .catch(error => {
      if (!error.response) {
          // network error
          window.alert('Error: Network Error');
      } else {
        window.alert(error.response.data.message);
      }
    })
    // .catch(function (err) {
    //   let res = err.response
    //   if (err) {
    //     window.alert(`api error, HTTP CODE: ` + res.status);
    //   }
    // })
}

// 返回在vue模板中的调用接口
export default {
  get: function (url, params, success) {
    return apiAxios('GET', url, params, success)
  },
  post: function (url, params, success) {
    return apiAxios('POST', url, params, success)
  },
  put: function (url, params, success) {
    return apiAxios('PUT', url, params, success)
  },
  delete: function (url, params, success) {
    return apiAxios('DELETE', url, params, success)
  }
}