<template>
  <Space>
    <Form :model="searchForm" layout="inline">
      <FormItem ref="name" label="搜索管理员" name="name" v-bind="validateInfos.name">
        <Input v-model:value="searchForm.name" placeholder="搜索管理员登录名" allow-clear @change="onSearchNameChange"/>
      </FormItem>
      <FormItem ref="date" label="日期" name="date" v-bind="validateInfos.date">
        <DatePickerRangePicker v-model:value="searchForm.date" @change="onDateChange">
          <template #suffixIcon>
            <CalendarOutlined/>
          </template>
        </DatePickerRangePicker>
      </FormItem>
      <FormItem ref="action" label="动作" name="action" v-bind="validateInfos.action">
        <Select mode="multiple" style="width:200px" placeholder="请选择" :default-value="searchForm.action" @change="onSelectChange">
          <SelectOption v-for="url in Object.keys(urls)" :key="url">
            {{ urls[url] }}
          </SelectOption>
        </Select>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="onSearch">查询</Button>
      </FormItem>
    </Form>
  </Space>
  <div class="line"/>
  <Table bordered :data-source="logList" :columns="columns" :loading="tableLoading" :pagination="pagination">
    <template slot="requestTime" v-slot:requestTime="{text}">{{ format(text) }}</template>
    <template slot="message" v-slot:message="{text, record}">{{ record.result }}<br/><span class="gray-font-color">{{ record.message }}</span></template>
    <template slot="ipArea" v-slot:ipArea="{text, record}">{{ record.ip }}<br/><span class="gray-font-color">{{ record.ipArea }}</span></template>
  </Table>
</template>

<script lang="ts" setup>
import {CalendarOutlined} from '@ant-design/icons-vue'
import {Button, DatePicker, Table, Form, Input, Select} from 'ant-design-vue'
import {onMounted, reactive, ref} from 'vue'
import {SystemApi} from '../../api'
import {format, queryString, updateRouter, usePagination} from '../../util'

const FormItem = Form.Item
const SelectOption = Select.Option
const DatePickerRangePicker = DatePicker.RangePicker

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
const {validate, validateInfos} = Form.useForm(searchForm, searchRules)

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
</script>

