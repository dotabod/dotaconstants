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

# Install directly from GitHub (pre-built, no build step needed)
bun add https://github.com/odota/dotaconstants.git
```

## Usage

```javascript
// Import all constants
const constants = require('dotaconstants');

// Or import specific constants
const { heroes, items } = require('dotaconstants');
```

## Notes
* The package comes with pre-built files - no build step is needed for consumers
* Manually maintained files are located in the `json` directory
* Some data is fetched from remote sources
* Add a new patch ID: `npm run newpatch`
* Update and regenerate build: `npm run build`
* Create a new version: `npm version minor`
* Publish to npm: `npm publish`
