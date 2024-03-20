import { promises as fs } from 'fs'
import path from 'path'
import globPromise from 'glob-promise'

const getFilesModule = {

    async getFiles(root) {
        let ignore = [];
        const ignoreFileName = path.join(root, '.buildignore')

        try {
            const ignoreFileContent = await fs.readFile(ignoreFileName, 'utf8')
            ignore = ignoreFileContent.trim().split("\n")
        } catch (error) {
            console.error("Error reading .buildignore file:", error)
        }

        try {
            const options = {
                ignore,
                matchBase: true,
                dot: true,
                cwd: root
            }
            const matches = await globPromise('*', options)
            return matches
        } catch (error) {
            console.error("Error fetching files:", error)
            return []
        }
    }
}

export default getFilesModule
