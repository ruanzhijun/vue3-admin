import {HttpException, HttpStatus} from '@nestjs/common'

/**
 * 统一错误格式
 */
export class BaseError extends HttpException {
  private readonly code: number

  /**
   * 构造函数
   * @param code 错误码
   * @param message 错误信息
   */
  constructor(code: number, message?: string) {
    super(message, HttpStatus.OK)
    this.code = code
  }

  getResponse(): {code: number, message: string} {
    return {code: this.code, message: this.message}
  }
}
