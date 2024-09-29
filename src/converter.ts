import { marked } from 'marked'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'
import fs from 'node:fs'
import path from 'node:path'
import type { DocpackConfig } from '@/parser'

const fileTypeMap = {
  png: 'image/png',
  jpg: 'image/jpg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
}

const generateToc = (content: string) => {
  const headings = content.match(/^#{1,3} .+$/gm) || []
  let toc = '<h2>Table of Contents</h2>\n<ul>'
  for (const heading of headings) {
    console.log(heading)
    const level = heading.match(/^#+/)?.[0].length || 0
    const text = heading.replace(/^#+\s/, '')
    const slug = text.toLowerCase().replace(/[^\w]+/g, '-')
    toc += `\n  <li class="toc-level-${level}"><a href="#${slug}">${text}</a> <span class="page-ref" data-ref="${slug}"></span></li>`
  }
  toc += '\n</ul>'
  return toc
}

const addHeadingIds = (content: string) => {
  return content.replace(/^(#{1,3}) (.+)$/gm, (_, hashes, title) => {
    const slug = title.toLowerCase().replace(/[^\w]+/g, '-')
    return `${hashes} <a id="${slug}" class="heading-anchor"></a>${title}`
  })
}

const convertImagesToBase64 = (html: string) => {
  const $ = cheerio.load(html)

  $('img').each(function () {
    const original_src = $(this).attr('src')

    if (!original_src) return
    const file_extension = original_src
      .split('.')
      .slice(-1)[0] as keyof typeof fileTypeMap
    if (!fileTypeMap[file_extension]) {
      console.log(`There is no mapping for file extension '${file_extension}'.`)
      return
    }
    const local_filename = original_src

    if (!fs.existsSync(local_filename)) {
      console.log(`File does not exist: ${local_filename}`)
      return
    }
    const local_src = `data:${fileTypeMap[file_extension]};base64,${fs.readFileSync(local_filename).toString('base64')}`
    $(this).attr('src', local_src)
    $(this).attr('style', 'max-width: 100%')
  })

  return $.html()
}

const convertMarkdownToHtml = (
  inputPath: string,
  options: DocpackConfig,
  lang: string,
) => {
  console.log('asdadsds', inputPath)
  const markdowns = options.chapters.map((chapter) => chapter.content)
  const markdown = markdowns
    .map((markdown) =>
      markdown.replaceAll('attachments/', `${inputPath}/assets/`),
    )
    .join('\n')
  let toc = null
  let cover = null

  console.log(markdown)
  if (options.manifest.settings.tableOfContents) {
    toc = `${generateToc(markdown)} <div class="page-break"></div>`
  }

  if (options.manifest.cover && options.cover) {
    cover = `${marked.parse(options.cover)}<div class="page-break"></div>`
  }

  const contentWithIds = addHeadingIds(markdown)
  const htmlContent = marked.parse(contentWithIds)

  const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.manifest.title[lang]}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .toc-level-2 { margin-left: 20px; }
        .toc-level-3 { margin-left: 40px; }
        @media print {
            .page-break { page-break-after: always; }
        }
        table, th, td {
          border: 1px solid black;
          border-collapse: collapse;
        }
        th, td {
          padding: 5px;
        }
        .page-ref::before {
            content: " (page ";
        }
        .page-ref::after {
            content: ")";
        }
    </style>
</head>
<body>
    <header>
        <h1>${options.manifest.title[lang]}</h1>
        <p>By ${options.manifest.authors.join(', ')}</p>
    </header>
    ${cover ?? ''}
    ${toc ?? ''}

    ${htmlContent}
</body>
</html>
    `

  return convertImagesToBase64(template)
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

const convertHtmlToPdf = async (html: string, outputPath: string) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })

  let headerTemplate = `
        <div style="font-size: 10px; text-align: center; width: 100%;">
            ${'almafa'}
        </div>
    `

  const { data, isSvg } = getImageData('./input/assets/facekom_logo.svg')
  const imgSrc = isSvg
    ? `data:image/svg+xml;utf8,${encodeURIComponent(data)}`
    : `data:image/png;base64,${data}`

  headerTemplate = `
            <div style="font-size: 10px; text-align: center; width: 100%;">
                <img src="${imgSrc}" style="height: 20mm; max-width: 90%;" />
                <div>${'temp'}</div>
            </div>
        `

  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: { top: '30mm', right: '20mm', bottom: '30mm', left: '20mm' },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: headerTemplate,
    footerTemplate: `
            <div style="font-size: 10px; text-align: center; width: 100%;">
                Page <span class="pageNumber"></span> of <span class="totalPages"></span>
            </div>
        `,
  })

  const pageNumbers = await page.evaluate(() => {
    const headings = document.querySelectorAll('.heading-anchor')
    const pageRefs: { [key: string]: number } = {}
    const pageHeight = 1123
    const headerHeight = 30 * 3.78
    const contentTop = headerHeight

    for (const heading of headings) {
      const id = heading.id
      const rect = heading.getBoundingClientRect()
      const pageNumber = Math.floor((rect.top - contentTop) / pageHeight) + 1
      pageRefs[id] = pageNumber
    }
    return pageRefs
  })

  const updatedHtml = await page.evaluate((pageNumbers) => {
    const pageRefs = document.querySelectorAll('.page-ref')
    for (const ref of pageRefs) {
      const id = ref.getAttribute('data-ref')
      if (id && pageNumbers[id]) {
        ref.textContent = (pageNumbers[id] + (true ? 2 : 1)).toString()
      }
    }
    return document.documentElement.outerHTML
  }, pageNumbers)

  await page.setContent(updatedHtml, { waitUntil: 'networkidle0' })
  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: { top: '30mm', right: '20mm', bottom: '30mm', left: '20mm' },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: headerTemplate,
    footerTemplate: `
            <div style="font-size: 10px; text-align: center; width: 100%;">
                Page <span class="pageNumber"></span> of <span class="totalPages"></span>
            </div>
        `,
  })

  await browser.close()
}

export const convertMarkdownToPdf = async (
  inputPath: string,
  options: DocpackConfig,
  lang: string,
  outputPath: string,
) => {
  const html = convertMarkdownToHtml(inputPath, options, lang)

  fs.writeFileSync('./test.html', html)
  await convertHtmlToPdf(html, outputPath)
  console.log(`PDF generated: ${outputPath}`)
}
