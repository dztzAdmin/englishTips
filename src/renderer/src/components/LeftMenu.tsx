import { Button } from '@mantine/core'
import { currentContentAtom } from '@renderer/atoms/content'
import csvToJson, { ExchangeType, LocalWordsType } from '@renderer/utls/csvToJson'
import { IconUpload } from '@tabler/icons-react'
import { useSetAtom } from 'jotai'
import { set } from 'lodash'
import { useState } from 'react'

function LeftMenu(): JSX.Element {
  const setCurrentContent = useSetAtom(currentContentAtom)
  const [getWorAdd, setGetWorAdd] = useState<number>(0)
  const [add, setAdd] = useState<number>(0)

  return (
    <div className="p-[10px]">
      <Button
        className="mb-2"
        fullWidth
        onClick={async () => {
          /**选择txt文件进行处理 */
          const result = await window.severs.openFileAPI(
            {
              name: '*.txt',
              extensions: ['txt']
            },
            true
          )
          /**格式化处理 */
          const totail =
            result.data?.map((item) => (item.fileData as string).split('\r')).flat(1) || []
          const newWords = totail?.map((word) => word.toLocaleLowerCase().trim())
          console.log(newWords, 'newWords')
          /**去除短语 */
          const filerWords = newWords.filter((word) => !word.includes(' '))

          const wordResult = await window.stores.localWords.getItem(filerWords, 'localWordsDB')
          /**清除原始数据 */
          const clearResult = await window.stores.localWords.clearDB('localGetWordDB')
          if (!clearResult) {
            console.log('清空数据库出错')
            return
          }
          console.log(wordResult, 'wordResult')
          const failWords: string[] = []
          /**存入数据库中 */
          let add = 1
          for (const wordName in wordResult) {
            const data = wordResult[wordName]
            try {
              if (data) {
                const result = await window.stores.localWords.addItem(
                  wordName,
                  data,
                  'localGetWordDB'
                )

                const percent = add++ / Object.values(wordResult).length
                console.log(result, percent, wordName, Object.values(wordResult).length)
                setGetWorAdd(percent === 1 ? 0 : percent)
                if (!result) throw new Error('单词添加出错')
              } else failWords.push(wordName)
            } catch (err) {
              console.log(err, 'err')
            }
          }
          console.log(failWords, 'failWords')
        }}
      >
        <IconUpload size={15} className=" mr-2" />
        已学习单词 {getWorAdd ? `${(getWorAdd * 100).toFixed(2)}%` : ''}
      </Button>
      <Button
        className="mb-2"
        fullWidth
        onClick={async () => {
          /**选择txt文件进行处理 */
          const result = await window.severs.openFileAPI(
            {
              name: '*.txt',
              extensions: ['txt']
            },
            true
          )

          setCurrentContent({
            content: result.data?.[0].fileData as string,
            title: result.data?.[0].fileName as string
          })
          console.log(result)
        }}
      >
        <IconUpload size={15} className=" mr-2" />
        上传文章
      </Button>
      <Button
        fullWidth
        disabled
        onClick={async () => {
          /**选择txt文件进行处理 */
          const result = await window.severs.openFileAPI(
            {
              name: '*.csv',
              extensions: ['csv']
            },
            true
          )
          console.log(result.data, 'result')
          /**转换csv为json */
          const translateResult = await csvToJson((result.data?.[0].fileData || '') as string)
          console.log(translateResult, 'translateResult')
          /**清除原始数据 */
          await window.stores.localWords.clearDB('localWordsDB')
          let add = 1
          for (const item of translateResult) {
            if (item.exchange && typeof item.exchange === 'string') {
              const newExchange = Object.fromEntries(
                item.exchange.split('/').map((item) => item.split(':'))
              ) as ExchangeType
              set(item, 'exchange', newExchange)
            }

            await window.stores.localWords
              .addItem(item.word as string, item as LocalWordsType)
              .then(() => {
                // console.log(res, `${add++}/${translateResult.length}`, `add ${item.word}`)
                const percent = add++ / translateResult.length
                setAdd(percent === 1 ? 0 : percent)
              })
          }
        }}
      >
        <IconUpload size={15} className=" mr-2" />
        词库转换 {add ? `${(add * 100).toFixed(2)}%` : ''}
      </Button>
    </div>
  )
}

export default LeftMenu
