FaceKom Dockpack Library
========================

## Usages

### Programmatic usage

```js
const path = require('node:path')
const dockpack = require('@techteamer/dockpack')

const configPath = path.join(process.cwd(), 'docs.json')

dockpack.generate({
  configPath,
  options: {}
})
```

## API

## `.generate(options)`

Description...

**options**: `Object`

Description...

**options.configPath**: `String`

Description...

## docs.json config

Description...

**format:** `JSON`

**Exhaustive example**

```json
{
  // TODO
  "<book_name>": {
    "name": "string",
    "files": ["<glob_pattern>"]
  }
}
```

**book_name**: `Object`

Description...

**book_name.name**: `String`

Description...
