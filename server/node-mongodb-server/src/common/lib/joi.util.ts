import * as joi from 'joi'

export function joiValidate(param: any, schema: any, options?: any) {
  const {value, error} = joi.object(schema).validate(param, options || {
    convert: true,
    noDefaults: false,
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false
  })
  if (error) {
    throw error
  }
  return value
}

export {joi}
