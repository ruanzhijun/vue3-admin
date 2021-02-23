<template>
  <a-space>
    <a-form :model="searchForm" layout="inline">
      <a-form-item ref="name" label="管理员" name="name" v-bind="validateInfos.name">
        <a-input v-model:value="searchForm.name" placeholder="搜索管理员" allow-clear @change="onSearchNameChange"/>
      </a-form-item>
      <a-form-item ref="date" label="日期" name="date" v-bind="validateInfos.date">
        <a-range-picker v-model:value="searchForm.date" @change="onDateChange">
          <template #suffixIcon>
            <CalendarOutlined/>
          </template>
        </a-range-picker>
      </a-form-item>
      <a-form-item ref="action" label="动作" name="action" v-bind="validateInfos.action">
        <a-select mode="multiple" style="width:200px" placeholder="请选择" :default-value="searchForm.action" @change="onSelectChange">
          <a-select-option v-for="url in Object.keys(urls)" :key="url">
            {{ urls[url] }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="onSearch">查询</a-button>
      </a-form-item>
    </a-form>
  </a-space>
  <div class="line"/>
  <a-table bordered :data-source="logList" :columns="columns" :loading="tableLoading" :pagination="pagination">
    <template slot="requestTime" v-slot:requestTime="{text}">{{ format(text) }}</template>
    <template slot="message" v-slot:message="{text, record}">{{ record.result }}<br/><span class="gray-font-color">{{ record.message }}</span></template>
    <template slot="ipArea" v-slot:ipArea="{text, record}">{{ record.ip }}<br/><span class="gray-font-color">{{ record.ipArea }}</span></template>
  </a-table>
</template>


<script lang="ts">
import {useForm} from '@ant-design-vue/use'
import {CalendarOutlined} from '@ant-design/icons-vue'
import {Button, DatePicker, Form, Input, Select, Space, Table, Tooltip} from 'ant-design-vue'
import {defineComponent, onMounted, reactive, ref} from 'vue'
import {SystemApi} from '../../api'
import {format, queryString, updateRouter, usePagination} from '../../util'

export default defineComponent({
  components: {
    CalendarOutlined,
    'a-form': Form,
    'a-space': Space,
    'a-input': Input,
    'a-table': Table,
    'a-button': Button,
    'a-select': Select,
    'a-tooltip': Tooltip,
    'a-form-item': Form.Item,
    'a-select-option': Select.Option,
    'a-range-picker': DatePicker.RangePicker
  },
  setup() {
    // 变量
    const columns = [
      {title: '管理员', width: '180px', dataIndex: 'name'},
      {title: '动作', width: '180px', dataIndex: 'action'},
      {title: '操作结果', dataIndex: 'result', slots: {customRender: 'message'}},
      {title: 'ip地址', width: '135px', dataIndex: 'ip', slots: {customRender: 'ipArea'}},
      {title: '操作时间', width: '170px', dataIndex: 'requestTime', slots: {customRender: 'requestTime'}}
    ]

    // 状态
    const query = queryString()
    const urls = ref([] as any[])
    const logList = ref([] as any[])
    const tableLoading = ref(false)
    const pagination = usePagination(() => getLogList())
    const current = ref(parseInt(query && query.page ? query.page.toString() : '0') || 1)

    // 表单
    const searchRules = reactive({
      name: [{required: false}],
      date: [{required: false}],
      action: [{required: false}]
    })
    const searchForm = reactive({
      name: query && query.name ? query.name.toString() : '',
      date: query && query.date ? query.date.split(',') : [] as string[],
      action: query && query.action ? query.action.split(',') : [] as string[]
    })
    const {validate, validateInfos} = useForm(searchForm, searchRules)

    // 生命周期
    onMounted(() => initUrlSelectData())

    // 方法定义
    const initUrlSelectData = async function () {
      urls.value = await SystemApi.getUrls()
      await getLogList()
    }

    const onSelectChange = function (value: string[]) {
      searchForm.action = value
      getLogList()
    }

    const onSearch = (e: any) => {
      e.preventDefault()
      validate().then(() => getLogList()).catch(e => e)
    }

    const onSearchNameChange = async (e: any) => {
      e.preventDefault()
      if (!searchForm.name) {
        pagination.value.current = current.value = 1
        updateRouter({page: pagination.value.current, pageSize: pagination.value.pageSize})
        await getLogList()
      }
    }

    const _updateRouter = () => {
      searchForm.date = Array.isArray(searchForm.date) ? searchForm.date.filter(v => !!v) : []
      updateRouter({
        page: pagination.value.current,
        pageSize: pagination.value.pageSize,
        name: searchForm.name,
        date: Array.isArray(searchForm.date) && searchForm.date.length === 2 ? `${searchForm.date.join(',')}` : undefined,
        action: Array.isArray(searchForm.action) && searchForm.action.length > 0 ? `${searchForm.action.join(',')}` : undefined
      })
    }

    const getLogList = async () => {
      _updateRouter()
      tableLoading.value = true
      const data = await SystemApi.getLogList(pagination.value.current, pagination.value.pageSize, searchForm.name, searchForm.date[0], searchForm.date[1], searchForm.action)
      tableLoading.value = false
      logList.value = data.list
      Object.assign(pagination.value, {total: data.total})
    }

    const onDateChange = function (date: any, dateString: any) {
      searchForm.date = dateString
      getLogList()
    }

    return {
      urls, pagination, searchForm, validate, validateInfos, tableLoading, logList, columns,
      format, onSearchNameChange, onDateChange, onSelectChange, onSearch
    }
  }
})
</script>

