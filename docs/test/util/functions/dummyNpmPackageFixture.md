[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [test/util](../README.md) / dummyNpmPackageFixture

# Function: dummyNpmPackageFixture()

> **dummyNpmPackageFixture**(): [`DummyNpmPackageFixture`](../type-aliases/DummyNpmPackageFixture.md)

Defined in: node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/fixtures/dummy-npm-package.d.ts:77

This fixture initializes the dummy root directory as a NPM package with a
`package.json` file (optionally described by `initialVirtualFiles`) and
node_modules subdirectory. If said `package.json` file contains any
dependencies, they will be installed courtesy of `npm install`. Additional
packages can also be installed via
[DummyNpmPackageFixtureOptions.additionalPackagesToInstall](../type-aliases/DummyNpmPackageFixtureOptions.md).

All packages are always installed with `--force`.

If a `packageUnderTest` is provided, and it is namespaced (e.g.
"@-xun/symbiote"), an empty directory will be created using the namespace as
its name (e.g. `node_modules/@-xun`).

Note that the `packageUnderTest` is not the same thing as the dummy root NPM
package; the latter typically imports/tests the former.

## Returns

[`DummyNpmPackageFixture`](../type-aliases/DummyNpmPackageFixture.md)
