const fs = require('fs');
const path = require("path")
const archiver = require("archiver")
const getFilesModule = require("./getFiles.js")


/**
 * Packs a folder into a zip archive.
 * @async
 * @param {string} source - The source directory to be packed, relative to workDir.
 *   - Example: If you want to archive the 'src' directory of your project, then the `source` should be 'src'.
 * @param {string} destination - The destination path for the zip archive, relative to workDir.
 *   - Example: If you want to save the archive to a file named 'build/archives/archive.zip', the `destination` would be 'build/archives/archive.zip'.
 * @param {string} workDir - The working directory for relative paths. This path serves as the absolute starting point.
 *   - Example: If the project's working directory is '/home/user/project', then `workDir` would be '/home/user/project'.
 * @returns {Promise<void>} A promise that resolves when the packing process is completed.
 *
 * @example
 * // Example usage:
 * const workDir = '/home/user/project'
 * const source = 'src'
 * const destination = 'build/archives/archive.zip'
 */
async function packFolder(source, destination, workDir) {
  try {
    const sourceCodeDirectory = path.resolve(workDir, source)
    const outputFilePath = path.join(workDir, destination)

    console.log(`Packing ${sourceCodeDirectory} to ${outputFilePath}...`)
    const output = fs.createWriteStream(outputFilePath)
    //Setting the compression level of the archive
    const archive = archiver('zip', { zlib: { level: 9 } })

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Archiver warning:', err)
      } else {
        throw err
      }
    })

    archive.on('error', (err) => {
      throw err
    })

    archive.pipe(output)

    // Adding all files from the directory to the archive
    const files = await getFilesModule.getFiles(sourceCodeDirectory)
    for (const file of files) {
        archive.file(path.join(sourceCodeDirectory, file), { name: file })
    }

    await archive.finalize();
    console.log(`${outputFilePath} has been created.`)
  } catch (error) {
    console.error('Error in packFolder:', error)
  }
}

module.exports = packFolder
