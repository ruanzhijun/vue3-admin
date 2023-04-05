import {Directive} from 'vue'
import {GetAuthority} from '../constant'
import {AdminStore} from '../store'
import {getAbsoluteLeft, getAbsoluteTop, getBrowserRect} from '../util'

function getTooltipPlacement(tooltip: any): 'topRight' | 'topLeft' {
  const {width} = getBrowserRect()
  const warpRect = tooltip.getBoundingClientRect()
  const {left} = tooltip.parentNode.getBoundingClientRect()
  return width - left - warpRect.width <= 160 ? 'topRight' : 'topLeft'
}

const Permission: Directive = {
  mounted(el: any, binding: any) {
    const store = AdminStore()
    const {components} = store[GetAuthority] as {init: boolean, pages: string[], components: string[]}
    if (!components || components.length <= 0 || components.indexOf(binding.value) > -1) {
      return
    }

    // 设置动画开始延迟时间(单位：毫秒)
    const animationDelay = 150

    // 您没有权限，请联系管理员
    const id = Math.random().toString(36).slice(2)
    el.innerHTML = `<span id="role-${id}" style="display:inline-block;cursor:not-allowed">${el.innerHTML.replace('<button', '<button disabled style="pointer-events:none"')}<div id="${id}" class="ant-tooltip" style="position:absolute;display:none"><div class="ant-tooltip-content"><div class="ant-tooltip-arrow"></div><div class="ant-tooltip-inner" role="tooltip" style="cursor:text">您没有权限，请联系管理员</div></div></div></span>`
    const warp = document.getElementById(`role-${id}`) as any
    const tooltip = document.getElementById(id) as any
    warp.addEventListener('mouseover', () => {
      setTimeout(() => {
        let top = getAbsoluteTop(warp)
        top = top > 210 ? top - 210 : top - 45
        let left = getAbsoluteLeft(warp)
        left = left > 365 ? left - 355 : left
        tooltip.style.display = 'block'
        tooltip.style.top = `${top}px`
        tooltip.style.left = `${left}px`
        const className = getTooltipPlacement(tooltip)
        if (className === 'topLeft') {
          tooltip.style.left = `${left}px`
        }
        tooltip.classList.add(`ant-tooltip-placement-${className}`)
        tooltip.classList.remove('zoom-big-fast-enter')
        tooltip.classList.remove('zoom-big-fast-enter-active')
      }, animationDelay)
    })
    warp.addEventListener('mouseout', () => {
      setTimeout(() => {
        const className = getTooltipPlacement(tooltip)
        tooltip.style.display = 'none'
        tooltip.classList.remove(`ant-tooltip-placement-${className}`)
        tooltip.classList.remove('zoom-big-fast-leave')
        tooltip.classList.remove('zoom-big-fast-leave-active')
      }, animationDelay)
    })
  }
}

export default {name: 'permission', directive: Permission}
