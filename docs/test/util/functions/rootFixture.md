[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [test/util](../README.md) / rootFixture

# Function: rootFixture()

> **rootFixture**(): [`RootFixture`](../type-aliases/RootFixture.md)

Defined in: node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/fixtures/root.d.ts:20

This fixture creates the dummy root directory as well as the `src/`
subdirectory. It is perhaps the most important fixture.

If the first fixture in the array of fixtures passed to the `fixtures`
parameter of `withMockedFixtures` is not this fixture, then this fixture is
prepended to `fixtures`.

If this fixture appears anywhere else in `fixtures` other than as the first
element, it will be ignored entirely.

## Returns

[`RootFixture`](../type-aliases/RootFixture.md)
