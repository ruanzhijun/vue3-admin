import {Directive} from 'vue'
import {GetAuthority} from '../constant'
import store from '../store'
import {getAbsoluteLeft, getAbsoluteTop} from '../util'

function getScrollbarWidth() {
  const odiv = document.createElement('div')
  Object.assign(odiv.style, {width: '100px', height: '100px', overflowY: 'scroll'})
  document.body.appendChild(odiv)//把div添加到body中
  const scrollbarWidth = odiv.offsetWidth - odiv.clientWidth//相减
  odiv.remove()//移除创建的div
  return 0//返回滚动条宽度
}

const app = document.getElementById('app') as any
console.log('xxxxxxx:',app.offsetWidth, app.clientWidth)

function hasScrolled(element: any, direction: any): any {
  if (direction === 'vertical') {
    return element.scrollHeight > element.clientHeight
  } else if (direction === 'horizontal') {
    return element.scrollWidth > element.clientWidth
  }
}

function hasScrollbar() {
  return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight)
}

var isScroll = function (el?: any) {
  // test targets
  var elems = el ? [el] : [document.documentElement, document.body]
  var scrollX = false, scrollY = false
  for (var i = 0; i < elems.length; i++) {
    var o = elems[i]
    // test horizontal
    var sl = o.scrollLeft
    o.scrollLeft += (sl > 0) ? -1 : 1
    o.scrollLeft !== sl && (scrollX = scrollX || true)
    o.scrollLeft = sl
    // test vertical
    var st = o.scrollTop
    o.scrollTop += (st > 0) ? -1 : 1
    o.scrollTop !== st && (scrollY = scrollY || true)
    o.scrollTop = st
  }
  // ret
  return {
    scrollX: scrollX,
    scrollY: scrollY
  }
}

let width = document.documentElement.clientWidth || document.body.clientWidth
let height = document.documentElement.clientHeight || document.body.clientHeight

// alert(window.screen.availWidth+","+document.body.scrollWidth )
if(window.screen.availHeight-document.body.clientHeight >=75){
  // alert('有滚动条。。。')
}
// alert(document.body.clientHeight + ',' + window.screen.availHeight)

window.onresize = function () {
   width = document.documentElement.clientWidth || document.body.clientWidth
   height = document.documentElement.clientHeight || document.body.clientHeight
}

function getTooltipPlacement(tooltip: any, e: any): 'topRight' | 'topLeft' {
  const right = width - getAbsoluteLeft(e) - 70 - getScrollbarWidth()
  return tooltip.offsetWidth >= right ? 'topRight' : 'topLeft'
}

const Permission: Directive = {
  mounted(el: any, binding: any) {
    const components = store.getters[GetAuthority].components || []
    if (components.length <= 0 || components.indexOf(binding.value) > -1) {
      return
    }

    // 您没有权限，请联系管理员
    // https://github.com/Akryum/v-tooltip
    // https://www.jianshu.com/p/4d20580c9bda
    // https://github.com/vueComponent/ant-design-vue/blob/next/components/tooltip/Tooltip.tsx
    const id = Math.random().toString(36).slice(2)
    el.innerHTML = `<span id="role-${id}" style="display:inline-block;cursor:not-allowed">${el.innerHTML.replace('<button', '<button disabled style="pointer-events:none"')}<div id="${id}" class="ant-tooltip role-manager-tooltip" style="z-index:99999;position:absolute;display:none;"><div class="ant-tooltip-content"><div class="ant-tooltip-arrow"></div><div class="ant-tooltip-inner" role="tooltip">您没有权限，请联系管理员</div></div></div></span>`
    const warp = document.getElementById(`role-${id}`) as any
    const tooltip = document.getElementById(id) as any
    warp.addEventListener('mouseover', () => {
      const top = getAbsoluteTop(warp) - 210
      const right = width - getAbsoluteLeft(warp) - 70 - getScrollbarWidth()
      tooltip.style.display = 'block'
      tooltip.style.top = `${top <= 0 ? 25 : top}px`
      tooltip.style.right = `${right}px`
      const className = getTooltipPlacement(tooltip, warp)
      if (className === 'topLeft') {
        tooltip.style.right = `${right - 24}px`
      }
      tooltip.classList.add(`ant-tooltip-placement-${className}`)
    })
    warp.addEventListener('mouseout', () => {
      const className = getTooltipPlacement(tooltip, warp)
      tooltip.style.display = 'none'
      tooltip.classList.remove(`ant-tooltip-placement-${className}`)
    })
  }
}

export default {name: 'permission', directive: Permission}
