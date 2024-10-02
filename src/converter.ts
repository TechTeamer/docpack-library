import { marked } from 'marked'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'
import fs from 'node:fs'
import path from 'node:path'
import type { DocpackConfig, DocpackReferenceCollection } from '@/parser'
import { extractHeadings } from '@/utils/pdf'
import { generateHtmlTemplate } from '@/renderer/template'
import {
  renderAbbreviations,
  renderReferences,
  renderTerms,
} from '@/renderer/table'
import { escapeRegExp, getSlug, removeVersionPrefix } from '@/utils/text'

const FILE_TYPE_MAP = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
} as const

type FileExtension = keyof typeof FILE_TYPE_MAP

type HeadingCounters = {
  h1: number
  h2: number
  h3: number
}

export const convertMarkdownToPdf = async (
  inputPath: string,
  options: DocpackConfig,
  lang: string,
  outputPath?: string,
) => {
  const html = await convertMarkdownToHtml(options, lang)

  return convertHtmlToPdf(
    html,
    options.manifest.settings.pageNumbering,
    inputPath,
    outputPath,
  )
}

const convertMarkdownToHtml = async (
  options: DocpackConfig,
  lang: string,
): Promise<string> => {
  const htmlContent = await generateHtmlContent(options)
  const cover =
    options.manifest.cover && options.cover
      ? generateCover(options.cover)
      : null
  const additionalSections = generateAdditionalSections(options)

  let finalHtmlContent = htmlContent + additionalSections

  if (options.manifest.settings.chapterNumbering) {
    finalHtmlContent = applyHeadingNumbers(finalHtmlContent)
  }

  const toc = options.manifest.settings.tableOfContents
    ? generateTocFromHtml(finalHtmlContent)
    : null

  return generateHtmlTemplate(options, lang, cover, toc, finalHtmlContent)
}

const generateAdditionalSections = (options: DocpackConfig): string => {
  const sections = []

  if (options.manifest.settings.abbreviations && options.abbreviations) {
    sections.push(renderAbbreviations(options.abbreviations))
  }
  if (options.manifest.settings.references && options.references) {
    sections.push(renderReferences(options.references))
  }
  if (options.manifest.settings.terms && options.terms) {
    sections.push(renderTerms(options.terms))
  }

  return sections.length > 0
    ? `<div class="page-break"></div>${sections.join('')}`
    : ''
}

const applyHeadingNumbers = (html: string): string => {
  const $ = cheerio.load(html)
  const headingCounters: HeadingCounters = { h1: 0, h2: 0, h3: 0 }

  $('h1, h2, h3').each((_, element) => {
    const $element = $(element)
    const level = `h${element.tagName.slice(1)}` as keyof HeadingCounters

    headingCounters[level]++
    if (level === 'h1') {
      headingCounters.h2 = 0
      headingCounters.h3 = 0
    } else if (level === 'h2') {
      headingCounters.h3 = 0
    }

    const headingNumber = generateHeadingNumber(headingCounters, level)
    const headingText = $element.text()
    const headingId =
      $element.find('.heading-anchor').attr('id') || getSlug(headingText)

    $element.html(
      `<a id="${headingId}" class="heading-anchor"></a>${headingNumber} ${headingText}`,
    )
  })

  return $.html()
}

const generateHeadingNumber = (
  counters: HeadingCounters,
  level: keyof HeadingCounters,
): string => {
  switch (level) {
    case 'h1':
      return `${counters.h1}.`
    case 'h2':
      return `${counters.h1}.${counters.h2}.`
    case 'h3':
      return `${counters.h1}.${counters.h2}.${counters.h3}.`
  }
}

const generateHtmlContent = async (options: DocpackConfig): Promise<string> => {
  const htmlContent = await Promise.all(
    options.chapters.map(async (chapter, index) => {
      const chapterHtml = await marked.parse(addHeadingIds(chapter.content))
      const processedHtml = options.references
        ? processReferencesInHtml(chapterHtml, options.references)
        : chapterHtml
      return index > 0
        ? `<div class="page-break"></div>${processedHtml}`
        : processedHtml
    }),
  )

  return htmlContent.join('')
}

const generateCover = (cover: string): string => {
  return `${marked.parse(cover)}<div class="page-break"></div>`
}

const convertHtmlToPdf = async (
  html: string,
  pageNumbering: boolean,
  inputPath: string,
  outputPath?: string,
) => {
  const updatedHtml = convertImagesToBase64(html, inputPath)
  const tempPdfPath = path.join(inputPath, 'temp.pdf')
  const outputPdf = outputPath ? path.join(outputPath, 'output.pdf') : undefined

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()

  try {
    await page.setContent(updatedHtml, { waitUntil: 'networkidle0' })
    await page.pdf(getPdfOptions(tempPdfPath, pageNumbering))

    const headings = await extractHeadings(tempPdfPath)
    const finalHtml = updateHtmlToc(updatedHtml, headings)

    await page.setContent(finalHtml, { waitUntil: 'networkidle0' })
    const finalPdf = await page.pdf(getPdfOptions(outputPdf, pageNumbering))

    if (!outputPath) {
      return finalPdf
    }
  } finally {
    console.log('PDF converted')
    await browser.close()
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath)
    }
  }
}

const getPdfOptions = (path: string | undefined, pageNumbering: boolean) => ({
  path,
  format: 'A4' as const,
  margin: { top: '30mm', right: '20mm', bottom: '20mm', left: '20mm' },
  printBackground: true,
  displayHeaderFooter: pageNumbering,
  headerTemplate: getHeaderTemplate(),
  footerTemplate: getFooterTemplate(),
})

const getHeaderTemplate = (): string => {
  const { data, isSvg } = getImageData('./input/assets/facekom_logo.svg')
  const imgSrc = isSvg
    ? `data:image/svg+xml;utf8,${encodeURIComponent(data)}`
    : `data:image/png;base64,${data}`
  return `
    <div style="font-size: 10px; text-align: center; width: 100%;">
        <img src="${imgSrc}" style="height: 20mm; max-width: 90%;" />
    </div>
  `
}

const getFooterTemplate = (): string => `
  <div style="font-size: 10px; text-align: center; width: 100%;">
      Page <span class="pageNumber"></span> of <span class="totalPages"></span>
  </div>
`

const generateTocFromHtml = (html: string): string => {
  const $ = cheerio.load(html)
  let toc = '<h2>Table of Contents</h2>\n<ul>'

  for (const element of $('h1, h2, h3').toArray()) {
    const $element = $(element)
    const level = Number.parseInt(element.tagName.substring(1))
    const text = $element.text()
    const id = $element.find('.heading-anchor').attr('id') || ''

    toc += `\n  <div class="toc-level-${level}"><a href="#${id}">${text} <span class="page-ref" data-ref="${id}"></span></a></div>`
  }

  return `${toc}</ul>`
}

const addHeadingIds = (content: string): string => {
  return content.replace(/^(#{1,3}) (.+)$/gm, (_, hashes, title) => {
    const slug = getSlug(title)
    return `${hashes} <a id="${slug}" class="heading-anchor"></a>${title}`
  })
}

const convertImagesToBase64 = (html: string, inputPath: string): string => {
  const $ = cheerio.load(html)

  for (const img of $('img').toArray()) {
    const $img = $(img)
    const originalSrc = $img.attr('src')

    if (!originalSrc || originalSrc.startsWith('http')) continue
    const fileExtension = originalSrc.split('.').slice(-1)[0] as FileExtension
    if (!FILE_TYPE_MAP[fileExtension]) {
      console.log(`There is no mapping for file extension '${fileExtension}'.`)
      continue
    }

    const localFilename = originalSrc.replace(
      'attachments/',
      `${inputPath}/assets/`,
    )

    if (!fs.existsSync(localFilename)) {
      console.log(`File does not exist: ${localFilename}`)
      continue
    }

    const localSrc = `data:${FILE_TYPE_MAP[fileExtension]};base64,${fs.readFileSync(localFilename).toString('base64')}`
    $img.attr('src', localSrc)
    $img.attr('style', 'max-width: 100%')
  }

  return $.html()
}

const processReferencesInHtml = (
  html: string,
  references: DocpackReferenceCollection,
): string => {
  const $ = cheerio.load(html)

  for (const paragraph of $('p').toArray()) {
    const $paragraph = $(paragraph)
    let content = $paragraph.html() || ''

    for (const refId of Object.keys(references)) {
      const regex = new RegExp(`\\b${escapeRegExp(refId)}\\b`, 'g')
      content = content.replace(
        regex,
        `<a href="#reference-${getSlug(refId)}" class="reference-link">${refId}<sub>${1}</sub></a>`,
      )
    }

    $paragraph.html(content)
  }

  return $.html()
}

type ProcessedHeading = {
  text: string
  page: number
  used: boolean
}

const updateHtmlToc = (
  htmlContent: string,
  headings: ReadonlyArray<{ page: number; text: string }>,
): string => {
  const $ = cheerio.load(htmlContent)

  const tocEntries = $('.page-ref')
    .map((_, element) => {
      const $element = $(element)
      const id = $element.attr('data-ref')
      const text = $element.closest('a').text().trim()
      return id ? { id, text, $element } : null
    })
    .get()
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  const processedHeadings: ProcessedHeading[] = headings.map((heading) => ({
    text: getSlug(removeVersionPrefix(heading.text)),
    page: heading.page,
    used: false,
  }))

  for (const entry of tocEntries) {
    const entrySlug = getSlug(removeVersionPrefix(entry.text))
    const matchingHeading = processedHeadings.find(
      (h) => h.text === entrySlug && !h.used,
    )

    if (matchingHeading) {
      entry.$element.text(`${matchingHeading.page}`)
      matchingHeading.used = true
    } else {
      const closestHeading = findClosestHeading(entry, processedHeadings)
      if (closestHeading) {
        entry.$element.text(`${closestHeading.page}`)
        closestHeading.used = true
      } else {
        console.warn(`No matching heading found for TOC entry: ${entry.text}`)
      }
    }
  }

  return $.html()
}

const findClosestHeading = (
  entry: { text: string },
  headings: ProcessedHeading[],
): ProcessedHeading | undefined => {
  const entrySlug = getSlug(removeVersionPrefix(entry.text))

  return headings.find(
    (heading) =>
      !heading.used &&
      (heading.text.includes(entrySlug) || entrySlug.includes(heading.text)),
  )
}

const getImageData = (imagePath: string): { data: string; isSvg: boolean } => {
  const ext = path.extname(imagePath).toLowerCase()
  const isSvg = ext === '.svg'

  if (isSvg) {
    const svgContent = fs.readFileSync(imagePath, 'utf-8')
    return { data: svgContent, isSvg: true }
  }

  const imageBuffer = fs.readFileSync(imagePath)
  const base64Image = imageBuffer.toString('base64')
  return { data: base64Image, isSvg: false }
}

marked.setOptions({ gfm: true })
