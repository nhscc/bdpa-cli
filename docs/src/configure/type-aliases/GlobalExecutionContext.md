[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [src/configure](../README.md) / GlobalExecutionContext

# Type Alias: GlobalExecutionContext

> **GlobalExecutionContext** = `StandardExecutionContextWithListr2` & `object`

Defined in: [src/configure.ts:58](https://github.com/nhscc/bdpa-cli/blob/2e09fd4252f6e41b59aedfbc8db92acd3a6a9a39/src/configure.ts#L58)

## Type Declaration

### getConfig

> **getConfig**: \<`T`\>(`key`, `validator`) => `T`

Call this function to grab a value from global configuration. Nested `key`
is supported (e.g. `a.b.c`). Use `validator` to validate the value. Pass a
custom function to `validator` that returns `true` if valid, or false / an
error string if invalid.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

##### validator

`"string"` \| `"number"` \| `"boolean"` \| `"null"` \| ((`value`) => `boolean` \| `string`)

#### Returns

`T`

### startupError

> **startupError**: `Error` \| `undefined`
