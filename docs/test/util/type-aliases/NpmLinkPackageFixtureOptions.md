[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [test/util](../README.md) / NpmLinkPackageFixtureOptions

# Type Alias: NpmLinkPackageFixtureOptions

> **NpmLinkPackageFixtureOptions** = `Tagged`\<\{ `packageUnderTest`: `Omit`\<`GenericPackage`, `"projectMetadata"`\>; \}, *typeof* [`npmLinkPackageFixtureName`](../variables/npmLinkPackageFixtureName.md)\>

Defined in: node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/fixtures/npm-link-package.d.ts:20

Contains any additional options properties this fixture expects or allows.

This type is Tagged so that it can be differentiated from `XContext`
types provided by other fixtures, even when they contain the same keys (or no
keys).

## See

[npmLinkPackageFixture](../functions/npmLinkPackageFixture.md)
