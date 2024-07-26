FaceKom Documentation Packaging
===============================
This package's purpose is to generate a PDF file based on the content of an input folder.

The structure of the input folder should be the following:
```
./input_folder
|-- assets
|-- chapters
|-- cover.md
|-- definitions
|   |-- abbreviations.json
|   |-- references.json
|   `-- terms.json
|-- history.json
|-- manifest.json
`-- outline.json
```

The library should export a class which has a method, which is callable and accepts the path of the input folder as a parameter.

## Content of the files
### manifest.json
```ts
interface DocpackManifest{
  title: { [ languageKey: string ]: string }, // The title of the generated PDF in different languages.
  authorts: string[], // List of the authors.
  cover: boolean, // Flag if a cover should be generated and added to the beginning of the generated PDF file.
  settings: {
    pageNumbering: boolean, // Flag if the pages should be numbered.
    chapterNumbering: boolean, // Flag if the chapters should be automatically numbered.
    tableOfContents: boolean, // Flag if table of contents should be generated to the beginning of the generated PDF file. It should be right after the cover page or the document history if it is included in the generated PDF file.
    documentHistory: boolean, // Flag if document history should be generated to the beginning of the generated PDF file. It should be right after the cover page.
    terms: boolean, // Flag if a legend for the used terms should be included in the generated PDF file. If it should be included, it have to be generated based on the `definitions/terms.json` file.
    abbreviations: boolean, // Flag if a legend for the used abbreviations should be included in the generated PDF file. If it should be included, it have to be generated based on the `definitions/abbreviations.json` file.
    references: boolean // Flag if a legend for the used references should be included in the generated PDF file. If it should be included, it have to be generated based on the `definitions/references.json` file.
  },
  locale: {
    default: string, // Language code of the default language of the input files.
    options: string[] // All language in which the source files are available and the PDFs will be generated.
  }
}
```

### outline.json
```ts
interface DocpackOutline{
  chapters: {
    fileName: string, // Name of the folder where the chapter can be found.
    include: boolean, // Flag if the chapter should be included in the generated PDF file or not.
    title: { [ languageKey: string ]: string } // The title of the chapter in different languages.
  }[] // List of chapters used during the generation of the PDF file.
}
```

### history.json
```ts
interface DocpackHistory{
  history: {
    version: string, // Semantic version of a release of the PDF file.
    author: string, // Author of a release.
    date: string, // Time of release in YYYY-MM-DD format.
    description: string // Description of what changed in the release.
  }[] // Versions of the PDF file.
}
```

### definitions/abbreviations.json
```ts
interface DocpackAbbreviation{
  short: string, // Abbreviation used in the source files.
  long: string // Meaning behind the abbreviation.
}[]
```

### definitions/references.json
```ts
interface DocpackReferenceCollection {
  [ referenceId: string ]: {
    title: string, // Name of the reference.
    link: string // The link where the referenced source can be found.
  } // A reference which can be referred in the source files by the referenceId.
}
```

### definitions/terms.json
```ts
interface DocpackTerm {
    term: string, // Term used in the source files.
    definition: string // Meaning of the used term.
}[] // List of terms used in the source files.
```

## Content of the folders
### The `chapters` folder
This folder should include the markdown files from which a chapter of the PDF file should be generated.

The files should follow the following naming convention:
```
<CHAPTER_NAME>-<LANGUAGE_CODE>.md
```

In the convention described above the `CHAPTER_NAME` is the value which should be used in the `outline.json` file in the `fileName` attribute of the chapters.

In the convention described above the `LANGUAGE_CODE` is the value which should be included in the `manifest.json` file in the `locale.options` attribute.

#### Example
If the `manifest.json` and `outline.json` looks like the example below, then the `chapters` folder should look like the tree below.

##### manifest.json
```json
{
  "title": {
    "hu": "Fejlesztői dokumentáció",
    "en": "Developer documentation"
  },
  // ...
  "locale": {
    "default": "hu",
    "options": ["hu", "en"]
  }
}
```

##### outline.json
```json
{
  "chapters": [
    {
      "fileName": "installation",
      "include": true,
      "title": {
        "hu": "Telepítés",
        "en": "Installation"
      }
    }
  ]
}
```

##### Content `chapters` folder
```
./input_folder
|-- chapters/
|   |-- installation-hu.md
|   `-- installation-en.md
```

### The `assets` folder
This folder should contain every file which is referenced in the source files. Currently only images are supported.

## Installation
You can add this library to your project by executing the following command in you project's folder.
```bash
npm install @techteamer/docpack-library
```

## Usage
The library can be used in two ways. One is when the result should be written out into a file on the file system. The other one is when the generated should be returned as a `Buffer`.

### Writing result out into a file
```ts
import { MarkdownToPDFConverter } from '@techteamer/docpack-library';

const converter = new MarkdownToPDFConverter();
converter.convertFolder('./inputFolder', './output/genereated.pdf').then(() => {
  console.log('Conversion completed.');
});
```

The example above imports the `MarkdownToPDFConverter` to from the `@techteamer/docpack-library` package, then instantiates it.

Via the previously instantiated instance, it calls the convertFolder method, which accepts two parameters. The first is the `inputFolder` parameter which is a relative or absolute path of the folder which should be converted into a PDF file.

The second one is the `outputFile` parameter which is a relative or absolute path of the file where the generated PDF file should been written out.

When the Promise which was returned from the `MarkdownToPDFConverter.convertFolder` method resolves, it writes out the console the `Conversion completed.` text.

### Receiving result as a `Buffer`
```ts
import { MarkdownToPDFConverter } from '@techteamer/docpack-library';

const converter = new MarkdownToPDFConverter();
converter.convertFolder('./inputFolder').then((buffer) => {
  console.log('Conversion completed.')
  fs.writeFile('output/generated.pdf', buffer, (error) => {
    if (error) {
      console.error('An error occured during writing out the Buffer into the file:', error);
      return;
    }
    console.log('Buffer successfully saved to the file!');
  });
});
```

The example above imports the `MarkdownToPDFConverter` to from the `@techteamer/docpack-library` package, then instantiates it.

Via the previously instantiated instance, it calls the convertFolder method, which accepts two parameters. The first is the `inputFolder` parameter which is a relative or absolute path of the folder which should be converted into a PDF file.

When the Promise which was returned from the `MarkdownToPDFConverter.convertFolder` method resolves, it tries to write out the buffer resolved by the promise into the `output/generated.pdf` file. If an error occurs during the write out, it prints the `An error occured during writing out the Buffer into the file:` text and the error object to the console. If it can successfully write it out into the file, it prints out the `Buffer successfully saved to the file!` string to the console.
