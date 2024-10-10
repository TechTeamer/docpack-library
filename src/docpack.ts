import { convertMarkdownToPdf } from '@/converter'
import { loadDocpackFiles } from '@/parser'
import fs from 'node:fs/promises'
import path from 'node:path'

export class MarkdownToPDFConverter {
  convertFolder = async (inputFolder: string, outputFolder?: string) => {
    const docpackConfig = await loadDocpackFiles(inputFolder)

    if (outputFolder) {
      await fs.mkdir(outputFolder, { recursive: true })
    }

    const results = docpackConfig.manifest.locale.options.map(
      async (locale) => ({
        locale,
        result: await convertMarkdownToPdf(
          inputFolder,
          docpackConfig,
          locale,
          outputFolder,
        ),
      }),
    )

    return Promise.all(results)
  }
}
