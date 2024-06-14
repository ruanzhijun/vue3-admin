<template>
  <Space>
    <Button type="primary" @click="onCreate"> + 新增配置</Button>
    <Button @click="onRefresh">刷新</Button>
  </Space>
  <br/><br/>
  <Empty v-if="globalConfig.length === 0"/>
  <Tabs v-if="globalConfig.length > 0">
    <TabsTabPane v-for="data in globalConfig" :key="data.module" :tab="data.module">
      <Table bordered :data-source="data.config" :columns="columns" :pagination="false" :loading="tableLoading">
        <template #bodyCell="{column, text, record}">
          <template v-if="column.dataIndex === 'operate'">
            <Space>
              <Button size="small" type="primary" @click="onModify(record.id)">修改</Button>
              <Popconfirm cancelText="取消" okText="确认" title="确认删除吗？" @confirm="() => confirmDelete(record.id)">
                <Button size="small" danger>删除</Button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </TabsTabPane>
  </Tabs>
  <Modal v-model:open="modalVisible" :title="modalTitle" :closable="true" :keyboard="false" :maskClosable="false" :footer="null" :destroyOnClose="true" @cancel="onCancel">
    <Form :model="form" :rules="rules" :label-col="{span:4}" :wrapper-col="{span:16}">
      <Input v-model:value="form.key" style="display:none"/>
      <FormItem ref="module" label="所属模块" name="module" v-bind="validateInfos.module">
        <AutoComplete v-model:value="form.module" :data-source="modules" :disabled="moduleInputDisabled"/>
      </FormItem>
      <FormItem ref="key" label="配置KEY" name="key" v-bind="validateInfos.key">
        <Input v-model:value="form.key" :disabled="keyInputDisabled"/>
      </FormItem>
      <FormItem ref="value" label="配置数值" name="value" v-bind="validateInfos.value">
        <Input v-model:value="form.value"/>
      </FormItem>
      <FormItem ref="desc" label="配置说明" name="desc" v-bind="validateInfos.desc">
        <Input v-model:value="form.desc"/>
      </FormItem>
      <FormItem :wrapper-col="{span:14,offset:4}">
        <Space>
          <Button type="primary" :loading="submitLoading" @click="onSubmit">提交</Button>
          <Button @click="onCancel">取消</Button>
        </Space>
      </FormItem>
    </Form>
  </Modal>
</template>

<script lang="ts" setup>
import {AutoComplete, Button, Empty, Form, Input, Modal, Popconfirm, Space, Table, Tabs} from 'ant-design-vue'
import {onMounted, reactive, ref} from 'vue'
import {SystemApi} from '../../api'

const FormItem = Form.Item
const TabsTabPane = Tabs.TabPane

const columns = [
  {title: '配置KEY', dataIndex: 'key', width: '30%'},
  {title: '配置数值', dataIndex: 'value'},
  {title: '配置说明', dataIndex: 'desc'},
  {title: '操作', dataIndex: 'operate', width: '150px'}
]

const rules = reactive({
  id: [{required: false}],
  module: [{required: true, message: '请输入所属模块', trigger: ['change', 'blur']}],
  key: [{required: true, message: '请输入配置KEY', trigger: ['change', 'blur']}],
  value: [{required: true, message: '请输入配置值', trigger: ['change', 'blur']}],
  desc: [{required: true, message: '请输入配置说明', trigger: ['change', 'blur']}]
})

// 状态
const globalConfig = ref<{module: string, config: {id: string, module: string, key: string, value: string, desc: string}[]}[]>([])
const modules = ref([] as string[])
const tableLoading = ref(false)
const submitLoading = ref(false)
const modalVisible = ref(false)
const moduleInputDisabled = ref(false)
const keyInputDisabled = ref(false)
const modalTitle = ref('')
const form = reactive({id: '', module: '', key: '', value: '', desc: ''})
const {validate, resetFields, validateInfos} = Form.useForm(form, rules)

// 生命周期
onMounted(() => getGlobalConfig())

// 方法定义
const getGlobalConfig = async () => {
  tableLoading.value = true
  modules.value.length = 0
  globalConfig.value = await SystemApi.getGlobalConfig()
  globalConfig.value.forEach(v => modules.value.push(v.module))
  tableLoading.value = false
}

const onCreate = () => {
  resetFields()
  modalVisible.value = true
  moduleInputDisabled.value = false
  keyInputDisabled.value = false
  modalTitle.value = '新增配置'
}

const onRefresh = () => getGlobalConfig()

const onSubmit = (e: any) => {
  e.preventDefault()
  validate().then(async (values) => {
    let result
    submitLoading.value = true
    const {id} = values
    if (id) {
      result = await SystemApi.updateGlobalConfig(id, values)
    } else {
      result = await SystemApi.saveGlobalConfig(values)
    }
    submitLoading.value = false

    if (result) {
      await getGlobalConfig()
      onCancel()
    }
  }).catch(err => err)
}

const onCancel = () => {
  modalVisible.value = false
  resetFields()
}

const onModify = (id: string) => {
  modalVisible.value = true
  moduleInputDisabled.value = true
  keyInputDisabled.value = true
  modalTitle.value = '修改配置'
  const data = {} as any
  for (const module of globalConfig.value) {
    const findOne = module.config.find(v => v.id === id)
    if (findOne) {
      Object.assign(data, findOne)
      break
    }
  }
  const {module, key, value, desc} = data
  form.id = id
  form.module = module
  form.key = key
  form.value = value
  form.desc = desc
}

const confirmDelete = async (id: string) => {
  const result = await SystemApi.deleteGlobalConfig(id)
  if (result === 1) {
    await onRefresh()
  }
}

</script>
