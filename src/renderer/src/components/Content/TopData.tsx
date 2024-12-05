import { essaysInfoAtomFamily } from '@renderer/atoms/words'
import { useAtomValue } from 'jotai'

export default function TopData({ title }: { title: string }): JSX.Element | null {
  const currentInfo = useAtomValue(essaysInfoAtomFamily(title))

  return currentInfo ? (
    <div className="flex flex-wrap">
      <div className=" ml-2">认识：{currentInfo.knowNum}</div>
      <div className=" ml-2">不认识：{currentInfo.unknowNum}</div>
      <div className=" ml-2">忘记：{currentInfo.forgetNum}</div>
      <div className=" ml-2">单词总数：{currentInfo.words}</div>
      <div className=" ml-2">词数：{currentInfo.wordCount}</div>
      <div className=" ml-2">
        认知率：{((currentInfo.knowNum * 100) / currentInfo.words).toFixed(1)}%
      </div>
    </div>
  ) : null
}
