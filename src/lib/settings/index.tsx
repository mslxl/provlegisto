import { fs } from '@tauri-apps/api'

type DefaultValueGetter = (...args: any) => any

type SettingsItem<R> = {
  readonly title: string
  readonly description?: string
  defaultValue: () => R
}

type ExtractValueType<T extends SettingsItem<any>> = ReturnType<T['defaultValue']>

type SettingsModel<P extends object> = {
  [Property in keyof P as P[Property] extends SettingsItem<any> ? Property : never]: P[Property] extends SettingsItem<any> ? ExtractValueType<P[Property]> : never
}

class SettingsManager<P extends object>{
  value?: SettingsModel<P>
  proto: P
  private constructor(proto: P) {
    this.proto = proto
  }

  async load(file: string) {
    let content = await fs.readTextFile(file)
    let obj = JSON.parse(content)
    this.loads(obj)
  }

  loads(obj: any) {
    let v: any = {}
    for (let key of Object.keys(this.proto)) {
      v[key] = obj[key] || ((this.proto as any)[key] as DefaultValueGetter)();
    }
    this.value = v
  }

  get(): SettingsModel<P> {
    if (this.value) {
      return this.value
    }
    throw new Error('Settings does not load')
  }

  isDiff(obj: any): boolean {
    if (!this.value) {
      throw new Error('Settings does not load')
    }
    for (let key of Object.keys(this.proto)) {
      if (obj[key] !== (this.value as any)[key]) return true
    }
    return false
  }
}