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

## Dotabod fork maintenance

`fetch.yaml` checks dotabuff/d2vpkr every hour and rebuilds when its source commit
changes. It also rebuilds daily for live Valve data feeds, and after generator or
manual JSON changes. Each build pins game-resource URLs to the detected d2vpkr
commit. HTTP failures stop regeneration, so an error page cannot silently advance
the source tracker.

Only changed generated data creates a package version. A client update that only
changes unrelated assets can advance `d2vpkr_commit` without changing constants or
bumping the package. The `version` file records the Steam client version of the
last generated-data update; it is not the last client build ever observed.

The backend repository's `dotaconstants-update.yml` checks both Dotabod consumers
hourly, compares all generated JSON datasets and entry points, and updates their
exact pins and pnpm lockfiles together. Scheduled updates merge only after consumer
CI and checks pass. Preview commits outside this fork's master history produce
reviewable PRs without automatic merging.

Upstream generator changes still need review. Merge upstream through a merge
commit, preserving its ancestry and the Dotabod exports, cosmetics, and innate
support. The generator tests and live regeneration check cover those integrations.

Cosmetic icon regeneration is a separate weekly VPK job that needs a working Steam
account with a Dota license. `InvalidPassword` requires updating the Actions
`STEAM_USERNAME`/`STEAM_PASSWORD` secrets; gameplay constants do not need that login.
