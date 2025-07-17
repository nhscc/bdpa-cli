[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [test/util](../README.md) / makeSetupTestFunction

# Function: makeSetupTestFunction()

> **makeSetupTestFunction**\<`TaskConfig`, `TaskConfigIsCollections`\>(`__namedParameters`): `object`

Defined in: [test/util.ts:138](https://github.com/nhscc/bdpa-cli/blob/c8a325cdd3d6bbbd34604fbd2249eb233fe4776a/test/util.ts#L138)

This function takes several return values from `setupMemoryServerOverride({
defer: 'without-hooks' })`, a `supportedTask` sub-object configuration (e.g.
the object value of the `'ban-hammer'` or `'prune-data'` sub-keys), and a
target name (e.g. `'drive'` or `'qoverflow'`).

This function calls `beforeEach` and `afterEach` and then returns a
`setupTest` function that, when invoked, returns useful primitives for
testing the target backend.

`makeSetupTestFunction` is meant to be called within a Jest `describe` block
but outside of any `test`/`it` blocks. On the other hand, `setupTest` _is_
meant to be called within a `test`/`it` block.

## Type Parameters

### TaskConfig

`TaskConfig` *extends* `Record`\<`string`, `JsonPrimitive`\>

### TaskConfigIsCollections

`TaskConfigIsCollections` *extends* `boolean` = `true`

## Parameters

### \_\_namedParameters

`object` & `Pick`\<`SetupMemoryServerOverrideReturnType`, `"initializeMemoryServerOverride"` \| `"killMemoryServerOverride"` \| `"resetSharedMemory"` \| `"reinitializeServerDatabases"`\>

## Returns

`object`

### setupTest()

> **setupTest**: () => `Promise`\<`object` & `object` & `TaskConfigIsCollections` *extends* `true` ? `object` : `object`\>

#### Returns

`Promise`\<`object` & `object` & `TaskConfigIsCollections` *extends* `true` ? `object` : `object`\>
