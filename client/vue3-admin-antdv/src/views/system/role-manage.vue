<template>
  <Space>
    <div v-permission="'create-role'">
      <Button type="primary" @click="onCreate"> + 新增角色</Button>
    </div>
    <Button @click="onRefresh">刷新</Button>
  </Space>
  <div class="line"/>
  <Space>
    <Form :model="searchForm" layout="inline">
      <FormItem ref="name" label="角色名" name="name" v-bind="validateInfoSearch.name">
        <Input v-model:value="searchForm.name" placeholder="搜索角色名" allow-clear @change="onSearchNameChange"/>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="onSearch">查询</Button>
      </FormItem>
    </Form>
  </Space>
  <div class="line"/>
  <Table bordered :data-source="roleList" :columns="columns" :loading="tableLoading" :pagination="pagination">
    <template slot="status" v-slot:status="{text, record}">
      <Tag color="green" v-if="record.status === 'enable'">{{ record.status === 'enable' ? '正常' : '' }}</Tag>
      <Tag color="red" v-if="record.status === 'frozen'">{{ record.status === 'frozen' ? '冻结' : '' }}</Tag>
    </template>
    <template slot="authority" v-slot:authority="{text, record}">
      <div v-for="option in record.name === '超级管理员' ? options: parseAuthority(record.authority)" class="authority-page">
        <div class="role-module">
          <Tag color="red" :key="option.key" class="authority-tag">{{ option.title }}</Tag>
        </div>
        <div class="role-page">
          <div v-for="page in option.children" class="authority-tag">
            <Popover v-if="page.children.length > 0">
              <template v-slot:content>
                <Tag color="cyan" v-for="component in page.children" :key="component.key">{{ component.title }}</Tag>
              </template>
              <Tag color="blue" :key="page.key">{{ page.title }}</Tag>
            </Popover>
            <Tag color="blue" v-else :key="page.key">{{ page.title }}</Tag>
          </div>
        </div>
        <br>
      </div>
    </template>
    <template slot="format" v-slot:format="{text}">{{ format(text) }}</template>
    <template slot="operate" v-slot:operate="{text, record}">
      <div v-if="record.name === '超级管理员'">
        <Space>
          <Tooltip placement="topRight" title="超管角色不能编辑">
            <Button size="small" disabled>编辑</Button>
          </Tooltip>
          <Tooltip placement="topLeft" title="超管角色不能删除">
            <Button size="small" disabled>删除</Button>
          </Tooltip>
        </Space>
      </div>
      <div v-else>
        <Space>
          <div v-permission="'modify-role'">
            <Button size="small" type="primary" @click="onModify(record.id)">编辑</Button>
          </div>
          <div v-permission="'delete-role'">
            <Popconfirm cancelText="取消" okText="确认" title="确认删除吗？" @confirm="() => confirmDelete(record.id)">
              <Button size="small" danger>删除</Button>
            </Popconfirm>
          </div>
        </Space>
      </div>
    </template>
  </Table>
  <Modal v-model:visible="modalVisible" :title="modalTitle" :closable="true" :keyboard="false" :maskClosable="false" :footer="null" :destroyOnClose="true" :width="600" @cancel="onCancel">
    <Form :model="form" :rules="rules" :label-col="{span:4}" :wrapper-col="{span:16}">
      <Input v-model:value="form.id" style="display:none"/>
      <FormItem ref="name" label="角色名称" name="name" v-bind="validateInfos.name">
        <Input v-model:value="form.name"/>
      </FormItem>
      <FormItem ref="authority" label="角色权限" name="authority" v-bind="validateInfos.authority">
        <Tree checkable :defaultExpandAll="true" :tree-data="options" :default-checked-keys="checkedKeys" @check="onCheck"/>
      </FormItem>
      <FormItem :wrapper-col="{span:14,offset:4}">
        <Space>
          <Button type="primary" @click="onSubmit" :loading="submitLoading">提交</Button>
          <Button @click="onCancel">取消</Button>
        </Space>
      </FormItem>
    </Form>
  </Modal>
</template>
<script lang="ts" setup>
import {Button, Form, Input, Modal, Popconfirm, Popover, Space, Table, Tag, Tooltip, Tree} from 'ant-design-vue'
import {onMounted, reactive, ref, toRaw} from 'vue'
import {AccountApi} from '../../api'
import {getDescriptionByName, getModuleByPageName, getPageByComponentName, getRouters, getUrlByComponentName} from '../../router'
import {format, queryString, updateRouter, usePagination} from '../../util'

const FormItem = Form.Item

// 变量
const columns = [
  {title: '角色名称', dataIndex: 'name', width: '150px'},
  {title: '关联人数', dataIndex: 'relations', width: '90px'},
  {title: '权限列表', dataIndex: 'authority', slots: {customRender: 'authority'}},
  {title: '创建时间', dataIndex: 'createTime', width: '170px', slots: {customRender: 'format'}},
  {title: '操作', dataIndex: 'operate', width: '150px', slots: {customRender: 'operate'}}
]

const rules = reactive({
  id: [{required: false}],
  name: [{required: true, message: '请输入角色名称', trigger: ['change', 'blur']}],
  authority: [{required: true}]
})

const searchRules = reactive({name: [{required: false}]})

// 状态
const roleList = ref([] as any[])
const query = queryString()
const tableLoading = ref(false)
const submitLoading = ref(false)
const pagination = usePagination(() => getRoleList())

// 弹窗
const modalVisible = ref(false)
const modalTitle = ref('')
const options = ref([] as any[])
const checkedKeys = ref([] as string[])
const form = reactive({id: '', name: '', authority: [] as string[]})
const searchForm = reactive({name: query && query.name ? query.name.toString() : ''})
const {resetFields, validate, validateInfos} = Form.useForm(form, rules)
const {validate: validateSearch, validateInfos: validateInfoSearch} = Form.useForm(searchForm, searchRules)

for (const router of getRouters()) {
  const route = {title: router.meta?.name, key: router.name, children: [] as any[]}
  for (const children of router.children || []) {
    const meta = children.meta || {}
    const child = {title: meta.name, key: children.name, children: [] as any[]}
    for (const item of (meta.authority || []) as any[]) {
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
  updateRouter({page: pagination.value.current, pageSize: pagination.value.pageSize, name: searchForm.name})
  tableLoading.value = true
  const data = await AccountApi.getRoleList(pagination.value.current, pagination.value.pageSize, searchForm.name)
  tableLoading.value = false
  roleList.value = data.list
  Object.assign(pagination.value, {total: data.total})
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
      submitLoading.value = true
      if (id) {
        result = await AccountApi.editRole(id, values.name, authority)
      } else {
        result = await AccountApi.addRole(values.name, authority)
      }
      submitLoading.value = false
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
    await onRefresh()
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

const onSearch = (e: any) => {
  e.preventDefault()
  validateSearch().then(async (values) => {
    if (!values.name) {
      return
    }
    pagination.value.current = 1
    await getRoleList()
  }).catch(e => e)
}

const onSearchNameChange = async (e: any) => {
  e.preventDefault()
  if (!searchForm.name) {
    pagination.value.current = 1
    updateRouter({page: pagination.value.current, pageSize: pagination.value.pageSize})
    await getRoleList()
  }
}
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
