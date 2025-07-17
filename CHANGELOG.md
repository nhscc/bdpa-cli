# Changelog

All notable changes to this project will be documented in this auto-generated
file. The format is based on [Conventional Commits][1];
this project adheres to [Semantic Versioning][2].

<br />

## @nhscc/bdpa-cli[@1.1.0][3] (2025-07-17)

### ✨ Features

- Finish prune-data implementation ([a8a1866][4])
- **src:** land initial prune-data task implementation ([81f7f67][5])

### 🪄 Fixes

- Use proper keys for qoverflow configs ([1668161][6])

### ⚙️ Build System

- **deps:** bump @-xun/cli from 2.0.2 to 2.0.3 ([3d7e120][7])
- **deps:** bump @-xun/cli from 2.0.3 to 2.0.4 ([0942598][8])
- **deps:** bump @-xun/cli from 2.0.4 to 2.0.7 ([55aec69][9])
- **deps:** bump @-xun/mongo-schema from 1.2.3 to 1.3.0 ([441965c][10])
- **deps:** bump @-xun/mongo-schema from 1.3.0 to 1.3.2 ([4fd74a2][11])
- **deps:** bump @-xun/mongo-schema from 1.3.2 to 1.4.0 ([3b703ee][12])
- **deps:** bump @-xun/mongo-test from 2.0.0 to 2.1.0 ([317a637][13])
- **deps:** bump @nhscc/backend-drive from 1.0.0 to 1.1.0 ([1dea25b][14])
- **deps:** bump @nhscc/backend-drive from 1.1.0 to 1.2.0 ([5cd657b][15])
- **deps:** bump @nhscc/backend-drive from 1.2.0 to 1.3.0 ([bce41c5][16])
- **deps:** bump @nhscc/backend-qoverflow from 1.0.0 to 1.1.0 ([e6630ab][17])
- **deps:** bump @nhscc/backend-qoverflow from 1.1.0 to 1.1.1 ([048dc1f][18])
- **deps:** bump @nhscc/backend-qoverflow from 1.1.1 to 1.2.0 ([b63865f][19])
- **deps:** bump core-js from 3.42.0 to 3.44.0 ([6c03c73][20])
- **deps:** bump rejoinder from 1.2.5 to 2.0.1 ([95697f7][21])
- **deps:** bump rejoinder from 2.0.1 to 2.0.2 ([51b357c][22])
- **deps:** bump rejoinder-listr2 from 1.0.3 to 2.0.1 ([4ecdd97][23])
- **deps:** bump rejoinder-listr2 from 2.0.1 to 2.0.2 ([af3d478][24])
- **package:** organize dependencies ([b443dda][25])

<br />

### 🏗️ Patch @nhscc/bdpa-cli[@1.1.2][26] (2025-07-17)

#### 🪄 Fixes

- **src:** output banned count estimate instead of a promised estimate ([c8a325c][27])

<br />

### 🏗️ Patch @nhscc/bdpa-cli[@1.1.1][28] (2025-07-17)

#### 🪄 Fixes

- Expand multitenancy support ([cc06230][29])

<br />

## @nhscc/bdpa-cli[@1.0.0][30] (2025-05-28)

### ✨ Features

- Bring in cli functionality (base template) ([abf0233][31])
- **commands:** add root, "stats" commands ([a38709d][32])
- **commands:** add root, "stats" commands ([096f029][33])

### ⚙️ Build System

- **deps:** bump @-xun/cli from 1.3.2 to 2.0.0 ([672b24d][34])
- **deps:** bump @-xun/cli from 2.0.0 to 2.0.2 ([737b4f2][35])
- **package:** add core-js dependency ([7f42b19][36])
- **package:** mark package as non-private ([fb94d84][37])
- **package:** place package under `[@nhscc](https://github.com/nhscc)` namespace ([670d679][38])

<br />

### 🏗️ Patch @nhscc/bdpa-cli[@1.0.1][39] (2025-05-30)

#### 🪄 Fixes

- **src:** improve error handling and output ([7d2ecaa][40])

#### ⚙️ Build System

- **package:** add several dependencies ([117c24c][41])

[1]: https://conventionalcommits.org
[2]: https://semver.org
[3]: https://github.com/nhscc/bdpa-cli/compare/@nhscc/bdpa-cli@1.0.1...@nhscc/bdpa-cli@1.1.0
[4]: https://github.com/nhscc/bdpa-cli/commit/a8a186675ef459ddfe57e6bb56f44cda5341d5f1
[5]: https://github.com/nhscc/bdpa-cli/commit/81f7f679fec2ce376e802135af282832f5404a73
[6]: https://github.com/nhscc/bdpa-cli/commit/1668161d688eb0ce1e1e94bbfbf3ab2a91e0025a
[7]: https://github.com/nhscc/bdpa-cli/commit/3d7e12079d41bd80d3e186676c776e0eb4174000
[8]: https://github.com/nhscc/bdpa-cli/commit/094259842084164b913b9c1e9309be6a68341fa3
[9]: https://github.com/nhscc/bdpa-cli/commit/55aec69918dc4c353adbebb5106310d66552e0d6
[10]: https://github.com/nhscc/bdpa-cli/commit/441965c9dda7bb645503ff18102d5c056dffe67b
[11]: https://github.com/nhscc/bdpa-cli/commit/4fd74a20ffb7a317669e27e537b92c5c6155de3e
[12]: https://github.com/nhscc/bdpa-cli/commit/3b703eea378ec23b139b335e1cb42754219a9075
[13]: https://github.com/nhscc/bdpa-cli/commit/317a6373f1ead2eb5d13884f63e9c8eba66466f5
[14]: https://github.com/nhscc/bdpa-cli/commit/1dea25bb9170cda30330a8faf79cac31b7075638
[15]: https://github.com/nhscc/bdpa-cli/commit/5cd657b6aeb1fedd9cfca9e0dee33b9d602c395c
[16]: https://github.com/nhscc/bdpa-cli/commit/bce41c52907b7abe6aab1d8c86128fb31231a06d
[17]: https://github.com/nhscc/bdpa-cli/commit/e6630abfb1645f53bced886f758169b18f443fdb
[18]: https://github.com/nhscc/bdpa-cli/commit/048dc1f4048271bba692e6afc5b4864bbe7c9e4c
[19]: https://github.com/nhscc/bdpa-cli/commit/b63865f96f712dd21c9b4d789642bb9259601033
[20]: https://github.com/nhscc/bdpa-cli/commit/6c03c734acfa07e35529584baad9f0a55a68b9f7
[21]: https://github.com/nhscc/bdpa-cli/commit/95697f76db190e51fc88d04f69df28ec905e1b61
[22]: https://github.com/nhscc/bdpa-cli/commit/51b357cb985bd3addb73af93e77a6d4cf6bd95cf
[23]: https://github.com/nhscc/bdpa-cli/commit/4ecdd97e0008bfb3281d5a610322193e02103382
[24]: https://github.com/nhscc/bdpa-cli/commit/af3d4784bcd0f7dee24607091d89d8f6076cc15c
[25]: https://github.com/nhscc/bdpa-cli/commit/b443dda9da2c3974bea826255c4901d097423985
[26]: https://github.com/nhscc/bdpa-cli/compare/@nhscc/bdpa-cli@1.1.1...@nhscc/bdpa-cli@1.1.2
[27]: https://github.com/nhscc/bdpa-cli/commit/c8a325cdd3d6bbbd34604fbd2249eb233fe4776a
[28]: https://github.com/nhscc/bdpa-cli/compare/@nhscc/bdpa-cli@1.1.0...@nhscc/bdpa-cli@1.1.1
[29]: https://github.com/nhscc/bdpa-cli/commit/cc06230b8b3c4bd28c3da1903ce886e7c819a1ce
[30]: https://github.com/nhscc/bdpa-cli/compare/abf0233e2b7377c224dc40d02e6091f130c94db7...@nhscc/bdpa-cli@1.0.0
[31]: https://github.com/nhscc/bdpa-cli/commit/abf0233e2b7377c224dc40d02e6091f130c94db7
[32]: https://github.com/nhscc/bdpa-cli/commit/a38709d3e8aeaebaa5c2320def4a3fc254ac04c8
[33]: https://github.com/nhscc/bdpa-cli/commit/096f0290505c411b3fdc7f796df6e6ea029f5bff
[34]: https://github.com/nhscc/bdpa-cli/commit/672b24d9314522a1edf0ba05bc015cc76eda8941
[35]: https://github.com/nhscc/bdpa-cli/commit/737b4f2ca1090929d747a088dd2c130424b5306e
[36]: https://github.com/nhscc/bdpa-cli/commit/7f42b19c00d44ee2ec3c689990c4f9fb3c09232d
[37]: https://github.com/nhscc/bdpa-cli/commit/fb94d84b32201c9d8dab385121a53d5c0ecc3177
[38]: https://github.com/nhscc/bdpa-cli/commit/670d6794a5cff2701b76ae7c78a2f6f20dbd2ecb
[39]: https://github.com/nhscc/bdpa-cli/compare/@nhscc/bdpa-cli@1.0.0...@nhscc/bdpa-cli@1.0.1
[40]: https://github.com/nhscc/bdpa-cli/commit/7d2ecaa554069434ddf0e3f05118f816332f92a4
[41]: https://github.com/nhscc/bdpa-cli/commit/117c24c40266cf7a0f902a1bfc12de23f5efda5d
