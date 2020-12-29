export * from './store-key'
export const TokenKey: string = 'token'
export const PageSizeOptions: string[] = ['10', '20', '30', '40', '50']
export const DefaultPageSize: number = parseInt(PageSizeOptions[0])
export const MaxPageSize: number = parseInt(PageSizeOptions[PageSizeOptions.length - 1])
