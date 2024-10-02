import { convertMarkdownToPdf } from '@/converter'
import { loadDocpackFiles } from '@/parser'

export class DocPack {
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
