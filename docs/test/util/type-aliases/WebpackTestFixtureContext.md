[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [test/util](../README.md) / WebpackTestFixtureContext

# Type Alias: WebpackTestFixtureContext

> **WebpackTestFixtureContext** = `Tagged`\<\{ `testResult`: `RunReturnType`\<`RunOptions`\>; \}, *typeof* [`webpackTestFixtureName`](../variables/webpackTestFixtureName.md)\>

Defined in: node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/fixtures/webpack-test.d.ts:45

Contains any additional context properties this fixture makes available by
the time its `setup` function has successfully executed.

It is the sole responsibility of this fixture to ensure the context contains
the mentioned properties as described.

This type is Tagged so that it can be differentiated from `XContext`
types provided by other fixtures, even when they contain the same properties
(or no properties).

## See

[webpackTestFixture](../functions/webpackTestFixture.md)
