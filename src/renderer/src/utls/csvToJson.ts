import csvtojson from 'csvtojson'
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
    d: string // 	过去分词（done）
    i: string //	现在分词（doing）
    3: string //	第三人称单数（does）
    r: string //	形容词比较级（-er）
    t: string //	形容词最高级（-est）
    s: string //	名词复数形式
    0: string //	Lemma，如 perceived 的 Lemma 是 perceive
    1: string //	Lemma 的变换形式，比如 s 代表 apples 是其 lemma 的复数形式
  }>
}

export type LocalWordsType = Omit<LocalWordsDBType, 'id'>

export default async function csvToJson(csv: string): Promise<Record<string, unknown>[]> {
  // // 处理选项参数，默认分隔符为逗号
  // const delimiter = options?.delimiter || ','

  // // 将CSV数据按行分割成数组
  // const lines = csv
  //   .split('\n')
  //   .map((line) => line.trim())
  //   .filter((line) => line)
  // const result: LocalWordsType[] = []

  // // 第一行作为字段名
  // const headers = lines[0].split(delimiter).map((header) => header.trim())

  // // 遍历剩余的行以构造JSON对象
  // for (let i = 1; i < lines.length; i++) {
  //   const obj: LocalWordsType = {} as LocalWordsType
  //   const currentline = lines[i].split(delimiter).map((cell) => cell.trim())

  //   headers.forEach((header, index) => {
  //     obj[header] = currentline[index]
  //   })
  //   result.push(obj)
  // }

  const result = await csvtojson().fromString(csv).then()
  console.log(result)
  return result
}
