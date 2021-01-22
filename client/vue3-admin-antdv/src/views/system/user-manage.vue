<template>
  <a-space>
    <div v-permission="'create-admin'">
      <a-button type="primary" @click="onCreate"> + 新增管理员</a-button>
    </div>
    <a-button @click="onRefresh">刷新</a-button>
  </a-space>
  <div class="line"/>
  <a-space>
    <a-form :model="searchForm" layout="inline">
      <a-form-item ref="name" label="管理员登录名" name="name" v-bind="validateInfoSearch.name">
        <a-input v-model:value="searchForm.name" placeholder="搜索管理员登录名" allow-clear @change="onSearchNameChange"/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="onSearch">查询</a-button>
      </a-form-item>
    </a-form>
  </a-space>
  <div class="line"/>
  <a-table bordered :data-source="adminList" :columns="columns" :loading="tableLoading" :pagination="pagination">
    <template slot="username" v-slot:username="{text, record}">{{ text }}
      <a-tag color="rgb(0, 187, 34)" v-if="store.getters[GetAdminInfo].username === text">这是您</a-tag>
    </template>
    <template slot="roleNames" v-slot:roleNames="{text, record}">{{ text.join('、') }}</template>
    <template slot="status" v-slot:status="{text, record}">
      <a-tag color="green" v-if="record.status === 'enable'">{{ record.status === 'enable' ? '正常' : '' }}</a-tag>
      <a-tag color="red" v-if="record.status === 'frozen'">{{ record.status === 'frozen' ? '冻结' : '' }}</a-tag>
    </template>
    <template slot="createTime" v-slot:createTime="{text}">{{ text ? format(text) : '--' }}</template>
    <template slot="lastLoginTime" v-slot:lastLoginTime="{text}">{{ text ? format(text) : '--' }}</template>
    <template slot="lastLoginInfo" v-slot:lastLoginInfo="{text, record}">{{ record.lastLoginIp }}<br/><span class="last-login-area">{{ record.lastLoginArea }}</span></template>
    <template slot="operate" v-slot:operate="{text, record}">
      <a-space>
        <div v-permission="'modify-admin'">
          <a-button size="small" type="primary" @click="onModify(record.id)">编辑</a-button>
        </div>
        <div v-permission="'delete-admin'">
          <a-popconfirm cancelText="取消" okText="确认" title="确认删除吗？" @confirm="() => confirmDelete(record.id)">
            <a-button size="small" type="danger">删除</a-button>
          </a-popconfirm>
        </div>
      </a-space>
    </template>
  </a-table>
  <a-modal v-model:visible="modalVisible" :title="modalTitle" :closable="true" :keyboard="false" :maskClosable="false" :footer="null" :destroyOnClose="true" :width="600" @cancel="onCancel">
    <a-form :model="form" :rules="rules" :label-col="{span:5}" :wrapper-col="{span:16}">
      <a-input v-model:value="form.id" style="display:none"/>
      <a-form-item ref="name" label="管理员登录名" name="username" v-bind="validateInfos.username">
        <a-input v-model:value="form.username" :disabled="usernameDisabled" placeholder="请输入管理员登录名"/>
      </a-form-item>
      <a-form-item ref="password" label="管理员登密码" name="password" v-bind="validateInfos.password">
        <a-input type="password" v-model:value="form.password" placeholder="请输入管理员登密码"/>
      </a-form-item>
      <a-form-item ref="status" label="管理员状态" name="status" v-bind="validateInfos.status" v-if="usernameDisabled">
        <a-switch checked-children="正常" un-checked-children="冻结" v-model:checked="currentAdminStatus" @change="onCheck"/>
      </a-form-item>
      <a-form-item ref="roleId" label="管理员角色" name="roleId" v-bind="validateInfos.roleId">
        <a-checkbox-group :options="allRole" v-model:value="currentAdminRole" @change="onChangeRole"/>
      </a-form-item>
      <a-form-item :wrapper-col="{span:14,offset:4}">
        <a-space>
          <a-button type="primary" @click="onSubmit" :loading="submitLoading">提交</a-button>
          <a-button @click="onCancel">取消</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </a-modal>
</template>


<script lang="ts">
import {useForm} from '@ant-design-vue/use'
import {AutoComplete, Button, Checkbox, Col, Empty, Form, Input, Modal, Pagination, Popconfirm, Popover, Row, Space, Switch, Table, Tabs, Tag, Tooltip, Tree} from 'ant-design-vue'
import {defineComponent, onMounted, reactive, ref} from 'vue'
import {AccountApi} from '../../api'
import {DefaultPageSize, GetAdminInfo} from '../../constant'
import store from '../../store'
import {format, queryString, updateRouter, usePagination} from '../../util'

export default defineComponent({
  components: {
    'a-tag': Tag,
    'a-col': Col,
    'a-row': Row,
    'a-checkbox': Checkbox,
    'a-checkbox-group': Checkbox.Group,
    'a-switch': Switch,
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
    const pageSize = ref(parseInt(query && query.pageSize ? query.pageSize.toString() : '0') || DefaultPageSize)
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
    const {resetFields, validate, validateInfos} = useForm(form, rules)
    const {validate: validateSearch, validateInfos: validateInfoSearch} = useForm(searchForm, searchRules)

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
          onRefresh()
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
        onRefresh()
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

    return {
      store, GetAdminInfo,
      columns, current, total, allRole, currentAdminRole, adminList, tableLoading, submitLoading,
      pagination, currentAdminStatus, usernameDisabled, modalVisible, modalTitle, form, rules, searchRules,
      searchForm, options, checkedKeys, onChangeRole,
      onRefresh, onCreate, onSubmit, onCancel, onModify, confirmDelete, resetFields, validateInfos,
      format, onCheck, onSearch, onSearchNameChange, validateInfoSearch
    }
  }
})
</script>
<style scoped>
.last-login-area {
  font-size: 10px;
  color: #ccc;
}
</style>
