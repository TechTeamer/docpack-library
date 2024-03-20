FaceKom Dockpack Library
========================

## Usages

### Programmatic usage

```js

import { main } from './src/index.js';

main().then(() => {
    console.log('Operation completed.');
}).catch((error) => {
    console.error('Error:', error);
});

```

# API

### .generate(config)

This method generates results based on the provided configuration object. It iterates through each operation defined in the configuration, performing actions based on the operation's type.

> **Parameter**

***config***: `Object`

 The configuration object that defines the operations to be executed.

 **format:**: `JSON`

> **Returns**

***promise***: `Object`

 A promise that resolves to the generated result.

 ## Main configuration

**Example**

```json
{
  "operations": [
    {
      "type": "addPdf",
      "contentPath": "path/to/html",
      "outputPath": "path/to/output.pdf"
    },
    {
      "type": "collectManual",
      "service": "serviceName"
    },
    {
      "type": "getFiles",
      "root": "path/to/source"
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

### Operations: `Array` 

The configuration object's operations array defines the tasks that the library will execute. Each object in the array must specify the operation type and relevant parameters.

### `getFiles`:

Part of the getFilesModule, this function fetches all files within a specified root directory, excluding those listed in the .buildignore file.

> **Parameter**

***root***: : `String`

  The root directory from which files will be collected.

> **Returns**

***promise***: `Array <string>`

  A promise that resolves to the generated result.

...


### File structure

This documentation relates to the following file structure:

`src/index.js` - Contains the main logic for reading the configuration, performing operations, and logging results.

`src/config.json` - A JSON file containing the configuration for operations.

`src/services/getFiles.js` - Provides functionality to fetch files from a directory, excluding ignored files.
