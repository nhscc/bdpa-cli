[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [src/configure](../README.md) / GlobalCliArguments

# Type Alias: GlobalCliArguments

> **GlobalCliArguments** = `StandardCommonCliArguments` & `object`

Defined in: [src/configure.ts:87](https://github.com/nhscc/bdpa-cli/blob/d76a4d6f2496d9d7ff05f6ca6f7775f062e8a812/src/configure.ts#L87)

These properties will be available in the `argv` object of any command that
uses [withGlobalBuilder](../../util/functions/withGlobalBuilder.md) to construct its `builder`.

This type is manually synchronized with [globalCliArguments](../variables/globalCliArguments.md), but the
keys may differ slightly (e.g. hyphens may be elided in favor of camelCase).

## Type Declaration

### targets

> **targets**: [`ActualTargetProblem`](../../constant/type-aliases/ActualTargetProblem.md)[]

## See

StandardCommonCliArguments
