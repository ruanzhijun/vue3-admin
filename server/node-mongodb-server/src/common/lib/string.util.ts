import * as _ from 'lodash'

/**
 * String 工具类
 */
export class StringUtil {
  /**
   * 判断是否为json字符串
   * @param str 字符串或者对象
   */
  static isJSON(str: string): boolean {
    const typeSet = new Set(['object', '[object object]', '[object array]'])
    const type = Object.prototype.toString.call(str).toLowerCase()
    if (typeSet.has(type)) {
      return true
    }

    if (/^[0-9]+$/g.test(str)) {
      return false
    }

    try {
      JSON.parse(str)
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * 判断是否为html字符串
   * @param str 字符串或者对象
   */
  static isHTML(str: string): boolean {
    // 如果经过html过滤之后不等于它本身，就是html文本
    return str !== str.replace(/<!?\/?[a-zA-Z]+[^><]*>/g, '').trim()
  }

  /**
   * 转为下划线风格
   * @param str 字符串
   */
  static snakeCase(str: string): string {
    return (str || '').replace(/([^A-Z])([A-Z])/g, ($0, $1, $2) => {
      return `${$1}_${$2.toLowerCase()}`
    })
  }

  /**
   * 转为驼峰风格
   * @param str 字符串
   */
  static camelCase(str: string): string {
    str = str || ''
    if (str.indexOf('_') > -1) {
      str = str.replace(/_(\w)/g, (a, b) => {
        return b.toUpperCase()
      })
    }
    return str
  }

  /**
   * 过滤html标签
   * @param str 字符串
   */
  static stripHTML(str: string): string {
    str = str || ''
    str = str.replace(/<!?\/?[a-zA-Z]+[^><]*>/ig, '').trim()
    str = str.replace(/<!--[\s\S]*?--\>/ig, '').trim()
    str = str.replace(/\[\s*if\s+[^\]][\s\w]*\]/ig, '').trim()
    str = str.replace(/(&nbsp;)/ig, '').trim()
    return str
  }

  /**
   * 过滤字符串所有空格
   * @param str 字符串
   */
  static stripAllSpace(str: string): string {
    return (str || '').replace(/^\s+|\s+|\s+$/ig, '').trim()
  }

  /**
   * 返回干净整洁的html代码
   * @param content html文本
   */
  static cleanHTML(content: string): string {
    content = content.replace(/<((?!img)[a-zA-Z0-9]+)(\s*[^>]*)?>/ig, '<$1>').trim()// 去掉除所有html标签里面的属性
    content = content.replace(/<style>[\s\S]*?<\/style>/ig, '').trim()// 去掉style标签
    content = content.replace(/<script>[\s\S]*?<\/script>/ig, '').trim()// 去掉script标签
    content = content.replace(/(<p\>)\s+/ig, '<p>').trim()// 去掉p标签前面的空格
    content = content.replace(/(<\/p>\s+?<p>)+/ig, '</p><p>').trim()// 去掉p标签之间的换行符、空格等
    content = content.replace(/(<img.*?)style=\".*?\"/ig, '$1').trim()// 删除img标签的style属性
    content = content.replace(/<!--[\s\S]*?--\>/ig, '').trim()// 删除html注释
    content = content.replace(/\[\s*if\s+[^\]][\s\w]*\]/ig, '').trim()// 删除html条件注释
    return content
  }

  /**
   * 插入字符串
   * @param str 原字符串
   * @param flg 要插入的字符串
   * @param sn 插入的位置
   */
  static insert(str: string, flg: string, sn: number) {
    let newstr = ''
    for (let i = 0; i < str.length; i += sn) {
      const tmp = str.substring(i, i + sn)
      newstr += tmp + flg
    }
    return newstr.substr(0, newstr.length - 1)
  }

  /**
   * 把json的中文url encode一下
   * @param json json对象
   */
  static urlEncodeJSON(json: any): any {
    for (const key of Object.keys(json)) {
      if (!/[A-Za-z0-9]+/.test(_.toString(json[key]).trim())) {
        Object.assign(json, {[key]: encodeURIComponent(_.toString(json[key]).trim())})
      }
    }
    return json
  }

  /**
   * 首字母大写
   * @param str 字符串
   */
  static firstUpperCase(str: string): string {
    return `${(str || '').substring(0, 1).toUpperCase()}${(str || '').substring(1)}`
  }
}
