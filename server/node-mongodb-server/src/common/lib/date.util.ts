import * as Moment from 'moment-timezone'

export class DateUtil {
  /**
   * 获取当前时间对象
   * @param time 时间
   */
  static getCurrentTime(time = new Date()): Date {
    return Moment(time).toDate()
  }

  /**
   * 获取当前时间戳(毫秒)
   * @param time 时间
   */
  static getCurrentTimestamp(time = new Date()) {
    return Moment(time).valueOf()
  }

  /**
   * 返回指定日期的凌晨零点时间戳
   * @param currentTime 当前的时间
   * @param day 是否加减日期
   */
  static getDate(currentTime = new Date(), day = 0): number {
    return Moment(currentTime || new Date()).add(day, 'day').startOf('day').valueOf()
  }

  /**
   * 对指定日期进行格式化
   * @param time 时间
   * @param format 格式模板(参考：http://momentjs.cn/docs/#/parsing/string-format)
   */
  static formatTime(time = new Date(), format = 'YYYY-MM-DD HH:mm:ss'): string {
    return Moment(time || new Date()).format(format)
  }

  /**
   * 时间字符串转日期
   * @param str 时间字符串
   * @param format 格式模板(参考：http://momentjs.cn/docs/#/parsing/string-format)
   */
  static str2date(str, format = 'YYYY-MM-DD HH:mm:ss'): Date {
    return Moment(str, format).toDate()
  }

  /**
   * 求某一个日期的最近x天
   * @param date 日期
   * @param days 最近x天
   * @param format 格式模板(参考：http://momentjs.cn/docs/#/parsing/string-format)
   */
  static recentDays(date: Date, days: number, format = 'YYYY-MM-DD HH:mm:ss'): string[] {
    const result = []
    if (days < 1) {
      return result
    }
    const st = DateUtil.getDate(date) - 86400000 * (days - 1)
    const et = DateUtil.getDate(date) + 86400000
    for (let t = st; t <= et; t += 86400000) {
      result.push(DateUtil.formatTime(new Date(t), format))
    }
    return result
  }

  /**
   * 把时间转成秒数
   * @param time 时间格式
   * 例如：1:20:30 => 4830000
   */
  static time2second(time): number {
    return Moment.duration(time).asMilliseconds()
  }

  /**
   * 把 YYYYMMDD 格式转日期
   * @param str 字符串
   * @param format 格式
   * 例如： 20181009 => 2018-10-09 00:00:00
   */
  static str2dateStr(str, format = 'YYYY-MM-DD HH:mm:ss'): string {
    return Moment(str, 'YYYYMMDD').format(format)
  }

  /**
   * 获取月份
   */
  static getMonth(month: number = 0): number {
    return parseInt(Moment().month(Moment().month() + month).startOf('month').format('YYYYMM'))
  }
}
