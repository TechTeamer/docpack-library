const fs = require('fs').promises
const path = require('path')
const globPromise = require('glob-promise')
const marked = require('marked')
const puppeteer = require('puppeteer')
const asciidoctor = require('asciidoctor')()

/**
 * Module for adding PDF files based on the provided document configuration.
 *
 * @module addPdfModule
 */
const addPdfModule = {
  /**
   * Adds PDF files based on the provided document configuration.
   *
   * @param {Object} documentConfig - The configuration object for the document.
   * @param {string} documentConfig.name - The name of the output PDF file.
   * @param {string|string[]} documentConfig.files - The file pattern(s) to include in the PDF.
   * @param {string} documentConfig.path - The path of the document.
   * @param {boolean} documentConfig.merge - Indicates whether to merge the files into a single PDF or create individual PDFs.
   * @param {string} workDir - The working directory.
   * @returns {Promise<void>} - A promise that resolves when the PDF(s) have been created.
   */
  async addPdf(documentConfig, workDir) {
    const { name, files, path: docPath, merge } = documentConfig
    const outputDir = path.join(workDir, 'output', docPath)
    await fs.mkdir(outputDir, { recursive: true })

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    if (merge) {
      let documentsContent = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>'

      const filePatterns = Array.isArray(files) ? files : [files]
      for (const pattern of filePatterns) {
        const filePaths = await globPromise(pattern, { cwd: workDir })
        for (const filePath of filePaths) {
          const fullFilePath = path.join(workDir, filePath)
          const fileContent = await fs.readFile(fullFilePath, 'utf8')

          if (filePath.endsWith('.md')) {
            documentsContent += marked.parse(fileContent)
          } else if (filePath.endsWith('.adoc')) {
            documentsContent += asciidoctor.convert(fileContent, { to: 'html' })
          }
        }
      }

      documentsContent += '</body></html>'
      await page.setContent(documentsContent, {
        waitUntil: 'networkidle0'
      })

      const pdfPath = path.join(outputDir, name)
      await page.pdf({ path: pdfPath, format: 'A4' })
    } else {
      const filePatterns = Array.isArray(files) ? files : [files]
      for (const pattern of filePatterns) {
        const filePaths = await globPromise(pattern, { cwd: workDir })
        for (const filePath of filePaths) {
          const fullFilePath = path.join(workDir, filePath)
          const fileContent = await fs.readFile(fullFilePath, 'utf8')
          let documentContent = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>'

          if (filePath.endsWith('.md')) {
            documentContent += marked.parse(fileContent)
          } else if (filePath.endsWith('.adoc')) {
            documentContent += asciidoctor.convert(fileContent, { to: 'html' })
          }

          documentContent += '</body></html>'
          await page.setContent(documentContent, {
            waitUntil: 'networkidle0'
          })

          const individualPdfPath = path.join(outputDir, `${path.basename(filePath, path.extname(filePath))}.pdf`)
          await page.pdf({ path: individualPdfPath, format: 'A4' })
        }
      }
    }

    await browser.close()
  }
};

module.exports = { addPdfModule }
