import * as config from 'config'
import * as nodemailer from 'nodemailer'
import {Logger, StringUtil} from './'

/**
 * 邮件工具类
 */
const transporter = nodemailer.createTransport({
  pool: true,
  host: config.mailConfig.host,
  port: config.mailConfig.port,
  debug: true,
  ignoreTLS: true,
  secure: true,
  auth: {
    user: config.mailConfig.user,
    pass: config.mailConfig.pass,
    type: 'login'
  }
})

export class MailUtil {
  /**
   * 发送文本邮件
   * @param title 邮件标题
   * @param content 邮件内容(自动识别是普通文本还是HTML文本)
   * @param to 收件者列表
   */
  static send(title: string, content: string, ...to) {
    Logger.trace('message send title: ', title)
    Logger.trace('message send content: ', content)
    for (const t of to) {
      const mailOptions = {} as {from: string, to: string, subject: string, html: string, text: string}
      mailOptions.from = `"${config.mailConfig.alias}" <${config.mailConfig.user}>`
      mailOptions.to = t
      mailOptions.subject = title

      if (StringUtil.isHTML(content)) {
        mailOptions.html = content
      } else {
        mailOptions.text = content
      }

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          Logger.error('message send error: ', error)
          return
        }
        Logger.info('message send success: ', info)
      })
    }
  }

  /**
   * 发送带附件文本邮件
   * @param title 邮件标题
   * @param content 邮件内容(自动识别是普通文本还是HTML文本)
   * @param attachments 邮件附件([{filename:'',path:''}...])
   * @param to 收件者列表
   */
  static sendWithAttachments(title: string, content: string, attachments: {filename: string, path: string}[], ...to) {
    Logger.trace('message send title: ', title)
    Logger.trace('message send attachments: ', attachments)
    Logger.trace('message send content: ', content)
    for (const t of to) {
      const mailOptions = {} as {from: string, to: string, subject: string, html: string, text: string, attachments: {filename: string, path: string}[]}
      mailOptions.from = `"${config.mailConfig.alias}" <${config.mailConfig.user}>`
      mailOptions.to = t
      mailOptions.subject = title
      mailOptions.attachments = attachments

      if (StringUtil.isHTML(content)) {
        mailOptions.html = content
      } else {
        mailOptions.text = content
      }

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          Logger.error('message send error: ', error)
          return
        }
        Logger.info('message send success: ', info)
      })
    }
  }
}
