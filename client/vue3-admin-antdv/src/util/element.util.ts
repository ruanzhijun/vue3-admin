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
 * 获取html元素的绝对横坐标
 * @param e html元素
 */
export function getAbsoluteLeft(e: any): number {
  let offset = e.offsetLeft
  if (e.offsetParent != null) {
    offset += getAbsoluteLeft(e.offsetParent)
  }
  return offset
}
