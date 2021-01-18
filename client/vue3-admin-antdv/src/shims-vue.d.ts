declare module 'package.json' {
  export interface Package {
    version: string;
  }

  export const pkg: Package
}
