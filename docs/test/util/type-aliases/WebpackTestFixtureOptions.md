[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [test/util](../README.md) / WebpackTestFixtureOptions

# Type Alias: WebpackTestFixtureOptions

> **WebpackTestFixtureOptions** = `Tagged`\<\{ `fileUnderTest`: `string`; `webpackVersion`: `string`; \}, *typeof* [`webpackTestFixtureName`](../variables/webpackTestFixtureName.md)\>

Defined in: node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/fixtures/webpack-test.d.ts:20

Contains any additional options properties this fixture expects or allows.

This type is Tagged so that it can be differentiated from `XContext`
types provided by other fixtures, even when they contain the same keys (or no
keys).

## See

[webpackTestFixture](../functions/webpackTestFixture.md)
