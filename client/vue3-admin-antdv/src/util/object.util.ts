/**
 * 判断某个值是否为空
 * @param value 值
 */
export function isEmpty(value: any): boolean {
  if (typeof value === 'number') {
    return false
  }
  return value === '' || value === undefined || value === null || value.length <= 0 || Object.keys(value).length <= 0
}

/**
 * 去掉json值为空的key
 * @param json json数据
 */
export function stripEmptyValue(json: any): any {
  if (!json) {
    return {}
  }
  const data = {}
  Object.keys(json).forEach(key => !isEmpty(json[key]) ? Object.assign(data, {[key]: json[key]}) : {})
  return data
}
