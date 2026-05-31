[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [src/util](../README.md) / withGlobalBuilder

# Function: withGlobalBuilder()

> **withGlobalBuilder**\<`CustomCliArguments`\>(...`__namedParameters`): `WithBuilderExtensionsReturnType`\<`CustomCliArguments`\>

Defined in: [src/util.ts:178](https://github.com/nhscc/bdpa-cli/blob/d76a4d6f2496d9d7ff05f6ca6f7775f062e8a812/src/util.ts#L178)

A version of withStandardBuilder that expects `CustomCliArguments` to
extend [GlobalCliArguments](../../configure/type-aliases/GlobalCliArguments.md) and implements any related global handler
functionality.

[globalCliArguments](../../configure/variables/globalCliArguments.md) is included in `additionalCommonOptions`
automatically. See withStandardBuilder for more details on how this
function semi-deep merges various common option configurations.

## Type Parameters

### CustomCliArguments

`CustomCliArguments` *extends* [`GlobalCliArguments`](../../configure/type-aliases/GlobalCliArguments.md)

## Parameters

### \_\_namedParameters

...\[`BfeBuilderObject`\<`CustomCliArguments`, [`GlobalExecutionContext`](../../configure/type-aliases/GlobalExecutionContext.md)\> \| ((...`args`) => `void` \| `BfeBuilderObject`\<`CustomCliArguments`, [`GlobalExecutionContext`](../../configure/type-aliases/GlobalExecutionContext.md)\>), `Omit`\<`WithBuilderExtensionsConfig`\<`CustomCliArguments`\>, `"commonOptions"` \| `"enableAutomaticSorting"`\> & `object`?\]

## Returns

`WithBuilderExtensionsReturnType`\<`CustomCliArguments`\>
