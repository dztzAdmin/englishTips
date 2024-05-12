import { Alert, Badge, Group, Text } from '@mantine/core'
import { essaysInfoAtomFamily } from '@renderer/atoms/words'
import { LocalWordsDBType } from '@renderer/utls/csvToJson'
import { useSetAtom } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { omit } from 'lodash'
import React, { useState } from 'react'
import { useCallback, useEffect, useRef } from 'react'

/**标点符号 */
const punctuations = ['?', '？', '，', '。', '！', '；', '：', '!', ':', ';', ',', '.', '']

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
  clickData
}: {
  clickData: {
    infoData: LocalWordsDBType | null
    targetDOMRect: DOMRect | null
  } | null
}): JSX.Element | null => {
  if (!clickData) return null
  const { infoData, targetDOMRect } = clickData
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

    console.log('设置了')
    return () => {
      //移除全局取消事件
      document.removeEventListener('click', closeFun)
      document.removeEventListener('contextmenu', closeFun)
    }
  }, [closeFun, clickData])

  return infoData ? (
    <div
      style={{
        // display: renderData?.isShow ? 'block' : 'none',
        visibility: renderData?.isShow ? 'visible' : 'hidden',
        ...renderData?.position
      }}
      ref={currentEleRef}
      className=" fixed transition-[top,left]  duration-300 bg-white  rounded-2xl"
    >
      <Alert className=" fixed p-2" variant="lingt" color="green" radius="lg">
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
      </Alert>
    </div>
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
    //当前选中单词的数据
    infoData: LocalWordsDBType | null
    //当前选中元素的位置信息
    targetDOMRect: DOMRect | null
  } | null>(null)
  /**转换方法 */
  const traverseAndReplace = useAtomCallback(
    useCallback(
      (
        get,
        set,
        node: Node,
        option: {
          keys: string[]
          exchangeData: string[]
        }
      ) => {
        const infoData: {
          knowWordArr: string[]
          unknowWordArr: string[]
          wordArr: string[]
          totaiNum: number
        } = {
          knowWordArr: [],
          unknowWordArr: [],
          wordArr: [],
          totaiNum: 0
        }
        //递归方法
        const dfs = (
          node: Node,
          option: {
            keys: string[]
            exchangeData: string[]
          }
        ): void => {
          const { keys, exchangeData } = option
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
                if (keys?.includes(newVal) || exchangeData.includes(newVal)) {
                  //统计认识的数据
                  infoData.knowWordArr.push(newVal)
                  return `<span tag='familiar' class='text-status familiar'>${val}</span>`
                }
                if (/\w+/.test(newVal)) {
                  //统计不认识的单词数据
                  infoData.unknowWordArr.push(newVal)
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
        dfs(node, option)
        return infoData
      },
      []
    )
  )

  /**监视click单词事件 */
  const preRefClickCallback = useCallback(async function (event) {
    event.stopPropagation()
    event.preventDefault()
    //被点击元素
    const target = event.target as Element
    //位置信息
    const targetDOMRect = target.getBoundingClientRect()
    // 被点击的单词
    const outerText = (event.target?.outerText as string).toLocaleLowerCase().trim()
    console.log('你点击了：', outerText)

    //

    //找到这个单词的相关数据
    const infoData =
      getWordsRef.current[outerText] ||
      (await window.stores.localWords.getItem(outerText))[outerText]
    console.log(infoData, 'outerTextData')
    //设置数据
    setClickData({
      infoData,
      targetDOMRect
    })
  }, [])
  /**监视contextmenu单词事件 */
  const preRefContextmenuCallback = useCallback(async function (event) {
    // 被点击的单词
    const outerText = (event.target?.outerText as string).toLocaleLowerCase().trim()
    console.log('你右键了：', outerText)

    //找到这个单词的相关数据
    const infoData =
      getWordsRef.current[outerText] ||
      (await window.stores.localWords.getItem(outerText))[outerText]

    console.log(infoData, 'outerTextData')
  }, [])

  useEffect(() => {
    console.log(preRef.current, 'spanRef')
    // 在pre元素上设置点击事件监听器
    preRef.current?.addEventListener('click', preRefClickCallback)
    preRef.current?.addEventListener('contextmenu', preRefContextmenuCallback)
    return () => {
      /**清除监听 */
      preRef.current?.removeEventListener('click', preRefClickCallback)
      preRef.current?.removeEventListener('contextmenu', preRefContextmenuCallback)
    }
  }, [preRefClickCallback, preRefContextmenuCallback])

  useEffect(() => {
    if (!content) return
    //获取所有已学单词:
    window.stores.localWords.getAllItem('localGetWordDB').then((wordResult) => {
      getWordsRef.current = wordResult
      //keys
      const keys = Object.keys(wordResult)
      //获取所有已学单词的变体
      const exchangeData = Object.values(wordResult)
        .map((item) => Object.values(item ? omit(item.exchange, ['0', '1']) : {}))
        .flat(1)
      const infoData = preRef.current && traverseAndReplace(preRef.current, { keys, exchangeData })
      console.log(infoData, 'infoData')
      if (infoData) {
        //设置信息
        setEssaysInfo({
          knowNum: duplicationStrArr(infoData.knowWordArr).length,
          unknowNum: duplicationStrArr(infoData.unknowWordArr).length,
          words: duplicationStrArr(infoData.wordArr).length,
          wordCount: infoData.totaiNum
        })
      }
    })
  }, [content])

  return (
    <>
      <WordInfoContent clickData={clickData} />
      <pre
        ref={preRef}
        className="text-wrap"
        dangerouslySetInnerHTML={{
          __html: content
        }}
      />
    </>
  )
}

export default React.memo(TranslateText)
