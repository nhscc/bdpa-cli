# Changelog

All notable changes to this project will be documented in this auto-generated
file. The format is based on [Conventional Commits][1];
this project adheres to [Semantic Versioning][2].

<br />

## @nhscc/bdpa-cli[@1.2.0][3] (2026-05-31)

### ✨ Features

- Add airports-related functionality ([cc4a984][4])

### 🪄 Fixes

- **src:** fixup flight generation algorithm ([82a6a54][5])

### ⚙️ Build System

- **deps:** bump core-js from 3.44.0 to 3.45.1 ([b16c696][6])
- **deps:** bump core-js from 3.45.1 to 3.49.0 ([ae243d0][7])
- **deps:** bump env-paths from 3.0.0 to 4.0.0 ([7e3d08e][8])
- **deps:** bump rejoinder from 2.0.2 to 2.1.0 ([9c855b7][9])
- **deps:** bump rejoinder-listr2 from 2.0.2 to 2.1.1 ([6c8925c][10])
- **deps:** bump type-fest from 4.41.0 to 5.6.0 ([af6a7c2][11])
- **package:** update dependencies ([24353ca][12])

<br />

### 🏗️ Patch @nhscc/bdpa-cli[@1.2.1][13] (2026-05-31)

#### 🪄 Fixes

- **src:** allow flight TTL and advance generation days to operate independently ([0d71d1a][14])
  <br />

## @nhscc/bdpa-cli[@1.1.0][15] (2025-07-17)

### ✨ Features

- Finish prune-data implementation ([a8a1866][16])
- **src:** land initial prune-data task implementation ([81f7f67][17])

### 🪄 Fixes

- Use proper keys for qoverflow configs ([1668161][18])

### ⚙️ Build System

- **deps:** bump @-xun/cli from 2.0.2 to 2.0.3 ([3d7e120][19])
- **deps:** bump @-xun/cli from 2.0.3 to 2.0.4 ([0942598][20])
- **deps:** bump @-xun/cli from 2.0.4 to 2.0.7 ([55aec69][21])
- **deps:** bump @-xun/mongo-schema from 1.2.3 to 1.3.0 ([441965c][22])
- **deps:** bump @-xun/mongo-schema from 1.3.0 to 1.3.2 ([4fd74a2][23])
- **deps:** bump @-xun/mongo-schema from 1.3.2 to 1.4.0 ([3b703ee][24])
- **deps:** bump @-xun/mongo-test from 2.0.0 to 2.1.0 ([317a637][25])
- **deps:** bump @nhscc/backend-drive from 1.0.0 to 1.1.0 ([1dea25b][26])
- **deps:** bump @nhscc/backend-drive from 1.1.0 to 1.2.0 ([5cd657b][27])
- **deps:** bump @nhscc/backend-drive from 1.2.0 to 1.3.0 ([bce41c5][28])
- **deps:** bump @nhscc/backend-qoverflow from 1.0.0 to 1.1.0 ([e6630ab][29])
- **deps:** bump @nhscc/backend-qoverflow from 1.1.0 to 1.1.1 ([048dc1f][30])
- **deps:** bump @nhscc/backend-qoverflow from 1.1.1 to 1.2.0 ([b63865f][31])
- **deps:** bump core-js from 3.42.0 to 3.44.0 ([6c03c73][32])
- **deps:** bump rejoinder from 1.2.5 to 2.0.1 ([95697f7][33])
- **deps:** bump rejoinder from 2.0.1 to 2.0.2 ([51b357c][34])
- **deps:** bump rejoinder-listr2 from 1.0.3 to 2.0.1 ([4ecdd97][35])
- **deps:** bump rejoinder-listr2 from 2.0.1 to 2.0.2 ([af3d478][36])
- **package:** organize dependencies ([b443dda][37])

<br />

### 🏗️ Patch @nhscc/bdpa-cli[@1.1.4][38] (2025-07-26)

#### 🪄 Fixes

- **tasks/ban-hammer:** no longer take client ip into consideration when calculating bans ([aab43db][39])

#### ⚙️ Build System

- **deps:** bump @nhscc/backend-drive from 1.3.0 to 1.3.1 ([3f1f088][40])
- **deps:** bump @nhscc/backend-qoverflow from 1.2.0 to 1.2.1 ([a433dc7][41])
- **deps:** bump mongodb from 6.17.0 to 6.18.0 ([65fbc38][42])

<br />

### 🏗️ Patch @nhscc/bdpa-cli[@1.1.3][43] (2025-07-18)

#### 🪄 Fixes

- **src:** improve output ([ff937d5][44])

<br />

### 🏗️ Patch @nhscc/bdpa-cli[@1.1.2][45] (2025-07-17)

#### 🪄 Fixes

- **src:** output banned count estimate instead of a promised estimate ([c8a325c][46])

<br />

### 🏗️ Patch @nhscc/bdpa-cli[@1.1.1][47] (2025-07-17)

#### 🪄 Fixes

- Expand multitenancy support ([cc06230][48])

<br />

## @nhscc/bdpa-cli[@1.0.0][49] (2025-05-28)

### ✨ Features

- Bring in cli functionality (base template) ([abf0233][50])
- **commands:** add root, "stats" commands ([a38709d][51])
- **commands:** add root, "stats" commands ([096f029][52])

### ⚙️ Build System

- **deps:** bump @-xun/cli from 1.3.2 to 2.0.0 ([672b24d][53])
- **deps:** bump @-xun/cli from 2.0.0 to 2.0.2 ([737b4f2][54])
- **package:** add core-js dependency ([7f42b19][55])
- **package:** mark package as non-private ([fb94d84][56])
- **package:** place package under `[@nhscc](https://github.com/nhscc)` namespace ([670d679][57])

<br />

### 🏗️ Patch @nhscc/bdpa-cli[@1.0.1][58] (2025-05-30)

#### 🪄 Fixes

- **src:** improve error handling and output ([7d2ecaa][59])

#### ⚙️ Build System

- **package:** add several dependencies ([117c24c][60])

[1]: https://conventionalcommits.org
[2]: https://semver.org
[3]: https://github.com/nhscc/bdpa-cli/compare/@nhscc/bdpa-cli@1.1.4...@nhscc/bdpa-cli@1.2.0
[4]: https://github.com/nhscc/bdpa-cli/commit/cc4a984589103b9c4d3f6967ebd6595d79d715cb
[5]: https://github.com/nhscc/bdpa-cli/commit/82a6a54b8c087c4b96eb859b2737ebb1cbcbdb86
[6]: https://github.com/nhscc/bdpa-cli/commit/b16c696d31a62181d69d59bcbd8a250f8a628b05
[7]: https://github.com/nhscc/bdpa-cli/commit/ae243d04293da04e54f64e68ab85baed9a80c1cc
[8]: https://github.com/nhscc/bdpa-cli/commit/7e3d08e41f36e55b74d2f8f1cf2401ba7c6ef9dd
[9]: https://github.com/nhscc/bdpa-cli/commit/9c855b7179ab1d094c78e36492b9a4c6483b5f19
[10]: https://github.com/nhscc/bdpa-cli/commit/6c8925c890a148c6ac9520c1d298b117ee17b945
[11]: https://github.com/nhscc/bdpa-cli/commit/af6a7c2afcd0d4e90327c2d540ac4043d69bc8d1
[12]: https://github.com/nhscc/bdpa-cli/commit/24353cad57d48b5be6fb6a00de3c7c96ac017cb5
[13]: https://github.com/nhscc/bdpa-cli/compare/@nhscc/bdpa-cli@1.2.0...@nhscc/bdpa-cli@1.2.1
[14]: https://github.com/nhscc/bdpa-cli/commit/0d71d1aa44b2e7aac852a99410ddf87be49531b0
[15]: https://github.com/nhscc/bdpa-cli/compare/@nhscc/bdpa-cli@1.0.1...@nhscc/bdpa-cli@1.1.0
[16]: https://github.com/nhscc/bdpa-cli/commit/a8a186675ef459ddfe57e6bb56f44cda5341d5f1
[17]: https://github.com/nhscc/bdpa-cli/commit/81f7f679fec2ce376e802135af282832f5404a73
[18]: https://github.com/nhscc/bdpa-cli/commit/1668161d688eb0ce1e1e94bbfbf3ab2a91e0025a
[19]: https://github.com/nhscc/bdpa-cli/commit/3d7e12079d41bd80d3e186676c776e0eb4174000
[20]: https://github.com/nhscc/bdpa-cli/commit/094259842084164b913b9c1e9309be6a68341fa3
[21]: https://github.com/nhscc/bdpa-cli/commit/55aec69918dc4c353adbebb5106310d66552e0d6
[22]: https://github.com/nhscc/bdpa-cli/commit/441965c9dda7bb645503ff18102d5c056dffe67b
[23]: https://github.com/nhscc/bdpa-cli/commit/4fd74a20ffb7a317669e27e537b92c5c6155de3e
[24]: https://github.com/nhscc/bdpa-cli/commit/3b703eea378ec23b139b335e1cb42754219a9075
[25]: https://github.com/nhscc/bdpa-cli/commit/317a6373f1ead2eb5d13884f63e9c8eba66466f5
[26]: https://github.com/nhscc/bdpa-cli/commit/1dea25bb9170cda30330a8faf79cac31b7075638
[27]: https://github.com/nhscc/bdpa-cli/commit/5cd657b6aeb1fedd9cfca9e0dee33b9d602c395c
[28]: https://github.com/nhscc/bdpa-cli/commit/bce41c52907b7abe6aab1d8c86128fb31231a06d
[29]: https://github.com/nhscc/bdpa-cli/commit/e6630abfb1645f53bced886f758169b18f443fdb
[30]: https://github.com/nhscc/bdpa-cli/commit/048dc1f4048271bba692e6afc5b4864bbe7c9e4c
[31]: https://github.com/nhscc/bdpa-cli/commit/b63865f96f712dd21c9b4d789642bb9259601033
[32]: https://github.com/nhscc/bdpa-cli/commit/6c03c734acfa07e35529584baad9f0a55a68b9f7
[33]: https://github.com/nhscc/bdpa-cli/commit/95697f76db190e51fc88d04f69df28ec905e1b61
[34]: https://github.com/nhscc/bdpa-cli/commit/51b357cb985bd3addb73af93e77a6d4cf6bd95cf
[35]: https://github.com/nhscc/bdpa-cli/commit/4ecdd97e0008bfb3281d5a610322193e02103382
[36]: https://github.com/nhscc/bdpa-cli/commit/af3d4784bcd0f7dee24607091d89d8f6076cc15c
[37]: https://github.com/nhscc/bdpa-cli/commit/b443dda9da2c3974bea826255c4901d097423985
[38]: https://github.com/nhscc/bdpa-cli/compare/@nhscc/bdpa-cli@1.1.3...@nhscc/bdpa-cli@1.1.4
[39]: https://github.com/nhscc/bdpa-cli/commit/aab43dbd010a981851c0502d764dfd948966b4ad
[40]: https://github.com/nhscc/bdpa-cli/commit/3f1f08875e93854eddfddcc718b91d078459fa51
[41]: https://github.com/nhscc/bdpa-cli/commit/a433dc7bbd8103245f427527ba19129d242bf2b8
[42]: https://github.com/nhscc/bdpa-cli/commit/65fbc38105d73a1fea56c454e448c399eba3bc24
[43]: https://github.com/nhscc/bdpa-cli/compare/@nhscc/bdpa-cli@1.1.2...@nhscc/bdpa-cli@1.1.3
[44]: https://github.com/nhscc/bdpa-cli/commit/ff937d5fa5de96938ab72f8ce38af693e479fb18
[45]: https://github.com/nhscc/bdpa-cli/compare/@nhscc/bdpa-cli@1.1.1...@nhscc/bdpa-cli@1.1.2
[46]: https://github.com/nhscc/bdpa-cli/commit/c8a325cdd3d6bbbd34604fbd2249eb233fe4776a
[47]: https://github.com/nhscc/bdpa-cli/compare/@nhscc/bdpa-cli@1.1.0...@nhscc/bdpa-cli@1.1.1
[48]: https://github.com/nhscc/bdpa-cli/commit/cc06230b8b3c4bd28c3da1903ce886e7c819a1ce
[49]: https://github.com/nhscc/bdpa-cli/compare/abf0233e2b7377c224dc40d02e6091f130c94db7...@nhscc/bdpa-cli@1.0.0
[50]: https://github.com/nhscc/bdpa-cli/commit/abf0233e2b7377c224dc40d02e6091f130c94db7
[51]: https://github.com/nhscc/bdpa-cli/commit/a38709d3e8aeaebaa5c2320def4a3fc254ac04c8
[52]: https://github.com/nhscc/bdpa-cli/commit/096f0290505c411b3fdc7f796df6e6ea029f5bff
[53]: https://github.com/nhscc/bdpa-cli/commit/672b24d9314522a1edf0ba05bc015cc76eda8941
[54]: https://github.com/nhscc/bdpa-cli/commit/737b4f2ca1090929d747a088dd2c130424b5306e
[55]: https://github.com/nhscc/bdpa-cli/commit/7f42b19c00d44ee2ec3c689990c4f9fb3c09232d
[56]: https://github.com/nhscc/bdpa-cli/commit/fb94d84b32201c9d8dab385121a53d5c0ecc3177
[57]: https://github.com/nhscc/bdpa-cli/commit/670d6794a5cff2701b76ae7c78a2f6f20dbd2ecb
[58]: https://github.com/nhscc/bdpa-cli/compare/@nhscc/bdpa-cli@1.0.0...@nhscc/bdpa-cli@1.0.1
[59]: https://github.com/nhscc/bdpa-cli/commit/7d2ecaa554069434ddf0e3f05118f816332f92a4
[60]: https://github.com/nhscc/bdpa-cli/commit/117c24c40266cf7a0f902a1bfc12de23f5efda5d
