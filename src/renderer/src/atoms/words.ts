import { PrimitiveAtom, atom } from 'jotai'
import { atomFamily, atomWithStorage } from 'jotai/utils'

export type EssagyInfoType = {
  /**认识的单词数量 */
  knowNum: number
  /**不认识的单词数量 */
  unknowNum: number
  /**单词总数 */
  words: number
  /**字数 */
  wordCount: number
}

/**上传的词库 */
const wordsAtom = atomWithStorage('wordsKey', {} as Record<'totail', string[]>)

/**文章中的单词识别相关的数据*/
const essaysInfoAtomFamily = atomFamily<string, PrimitiveAtom<EssagyInfoType | null>>(atom)

export { wordsAtom, essaysInfoAtomFamily }
