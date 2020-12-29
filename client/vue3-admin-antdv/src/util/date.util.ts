/**
 * 时间格式化
 * @param timestamp 时间戳(毫秒，默认当前时间)
 * @param format 格式(默认：yyyy-MM-dd hh:mm:ss)
 */
export function format(timestamp?: number, format: string = 'yyyy-MM-dd hh:mm:ss'): string {
  let _format = format
  const date = new Date(timestamp || new Date().getTime())
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  } as any
  _format = /(y+)/.test(_format) ? _format.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length)) : _format
  Object.keys(o).filter((k) => {
    _format = new RegExp(`(${k})`).test(_format) ? _format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length))) : _format
    return true
  })
  return _format
}
