<template>
  <Space>
    <div v-permission="'create-admin'">
      <Button type="primary" @click="onCreate"> + 新增管理员</Button>
    </div>
    <Button @click="onRefresh">刷新</Button>
  </Space>
  <div class="line"/>
  <Space>
    <Form :model="searchForm" layout="inline">
      <FormItem ref="name" label="管理员登录名" name="name" v-bind="validateInfoSearch.name">
        <Input v-model:value="searchForm.name" placeholder="搜索管理员登录名" allow-clear @change="onSearchNameChange"/>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="onSearch">查询</Button>
      </FormItem>
    </Form>
  </Space>
  <div class="line"/>
  <Table bordered :data-source="adminList" :columns="columns" :loading="tableLoading" :pagination="pagination">
    <template slot="username" v-slot:username="{text, record}">{{ text }}
      <Tag color="rgb(0, 187, 34)" v-if="store.getters[GetAdminInfo].username === text">这是您</Tag>
    </template>
    <template slot="roleNames" v-slot:roleNames="{text, record}">{{ text.join('、') }}</template>
    <template slot="status" v-slot:status="{text, record}">
      <Tag color="green" v-if="record.status === 'enable'">{{ record.status === 'enable' ? '正常' : '' }}</Tag>
      <Tag color="red" v-if="record.status === 'frozen'">{{ record.status === 'frozen' ? '冻结' : '' }}</Tag>
    </template>
    <template slot="createTime" v-slot:createTime="{text}">{{ text ? format(text) : '--' }}</template>
    <template slot="lastLoginTime" v-slot:lastLoginTime="{text}">{{ text ? format(text) : '--' }}</template>
    <template slot="lastLoginInfo" v-slot:lastLoginInfo="{text, record}">{{ record.lastLoginIp }}<br/><span class="gray-font-color">{{ record.lastLoginArea }}</span></template>
    <template slot="operate" v-slot:operate="{text, record}">
      <Space>
        <div v-permission="'modify-admin'">
          <Button size="small" type="primary" @click="onModify(record.id)">编辑</Button>
        </div>
        <div v-permission="'delete-admin'">
          <Popconfirm cancelText="取消" okText="确认" title="确认删除吗？" @confirm="() => confirmDelete(record.id)">
            <Button size="small" type="danger">删除</Button>
          </Popconfirm>
        </div>
      </Space>
    </template>
  </Table>
  <Modal v-model:visible="modalVisible" :title="modalTitle" :closable="true" :keyboard="false" :maskClosable="false" :footer="null" :destroyOnClose="true" :width="600" @cancel="onCancel">
    <Form :model="form" :rules="rules" :label-col="{span:5}" :wrapper-col="{span:16}">
      <Input v-model:value="form.id" style="display:none"/>
      <FormItem ref="name" label="管理员登录名" name="username" v-bind="validateInfos.username">
        <Input v-model:value="form.username" :disabled="usernameDisabled" placeholder="请输入管理员登录名"/>
      </FormItem>
      <FormItem ref="password" label="管理员登密码" name="password" v-bind="validateInfos.password">
        <Input type="password" v-model:value="form.password" placeholder="请输入管理员登密码"/>
      </FormItem>
      <FormItem ref="status" label="管理员状态" name="status" v-bind="validateInfos.status" v-if="usernameDisabled">
        <Switch checked-children="正常" un-checked-children="冻结" v-model:checked="currentAdminStatus" @change="onCheck"/>
      </FormItem>
      <FormItem ref="roleId" label="管理员角色" name="roleId" v-bind="validateInfos.roleId">
        <CheckboxGroup :options="allRole" v-model:value="currentAdminRole" @change="onChangeRole"/>
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
import {Button, Checkbox, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag} from 'ant-design-vue'
import {onMounted, reactive, ref} from 'vue'
import {AccountApi} from '../../api'
import {GetAdminInfo} from '../../constant'
import store from '../../store'
import {queryString, format, updateRouter, usePagination} from '../../util'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group

// 变量
const columns = [
  {title: '管理员登录名', width: '200px', dataIndex: 'username', slots: {customRender: 'username'}},
  {title: '管理员角色', dataIndex: 'roleNames', slots: {customRender: 'roleNames'}},
  {title: '状态', dataIndex: 'status', width: '70px', slots: {customRender: 'status'}},
  {title: '账号创建时间', dataIndex: 'createTime', width: '170px', slots: {customRender: 'createTime'}},
  {title: '最后登录时间', dataIndex: 'lastLoginTime', width: '170px', slots: {customRender: 'lastLoginTime'}},
  {title: '最后登录ip', dataIndex: 'lastLoginIp', width: '135px', slots: {customRender: 'lastLoginInfo'}},
  {title: '操作', dataIndex: 'operate', width: '150px', slots: {customRender: 'operate'}}
]

const rules = reactive({
  id: [{required: false}],
  username: [{required: true, message: '请输入管理员登录名', trigger: ['change', 'blur']}],
  password: [{required: false, message: '请输入管理员登录密码', trigger: ['change', 'blur']}],
  status: [{required: false}],
  roleId: [{required: true, message: '请至少选择一个管理员角色'}]
})

const searchRules = reactive({name: [{required: false}]})

// 状态
const adminList = ref([] as any[])
const allRole = ref([] as any[])
const currentAdminRole = ref([] as string[])
const query = queryString()
const current = ref(parseInt(query && query.page ? query.page.toString() : '0') || 1)
const total = ref(-1)
const tableLoading = ref(false)
const submitLoading = ref(false)
const usernameDisabled = ref(false)
const currentAdminStatus = ref(false)
const pagination = usePagination(() => getAdminList())

// 弹窗
const modalVisible = ref(false)
const modalTitle = ref('')
const options = ref([] as any[])
const checkedKeys = ref([] as string[])
const form = reactive({id: '', username: '', password: '', status: 'enable', roleId: [] as string[]})
const searchForm = reactive({name: query && query.name ? query.name.toString() : ''})
const {resetFields, validate, validateInfos} = Form.useForm(form, rules)
const {validate: validateSearch, validateInfos: validateInfoSearch} = Form.useForm(searchForm, searchRules)

// 生命周期
onMounted(() => getAdminList())

// 方法定义
const getAdminList = async () => {
  updateRouter({page: pagination.value.current, pageSize: pagination.value.pageSize, name: searchForm.name})
  tableLoading.value = true
  const data = await AccountApi.getAdminList(pagination.value.current, pagination.value.pageSize, searchForm.name)
  tableLoading.value = false
  adminList.value = data.list
  Object.assign(pagination.value, {total: data.total})
}

const onRefresh = () => getAdminList()

const onCreate = async () => {
  resetFields()
  modalVisible.value = true
  usernameDisabled.value = false
  currentAdminStatus.value = true
  modalTitle.value = '新增管理员'
  rules.password[0].required = true
  const serverRoleList = await AccountApi.getAllRole()
  allRole.value = serverRoleList.map(v => ({label: v.name, value: v.id}))
  currentAdminRole.value = []
}

const onSubmit = (e: any) => {
  e.preventDefault()
  validate().then(async (values) => {
    const {id} = values
    let result: number
    submitLoading.value = true
    if (id) {
      result = await AccountApi.editAdmin(id, values.username, values.password, values.roleId, values.status)
    } else {
      result = await AccountApi.addAdmin(values.username, values.password, values.roleId)
    }
    submitLoading.value = false
    if (result === 1) {
      await onRefresh()
      onCancel()
    }
  }).catch(e => e)
}

const onCheck = (selectedKeys: string[]) => {
  form.status = selectedKeys ? 'enable' : 'frozen'
}

const onCancel = () => {
  form.status = 'enable'
  rules.password[0].required = false
  modalVisible.value = false
  checkedKeys.value = []
  resetFields()
}

const onModify = async (adminId: string) => {
  const data = await AccountApi.getAdminDetail(adminId)
  const serverRoleList = await AccountApi.getAllRole()
  allRole.value = serverRoleList.map(v => ({label: v.name, value: v.id}))
  currentAdminRole.value = data.roleId || []
  modalVisible.value = true
  usernameDisabled.value = true
  modalTitle.value = '编辑管理员'
  rules.password[0].required = false
  const {username, status} = data
  form.id = adminId
  form.username = username
  form.status = status
  form.roleId = data.roleId
  currentAdminStatus.value = status === 'enable'
}

const confirmDelete = async (id: string) => {
  const result = await AccountApi.deleteAdmin(id)
  if (result === 1) {
    await onRefresh()
  }
}

const onChangeRole = (checkedValue: string[]) => form.roleId = checkedValue

const onSearch = (e: any) => {
  e.preventDefault()
  validateSearch().then(async (values) => {
    if (!values.name) {
      return
    }
    pagination.value.current = current.value = 1
    await getAdminList()
  }).catch(e => e)
}

const onSearchNameChange = async (e: any) => {
  e.preventDefault()
  if (!searchForm.name) {
    pagination.value.current = current.value = 1
    updateRouter({page: pagination.value.current, pageSize: pagination.value.pageSize})
    await getAdminList()
  }
}
</script>
