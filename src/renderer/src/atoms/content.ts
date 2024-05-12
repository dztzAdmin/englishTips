import { atom } from 'jotai'
/**当前打开的文章的文本内容 */
const currentContentAtom = atom<{
  content: string
  title: string
}>({ content: '', title: '' })

export { currentContentAtom }
