// Chrome API型定義
declare namespace chrome {
  export namespace storage {
    export interface StorageArea {
      get(
        keys: string | string[] | object | null,
      ): Promise<{ [key: string]: unknown }>
      set(items: object): Promise<void>
      remove(keys: string | string[]): Promise<void>
      clear(): Promise<void>
    }

    export const local: StorageArea
    export const sync: StorageArea
  }
}
