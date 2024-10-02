import type {
  DocpackAbbreviation,
  DocpackReferenceCollection,
  DocpackTerm,
} from '@/parser'
import { getSlug } from '@/utils/text'

export const renderAbbreviations = (abbreviations: DocpackAbbreviation) => {
  let tableHTML = `
    <h1><a id="abbreviations-rendered" class="heading-anchor"></a>Abbreviations</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Abbreviation</th>
            <th>Full Form</th>
          </tr>
        </thead>
        <tbody>
    `

  for (const abbr of abbreviations) {
    tableHTML += `
        <tr>
          <td>${abbr.short}</td>
          <td>${abbr.long}</td>
        </tr>
      `
  }

  tableHTML += `
        </tbody>
      </table>
    `

  return tableHTML
}

export const renderReferences = (references: DocpackReferenceCollection) => {
  let tableHTML = `
      <h1><a id="references-rendered" class="heading-anchor"></a>References</h1>
      <table border="1"">
        <thead>
          <tr>
            <th>Title</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
    `

  for (const referenceKey of Object.keys(references)) {
    const reference = references[referenceKey]
    tableHTML += `
        <tr>
          <td id="reference-${getSlug(referenceKey)}">${reference.title}</td>
          <td><a href="${reference.link}">${reference.link}</a></td>
        </tr>
      `
  }

  tableHTML += `
        </tbody>
      </table>
    `

  return tableHTML
}

export const renderTerms = (terms: DocpackTerm) => {
  let tableHTML = `
      <h1><a id="terms-rendered" class="heading-anchor"></a>Terms</h1>
      <table border="1"">
        <thead>
          <tr>
            <th>Term</th>
            <th>Definition</th>
          </tr>
        </thead>
        <tbody>
    `

  for (const term of terms) {
    tableHTML += `
        <tr>
          <td>${term.term}</td>
          <td>${term.definition}</td>
        </tr>
      `
  }

  tableHTML += `
        </tbody>
      </table>
    `

  return tableHTML
}
