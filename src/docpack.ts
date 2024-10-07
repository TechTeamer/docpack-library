import { convertMarkdownToPdf } from '@/converter'
import { loadDocpackFiles } from '@/parser'

export class MarkdownToPDFConverter {
  convertFolder = async (inputFolder: string, outputFolder?: string) => {
    const docpackConfig = await loadDocpackFiles(inputFolder)

    return await convertMarkdownToPdf(
      inputFolder,
      docpackConfig,
      'hu',
      outputFolder,
    )
  }
}
