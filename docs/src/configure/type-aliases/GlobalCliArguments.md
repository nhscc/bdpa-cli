[**@nhscc/bdpa-cron**](../../../README.md)

***

[@nhscc/bdpa-cron](../../../README.md) / [src/configure](../README.md) / GlobalCliArguments

# Type Alias: GlobalCliArguments

> **GlobalCliArguments** = `StandardCommonCliArguments` & `object`

Defined in: [src/configure.ts:57](https://github.com/nhscc/bdpa-cron/blob/fb94d84b32201c9d8dab385121a53d5c0ecc3177/src/configure.ts#L57)

These properties will be available in the `argv` object of any command that
uses [withGlobalBuilder](../../util/functions/withGlobalBuilder.md) to construct its `builder`.

This type is manually synchronized with [globalCliArguments](../variables/globalCliArguments.md), but the
keys may differ slightly (e.g. hyphens may be elided in favor of camelCase).

## Type declaration

### targets

> **targets**: [`TargetProblem`](../../constant/type-aliases/TargetProblem.md)[]

## See

StandardCommonCliArguments
