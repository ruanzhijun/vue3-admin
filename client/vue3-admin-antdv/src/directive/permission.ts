import {Directive} from 'vue'
import {GetAuthority} from '../constant'
import store from '../store'

const Permission: Directive = {
  mounted(el: any, binding: any) {
    const components = store.getters[GetAuthority].components || []
    if (components.length <= 0 || components.indexOf(binding.value) > -1) {
      return
    }

    const id = Math.random().toString(36).slice(2)
    const top = el.getBoundingClientRect().top - 195
    el.innerHTML = `<span id="role-${id}" style="display:inline-block;cursor:not-allowed">${el.innerHTML.replace('<button', '<button disabled style="pointer-events:none"')}<div id="${id}" class="ant-tooltip ant-tooltip-placement-topLeft role-manager-tooltip" style="top:${top < 0 ? 25 : top}px;display:none;"><div class="ant-tooltip-content"><div class="ant-tooltip-arrow"></div><div class="ant-tooltip-inner" role="tooltip">您没有权限，请联系管理员</div></div></div></span>`
    const warp = document.getElementById(`role-${id}`) as any
    const tooltip = document.getElementById(id) as any
    warp.addEventListener('mouseover', () => {
      tooltip.style.display = 'block'
    })
    warp.addEventListener('mouseout', () => {
      tooltip.style.display = 'none'
    })
  }
}

export default {name: 'permission', directive: Permission}
