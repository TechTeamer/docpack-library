import MarkdownToPDFConverter from '@/index'

const coverter = new MarkdownToPDFConverter()

const stuff = async () => {
  const data = await coverter.convertFolder('./input', './output')
  console.log(data)
}

stuff()
