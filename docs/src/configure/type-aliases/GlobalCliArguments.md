[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [src/configure](../README.md) / GlobalCliArguments

# Type Alias: GlobalCliArguments

> **GlobalCliArguments** = `StandardCommonCliArguments` & `object`

Defined in: [src/configure.ts:86](https://github.com/nhscc/bdpa-cli/blob/ff937d5fa5de96938ab72f8ce38af693e479fb18/src/configure.ts#L86)

These properties will be available in the `argv` object of any command that
uses [withGlobalBuilder](../../util/functions/withGlobalBuilder.md) to construct its `builder`.

This type is manually synchronized with [globalCliArguments](../variables/globalCliArguments.md), but the
keys may differ slightly (e.g. hyphens may be elided in favor of camelCase).

## Type declaration

### targets

> **targets**: [`ActualTargetProblem`](../../constant/type-aliases/ActualTargetProblem.md)[]

## See

StandardCommonCliArguments
