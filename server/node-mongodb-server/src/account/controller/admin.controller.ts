import {Body, Controller, Get, Headers, Post, Query} from '@nestjs/common'
import * as _ from 'lodash'
import {ApiDescription} from '../../common/decorator'
import {AdminError, SystemError} from '../../common/error'
import {PaginationSchema} from '../../common/joi'
import {joi, joiValidate} from '../../common/lib'
import {JwtService} from '../../system/service'
import {AdminService, RoleService} from '../service'

/**
 * @apiDefine account 帐号模块
 */
@Controller('/account/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService
  ) {
  }

  /**
   * @api {POST} /account/admin/login 管理员登录
   * @apiName accountAdminLogin
   * @apiGroup account
   * @apiParam {String} username 登录名
   * @apiParam {String} password 登录密码
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/account/admin/login
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": {
   *        "username": "admin",        // 登录名
   *        "authority": {              // 可以访问的菜单、按钮
   *           "pages":["role-manager","global-config"],
   *           "components":["create-role","delete-admin"],
   *           "urls":["/account/admin/list","/system/global/config"]
   *        },
   *        "token": "xxxxx"            // 登录token
   *    },
   *    "time": 1515082039984
   * }
   */
  @Post('/login')
  @ApiDescription('管理员登录')
  async login(@Headers() headers, @Body() body) {
    const {username, password} = joiValidate(body, {
      username: joi.string().required().strict().trim().error(SystemError.PARAMS_ERROR('管理员登录名不能为空')),
      password: joi.string().required().strict().trim().min(6).max(16).error(SystemError.PARAMS_ERROR('管理员登录密码长度为6~16位'))
    })

    // 查询管理员
    const [admin] = await this.adminService.findAdminByName(username)
    if (!admin) {
      throw AdminError.ADMIN_NOT_EXISTS
    }

    // 查询是否被封号
    if (admin.status !== 'enable') {
      throw AdminError.ACCOUNT_WAS_BANNED
    }

    // 验证密码
    if (!this.adminService.checkAdminPassword(admin, password)) {
      throw AdminError.ADMIN_PASSWORD_ERROR
    }

    // 校验成功，返回管理员信息，颁发token
    const token = await this.jwtService.encrypt({adminId: admin.id})

    // 获取登录ip
    const ip = _.head(_.toString(headers['x-forwarded-for'] || headers['x-real-ip']).trim().split(',')).trim() || '127.0.0.1'

    // 更新一次管理员密码，使得每次登录密文都不一样
    // 记录最后登录时间
    await this.adminService.updateAdminById(admin.id.toString(), {
      password: this.adminService.genAdminPassword(password),
      lastLoginTime: Date.now(),
      lastLoginIp: ip
    })

    // 获取管理员信息
    const adminInfo = await this.adminService.adminInfo(admin)
    Object.assign(headers, {adminId: admin.id.toString()})
    return {token, ...adminInfo}
  }

  /**
   * @api {GET} /account/admin/info 管理员信息
   * @apiName accountAdminInfo
   * @apiGroup account
   * @apiUse auth
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/account/admin/info
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": {
   *        "username": "admin",        // 登录名
   *        "authority": {              // 可以访问的菜单、按钮
   *           "pages":["role-manager","global-config"],
   *           "components":["create-role","delete-admin"],
   *           "urls":["/account/admin/list","/system/global/config"]
   *        }
   *    },
   *    "time": 1515082039984
   * }
   */
  @Get('/info')
  @ApiDescription('管理员信息')
  async info(@Headers() headers) {
    const {adminId} = joiValidate(headers, {adminId: joi.string().length(24).required().strict().trim().error(SystemError.PARAMS_ERROR('请传入正确的管理员id'))})

    // 查询管理员
    const admin = await this.adminService.findAdminById(adminId)
    if (!admin) {
      throw AdminError.ADMIN_NOT_EXISTS
    }

    return this.adminService.adminInfo(admin)
  }

  /**
   * @api {GET} /account/admin/list 管理员列表
   * @apiName accountAdminList
   * @apiGroup account
   * @apiUse auth
   * @apiUse pagination
   * @apiParam {String} [name] 管理员登录名搜索
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/account/admin/list
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": {
   *       "total": 100,
   *       "list": [{
   *          "id": "5facb544a2d8ba24b032563a",       // 管理员id
   *          "username": "admin",                    // 管理员登录名
   *          "status": "enable",                     // 管理员状态(enable-正常;frozen-冻结)
   *          "createTime": 1561130440760,            // 账号创建时间
   *          "lastLoginTime": 1606451461541,         // 最后登录时间
   *          "lastLoginIp": "12.33.43.123",          // 最后登录ip
   *          "lastLoginArea": "广东省广州市",         // 最后登录地区
   *          "roleNames": ["超级管理员"]              // 管理员角色名
   *       }, {...}]
   *    },
   *    "time": 1515082039984
   * }
   */
  @Get('/list')
  @ApiDescription('管理员列表')
  async adminList(@Query() query) {
    const {name, page, pageSize} = joiValidate(query, {name: joi.string().trim().strict().trim().error(SystemError.PARAMS_ERROR('管理员登录名不能为空')), ...PaginationSchema})
    const {list, total} = await this.adminService.adminList(name, page, pageSize)
    for (const admin of list) {
      const roleNames = []
      for (const roleId of admin.roleId) {
        const role = await this.roleService.findRoleById(roleId)
        roleNames.push(role && role.name ? role.name : '')
      }
      Object.assign(admin, {roleNames: roleNames.filter(v => !!v)})
    }
    return {list, total}
  }

  /**
   * @api {GET} /account/admin/detail 管理员详情
   * @apiName accountAdminDetail
   * @apiGroup account
   * @apiUse auth
   * @apiUse pagination
   * @apiParam {String} adminId 管理员id
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/account/admin/detail
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": {
   *       "id": "5facb544a2d8ba24b032563a",       // 管理员id
   *       "username": "admin",                    // 管理员登录名
   *       "status": "enable",                     // 管理员状态(enable-正常;frozen-冻结)
   *       "createTime": 1561130440760,            // 账号创建时间
   *       "lastLoginTime": 1606451461541,         // 最后登录时间
   *       "roleNames": ["超级管理员"]              // 管理员角色名
   *    },
   *    "time": 1515082039984
   * }
   */
  @Get('/detail')
  @ApiDescription('管理员详情')
  async adminDetail(@Query() query) {
    const {adminId} = joiValidate(query, {adminId: joi.string().length(24).required().strict().trim().error(SystemError.PARAMS_ERROR('请传入正确的管理员id'))})

    // 校验管理员是否存在
    const admin = await this.adminService.findAdminById(adminId)
    if (!admin) {
      throw AdminError.ADMIN_NOT_EXISTS
    }

    // 加上管理员角色名
    const roleNames = []
    for (const roleId of admin.roleId) {
      const role = await this.roleService.findRoleById(roleId)
      roleNames.push(role && role.name ? role.name : '')
    }
    Object.assign(admin, {roleNames: roleNames.filter(v => !!v)})
    delete admin.password
    return admin
  }

  /**
   * @api {POST} /account/admin/add 添加管理员
   * @apiName accountAdminAdd
   * @apiGroup account
   * @apiUse auth
   * @apiParam {String} username 管理员登录名
   * @apiParam {String} password 管理员登录密码(6~16位)
   * @apiParam {Array} roleId 角色id
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/account/admin/add
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": 1,                // 添加成功返回1
   *    "time": 1515082039984
   * }
   */
  @Post('/add')
  @ApiDescription('添加管理员')
  async add(@Body() body) {
    const {username, password, roleId} = joiValidate(body, {
      username: joi.string().required().strict().trim().error(SystemError.PARAMS_ERROR('管理员登录名不能为空')),
      password: joi.string().required().strict().trim().min(6).max(16).error(SystemError.PARAMS_ERROR('管理员登录密码长度为6~16位')),
      roleId: joi.array().unique().items(joi.string().required().length(24).strict().trim()).min(1).error(SystemError.PARAMS_ERROR('请传入正确的角色id'))
    })

    // 验证角色是否存在
    for (const rId of roleId) {
      const role = await this.roleService.findRoleById(rId)
      if (!role) {
        throw AdminError.ROLE_NOT_EXISTS
      }
    }

    // 验证管理员是否重复
    const admin = await this.adminService.findAdminByName(username)
    if (admin) {
      throw AdminError.ADMIN_NAME_DUPLICATE
    }

    await this.adminService.createAdmin(username, password, roleId)
    return 1
  }

  /**
   * @api {POST} /account/admin/edit 编辑管理员
   * @apiName accountAdminEdit
   * @apiGroup account
   * @apiUse auth
   * @apiParam {String} adminId 管理员id
   * @apiParam {String} [username] 管理员登录名
   * @apiParam {String} [password] 管理员登录密码(6~16位)
   * @apiParam {Array} [roleId] 角色id
   * @apiParam {String="enable","frozen"} [status] 角色状态(enable-正常;frozen-冻结)
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/account/admin/edit
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": 1,                // 编辑成功返回1
   *    "time": 1515082039984
   * }
   */
  @Post('/edit')
  @ApiDescription('编辑管理员')
  async edit(@Body() body) {
    const {adminId, username, password, roleId, status} = joiValidate(body, {
      adminId: joi.string().length(24).required().strict().trim().error(SystemError.PARAMS_ERROR('请传入正确的管理员id')),
      username: joi.string().strict().trim().error(SystemError.PARAMS_ERROR('管理员登录名不能为空')),
      password: joi.string().strict().trim().min(6).max(16).error(SystemError.PARAMS_ERROR('管理员登录密码长度为6~16位')),
      roleId: joi.array().unique().items(joi.string().required().length(24).strict().trim()).min(1).error(SystemError.PARAMS_ERROR('请传入正确的角色id')),
      status: joi.string().valid('enable', 'frozen').strict().trim().error(SystemError.PARAMS_ERROR('请传入正确的状态'))
    })

    // 必须要有数据才执行修改
    if (!username && !password && !roleId) {
      throw SystemError.PARAMS_ERROR('请传入需要修改的项目')
    }

    // 验证角色是否存在
    const role = await this.roleService.findRoleById(roleId)
    if (!role) {
      throw AdminError.ROLE_NOT_EXISTS
    }

    // 校验管理员是否存在
    const adminById = await this.adminService.findAdminById(adminId)
    if (!adminById) {
      throw AdminError.ADMIN_NOT_EXISTS
    }

    // 验证管理员是否重复
    const adminByName = await this.adminService.findAdminByName(username)
    if (adminByName && adminById.username !== username) {
      throw AdminError.ADMIN_NAME_DUPLICATE
    }

    const data = {}
    if (username) {
      Object.assign(data, {username})
    }
    if (status) {
      Object.assign(data, {status})
    }
    if (password) {
      Object.assign(data, {password: this.adminService.genAdminPassword(password)})
    }
    if (roleId) {
      const checkRole = await this.roleService.findRoleById(roleId)
      if (!checkRole) {
        throw AdminError.ROLE_NOT_EXISTS
      }
      Object.assign(data, {roleId})
    }
    await this.adminService.updateAdminById(adminId, data)
    return 1
  }

  /**
   * @api {POST} /account/admin/delete 删除管理员
   * @apiName accountAdminDelete
   * @apiGroup account
   * @apiUse auth
   * @apiParam {String} adminId 管理员id
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/account/admin/delete
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": 1,                // 删除成功返回1
   *    "time": 1515082039984
   * }
   */
  @Post('/delete')
  @ApiDescription('删除管理员')
  async delete(@Headers() headers, @Body() body) {
    const {adminId} = joiValidate(body, {adminId: joi.string().length(24).required().strict().trim().error(SystemError.PARAMS_ERROR('请传入正确的管理员id'))})

    // 不能删除自己
    if (adminId === headers.adminId) {
      throw AdminError.CAN_NOT_DELETE_MYSELF
    }

    // 校验管理员是否存在
    const admin = await this.adminService.findAdminById(adminId)
    if (!admin) {
      throw AdminError.ADMIN_NOT_EXISTS
    }

    await this.adminService.deleteAdmin(admin)
    return 1
  }

  /**
   * @api {POST} /account/admin/password 修改自己的密码
   * @apiName accountAdminPassword
   * @apiGroup account
   * @apiUse auth
   * @apiParam {String} password 管理员登录密码(6~16位)
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/account/admin/password
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": 1,                // 修改成功返回1
   *    "time": 1515082039984
   * }
   */
  @Post('/password')
  @ApiDescription('修改自己的密码')
  async password(@Headers() headers, @Body() body) {
    const {adminId, password} = joiValidate({...headers, ...body}, {
      adminId: joi.string().length(24).required().strict().trim().error(SystemError.PARAMS_ERROR('请传入正确的管理员id')),
      password: joi.string().required().strict().trim().min(6).max(16).error(SystemError.PARAMS_ERROR('管理员登录密码长度为6~16位'))

    })

    // 校验管理员是否存在
    const adminById = await this.adminService.findAdminById(adminId)
    if (!adminById) {
      throw AdminError.ADMIN_NOT_EXISTS
    }

    // 修改密码
    await this.adminService.updateAdminById(adminId, {password: this.adminService.genAdminPassword(password)})
    return 1
  }
}
