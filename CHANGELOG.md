## [1.3.0](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/compare/v1.2.1...v1.3.0) (2026-02-26)

### 🛠️ Code Refactoring

* **lib/cards/express-route-alert:** fix display issues ([eddd66c](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/eddd66cb909c6053e6110cf2dc74f1a1ffdb3c77))
* **lib/cards/express-route-metric-burst-alert:** fix display issues ([1baca55](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/1baca55a962834e7dcdf853110a4daf7d1111c73))
* **lib/cards:** display fixes ([95bfbc4](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/95bfbc4b3f80c0a7eaac123414c94ea4b138b092))
* **lib/express-route:** additional cleanup ([1ac63f1](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/1ac63f1a3ea2c7f80fd8cbd48b2d526e5a2d743f))
* **lib/express-route:** clean up parameter reassignment (code quality scan suggestion) ([a93b3af](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/a93b3aff0367535be4a4d5c2d2dc0bda0b334caa))
* **lib/express-route:** fix code quality finding (comparison between inconvertible types) ([9867299](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/9867299339bcb88645ec15355fd96fa0bb390a93))
* **lib/express-route:** fix type; output error (code quality scan suggestions) ([5eed7fc](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/5eed7fc57c16a3c9a4535e30ef1acdec3bc19c88))
* **lib/helpers:** clean up timezone logic; reduce duplication in localizeDateTime ([1c54a76](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/1c54a76115c3a037311975b7939c3c4fb4e78586))
* **lib/helpers:** fix code quality finding (comparison between inconvertible types) ([afd1ad7](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/afd1ad77dbc5b764548688dae7102516365776cd))

### 🐛 Fixes

* **lib/cards/express-route-alert:** json parse error ([f6cee56](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/f6cee5656ad40ff259afa52dd6abb6ace9d08c65))

### 🔧 Chores

* **host:** use non-preview version of `Microsoft.Azure.Functions.ExtensionBundle` ([a1e3af8](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/a1e3af8f197535701accb352eb35cc3716045d2f))

### 🏗️ Build System

* **npm:** bump `packageManager` ([b07f0f6](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/b07f0f64cdf379be373db8723cd2e8a31f21d63c))
* **npm:** bump `packageManager` ([a2c0c66](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/a2c0c66e6981e05e16910e70e85c5a7b54496c75))

### style

* **lib/helpers:** rename for consistency ([3cb804a](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/3cb804af0b3146ae715810b4449a2416e61efd73))
* **lib/helpers:** rename var (code quality scan suggestion) ([297a7f8](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/297a7f8c00b90a6496a200fdbc8974ed563df412))
## [1.2.1](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/compare/v1.2.0...v1.2.1) (2026-02-23)

### 🔧 Chores

* **deps-dev:** bump @biomejs/biome from 2.4.2 to 2.4.3 (#536) ([bca623f](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/bca623f8822438dda685548e9424901b48b80adc)), closes [#536](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/issues/536)
* **deps-dev:** bump @biomejs/biome from 2.4.3 to 2.4.4 (#537) ([6ea93fd](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/6ea93fd0f428726c87650d023eff69caadb86987)), closes [#537](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/issues/537)
* **overrides:** add minimatch (address security alert) ([b7aaf0b](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/b7aaf0bb517cd2f1ba52aefb295d0817c35b678b))

### 🏗️ Build System

* **npm:** bump `packageManager` ([a1ad19a](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/a1ad19a0a79bc997c4741f3976ff46137771dd7b))

### style

* **lib/cards/service-health-alert:** don't wrap labels ([142fedf](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/142fedf847613b9ba3fe21e6a9c4a9ec8b0d144e))

## [1.2.0](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/compare/v1.1.0...v1.2.0) (2026-02-17)

### 🛠️ Code Refactoring

* **alert-endpoint:** improve fetch logic ([3958bcb](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/3958bcbb8f56ebbadd61828c6179769289250f9c))
* **alert-endpoint:** update express route burst logic ([6cb4bd0](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/6cb4bd02b3b0dcfb762c29f9f815843e2f528e9f))
* **lib/cards/*:** add work in progress converting FactSet/Fact to ColumnSet/Colum/TextBlock ([129d56d](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/129d56d0fe1a331927069fa038c650f6397e4a33))
* **lib/cards/*:** use Tables (vs ColumnSet/Column or FactSet/Fact) ([988a2b3](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/988a2b3c963d620839220d537f44d9fb96b14372))
* **lib/cards/express-route-log-query-burst-alert:** add metricName ([92ce36a](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/92ce36a0261c28d8a8de7b39db487abc4ec79636))
* **lib/cards/service-health-alert:** add helper methods; fix display issues ([d5ea102](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/d5ea1020f087f800efd019eba32ae75ae59b5e04))
* **lib/cards/service-health-alert:** add WIP to fix a couple display issues ([5b7669e](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/5b7669e155fb69157e950150ab668fd9e0963c73))
* **WIP:** add work in progress ([00d8eb2](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/00d8eb2b543f5fc1f39527b84c5de7900c265c52))

### 🔧 Chores

* **deps-dev:** bump @biomejs/biome from 2.4.1 to 2.4.2 (#535) ([631b2a2](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/631b2a2f7bfcaaf2e74179486ffdb9b0bfcc20ce)), closes [#535](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/issues/535)
* **deps-dev:** bump @biomejs/biome to 2.4.1 ([aa9ec4d](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/aa9ec4d54045164b95c9b256b9b3b19a2668a1dd))
* **deps-dev:** bump @biomejs/biomne to 2.4.0 ([c2ff86c](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/c2ff86c1b8abd77d7a4f5fd3e3afef1b505323c1))
* **deps-dev:** bump azure-functions-core-tools from 4.6.0 to 4.7.0 (#533) ([8dd4614](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/8dd461421e2b477ef7168842b3c258159ef4197b)), closes [#533](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/issues/533)
* **deps:** bump dotenv from 17.2.4 to 17.3.1 (#534) ([36c7191](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/36c7191376b9f403a1b3d6827311be400d7382c7)), closes [#534](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/issues/534)
* **deps:** bump mikesprague/teams-incoming-webhook-action from 1 to 2 (#532) ([09363bf](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/09363bfc5e35c73a0399b950cffad5fbb42d2781)), closes [#532](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/issues/532)

### 📚 Documentation

* **CHANGELOG:** update last release with new changelog format ([2923623](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/2923623f460e715673698583aea94b369394ccc2))

### 🏗️ Build System

* **changelog:** add config for conventional-changelog ([5790059](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/57900594ab9194cb10146ed90a6a6f2b108f2041))
* **npm:** pass config to changelog script ([a226fe8](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/a226fe8690a146ae583390cc29433305fd959ed0))

## 1.1.0 (2026-02-12)

### 🛠️ Code Refactoring

* **alert-endpoint:** replace `axios` with `fetch` ([68ec0ab](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/68ec0ab6551a9dd054eb9f9c66336e5916d27906))
* **lib/cards/*:** reduce size/spacing of all cards ([5b8ddc7](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/5b8ddc7ced6c8e7aca4e483beeda3ae1f71a3876))

### 🔧 Chores

* **deps-dev:** bump @biomejs/biome from 2.3.14 to 2.3.15 (#531) ([dea50d2](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/dea50d2062232bd9b10e3534c0427045e6df8713)), closes [#531](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/issues/531)
* **deps:** bump @azure/storage-blob from 12.30.0 to 12.31.0 (#530) ([647b5bf](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/647b5bf49c03793304f5b7f1e3ce615b1f0fe4e7)), closes [#530](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/issues/530)
* **deps:** bump actions/cache from 4 to 5 (#528) ([0542580](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/0542580edae114f47bd3d6f747554db7faba2723)), closes [#528](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/issues/528)
* **deps:** bump actions/checkout from 5 to 6 (#527) ([82d1352](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/82d1352d5be41f1fd8558c3ed1bc64e17bd1c7e8)), closes [#527](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/issues/527)
* **deps:** bump actions/setup-node from 5 to 6 (#529) ([5163481](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/5163481b805633b5ab03ac14490b24d4394fd2b7)), closes [#529](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/issues/529)
* **deps:** remove axios ([162a39b](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/162a39bc799c054865a8bd7bd5f06a6454a16544))
* **vscode:** add workspace file ([028a86f](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/028a86f88c6eae58f57e32363bf46ae9a3973ce0))
* **release:** prepare release v1.1.0 ([65c9242](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/65c9242a772a5f440ea173f75d8acc9caae0c100))

### 📚 Documentation

* **README:** add actions var; update node/npm versions ([86d14b6](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/86d14b634560368e3d4856034cd1b7ac022ba6dc))

### 🔄 Continuous Integration

* **dev-build-and-deploy:** fix var ([d5c9862](https://github.com/cu-cit-cloud-team/az-common-alert-endpoint/commit/d5c98628727361cb7029a99e955bdde5c83bb73e))

## 1.0.0 (2026-02-10)

* Initial version/release
