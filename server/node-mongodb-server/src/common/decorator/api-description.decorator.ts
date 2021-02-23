/**
 * 定义接口说明(用于管理后台显示)
 * @param description 接口说明
 */
export function ApiDescription(description: string): MethodDecorator {
  return (target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    Reflect.defineMetadata('description', description, descriptor.value)
    return descriptor
  }
}
