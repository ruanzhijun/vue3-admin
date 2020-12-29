const path = require('path');
const pkg = require('../package.json');
const appDir = path.resolve(`${__dirname}${path.sep}..`);

module.exports = {
  // 端口
  port: process.env.PORT || 3002,
  // 运行环境
  env: process.env.NODE_ENV,
  // 应用程序名称
  name: pkg.name,
  // 程序版本
  version: pkg.version,
  // 应用程序目录
  appDir,
  // api前缀
  prefix: '/api/v1',
  // 本系统的访问地址
  self: 'https://vue3.admin.demo.ruanzhijun.cn',
  // 全局看守器配置
  guard: {
    jwt: {
      enable: true,
      whitelist: [
        '/account/admin/login'
      ]
    },
    authority: {
      enable: true,
      whitelist: [
        '/account/admin/login'
      ]
    }
  },
  // mongodb配置
  mongodb: {
    dbs: [{
      name: 'dashboard',
      url: process.env.DASHBOARD_MONGODB_URI
    }, {
      name: 'app',
      url: process.env.APP_MONGODB_URI
    }],
  },
  // 系统运行log配置
  logdb: {
    url: process.env.DASHBOARD_MONGODB_URI
  },
  // log4js配置
  log4js: {
    appenders: {
      out: {type: 'console'},
      app: {
        type: 'dateFile',
        filename: `${appDir}/log/${pkg.name}-log.log`,
        pattern: '.yyyy-MM-dd',
        compress: true,
        keepFileExt: true
      }
    },
    categories: {
      default: {
        appenders: ['out', 'app'],
        level: 'ALL'
      }
    }
  }
};
