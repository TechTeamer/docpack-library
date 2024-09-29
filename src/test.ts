import MarkdownToPDFConverter from '@/index'

const coverter = new MarkdownToPDFConverter()

const stuff = async () => {
  await coverter.convertFolder('./input', './output')
}

stuff()
