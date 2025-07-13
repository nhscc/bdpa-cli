[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [src/configure](../README.md) / GlobalExecutionContext

# Type Alias: GlobalExecutionContext

> **GlobalExecutionContext** = `StandardExecutionContextWithListr2` & `object`

Defined in: [src/configure.ts:55](https://github.com/nhscc/bdpa-cli/blob/8ad58c8c8508bf539936ccdd28c6f77ce4493fea/src/configure.ts#L55)

## Type declaration

### getConfig()

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

`"string"` | `"number"` | `"boolean"` | `"null"` | (`value`) => `boolean` \| `string`

#### Returns

`T`

### startupError

> **startupError**: `Error` \| `undefined`
