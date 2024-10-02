import type { DocpackConfig } from '@/parser'

export const generateHtmlTemplate = (
  options: DocpackConfig,
  lang: string,
  cover: string | null,
  toc: string | null,
  htmlContent: string,
) => `
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
          .toc-level-1 { margin-left: 0; }
          .toc-level-2 { margin-left: 20px; }
          .toc-level-3 { margin-left: 40px; }
          .toc-level-1 a, .toc-level-2 a, .toc-level-3 a {
              display: flex;
              align-items: baseline;
              text-decoration: none;
              color: inherit;
          }
          .toc-level-1 a::before, .toc-level-2 a::before, .toc-level-3 a::before {
              content: "";
              flex: 1;
              order: 2;
              height: 1px;
              background: black;
              margin: 0 5px;
          }
          .page-ref {
              order: 3;
          }
          .page-ref::before, .page-ref::after {
              content: none;
          }
          @media print {
              .page-break { page-break-after: always; }
          }
          table {
            width: 100%;
          }
          table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
          }
          th, td {
            padding: 5px;
          }
          .reference-link {
              color: inherit;
              text-decoration: none;
          }
      </style>
  </head>
  <body>
      <header>
          <h1>${options.manifest.title[lang]}</h1>
          <p>By ${options.manifest.authors.join(', ')}</p>
      </header>
      ${cover ?? ''}
      <div id="toc-placeholder">${toc ?? ''}</div>
      <div class="page-break"></div>
      ${htmlContent}
  </body>
  </html>
  `
