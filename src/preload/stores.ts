import localforage from 'localforage'
import { set } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
export type LocalWordsDBType = Record<
  | 'audio'
  | 'bnc'
  | 'collins'
  | 'definition'
  | 'detail'
  | 'frq'
  | 'oxford'
  | 'phonetic'
  | 'pos'
  | 'tag'
  | 'translation'
  | 'word'
  | 'id',
  string
> &
  ExchangeType

export type ExchangeType = {
  exchange: Partial<{
    p: string //	过去式（did）
    d: string //	过去分词（done）
    i: string //	现在分词（doing）
    3: string //	第三人称单数（does）
    r: string //	形容词比较级（-er）
    t: string //	形容词最高级（-est）
    s: string //	名词复数形式
    0: string //	Lemma，如 perceived 的 Lemma 是 perceive
    1: string //	Lemma 的变换形式，比如 s 代表 apples 是其 lemma 的复数形式
  }>
}
/**初始化词库数据库 */
const localWordsDB = localforage.createInstance({
  name: 'localWordsDB'
})

/**初始化已学单词数据库 */
const localGetWordDB = localforage.createInstance({
  name: 'localGetWordDB'
})

/**集合 */
const wordDB = {
  localWordsDB,
  localGetWordDB
}

/**统一词库操作方法 */
const localWords = {
  getItem: async (
    key: string | string[],
    DB_name: 'localWordsDB' | 'localGetWordDB' = 'localWordsDB'
  ): Promise<Record<string, LocalWordsDBType | null>> => {
    const lostResult: Record<string, LocalWordsDBType | null> = {}
    for (const item of Array.isArray(key) ? key : [key]) {
      const result = await wordDB[DB_name].getItem(item)
        .then(function (value) {
          // 当离线仓库中的值被载入时，此处代码运行
          return value as LocalWordsDBType
        })
        .catch(function (err) {
          // 当出错时，此处代码运行
          console.log(err)
          return null
        })
      set(lostResult, item, result)
    }
    return lostResult
  },
  getAllItem: async (
    DB_name: 'localWordsDB' | 'localGetWordDB' = 'localGetWordDB'
  ): Promise<Record<string, LocalWordsDBType | null>> => {
    const lostResult: Record<string, LocalWordsDBType | null> = {}
    await wordDB[DB_name].iterate((value, key) => {
      set(lostResult, key, value)
    })

    return lostResult
  },
  addItem: async (
    key: string,
    value: Omit<LocalWordsDBType, 'id'>,
    DB_name: 'localWordsDB' | 'localGetWordDB' = 'localWordsDB'
  ): Promise<boolean> => {
    /**创建id */
    const newValue = {
      ...value,
      id: uuidv4()
    }
    return wordDB[DB_name].setItem(key, newValue)
      .then(() => true)
      .catch(function (err) {
        // 当出错时，此处代码运行
        console.log(err)
        return false
      })
  },
  delTtem: async (
    key: string | string[],
    DB_name: 'localWordsDB' | 'localGetWordDB' = 'localWordsDB'
  ): Promise<Record<string, LocalWordsDBType | null>> => {
    const lostResult: Record<string, LocalWordsDBType | null> = {}
    for (const item of Array.isArray(key) ? key : [key]) {
      const result = await wordDB[DB_name].removeItem(item)
        .then(function (value) {
          // 当离线仓库中的值被载入时，此处代码运行
          console.log(value)
          return value
        })
        .catch(function (err) {
          // 当出错时，此处代码运行
          console.log(err)
          return null
        })
      set(lostResult, item, result)
    }
    return lostResult
  },
  clearDB: async (
    DB_name: 'localWordsDB' | 'localGetWordDB' = 'localWordsDB'
  ): Promise<boolean> => {
    return wordDB[DB_name].clear()
      .then(() => true)
      .catch(function (err) {
        // 当出错时，此处代码运行
        console.log(err)
        return false
      })
  }
}
/**初始化文章数据库 */
const localEssaysDB = localforage.createInstance({
  name: 'localEssaysDB'
})
/**统一文库操作方法 */
const localEssays = {
  getItem: async (key: string | string[]): Promise<Record<string, string | null>> => {
    const lostResult: Record<string, string | null> = {}
    for (const item of Array.isArray(key) ? key : [key]) {
      const result = await localEssaysDB
        .getItem(item)
        .then(function (value) {
          // 当离线仓库中的值被载入时，此处代码运行
          console.log(value)
          return value as string
        })
        .catch(function (err) {
          // 当出错时，此处代码运行
          console.log(err)
          return null
        })
      set(lostResult, item, result)
    }
    return lostResult
  },
  addItem: async (key: string, value: string): Promise<boolean> => {
    return localEssaysDB
      .setItem(key, value)
      .then(() => true)
      .catch(function (err) {
        // 当出错时，此处代码运行
        console.log(err)
        return false
      })
  }
}
export { localWords, localEssays }
