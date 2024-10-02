import { readFileSync } from 'node:fs'
import {
  type PDFDocumentProxy,
  getDocument,
} from 'pdfjs-dist/legacy/build/pdf.mjs'
import type {
  TextItem,
  TextMarkedContent,
} from 'pdfjs-dist/types/src/display/api'

type ConsoleMethod = (message?: unknown, ...optionalParams: unknown[]) => void

const silenceWarnings = () => {
  function createSilencedMethod(originalMethod: ConsoleMethod): ConsoleMethod {
    return (message?: unknown, ...args: unknown[]) => {
      if (typeof message === 'string' && message.includes('Cannot polyfill')) {
        return
      }
      originalMethod.call(console, message, ...args)
    }
  }

  console.log = createSilencedMethod(console.log)
}

silenceWarnings()

const isTextItem = (item: TextItem | TextMarkedContent): item is TextItem =>
  (item as TextItem).str !== undefined

const loadPdf = async (filePath: string) => {
  const data = new Uint8Array(readFileSync(filePath))
  const pdfDocument = await getDocument({ data }).promise

  return pdfDocument
}

const extractTextWithFontInfo = async (
  pdfDocument: PDFDocumentProxy,
  pageNumber: number,
) => {
  const page = await pdfDocument.getPage(pageNumber)
  const textContent = await page.getTextContent()

  return textContent.items.filter(isTextItem).map((item) => ({
    text: item.str,
    fontSize: item.transform[0],
  }))
}

export const extractHeadings = async (pdfPath: string) => {
  const pdfDoc = await loadPdf(pdfPath)
  const totalPages = pdfDoc.numPages
  const headings: { page: number; text: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    const textItems = await extractTextWithFontInfo(pdfDoc, i)

    for (const item of textItems) {
      if (item.fontSize > 12 && item.text !== '') {
        headings.push({ page: i, text: item.text })
      }
    }
  }

  return headings
}
