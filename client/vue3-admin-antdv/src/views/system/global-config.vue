<template>
  <a-space>
    <a-button type="primary" @click="onCreate"> + 新增配置</a-button>
    <a-button @click="onRefresh">刷新</a-button>
  </a-space>
  <br/><br/>
  <a-empty v-if="globalConfig.length === 0"/>
  <a-tabs v-if="globalConfig.length > 0">
    <a-tab-pane v-for="data in globalConfig" :key="data.module" :tab="data.module">
      <a-table bordered :data-source="data.config" :columns="columns" :pagination="false" :loading="loading">
        <template slot="operate" v-slot:operate="{text, record}">
          <a-space>
            <a-button size="small" type="primary" @click="onModify(record.id)">修改</a-button>
            <a-popconfirm cancelText="取消" okText="确认" title="确认删除吗？" @confirm="() => confirmDelete(record.id)">
              <a-button size="small" type="danger">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-tab-pane>
  </a-tabs>
  <a-modal v-model:visible="modalVisible" :title="modalTitle" :closable="true" :keyboard="false" :maskClosable="false" :footer="null" :destroyOnClose="true" @cancel="onCancel">
    <a-form :model="form" :rules="rules" :label-col="{span:4}" :wrapper-col="{span:16}">
      <a-input v-model:value="form.key" style="display:none"/>
      <a-form-item ref="module" label="所属模块" name="module" v-bind="validateInfos.module">
        <a-auto-complete v-model:value="form.module" :data-source="modules" :disabled="moduleInputDisabled"/>
      </a-form-item>
      <a-form-item ref="key" label="配置KEY" name="key" v-bind="validateInfos.key">
        <a-input v-model:value="form.key" :disabled="keyInputDisabled"/>
      </a-form-item>
      <a-form-item ref="value" label="配置数值" name="value" v-bind="validateInfos.value">
        <a-input v-model:value="form.value"/>
      </a-form-item>
      <a-form-item ref="desc" label="配置说明" name="desc" v-bind="validateInfos.desc">
        <a-input v-model:value="form.desc"/>
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
import {AutoComplete, Button, Empty, Form, Input, Modal, Popconfirm, Space, Table, Tabs} from 'ant-design-vue'
import {defineComponent, onMounted, reactive, ref} from 'vue'
import {SystemApi} from '../../api'

export default defineComponent({
  components: {
    'a-space': Space,
    'a-empty': Empty,
    'a-form': Form,
    'a-form-item': Form.Item,
    'a-input': Input,
    'a-auto-complete': AutoComplete,
    'a-modal': Modal,
    'a-button': Button,
    'a-popconfirm': Popconfirm,
    'a-tabs': Tabs,
    'a-tab-pane': Tabs.TabPane,
    'a-table': Table
  },
  setup() {
    // 变量
    const columns = [
      {title: '配置KEY', dataIndex: 'key', width: '30%'},
      {title: '配置数值', dataIndex: 'value'},
      {title: '配置说明', dataIndex: 'desc'},
      {title: '操作', dataIndex: 'operate', width: '180px', slots: {customRender: 'operate'}}
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
    const loading = ref(false)
    const modalVisible = ref(false)
    const moduleInputDisabled = ref(false)
    const keyInputDisabled = ref(false)
    const modalTitle = ref('')
    const form = reactive({id: '', module: '', key: '', value: '', desc: ''})
    const {validate, resetFields, validateInfos} = useForm(form, rules)

    // 生命周期
    onMounted(() => getGlobalConfig())

    // 方法定义
    const getGlobalConfig = async () => {
      loading.value = true
      modules.value.length = 0
      globalConfig.value = await SystemApi.getGlobalConfig()
      globalConfig.value.forEach(v => modules.value.push(v.module))
      loading.value = false
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
        const {id} = values
        if (id) {
          result = await SystemApi.updateGlobalConfig(id, values)
        } else {
          result = await SystemApi.saveGlobalConfig(values)
        }

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

    const confirmDelete = (id: string) => {
      SystemApi.deleteGlobalConfig(id).then(() => onRefresh())
    }

    return {
      columns, rules, loading,
      globalConfig, modalVisible, modalTitle, form, modules, moduleInputDisabled, keyInputDisabled, validateInfos,
      onRefresh, onCreate, onModify, onSubmit, onCancel, confirmDelete
    }
  }
})

</script>
