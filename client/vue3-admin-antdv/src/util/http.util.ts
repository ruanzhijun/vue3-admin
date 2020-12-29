import {message} from 'ant-design-vue'
import axios from 'axios'
import * as querystring from 'querystring'
import {TokenKey} from '../constant'
import {logout, noPermission, stripEmptyValue} from './'

const HttpUtil = axios.create({baseURL: '/api/v1', timeout: 30000})

// Request interceptors
HttpUtil.interceptors.request.use(
  config => {
    const token = localStorage.getItem(TokenKey)
    if (token) {
      config.headers[TokenKey] = localStorage.getItem(TokenKey)
    }
    return config
  }, error => {
    Promise.reject(error)
  }
)

// Response interceptors
HttpUtil.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 0) {
      message.error(res.message)
      // 20001-token失效
      if (res.code === 20001) {
        return logout()
      }
      // 20003-没有权限
      if (res.code === 20003) {
        return noPermission()
      }
      return null
    } else {
      return res.data
    }
  },
  error => {
    message.error(error.message)
    return Promise.reject(error)
  }
)

async function post(url: string, data?: any): Promise<any> {
  return HttpUtil.post(url, stripEmptyValue(data))
}

async function get(url: string, data?: any): Promise<any> {
  data = stripEmptyValue(data)
  return HttpUtil.get(Object.keys(data).length > 0 ? `${url}?${querystring.stringify(data)}` : url)
}

export {post, get}
