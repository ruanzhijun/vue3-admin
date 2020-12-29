import * as bluebird from 'bluebird'

Object.assign(global, {Promise: bluebird})
export {bluebird}
