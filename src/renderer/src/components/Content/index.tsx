//
//
//
import { ScrollArea } from '@mantine/core'
import { currentContentAtom } from '@renderer/atoms/content'
import { useAtom } from 'jotai'
import TopData from './TopData'
import TranslateText from './TranslateText'
function Content(): JSX.Element {
  const [currentContent] = useAtom(currentContentAtom)
  console.log(currentContent, 'currentContent')
  return (
    <div className="w-full h-full">
      {/* <ScrollArea className="h-[50%]">
        <div className="flex w-full flex-wrap">
          {words.totail?.map((word, idx) => (
            <Code
              key={idx}
              className="block !my-1 !mx-1"
              onClick={async () => {
                const wordResult = await window.stores.localWords.getItem(word.trim())
                console.log(wordResult, word, 'word result')
              }}
            >
              {word}
            </Code>
          ))}
        </div>
      </ScrollArea> */}
      {currentContent ? <TopData title={currentContent.title} /> : null}
      <ScrollArea className="w-full  px-2  h-[calc(100%-20px)]">
        <div className="flex flex-wrap">
          {/* {currentContent
            .split('\n')
            .map((lineText) => {
              return lineText.split(/[\w'-]+[^\w\s]/)
            })
            ?.map((lineText, idx) => {
              return (
                <div key={idx}>
                  {lineText.map((val) => {
                    const newVal = val.toLocaleLowerCase()
                    const newWords = words.totail?.map((word) => word.toLocaleLowerCase().trim())

                    if (newWords?.includes(newVal)) {
                      console.log(
                        val,
                        'val',
                        newWords.findIndex((word) => word === newVal)
                      )
                      return (
                        // <Indicator key={val + idx} offset={5} size={4}>
                        <Text key={val + idx} component="span" className="inline-block !m-[2px]">
                          {val}
                        </Text>
                        // </Indicator>
                      )
                    }
                    if (/\w+/.test(newVal)) {
                      return (
                        <Text
                          key={val + idx}
                          component="span"
                          fw={500}
                          // fs="italic"
                          className="inline-block !m-[2px] !text-[15px] bg-[#f1f3f5] rounded-md !px-[5px] !py-[2px]"
                        >
                          {val}
                        </Text>
                      )
                    }
                    return val
                  })}
                </div>
              )
            })} */}
          <TranslateText {...currentContent} />
        </div>
      </ScrollArea>
    </div>
  )
}

export default Content
