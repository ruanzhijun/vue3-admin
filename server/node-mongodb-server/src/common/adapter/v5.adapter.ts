import {HttpStatus} from '@nestjs/common'
import {ExpressAdapter} from '@nestjs/platform-express/adapters'
import * as express from 'express'
import {SystemError} from '../error'
import {Logger} from '../lib'

/**
 * 封装一个适配器，用于返回的时候包装一层数据，使的数据格式一致
 */
export class V5Adapter extends ExpressAdapter {
  constructor() {
    super(express())
  }

  reply(response, body: any, statusCode: number) {
    const res = response.status(HttpStatus.OK)
    const result = {time: Date.now(), code: 0, data: body}
    if (body && body.code) {
      Object.assign(result, body)
      delete result.data
    }

    if (result && result.data && result.data.statusCode > 0) {
      response.status(result.data.statusCode)
      Object.assign(result, SystemError.SYSTEM_ERROR.getResponse())
      const isError = result.data.statusCode >= 500
      const method = isError ? 'error' : 'trace'
      Logger[method](Object.assign(result.data, {error: `${result.data.statusCode} ${result.data.error || result.data.message}`}))
      if (!isError) {
        return res.send(result.data.message)
      }
      delete result.data
    }
    return res.json(result)
  }
}
