const getFilesModule = require("./services/getFiles.js")

/**
 * Generates a result based on the provided configuration.
 * @param {Object} config - The configuration object.
 * @returns {Promise<Object>} - A promise that resolves to the generated result.
 */
async function generate(config) {
  let result = {}
  const options = config.options

  for (const option of options) {
    switch (option.type) {
    case "addPdf":
      break
    case "collectManual":
      break
    case "getFiles":
      result.getFiles = await getFilesModule.getFiles(option.root)
      break
    case "packFolder":
      break
    case "youtrack":
      break
    }
  }

  return result
}

/**
 * The main function that serves as the entry point of the application.
 * It imports the configuration from a JSON file, generates a result using the configuration,
 * and logs the config and result to the console.
 * @returns {Promise<void>} A promise that resolves when the main function completes.
 */
async function main() {
  const config = require('./docs.json');

  console.log("Config:", config)

  const result = await generate(config)
  console.log("Result:", result)
}

module.exports = { generate, main }
