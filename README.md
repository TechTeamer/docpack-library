FaceKom Dockpack Library
========================

## Usages

### Programmatic usage

```js

//const path = require('node:path')
//const dockpack = require('@techteamer/dockpack')
//const configPath = path.join(process.cwd(), 'docs.json')
//dockpack.generate({
//  configPath,
//  options: {}
//})

```

# API

### .generate(config)

This method generates results based on the provided configuration object. It iterates through each option defined in the configuration, performing actions based on the option's type.

> **Parameter**

***docs.json config***: `Object`

 The configuration object that defines the options to be executed.

 **format:**: `JSON`

> **Returns**

***promise***: `Object`

 A promise that resolves to the generated result.

 ## Main configuration

**Example**

```json
{
  "options": [
    {
      "type": "addPdf",
      "contentPath": "path/to/html",
      "outputPath": "path/to/output.pdf",
      "options": {
        "name": "output.pdf",
        "include": true,
        "files": ["sample.md", "sample.adoc"],
        //TODO: "attachments": "" || ["*.openapi.yml"] <- glob or array of globs, these files will be copied next to the pdf file
        "path": "pdfs",
        "merge": true
      }
    },
    {
      "type": "collectManual",
      "service": "serviceName"
    },
    {
      "type": "getFiles",
      "root": "path/to/source",
      "options": {
        "ignore": true,
        "matchBase": true,
        "dot": true,
        "sync": true,
        "cwd": "root"
      }
    },
    {
      "type": "packFolder",
      "source": "path/to/source",
      "destination": "path/to/destination"
    },
    {
      "type": "youtrack",
      "source": "path/to/source"
    }
  ]
}

```

### Options: `Array` 

The configuration object's options array defines the tasks that the library will execute. Each object in the array must specify the option type and relevant parameters.

### `getFiles`:

Part of the getFilesModule, this function fetches all files within a specified root directory, excluding those listed in the .buildignore file.

> **Parameter**

***root***: : `String`

  The root directory from which files will be collected.

> **Returns**

***promise***: `Array <string>`

  A promise that resolves to the generated result.

### `addPdf`:

Part of the `src/services/addPdf.js` module, this function is tasked with creating PDF files from markdown and asciidoc files. The module supports configuration-based operations, enabling either the merging of multiple documents into a single PDF file or the creation of separate PDF files for each document.

> **Parameters**

***contentPath***: `String`

  Specifies the path to the HTML content that will be converted into a PDF. This path points to the location of the HTML file(s) that serve as the source for the PDF generation process.

***outputPath***: `String`

  Determines the output path where the generated PDF file will be saved. This is the final location of the PDF document after the conversion process is complete.

***options***: `Object`

  Additional parameters to customize the file retrieval process:

- **name**: `String`

  The name of the generated PDF file. This determines the output PDF file's name.

- **include**: `Boolean`

  Determines whether the document should be included in the PDF generation. If `true`, the document will be part of the generated PDF.

- **files**: `Array<String>`

  An array containing the paths to files to be converted into PDF. These can be markdown or asciidoc files.

- **attachments**: `String` or `Array<String>`

  Optional. A glob pattern or an array defining the files to be attached alongside the PDF as attachments. This could include files like `.openapi.yml` for documentation purposes.

- **path**: `String`

  The directory where the generated PDF file will be placed by the module. This determines the output location of the PDF files.

- **merge**: `Boolean`

  If `true`, the module merges all specified files into a single PDF document. If `false`, it generates separate PDF files for each file.

> **Returns**

   ***promise***: `void`

  A promise that resolves when the PDF generation is completed. There is no explicit return value, but upon successful operation, the generated PDF files will be placed in the specified location.

This functionality is crucial for dynamically generating documentation or reports from textual content. With the integration of the `addPdf` module, the system flexibly handles the conversion of content into PDF format, supporting a wide range of user needs.

...


# Project Structure and Content

## Folder and File Structure
- **index.js**: The entry point of the application.
- **src/**: The main folder for the source code.
  - **index.js**: Contains the main logic of the application.
  - **services/**: A folder containing various services.
    - **getFiles.js**: A module for reading and filtering files.
    - **addPdf.js**: A module for generating PDFs from markdown and asciidoc files, supporting both merging and separate file generation based on configuration.
- **docs.json**: Configuration file for generation.
- **test/**: The folder for tests.
  - **api.test.js**: The test file.

## Content
- The **index.js** file serves as the application's entry point, importing and executing the main logic defined in `src/index.js`.
- The **src/index.js** contains the generation logic, handling different types of operations (`addPdf`, `collectManual`, `getFiles`, etc.) based on the `docs.json` configuration.
- The **docs.json** is a configuration file that defines the operations to be performed by the application and their settings.
- The **src/services/getFiles.js** module serves as a cornerstone for file management within the application, specifically designed to retrieve files from a specified root directory. It's built to operate based on configurations, adeptly handling the inclusion or exclusion of files through an ignore list defined in a .buildignore file. This module leverages the glob-promise library to efficiently search and match file patterns within the directory, ensuring a flexible and comprehensive file selection process.
- The **src/services/addPdf.js** module is responsible for creating PDF files from markdown and asciidoc files. It supports configuration-based operations, allowing either the merging of multiple documents into a single PDF or the creation of separate PDF files for each document. This module utilizes libraries such as marked for markdown processing and asciidoctor for asciidoc processing, alongside puppeteer for generating PDFs from HTML content. This functionality is crucial for dynamically generating documentation or reports based on textual content.
- The **test/api.test.js** file is a collection of tests that test various parts of the application.
