/**
 * 获取浏览器宽高
 */
export function getBrowserRect(): {width: number, height: number} {
  const width = document.documentElement.clientWidth || document.body.clientWidth
  const height = document.documentElement.clientHeight || document.body.clientHeight
  return {width, height}
}

/**
 * 获取html元素的绝对高度
 * @param e html元素
 */
export function getAbsoluteTop(e: any): number {
  let offset = e.offsetTop
  if (e.offsetParent != null) {
    offset += getAbsoluteTop(e.offsetParent)
  }
  return offset
}

/**
 * 获取html元素的绝对左边距
 * @param e html元素
 */
export function getAbsoluteLeft(e: any): number {
  let offset = e.offsetLeft
  if (e.offsetParent != null) {
    offset += getAbsoluteLeft(e.offsetParent)
  }
  return offset
}
