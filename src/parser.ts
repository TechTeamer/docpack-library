import fs from 'node:fs/promises'
import path from 'node:path'

export type DocpackConfig = {
  manifest: DocpackManifest
  cover: string | null
  abbreviations: DocpackAbbreviation | null
  references: DocpackReferenceCollection | null
  terms: DocpackTerm | null
  chaptersConfig: Chapter[]
  chapters: {
    id: string
    content: string
  }[]
}

export type DocpackManifest = {
  title: { [languageKey: string]: string }
  authors: string[]
  cover: boolean
  header?: string
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

export type DocpackAbbreviation = {
  short: string
  long: string
}[]

export type DocpackReferenceCollection = {
  [referenceId: string]: {
    title: string
    link: string
  }
}

type Chapter = {
  fileName: string
  include: boolean
  title: { [languageKey: string]: string }
}

export type DocpackTerm = { term: string; definition: string }[]

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

const loadChapters = async (
  chaptersConfig: Chapter[],
  chaptersPath: string,
) => {
  const chapterFiles = await fs.readdir(chaptersPath)
  const chapters = await Promise.all(
    chapterFiles.map(async (file) => {
      const chapterPath = path.join(chaptersPath, file)
      const chapterContent = await loadFile(chapterPath)

      const chapter = chaptersConfig.find(
        (chapter) => chapter.fileName === path.basename(file, '.md'),
      )

      if (!chapter || !chapter.include) {
        return
      }

      return {
        id: path.basename(file, '.md'),
        content: chapterContent ?? '',
      }
    }),
  )

  return chapters.filter(
    (chapter): chapter is { id: string; content: string } =>
      chapter !== undefined,
  )
}

export const loadDocpackFiles = async (
  inputPath: string,
): Promise<DocpackConfig> => {
  const manifestPath = path.join(inputPath, 'manifest.json')
  const chaptersPath = path.join(inputPath, 'chapters.json')

  const manifest = await loadConfigFile<DocpackManifest>(manifestPath)
  const chaptersConfig = await loadConfigFile<Chapter[]>(chaptersPath)

  if (!manifest) {
    throw new Error('Manifest file not found')
  }

  if (!chaptersConfig) {
    throw new Error('Chapter config file not found')
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

  const chapters = await loadChapters(
    chaptersConfig,
    path.join(inputPath, 'chapters'),
  )

  return {
    manifest,
    cover,
    abbreviations,
    references,
    terms,
    chaptersConfig,
    chapters,
  }
}
