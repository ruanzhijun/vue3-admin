import * as joi from 'joi'
import {SystemError} from '../error'

export const PaginationSchema = Object.freeze({
  page: joi.number().min(1).default(1).error(SystemError.PARAMS_ERROR('请输入正确的页码')),
  pageSize: joi.number().min(1).max(50).default(20).error(SystemError.PARAMS_ERROR('页面大小的取值范围是1~50'))
})
