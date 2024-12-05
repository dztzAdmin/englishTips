import { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api'

// const extractTextFromPDFData = (pdfData: Output): string => {
//   let text = ''
//   pdfData.Pages.forEach((page) => {
//     let previousY = 0
//     page.Texts.forEach((textItem) => {
//       const x = textItem.x
//       const y = textItem.y

//       // Add new line if the y-coordinate changes significantly
//       if (previousY && Math.abs(y - previousY) > 1) {
//         text += '\n'
//       }

//       // Add indentation based on x-coordinate
//       if (x > 1) {
//         text += ' '.repeat(Math.floor(x / 2))
//       }

//       textItem.R.forEach((textRun) => {
//         text += decodeURIComponent(textRun.T)
//       })

//       previousY = y
//     })
//     text += '\n' // Add a new line at the end of each page
//   })
//   return text
// }
/**
 * 用于将 PDF 文件转换为文本
 * @param file pdf的Buffer类型数据
 * @returns Promise<string|null>
 */
// const PdfToText = async (Buffer: Buffer): Promise<string | null> => {
//   const PDFParser = await import('pdf2json')
//   return new Promise((resolve, reject) => {
//     const pdfParser = new PDFParser.default()
//     pdfParser.on('pdfParser_dataError', (errData) => {
//       console.log(errData.parserError, '解析pdf出错')
//       reject(null)
//     })

//     pdfParser.on('pdfParser_dataReady', (pdfData) => {
//       console.log(pdfData)
//       resolve(extractTextFromPDFData(pdfData))
//     })

//     pdfParser.parseBuffer(Buffer)
//   })
// }

// export default PdfToText

const PdfToText = (
  file: Buffer
): Promise<{ textContent: string; textContentObjs: TextContent[] } | null> => {
  // 异步函数，用于提取 PDF 文件中的文本
  const extractTextFromPdf = async (
    file: Buffer
  ): Promise<{ textContent: string; textContentObjs: TextContent[] } | null> => {
    try {
      const typedArray = new Uint8Array(file)
      console.log('进来了')
      // 动态导入 pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist')

      console.log(pdfjsLib, 'pdfjsLib')
      // 使用 pdf.js 加载 PDF 文件
      const pdf = await pdfjsLib.getDocument(typedArray).promise
      console.log(pdf, 'dfg')
      let textContent = ''
      const textContentObjs: TextContent[] = []
      // 遍历 PDF 文件的每一页
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContentObj = await page.getTextContent()
        textContentObjs.push(textContentObj)
        const textItems = textContentObj.items as TextItem[]
        let lastY: number | null = null
        let lastX: number | null = null

        textItems.forEach((item) => {
          if (lastY !== null && lastX !== null && item.transform[5] !== lastY) {
            textContent += '\n'
            // 添加缩进
            const indent = ' '.repeat(Math.max(0, Math.floor(lastX / 10)))
            textContent += indent
          }
          textContent += item.str
          lastY = item.transform[5]
          lastX = item.transform[4]
        })

        textContent += '\n' // 每页结束后添加一个换行符
      }
      return { textContent, textContentObjs }
    } catch (err) {
      console.log(err, 'pdf转text失败')
      return null
    }
  }

  return extractTextFromPdf(file) // 如果有文件，提取文本
}

export default PdfToText
