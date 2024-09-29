import fs from 'node:fs/promises'
import path from 'node:path'

export type DocpackConfig = {
  manifest: DocpackManifest
  cover: string | null
  abbreviations: DocpackAbbreviation | null
  references: DocpackReferenceCollection | null
  terms: DocpackTerm | null
  chapters: {
    id: string
    content: string
  }[]
}

export type DocpackManifest = {
  title: { [languageKey: string]: string }
  authors: string[]
  cover: boolean
  settings: {
    pageNumbering: boolean
    chapterNumbering: boolean
    tableOfContents: boolean
    documentHistory: boolean
    terms: boolean
    abbreviations: boolean
    references: boolean
  }
  locale: {
    default: string
    options: string[]
  }
}

type DocpackAbbreviation = {
  short: string
  long: string
}[]

type DocpackReferenceCollection = {
  [referenceId: string]: {
    title: string
    link: string
  }
}

type DocpackTerm = { term: string; definition: string }[]

const loadConfigFile = async <T>(filePath: string) => {
  try {
    const loadedFile = await fs.readFile(filePath, 'utf8')

    return JSON.parse(loadedFile) as T
  } catch (error) {
    console.error('Error reading configuration file:', filePath)

    return null
  }
}

const loadFile = async (filePath: string) => {
  try {
    const loadedFile = await fs.readFile(filePath, 'utf8')

    return loadedFile
  } catch (error) {
    console.error('Error reading file:', filePath)

    return null
  }
}

const loadChapters = async (chaptersPath: string) => {
  const chapterFiles = await fs.readdir(chaptersPath)
  const chapters = await Promise.all(
    chapterFiles.map(async (file) => {
      const chapterPath = path.join(chaptersPath, file)
      const chapterContent = await loadFile(chapterPath)

      return {
        id: path.basename(file, '.md'),
        content: chapterContent ?? '',
      }
    }),
  )

  return chapters
}

export const loadDocpackFiles = async (
  inputPath: string,
): Promise<DocpackConfig> => {
  const manifestPath = path.join(inputPath, 'manifest.json')

  const manifest = await loadConfigFile<DocpackManifest>(manifestPath)

  if (!manifest) {
    throw new Error('Manifest file not found')
  }

  const definitionsPath = path.join(inputPath, 'definitions')

  let abbreviations = null
  let references = null
  let terms = null
  let cover = null

  if (manifest.settings.abbreviations) {
    const abbreviationsPath = path.join(definitionsPath, 'abbreviations.json')

    abbreviations = await loadConfigFile<DocpackAbbreviation>(abbreviationsPath)
  }

  if (manifest.settings.references) {
    const referencesPath = path.join(definitionsPath, 'references.json')

    references =
      await loadConfigFile<DocpackReferenceCollection>(referencesPath)
  }

  if (manifest.settings.abbreviations) {
    const termsPath = path.join(definitionsPath, 'terms.json')

    terms = await loadConfigFile<DocpackTerm>(termsPath)
  }

  if (manifest.cover) {
    const coverPath = path.join(inputPath, 'cover.md')

    cover = await loadFile(coverPath)
  }

  const chapters = await loadChapters(path.join(inputPath, 'chapters'))

  return {
    manifest,
    cover,
    abbreviations,
    references,
    terms,
    chapters,
  }
}
