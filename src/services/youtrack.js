const fs = require("fs")
const path = require('path')
const puppeteer = require('puppeteer')
const axios = require('axios')
const mime = require('mime-types')  // Mime type detection

const configPath = path.join(__dirname, './../docs.json')
const configRaw = fs.readFileSync(configPath, 'utf8')
const config = JSON.parse(configRaw)
const youtrackConfig = config.options.find(option => option.type === "youtrack")
if (!youtrackConfig) {
  console.error("No youtrack configuration found.")
  return
}

async function youtrack(workDir) {

  const { YOUTRACK_TOKEN, VUER_BUILD_NUMBER, VUER_TAG_NAME } = youtrackConfig
  if (!YOUTRACK_TOKEN || !VUER_BUILD_NUMBER || !VUER_TAG_NAME) {
    console.error("Please ensure all necessary configuration variables are set in the JSON file.")
    return
  }

  const youtrackUrl = 'https://youtrack.techteamer.com'
  const query = `summary:"${VUER_BUILD_NUMBER} release" project:${VUER_TAG_NAME}*`
  const fetchUrl = `${youtrackUrl}/api/issues?query=${encodeURI(query)}&fields=id,summary,description`
  console.log(fetchUrl)

  try {
    const response = await axios.get(fetchUrl, {
      headers: {
        'Authorization': `Bearer ${YOUTRACK_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })

    const data = response.data
    console.log("Data received:", data)

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setContent(data[0].description, {
      waitUntil: 'networkidle2'
    })
    const pdfBuffer = await page.pdf({ format: 'A4' })

    await browser.close()

    const outputDir = `${workDir}/build/archives`
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
    }
    const outputFilePath = path.join(outputDir, 'release.pdf')
    
    // Mime type check before saving the file
    const mimeType = mime.lookup(outputFilePath)
    if (mimeType === 'application/pdf') {
      fs.writeFileSync(outputFilePath, pdfBuffer)
      console.log(`PDF has been created at ${outputFilePath}`)
    } else {
      console.error('Generated content is not a PDF.')
    }
    
  } catch (error) {
    console.error("Error fetching data:", error)
  }
}

module.exports = { youtrack }
