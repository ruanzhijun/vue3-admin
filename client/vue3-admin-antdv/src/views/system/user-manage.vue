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
      <FormItem ref="name" label="管理员用户名" name="name" v-bind="validateInfoSearch.name">
        <Input v-model:value="searchForm.name" placeholder="搜索管理员用户名" allow-clear @change="onSearchNameChange"/>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="onSearch">查询</Button>
      </FormItem>
    </Form>
  </Space>
  <div class="line"/>
  <Table bordered :data-source="adminList" :columns="columns" :loading="tableLoading" :pagination="pagination">
    <template #bodyCell="{column, text, record}">
      <template v-if="column.dataIndex === 'email'">
        {{ record.email }}
        <Tag color="rgb(0, 187, 34)" v-if="store.adminInfo.username === record.username">这是您</Tag>
      </template>
      <template v-if="column.dataIndex === 'roleNames'">{{ text.join('、') }}</template>
      <template v-if="column.dataIndex === 'status'">
        <Tag color="green" v-if="record.status === 'enable'">{{ record.status === 'enable' ? '正常' : '' }}</Tag>
        <Tag color="red" v-if="record.status === 'frozen'">{{ record.status === 'frozen' ? '冻结' : '' }}</Tag>
      </template>
      <template v-if="column.dataIndex === 'creatTime'">{{ text ? format(record.creatTime) : '--' }}</template>
      <template v-if="column.dataIndex === 'lastLoginTime'">{{ record.lastLoginTime ? format(record.lastLoginTime) : '--' }}</template>
      <template v-if="column.dataIndex === 'lastLoginInfo'">{{ record.lastLoginIp }}<br/><span class="gray-font-color">{{ record.lastLoginArea }}</span></template>
      <template v-if="column.dataIndex === 'operate'">
        <Space>
          <div v-permission="'modify-admin'">
            <Button size="small" type="primary" @click="onModify(record.id)">编辑</Button>
          </div>
          <div v-permission="'delete-admin'">
            <Tooltip placement="topRight" title="不能删除自己" v-if="store.adminInfo.username === record.username">
              <Button size="small" disabled>删除</Button>
            </Tooltip>
            <Popconfirm v-else cancelText="取消" okText="确认" title="确认删除吗？" @confirm="() => confirmDelete(record.id)">
              <Button size="small" danger>删除</Button>
            </Popconfirm>
          </div>
        </Space>
      </template>
    </template>
  </Table>
  <Modal v-model:open="modalVisible" :title="modalTitle" :closable="true" :keyboard="false" :maskClosable="false" :footer="null" :destroyOnClose="true" :width="700" @cancel="onCancel">
    <Form :model="form" :rules="rules" :label-col="{span:5}" :wrapper-col="{span:16}">
      <Input v-model:value="form.id" style="display:none"/>
      <FormItem ref="name" label="管理员登录邮箱" name="email" v-bind="validateInfos.email">
        <Input v-model:value="form.email" :disabled="emailDisabled" placeholder="请输入管理员登邮箱" readonly onfocus="this.removeAttribute('readonly');" onblur="this.setAttribute('readonly',true);"/>
      </FormItem>
      <FormItem ref="name" label="管理员名称" name="email" v-bind="validateInfos.username">
        <Input v-model:value="form.username" placeholder="管理员名称" readonly onfocus="this.removeAttribute('readonly');" onblur="this.setAttribute('readonly',true);"/>
      </FormItem>
      <FormItem ref="status" label="管理员状态" name="status" v-bind="validateInfos.status" v-if="emailDisabled">
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
import {Button, Checkbox, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag, Tooltip} from 'ant-design-vue'
import {onMounted, reactive, ref} from 'vue'
import {AccountApi} from '../../api'
import {AdminStore} from '../../store'
import {queryString, format, updateRouter, usePagination} from '../../util'

const store = AdminStore()
const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group

// 变量
const columns = [
  {title: '管理员登录邮箱', width: '250px', dataIndex: 'email'},
  {title: '管理员名称', width: '120px', dataIndex: 'username'},
  {title: '管理员角色', dataIndex: 'roleNames'},
  {title: '状态', dataIndex: 'status', width: '70px'},
  {title: '账号创建时间', dataIndex: 'createTime', width: '170px'},
  {title: '最后登录时间', dataIndex: 'lastLoginTime', width: '170px'},
  {title: '最后登录ip', dataIndex: 'lastLoginIp', width: '135px'},
  {title: '操作', dataIndex: 'operate', width: '150px'}
]

const rules = reactive({
  id: [{required: false}],
  email: [{required: true, message: '请输入管理员登录邮箱', trigger: ['change', 'blur']}],
  username: [{required: true, message: '请输入管理员名称', trigger: ['change', 'blur']}],
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
const emailDisabled = ref(false)
const currentAdminStatus = ref(false)
const pagination = usePagination(() => getAdminList())

// 弹窗
const modalVisible = ref(false)
const modalTitle = ref('')
const options = ref([] as any[])
const checkedKeys = ref([] as string[])
const form = reactive({id: '', email: '', username: '', password: '', status: 'enable', roleId: [] as string[]})
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
  emailDisabled.value = false
  currentAdminStatus.value = true
  modalTitle.value = '新增管理员'
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
      result = await AccountApi.addAdmin(values.email, values.username, values.roleId)
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
  emailDisabled.value = true
  modalTitle.value = '编辑管理员'
  const {email, status, username} = data
  form.id = adminId
  form.email = email
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
