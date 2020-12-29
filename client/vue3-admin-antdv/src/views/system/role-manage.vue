<template>
  <a-space>
    <div v-permission="'create-role'">
      <a-button type="primary" @click="onCreate"> + 新增角色</a-button>
    </div>
    <a-button @click="onRefresh">刷新</a-button>
  </a-space>
  <br/><br/>
  <a-table bordered :data-source="roleList" :columns="columns" :loading="loading" :pagination="pagination">
    <template slot="status" v-slot:status="{text, record}">
      <a-tag color="green" v-if="record.status === 'enable'">{{ record.status === 'enable' ? '正常' : '' }}</a-tag>
      <a-tag color="red" v-if="record.status === 'frozen'">{{ record.status === 'frozen' ? '冻结' : '' }}</a-tag>
    </template>
    <template slot="authority" v-slot:authority="{text, record}">
      <div v-for="option in record.name === '超级管理员' ? options: parseAuthority(record.authority)" class="authority-page">
        <div class="role-module">
          <a-tag color="red" :key="option.key" class="authority-tag">{{ option.title }}</a-tag>
        </div>
        <div class="role-page">
          <div v-for="page in option.children" class="authority-tag">
            <a-popover v-if="page.children.length > 0">
              <template v-slot:content>
                <a-tag color="cyan" v-for="component in page.children" :key="component.key">{{ component.title }}</a-tag>
              </template>
              <a-tag color="blue" :key="page.key">{{ page.title }}</a-tag>
            </a-popover>
            <a-tag color="blue" v-else :key="page.key">{{ page.title }}</a-tag>
          </div>
        </div>
        <br>
      </div>
    </template>
    <template slot="format" v-slot:format="{text}">{{ format(text) }}</template>
    <template slot="operate" v-slot:operate="{text, record}">
      <div v-if="record.name === '超级管理员'">
        <a-space>
          <a-tooltip placement="topLeft" title="超管角色不能编辑">
            <a-button size="small" disabled="true">编辑</a-button>
          </a-tooltip>
          <a-tooltip placement="topLeft" title="超管角色不能删除">
            <a-button size="small" disabled="true">删除</a-button>
          </a-tooltip>
        </a-space>
      </div>
      <div class="normal" v-if="record.name !== '超级管理员'">
        <a-space>
          <div v-permission="'modify-role'">
            <a-button size="small" type="primary" @click="onModify(record.id)">编辑</a-button>
          </div>
          <div v-permission="'delete-role'">
            <a-popconfirm cancelText="取消" okText="确认" title="确认删除吗？" @confirm="() => confirmDelete(record.id)">
              <a-button size="small" type="danger">删除</a-button>
            </a-popconfirm>
          </div>
        </a-space>
      </div>
    </template>
  </a-table>
  <a-modal v-model:visible="modalVisible" :title="modalTitle" :closable="true" :keyboard="false" :maskClosable="false" :footer="null" :destroyOnClose="true" :width="600" @cancel="onCancel">
    <a-form :model="form" :rules="rules" :label-col="{span:4}" :wrapper-col="{span:16}">
      <a-input v-model:value="form.id" style="display:none"/>
      <a-form-item ref="name" label="角色名称" name="name" v-bind="validateInfos.name">
        <a-input v-model:value="form.name"/>
      </a-form-item>
      <a-form-item ref="authority" label="角色权限" name="authority" v-bind="validateInfos.authority">
        <a-tree checkable :defaultExpandAll="true" :tree-data="options" :default-checked-keys="checkedKeys" @check="onCheck"/>
      </a-form-item>
      <a-form-item :wrapper-col="{span:14,offset:4}">
        <a-space>
          <a-button type="primary" @click="onSubmit">提交</a-button>
          <a-button @click="onCancel">取消</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="ts">
import {useForm} from '@ant-design-vue/use'
import {AutoComplete, Button, Empty, Form, Input, Modal, Pagination, Popconfirm, Popover, Space, Table, Tabs, Tag, Tooltip, Tree} from 'ant-design-vue'
import {defineComponent, onMounted, reactive, ref, toRaw} from 'vue'
import {AccountApi} from '../../api'
import {PageSizeOptions} from '../../constant'
import {getDescriptionByName, getModuleByPageName, getPageByComponentName, getRouters, getUrlByComponentName} from '../../router'
import {format} from '../../util'

export default defineComponent({
  components: {
    'a-tag': Tag,
    'a-popover': Popover,
    'a-tooltip': Tooltip,
    'a-tree': Tree,
    'a-directory-tree': Tree.DirectoryTree,
    'a-tree-node': Tree.TreeNode,
    'a-space': Space,
    'a-form': Form,
    'a-form-item': Form.Item,
    'a-input': Input,
    'a-auto-complete': AutoComplete,
    'a-empty': Empty,
    'a-modal': Modal,
    'a-button': Button,
    'a-pagination': Pagination,
    'a-popconfirm': Popconfirm,
    'a-tabs': Tabs,
    'a-tab-pane': Tabs.TabPane,
    'a-table': Table
  },
  setup() {
    // 变量
    const columns = [
      {title: '角色名称', dataIndex: 'name', width: '150px'},
      {title: '关联人数', dataIndex: 'relations', width: '90px'},
      {title: '状态', dataIndex: 'status', width: '70px', slots: {customRender: 'status'}},
      {title: '权限列表', dataIndex: 'authority', slots: {customRender: 'authority'}},
      {title: '创建时间', dataIndex: 'createTime', width: '160px', slots: {customRender: 'format'}},
      {title: '操作', dataIndex: 'operate', width: '180px', slots: {customRender: 'operate'}}
    ]

    const rules = reactive({
      id: [{required: false}],
      name: [{required: true, message: '请输入角色名称', trigger: ['change', 'blur']}],
      authority: [{required: true}]
    })

    // 状态
    const roleList = ref([] as any[])
    const current = ref(1)
    const total = ref(-1)
    const pageSize = ref(0)
    const loading = ref(false)
    const pagination = ref({
      current,
      total,
      pageSize: parseInt(PageSizeOptions[0]),
      showSizeChanger: true,
      pageSizeOptions: PageSizeOptions,
      showTotal: (total: number) => `共 ${total} 条`,
      onChange: (page: number): void => {
        current.value = page
        getRoleList()
      },
      onShowSizeChange: (current: number, size: number): void => {
        pageSize.value = size
        getRoleList()
      }
    })

    // 弹窗
    const modalVisible = ref(false)
    const modalTitle = ref('')
    const options = ref([] as any[])
    const checkedKeys = ref([] as string[])
    const form = reactive({id: '', name: '', authority: [] as string[]})
    const {resetFields, validate, validateInfos} = useForm(form, rules)

    for (const router of getRouters()) {
      const route = {title: router.meta?.name, key: router.name, children: [] as any[]}
      for (const children of router.children || []) {
        const meta = children.meta || {}
        const child = {title: meta.name, key: children.name, children: [] as any[]}
        for (const item of meta.authority || []) {
          child.children.push({title: item.desc, key: item.name})
        }
        route.children.push(child)
      }
      options.value.push(route)
    }

    // 生命周期
    onMounted(() => getRoleList())

    // 方法定义
    const getRoleList = async () => {
      loading.value = true
      const data = await AccountApi.getRoleList(pagination.value.current, pagination.value.pageSize)
      roleList.value = data.list
      pagination.value.total = total.value = data.total
      loading.value = false
    }

    const validateFormAuthority = (authority: string[]): boolean => {
      const urls = new Set<string>()
      const pages = new Set<string>()
      const components = new Set<string>()
      for (const item of authority) {
        const url = getUrlByComponentName(item)
        const page = getPageByComponentName(item)
        const isPage = !url && !!getModuleByPageName(item)
        const isComponent = !!url && !getModuleByPageName(item)
        if (Array.isArray(url) && url.length > 0) {
          url.forEach(v => urls.add(v))
        }
        if (page) {
          pages.add(page)
        }
        if (isPage) {
          pages.add(item)
        }
        if (isComponent) {
          components.add(item)
        }
      }
      const data = {pages: Array.from(pages), components: Array.from(components), urls: Array.from(urls)}
      const isUnCheckedAuthority = data.pages.length <= 0 && data.components.length <= 0 && data.urls.length <= 0
      if (isUnCheckedAuthority) {
        validateInfos.authority.required = true
        validateInfos.authority.validateStatus = 'error'
        validateInfos.authority.help = '请选择角色权限'
      }

      return !isUnCheckedAuthority
    }

    const onRefresh = () => getRoleList()

    const onCreate = () => {
      resetFields()
      modalVisible.value = true
      modalTitle.value = '新增角色'
    }

    const onSubmit = (e: any) => {
      e.preventDefault()
      validate().then(async (values) => {
        const urls = new Set<string>()
        const pages = new Set<string>()
        const components = new Set<string>()
        for (const item of form.authority) {
          const url = getUrlByComponentName(item)
          const page = getPageByComponentName(item)
          const isPage = !url && !!getModuleByPageName(item)
          const isComponent = !!url && !getModuleByPageName(item)
          if (Array.isArray(url) && url.length > 0) {
            url.forEach(v => urls.add(v))
          }
          if (page) {
            pages.add(page)
          }
          if (isPage) {
            pages.add(item)
          }
          if (isComponent) {
            components.add(item)
          }
        }
        const authority = {pages: Array.from(pages), components: Array.from(components), urls: Array.from(urls)}
        const flag = validateFormAuthority(form.authority)
        if (flag) {
          const {id} = values
          let result: number
          if (id) {
            result = await AccountApi.editRole(id, values.name, authority)
          } else {
            result = await AccountApi.addRole(values.name, authority)
          }
          if (result === 1) {
            onRefresh()
            onCancel()
          }
        }
      }).catch(() => validateFormAuthority(form.authority))
    }

    const onCheck = (selectedKeys: string[]) => {
      form.authority = selectedKeys
    }

    const onCancel = () => {
      modalVisible.value = false
      checkedKeys.value = []
      resetFields()
    }

    const onModify = (id: string) => {
      const data = roleList.value.find(v => v.id === id)
      modalVisible.value = true
      modalTitle.value = '编辑角色'
      const {name, authority} = data
      form.id = id
      form.name = name

      let tmp: any = {}
      for (const page of authority.pages) {
        tmp[page] = null
      }
      for (const component of authority.components) {
        const pagaName = getPageByComponentName(component)
        if (!!pagaName) {
          delete tmp[pagaName]
        }
      }
      form.authority = checkedKeys.value = authority.components.concat(Object.keys(tmp))
    }

    const confirmDelete = async (id: string) => {
      const result = await AccountApi.deleteRole(id)
      if (result === 1) {
        onRefresh()
      }
    }

    const parseAuthority = (data: any) => {
      const authority = toRaw(data) as {pages: string[], components: string[]}
      const roleAuthority: any = {}
      for (const p of authority.pages) {
        const moduleName = getModuleByPageName(p)
        const pageDescription = getDescriptionByName(p)
        const moduleDescription = getDescriptionByName(moduleName)
        const page = {title: pageDescription, key: p, children: {}}
        roleAuthority[moduleName] = roleAuthority[moduleName] || {title: moduleDescription, key: moduleName, children: {}}
        roleAuthority[moduleName].children[p] = page
      }
      for (const c of authority.components) {
        const pageName = getPageByComponentName(c)
        const moduleName = getModuleByPageName(pageName)
        const module = roleAuthority[moduleName] || {title: getDescriptionByName(moduleName), key: moduleName, children: {}}
        const page = module.children[pageName] || {title: getDescriptionByName(pageName), key: pageName, children: {}}
        page.children[c] = {title: getDescriptionByName(c), key: c}
      }

      let modules: any = Object.values(roleAuthority)
      for (const module of modules) {
        module.children = Object.values(module.children)
        for (const page of module.children) {
          page.children = Object.values(page.children)
        }
      }
      return roleAuthority
    }

    return {
      columns, current, total, roleList, loading, pagination,
      modalVisible, modalTitle, form, rules, options, checkedKeys,
      onRefresh, onCreate, onSubmit, onCancel, onModify, confirmDelete, resetFields, validateInfos,
      format, onCheck, parseAuthority
    }
  }
})
</script>
<style scoped>
.ant-tag {
  cursor: pointer
}

.role-page {
  width: 100%;
}

.authority-tag {
  float: left
}

.authority-page {
  clear: both;
  height: 28px;
}
</style>
