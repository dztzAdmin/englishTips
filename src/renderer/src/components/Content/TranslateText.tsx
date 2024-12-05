import { Alert, Badge, ColorSwatch, Group, Paper, Text } from '@mantine/core'
import { essaysInfoAtomFamily } from '@renderer/atoms/words'
import { LocalWordsDBType, TagType } from '@renderer/utils/csvToJson'
import { useSetAtom } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { omit, set } from 'lodash'
import React, { useState } from 'react'
import { useCallback, useEffect, useRef } from 'react'

type WarpTagType = 'familiar' | 'unfamiliar' | TagType

/**标点符号 */
const punctuations = ['?', '？', '，', '。', '！', '；', '：', '!', ':', ';', ',', '.', '']
/**标记颜色类型  */
const markColor: [WarpTagType, string][] = [
  ['familiar', '#009790'],
  ['forget', '#e6e608'],
  ['unfamiliar', '#e61908']
]
/**去重 *字符串数组*/
const duplicationStrArr = (arr: string[]): string[] => Array.from(new Set(arr))

/**计算组件所处的位置 */
const countElementPosition = (
  currentEleDOMRect: DOMRect,
  targetDOMRect: DOMRect
): Record<'top' | 'left', number> => {
  console.log(currentEleDOMRect, targetDOMRect)
  const { top, left, width: w, height: h } = targetDOMRect
  const { width: W, height: H } = currentEleDOMRect
  // 当前窗口的宽高
  const clientWidth = document.documentElement.clientWidth
  const clientHeight = document.documentElement.clientHeight

  let newTop = 0,
    newLeft = 0
  //top边界判断
  if (top + h + H + 10 > clientHeight) {
    console.log('超出下边界', top, H)
    newTop = top - 10 - H
  } else {
    newTop = top + h + 10
  }

  //left边界判断
  if (left < (W - w) / 2) {
    console.log('超出左边界', left, (W - w) / 2)
    newLeft = 0
  } else if (left > clientWidth - (W + w) / 2) {
    console.log('超出右边界')
    newLeft = clientWidth - W
  } else {
    console.log('正常值', left, W, w)
    newLeft = left - (W - w) / 2
  }

  return { top: newTop, left: newLeft }
}

/**左键组件 */
const WordInfoContent = ({
  clickData,
  recordMark
}: {
  clickData: {
    eventType: string
    target: Element
    infoData: LocalWordsDBType | null
    targetDOMRect: DOMRect | null
  } | null
  recordMark: (val: object) => void
}): JSX.Element | null => {
  if (!clickData) return null
  const { eventType, infoData, target, targetDOMRect } = clickData
  /**当前渲染的元素 */
  const currentEleRef = useRef<HTMLDivElement | null>(null)
  /**渲染相关的数据 */
  const [renderData, setRenderData] = useState<{
    isShow: boolean
    position: Record<'top' | 'left', number> | undefined
  } | null>(null)

  /**关闭事件 */
  const closeFun = useCallback(() => {
    console.log('全局')
    setRenderData((data) => ({ position: data?.position, isShow: false }))
  }, [])

  /**修改词库数据 */
  const wordsHeader = useCallback(
    async (headerType: WarpTagType) => {
      if (!infoData) return

      if (headerType === 'familiar') {
        await window.stores.localWords.addItem(infoData.word, infoData, 'localGetWordDB')
      }
      if (headerType === 'forget') {
        /**保存标签 */
        infoData.tagType = headerType
        await window.stores.localWords.addItem(infoData.word, infoData, 'localGetWordDB')
      }
      if (headerType === 'unfamiliar') {
        await window.stores.localWords.delTtem(infoData.word, 'localGetWordDB')
      }
    },
    [infoData]
  )
  useEffect(() => {
    //添加全局取消事件
    document.addEventListener('click', closeFun)
    document.addEventListener('contextmenu', closeFun)

    if (!currentEleRef.current || !targetDOMRect) return
    //获取currentEleRef的位置信息
    const currentEleDOMRect = currentEleRef.current.getBoundingClientRect()
    console.log(window.getComputedStyle(currentEleRef.current).height, 'other')
    //计算数据
    setRenderData({
      isShow: true,
      position: countElementPosition(currentEleDOMRect, targetDOMRect)
    })

    return () => {
      //移除全局取消事件
      document.removeEventListener('click', closeFun)
      document.removeEventListener('contextmenu', closeFun)
    }
  }, [closeFun, clickData])

  return infoData ? (
    <Paper
      shadow="xl"
      radius="lg"
      withBorder
      style={{
        // display: renderData?.isShow ? 'block' : 'none',
        visibility: renderData?.isShow ? 'visible' : 'hidden',
        ...renderData?.position
      }}
      ref={currentEleRef}
      className=" fixed transition-[top,left]  duration-300 bg-white  rounded-2xl"
    >
      <Alert className=" fixed p-2" variant="lingt" color="green" radius="lg">
        {eventType === 'click' ? (
          <>
            <Group>
              <Text size="xl" fw={500}>
                {infoData.word}
              </Text>
              {infoData.oxford === '1' ? <Badge className="ml-2">3000 CORE</Badge> : null}
            </Group>
            {infoData.phonetic ? <div>{`[${infoData.phonetic}]`}</div> : null}
            {infoData.tag ? (
              <div>
                标签：{' '}
                {infoData.tag.split(' ').map((tag) => (
                  <Badge className="mr-2" key={tag}>
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
            {infoData.frq ? <div>词频：{infoData.frq}</div> : null}
            {infoData.exchange ? (
              <div>
                变形：
                {Object.values(infoData.exchange).map((item, idx) => (
                  <span className="mr-2" key={idx}>
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
            <div>
              {infoData.translation.split('\\n').map((str) => (
                <div key={str}>{str}</div>
              ))}
            </div>
          </>
        ) : (
          <Group>
            {markColor.map(([tagType, color]) => (
              <ColorSwatch
                key={color}
                color={color}
                component="button"
                onClick={() => {
                  // e.stopPropagation()

                  //公共类 该变显示状态
                  // const publicClass = [...Array.from(target.classList).slice(0, -1), tagType]
                  // target.setAttribute('tag', tagType)
                  // target.setAttribute('class', publicClass.join(' '))
                  console.log(target)
                  recordMark({ [infoData.word]: tagType })
                  wordsHeader(tagType)
                }}
              />
            ))}
          </Group>
        )}
      </Alert>
    </Paper>
  ) : null
}

function TranslateText({ content, title }: Record<'content' | 'title', string>): JSX.Element {
  console.log('渲染了')
  const preRef = useRef<HTMLPreElement | null>(null)
  //已学习单词
  const getWordsRef = useRef<Record<string, LocalWordsDBType | null>>({})
  //当前展示的文章
  const setEssaysInfo = useSetAtom(essaysInfoAtomFamily(title))
  //点击后需要传递的数据
  const [clickData, setClickData] = useState<{
    //事件类型
    eventType: string
    //目标元素
    target: Element
    //当前选中单词的数据
    infoData: LocalWordsDBType | null
    //当前选中元素的位置信息
    targetDOMRect: DOMRect | null
  } | null>(null)
  //是否已经渲染完成
  const isRenderRef = useRef<boolean>(false)
  //渲染完成后进行的单词类别操作记录
  const [renderLaterRecord, setRenderLaterRecord] = useState<Record<string, WarpTagType>>({})
  /**转换方法 */
  const traverseAndReplace = useAtomCallback(
    useCallback(
      (
        _get,
        _set,
        node: HTMLPreElement,
        option: {
          keys: string[]
          exchangeData: string[]
          tags: Record<string, WarpTagType>
        }
      ) => {
        const infoData: {
          wordArr: string[]
          totaiNum: number
        } & Record<WarpTagType, string[]> = {
          familiar: [],
          forget: [],
          unfamiliar: [],
          wordArr: [],
          totaiNum: 0
        }
        //递归方法
        const dfs = (
          node: Node,
          option: {
            keys: string[]
            exchangeData: string[]
            tags: Record<string, WarpTagType>
          }
        ): void => {
          const { keys, exchangeData, tags } = option
          if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            if (punctuations.includes(node.textContent.trim())) return
            // 替换文本节点中的短横杠连接字符串
            const spanHTML = document.createElement('span')
            spanHTML.insertAdjacentHTML(
              'afterbegin',
              node.textContent?.replaceAll(/\b[a-zA-Z']+\b/g, (val) => {
                const newVal = val.toLocaleLowerCase()
                //统计词数
                infoData.wordArr.push(newVal)
                infoData.totaiNum++

                //单词的标记类型
                const markType = tags[newVal]
                //记录的特殊标记
                if (markType) {
                  if (markType === 'forget') infoData.forget.push(newVal)
                  return `<span tag='${markType}' class='text-status ${markType}'>${val}</span>`
                }
                if (keys?.includes(newVal) || exchangeData.includes(newVal)) {
                  //统计认识的数据
                  infoData.familiar.push(newVal)
                  return `<span tag='familiar' class='text-status familiar'>${val}</span>`
                }
                if (/\w+/.test(newVal)) {
                  //统计不认识的单词数据
                  infoData.unfamiliar.push(newVal)
                  return `<span tag='unfamiliar' class='text-status unfamiliar'>${val}</span>`
                }

                return val
              })
            )
            node.parentNode?.insertBefore(spanHTML, node)
            node.parentNode?.removeChild(node)
          } else {
            // 递归处理所有子节点
            node.childNodes.forEach((child) => dfs(child, option))
          }
        }
        if (!isRenderRef.current) {
          dfs(node, option)
          //标记渲染结束
          isRenderRef.current = true
        } else {
          const wordElement = Array.from(node.getElementsByClassName('text-status'))
          wordElement.forEach((ele) => {
            console.log(ele.textContent, 'textContent')
            if (!ele.textContent) return
            const mark = renderLaterRecord[ele.textContent]
            if (mark) {
              const publicClass = [...Array.from(ele.classList).slice(0, -1), mark]
              ele.setAttribute('tag', mark)
              ele.setAttribute('class', publicClass.join(' '))
            }
          })
          wordElement.forEach((element) => {
            if (!element.textContent) return
            const getTagType = element.getAttribute('tag')
            getTagType && infoData[getTagType].push(element.textContent)
            infoData.wordArr.push(element.textContent)
          })

          infoData.totaiNum = wordElement.length
        }

        return infoData
      },
      [renderLaterRecord]
    )
  )

  /**监视click/contextmenu单词事件 */
  const preRefClickCallback = useCallback(async function (event) {
    console.log(event, 'event')
    event.stopPropagation()
    event.preventDefault()
    //被点击的事件类型
    const eventType = event.type
    //被点击元素
    const target = event.target as Element
    //被点击的元素类型
    const elementType = target.nodeName
    /**当点击元素类型不为span时退出 */
    if (elementType !== 'SPAN') return setClickData(null)
    //位置信息
    const targetDOMRect = target.getBoundingClientRect()
    // 被点击的单词
    const outerText = (event.target?.outerText as string).toLocaleLowerCase().trim()

    //找到这个单词的相关数据
    const infoData =
      getWordsRef.current[outerText] ||
      (await window.stores.localWords.getItem(outerText))[outerText]
    //设置数据
    setClickData({
      eventType,
      infoData,
      target,
      targetDOMRect
    })
  }, [])

  const recordMark = useCallback(
    (val) => {
      setRenderLaterRecord((data) => ({ ...data, ...val }))
    },
    [setRenderLaterRecord]
  )
  useEffect(() => {
    console.log(preRef.current, 'spanRef')
    // 在pre元素上设置点击事件监听器
    preRef.current?.addEventListener('click', preRefClickCallback)
    preRef.current?.addEventListener('contextmenu', preRefClickCallback)
    return () => {
      /**清除监听 */
      preRef.current?.removeEventListener('click', preRefClickCallback)
      preRef.current?.removeEventListener('contextmenu', preRefClickCallback)
    }
  }, [preRefClickCallback])

  useEffect(() => {
    if (!content) return
    //获取所有已学单词:
    window.stores.localWords.getAllItem('localGetWordDB').then((wordResult) => {
      getWordsRef.current = wordResult
      //keys
      const keys = Object.keys(wordResult).map((word) => word.toLocaleLowerCase())
      //标记数据
      const tags: Record<string, TagType> = {}
      //获取所有已学单词的变体
      const exchangeData = Object.values(wordResult)
        .map((item) => {
          if (item?.tagType) set(tags, item.word, item.tagType)
          return Object.values(item ? omit(item.exchange, ['0', '1']) : {})
        })
        .flat(1)

      const infoData =
        preRef.current && traverseAndReplace(preRef.current, { keys, exchangeData, tags })
      console.log(infoData, 'infoData')
      if (infoData) {
        //设置信息
        setEssaysInfo({
          knowNum: duplicationStrArr(infoData.familiar).length,
          unknowNum: duplicationStrArr(infoData.unfamiliar).length,
          forgetNum: duplicationStrArr(infoData.forget).length,
          words: duplicationStrArr(infoData.wordArr).length,
          wordCount: infoData.totaiNum
        })
      }
    })
  }, [content, renderLaterRecord])
  /**当content发生改变时重置渲染标志 */
  useEffect(() => {
    isRenderRef.current = false
  }, [content])

  return (
    <>
      <WordInfoContent clickData={clickData} recordMark={recordMark} />
      <pre ref={preRef} className="text-wrap">
        {content}
      </pre>
    </>
  )
}

export default React.memo(TranslateText)
