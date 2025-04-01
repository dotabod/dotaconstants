# dotaconstants
Constant data for Dota 2 applications

## Installation

```bash
# NPM
npm install dotaconstants

# Yarn
yarn add dotaconstants

# Bun
bun add dotaconstants
```

### Installing from GitHub

This package includes pre-built files, so no build step is needed. When installing from GitHub, use the following approach:

```bash
# For NPM
npm install github:odota/dotaconstants

# For Yarn
yarn add github:odota/dotaconstants

# For Bun - use the direct URL
bun add https://github.com/odota/dotaconstants
```

### Bun Users - Important Note

When using Bun, add the following to your `package.json` if you're having issues with imports:

```json
"trustedDependencies": [
  "dotaconstants"
]
```

## Usage

```javascript
// Import all constants
const constants = require('dotaconstants');

// Or import specific constants
const { heroes, items } = require('dotaconstants');

// ES Modules import (with TypeScript/Bun)
import { heroes, items } from 'dotaconstants';

// Direct JSON imports (with TypeScript/Bun)
import HEROES from 'dotaconstants/build/heroes.json' assert { type: 'json' };
import ITEMS from 'dotaconstants/build/items.json' assert { type: 'json' };
```

## Notes
* The package comes with pre-built files - no build step is needed for consumers
* Manually maintained files are located in the `json` directory
* Some data is fetched from remote sources
* Add a new patch ID: `npm run newpatch`
* Update and regenerate build: `npm run build`
* Create a new version: `npm version minor`
* Publish to npm: `npm publish`
