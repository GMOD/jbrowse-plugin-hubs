## [2.0.1](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v2.0.0...v2.0.1) (2026-11-25)

### Chores

- A changelog and GitHub release per version, and a tag publishes only past the gates ([af9883e](https://github.com/GMOD/jbrowse-plugin-hubs/commit/af9883e703ef532f3f1dd7ddc30b9e49a798bfb4))

### Documentation

- The store entry is ESM as of 2.0.0, so releasing needs no manifest edit ([5999de2](https://github.com/GMOD/jbrowse-plugin-hubs/commit/5999de2d9d4af82fad565b2d31f046ca13c78ef0))

## [2.0.0](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.18...v2.0.0) (2026-11-25)

### Features

- **BREAKING** An ES module for JBrowse 5; JBrowse 4 keeps the 1.0.18 UMD ([67c5f6e](https://github.com/GMOD/jbrowse-plugin-hubs/commit/67c5f6e8e97a2944f13bde5f096c4c6ebf08166a))

## [1.0.18](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.17...v1.0.18) (2026-11-10)

### Bug Fixes

- A stored hub connection with no live instance is made again ([efc3861](https://github.com/GMOD/jbrowse-plugin-hubs/commit/efc3861e2d8eb9564b0a450bd60112904ec7d5b0))

## [1.0.17](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.16...v1.0.17) (2026-11-04)

### Bug Fixes

- The desktop session download keeps each relative uri's baseUri ([009d677](https://github.com/GMOD/jbrowse-plugin-hubs/commit/009d6774d5d6ca4f93f35683c4500d500445de14))

## [1.0.16](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.15...v1.0.16) (2026-09-28)

### Features

- Describe a hub genome as its assembly config, baseUri beside each uri ([69b9eb5](https://github.com/GMOD/jbrowse-plugin-hubs/commit/69b9eb5dbd8ce293d748e8bcf16d584529823ca3))

## [1.0.15](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.14...v1.0.15) (2026-09-24)

### Bug Fixes

- Host-compat probe answers the store manifest with the candidate's hash ([4d1ce04](https://github.com/GMOD/jbrowse-plugin-hubs/commit/4d1ce04eab95d0742ab5aee72c004f6d75903ff2))

### Features

- Describe hub genomes a multi-way lane lacks, without connecting them ([74ef0e3](https://github.com/GMOD/jbrowse-plugin-hubs/commit/74ef0e38e1378a177b1af307d929e39d21f3ce88))

## [1.0.14](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.13...v1.0.14) (2026-08-04)

### Features

- Tell core when the probe is done, so waitForAssembly need not guess ([edef199](https://github.com/GMOD/jbrowse-plugin-hubs/commit/edef199d263ddfe8e221eec40ce647672e17a6e9))

## [1.0.13](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.12...v1.0.13) (2026-08-04)

### Bug Fixes

- Don't announce a connection nobody asked for ([cbadb5c](https://github.com/GMOD/jbrowse-plugin-hubs/commit/cbadb5c4f0dc7e3626a6db26ce19e7543172cb31))
- Resolve a UCSC genome from minimal.json, and stop re-probing a name that missed ([97085ab](https://github.com/GMOD/jbrowse-plugin-hubs/commit/97085abd0ed47c92c728a596dfb68abbeb11585f))

### Chores

- Boot the candidate build on hosted releases before it can be published ([6b51da6](https://github.com/GMOD/jbrowse-plugin-hubs/commit/6b51da681c82b63346100adbd51be66086169b6b))

## [1.0.12](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.11...v1.0.12) (2026-07-31)

### Bug Fixes

- Harden desktop-session download and extension-point handler ([fcdad8b](https://github.com/GMOD/jbrowse-plugin-hubs/commit/fcdad8baf5a2e0aeed8ea8cc80fae8cdf32315b5))

### Other Changes

- Check the config exists before auto-connecting ([d3305e4](https://github.com/GMOD/jbrowse-plugin-hubs/commit/d3305e4c89710a2d94caa8d483648721c80d3476))

## [1.0.11](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.10...v1.0.11) (2026-07-30)

### Chores

- Restore pnpm-lock.yaml so publishing works again ([dcca8cc](https://github.com/GMOD/jbrowse-plugin-hubs/commit/dcca8ccfae835a6cc7cad23fb70fd0727eaa5ab2))

## [1.0.10](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.9...v1.0.10) (2026-07-30)

### Bug Fixes

- Contribute to Tools, not File, so released cores don't error-page ([fcac693](https://github.com/GMOD/jbrowse-plugin-hubs/commit/fcac693aff602394cd22946b464c40a74f8d56b3))

### Other Changes

- Add approved builds ([fb5d555](https://github.com/GMOD/jbrowse-plugin-hubs/commit/fb5d5550eb14ac9861d482a8d8d287369470e22a))
- Updates ([2bb283b](https://github.com/GMOD/jbrowse-plugin-hubs/commit/2bb283b9166b0a284cd9c8093a3fc6eca5da580e))

## [1.0.9](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.8...v1.0.9) (2026-06-19)

### Chores

- Add repository field (required for npm --provenance) ([4a84899](https://github.com/GMOD/jbrowse-plugin-hubs/commit/4a84899ddf52e2aabc301119cd9bab8246d8c67d))

## [1.0.8](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.7...v1.0.8) (2026-06-19)

### Bug Fixes

- Gate "Download desktop session" menu item to jbrowse-web only ([84c9f57](https://github.com/GMOD/jbrowse-plugin-hubs/commit/84c9f575949d1df67dd12230a5de769fd0d29df6))

## [1.0.7](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.6...v1.0.7) (2026-06-19)

### Chores

- Migrate to pnpm and ESLint flat config with import-x ([ccce50d](https://github.com/GMOD/jbrowse-plugin-hubs/commit/ccce50d35697dabf1d2a41a2946ab15f4c07ca73))
- Add npm trusted-publishing workflow on v* tags ([bbf270f](https://github.com/GMOD/jbrowse-plugin-hubs/commit/bbf270f9f425dd94fc6f4b47a0bb6971a5cdcf3c))
- Reference GMOD/jbrowse-plugin-hubs (repo moved) in publish setup note ([ef81b2c](https://github.com/GMOD/jbrowse-plugin-hubs/commit/ef81b2cae9495c78cceb726996d90c57bfbbb159))
- Drop eslint-plugin-unicorn; enable object-shorthand + no-unnecessary-condition ([3b7f9cf](https://github.com/GMOD/jbrowse-plugin-hubs/commit/3b7f9cf727d06d1f5cffd9e5a01086ad8166dc8a))

### Features

- Add "Download desktop session (.jbrowse)" File menu item ([8b3ab0f](https://github.com/GMOD/jbrowse-plugin-hubs/commit/8b3ab0f0f874660dde145fe7abd774a140ab8367))

## [1.0.6](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.5...v1.0.6) (2026-01-30)

### Other Changes

- Patch ([19c812b](https://github.com/GMOD/jbrowse-plugin-hubs/commit/19c812b9383597327b21b5e17ecf71b28896379d))

## [1.0.5](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.4...v1.0.5) (2026-01-30)

### Other Changes

- Npm run->yarn ([387663f](https://github.com/GMOD/jbrowse-plugin-hubs/commit/387663facdef998f7f1a96c55e91233622d20f58))
- Reduce devdeps ([fa90c0c](https://github.com/GMOD/jbrowse-plugin-hubs/commit/fa90c0c9daf215a8530795e8b4d087d6708b67c8))
- R1 ([cf925b2](https://github.com/GMOD/jbrowse-plugin-hubs/commit/cf925b24a9d30377d56c525112470f13fa6d10ba))
- R2 ([f649778](https://github.com/GMOD/jbrowse-plugin-hubs/commit/f649778fa367779f8358317e6ec916e0d0e08b08))

## [1.0.4](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.3...v1.0.4) (2026-01-29)

### Other Changes

- Update yarn.lock ([faf17ae](https://github.com/GMOD/jbrowse-plugin-hubs/commit/faf17ae4d9bf5ef904f7e2bea7d888043342fc44))

## [1.0.3](https://github.com/GMOD/jbrowse-plugin-hubs/compare/v1.0.2...v1.0.3) (2026-01-29)

### Other Changes

- Bump deps ([a1b38e0](https://github.com/GMOD/jbrowse-plugin-hubs/commit/a1b38e036a14b7a529776f47b56762d37c5b7f3e))
- Fix tests ([a26e9e3](https://github.com/GMOD/jbrowse-plugin-hubs/commit/a26e9e31aff7ba90e77a139be45632fa7286872c))
- Lint ([8256f24](https://github.com/GMOD/jbrowse-plugin-hubs/commit/8256f242162d0523ed446c8ecbf0a36e63f8535d))
- More updates ([7871dcb](https://github.com/GMOD/jbrowse-plugin-hubs/commit/7871dcb37406d54f8ae84ce4773c599d9d0a9b65))

## [1.0.2](https://github.com/GMOD/jbrowse-plugin-hubs/compare/...v1.0.2) (2025-07-31)

### Other Changes

- Initial ([a4095b2](https://github.com/GMOD/jbrowse-plugin-hubs/commit/a4095b27e7657e91c20552438b4bf9c0d6c48e31))

