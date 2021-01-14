import {Body, Controller, Get, Post, Query} from '@nestjs/common'
import {AdminError, SystemError} from '../../common/error'
import {PaginationSchema} from '../../common/joi'
import {joi, joiValidate} from '../../common/lib'
import {RoleService} from '../service'

/**
 * @apiDefine account 帐号模块
 */
@Controller('/account/role')
export class RoleController {
  /**
   * 定义一些非法角色名字眼
   */
  private readonly illegalRoleName: string[] = ['admin', 'administrator', 'super', 'su', 'root', '超', '超级', '管理', '管理员', '超管']

  constructor(
    private readonly roleService: RoleService
  ) {
  }

  /**
   * @api {POST} /account/role/add 添加角色
   * @apiName accountAddRole
   * @apiGroup account
   * @apiUse auth
   * @apiParam {String} name 角色名
   * @apiParam {Object} authority 角色权限，例子：<br>{<br>&nbsp;&nbsp;&nbsp;&nbsp;"pages":["role-manager","global-config"],<br>&nbsp;&nbsp;&nbsp;&nbsp;"components":["create-role","delete-admin"],<br>&nbsp;&nbsp;&nbsp;&nbsp;"urls":["/account/admin/list","/system/global/config"]<br>}
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/account/role/add
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": 1,              // 添加成功返回1
   *    "time": 1515082039984
   * }
   */
  @Post('/add')
  async addRole(@Body() body) {
    const {name, authority} = joiValidate(body, {
      name: joi.string().trim().required().strict().trim().error(SystemError.PARAMS_ERROR('角色名不能为空')),
      authority: joi.object({
        pages: joi.array().unique().items(joi.string().trim().strict()).strict().error(SystemError.PARAMS_ERROR('角色权限格式不正确')),
        components: joi.array().unique().items(joi.string().trim().strict()).strict().error(SystemError.PARAMS_ERROR('角色权限格式不正确')),
        urls: joi.array().unique().items(joi.string().trim().strict()).strict().error(SystemError.PARAMS_ERROR('角色权限格式不正确'))
      }).required().strict().error(SystemError.PARAMS_ERROR('角色权限格式不正确'))
    })

    // 权限里面，pages、components、urls 至少有一个是非空的
    if (authority.pages.length <= 0 && authority.components.length <= 0 && authority.urls.length <= 0) {
      throw SystemError.PARAMS_ERROR('角色权限格式不正确')
    }

    // 验证角色名是否重复
    const admin = await this.roleService.findRoleByName(name)
    if (admin) {
      throw AdminError.ROLE_NAME_DUPLICATE
    }

    // 不可以有非法字眼
    for (const str of this.illegalRoleName) {
      if (name.toString().toLowerCase().indexOf(str) !== -1) {
        throw SystemError.PARAMS_ERROR(`角色名不能包含：${this.illegalRoleName}等字眼`)
      }
    }

    await this.roleService.createRole(name, authority)
    return 1
  }

  /**
   * @api {GET} /account/role/list 角色列表
   * @apiName accountRoleList
   * @apiGroup account
   * @apiUse auth
   * @apiUse pagination
   * @apiParam {String} [name] 角色名搜索
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/account/role/list
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": {
   *       "total": 100,
   *       "list": [{
   *          "id": "5d0cf5c869903f4c8845ed7e",       // 角色id
   *          "name": "超级管理员",                    // 角色名称
   *          "relations": 1,                         // 关联管理员人数
   *          "authority": [....],                    // 权限列表
   *          "createTime": 1561130440760             // 角色创建时间
   *       }, {...}]
   *    },
   *    "time": 1515082039984
   * }
   */
  @Get('/list')
  async roleList(@Query() query) {
    const {name, page, pageSize} = joiValidate(query, {name: joi.string().trim().strict().trim().error(SystemError.PARAMS_ERROR('角色名不能为空')), ...PaginationSchema})
    return this.roleService.roleList(name, page, pageSize)
  }

  /**
   * @api {GET} /account/role/all 所有角色
   * @apiName accountRoleAll
   * @apiGroup account
   * @apiUse auth
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/account/role/all
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": [{
   *       "id": "5d0cf5c869903f4c8845ed7e",       // 角色id
   *       "name": "超级管理员"                     // 角色名称
   *    }, {...}],
   *    "time": 1515082039984
   * }
   */
  @Get('/all')
  async allRole(@Query() query) {
    const roleList = await this.roleService.roleList(null, 1, Number.MAX_SAFE_INTEGER)
    return roleList.list.map(v => ({id: v.id, name: v.name}))
  }

  /**
   * @api {POST} /account/role/edit 编辑角色
   * @apiName accountRoleEdit
   * @apiGroup account
   * @apiUse auth
   * @apiParam {String} roleId 角色id
   * @apiParam {String} [name] 角色名
   * @apiParam {Object} [authority] 角色权限，例子：<br>{<br>&nbsp;&nbsp;&nbsp;&nbsp;"pages":["role-manager","global-config"],<br>&nbsp;&nbsp;&nbsp;&nbsp;"components":["create-role","delete-admin"],<br>&nbsp;&nbsp;&nbsp;&nbsp;"urls":["/account/admin/list","/system/global/config"]<br>}
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/account/role/edit
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": 1,              // 编辑成功返回1
   *    "time": 1515082039984
   * }
   */
  @Post('/edit')
  async editRole(@Body() body) {
    const {roleId, name, authority} = joiValidate(body, {
      roleId: joi.string().length(24).required().strict().trim().error(SystemError.PARAMS_ERROR('请传入正确的角色id')),
      name: joi.string().trim().strict().trim().error(SystemError.PARAMS_ERROR('角色名不能为空')),
      authority: joi.object({
        pages: joi.array().unique().items(joi.string().trim().strict()).strict().error(SystemError.PARAMS_ERROR('角色权限格式不正确')),
        components: joi.array().unique().items(joi.string().trim().strict()).strict().error(SystemError.PARAMS_ERROR('角色权限格式不正确')),
        urls: joi.array().unique().items(joi.string().trim().strict()).strict().error(SystemError.PARAMS_ERROR('角色权限格式不正确'))
      }).strict().error(SystemError.PARAMS_ERROR('角色权限格式不正确'))
    })

    // 必须要有数据才执行修改
    if (!name && !authority) {
      throw SystemError.PARAMS_ERROR('请传入需要修改的项目')
    }

    // 权限里面，pages、components、urls 至少有一个是非空的
    if (authority.pages.length <= 0 && authority.components.length <= 0 && authority.urls.length <= 0) {
      throw SystemError.PARAMS_ERROR('角色权限格式不正确')
    }

    // 不可以有非法字眼
    for (const str of this.illegalRoleName) {
      if (name.toString().toLowerCase().indexOf(str) !== -1) {
        throw SystemError.PARAMS_ERROR(`角色名不能包含：${this.illegalRoleName}等字眼`)
      }
    }

    // 超管不可以修改信息
    const roleById = await this.roleService.findRoleById(roleId)
    if (roleById.name === '超级管理员') {
      throw AdminError.SUPER_CAN_NOT_EDIT
    }

    // 验证角色名是否重复
    const roleByName = await this.roleService.findRoleByName(name)
    if (roleByName && roleById.name !== name) {
      throw AdminError.ROLE_NAME_DUPLICATE
    }

    await this.roleService.editRole(roleId, name, authority)
    return 1
  }

  /**
   * @api {POST} /account/role/delete 删除角色
   * @apiName accountRoleDelete
   * @apiGroup account
   * @apiUse auth
   * @apiParam {String} roleId 角色id
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/account/role/delete
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": 1,              // 删除成功返回1
   *    "time": 1515082039984
   * }
   */
  @Post('/delete')
  async deleteRole(@Body() body) {
    const {roleId} = joiValidate(body, {roleId: joi.string().length(24).required().strict().trim().error(SystemError.PARAMS_ERROR('请传入正确的角色id'))})

    await this.roleService.deleteRole(roleId)
    return 1
  }
}
