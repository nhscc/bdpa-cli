[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [src/util](../README.md) / withGlobalUsage

# Function: withGlobalUsage()

## Call Signature

> **withGlobalUsage**(`altDescription?`): `string`

Defined in: node\_modules/@black-flag/extensions/dist/packages/extensions/src/index.d.ts:502

Generate command usage text consistently yet flexibly.

Defaults to: `Usage: $000\n\n${altDescription}` where `altDescription` is
`"$1."`.

### Parameters

#### altDescription?

`string`

### Returns

`string`

## Call Signature

> **withGlobalUsage**(`altDescription?`, `config?`): `string`

Defined in: node\_modules/@black-flag/extensions/dist/packages/extensions/src/index.d.ts:503

Generate command usage text consistently yet flexibly.

Defaults to: `Usage: $000\n\n${altDescription}` where `altDescription` is
`"$1."`.

### Parameters

#### altDescription?

`string`

#### config?

`Omit`\<`WithUsageExtensionsConfig`, `"altDescription"`\>

### Returns

`string`

## Call Signature

> **withGlobalUsage**(`config?`): `string`

Defined in: node\_modules/@black-flag/extensions/dist/packages/extensions/src/index.d.ts:504

Generate command usage text consistently yet flexibly.

Defaults to: `Usage: $000\n\n${altDescription}` where `altDescription` is
`"$1."`.

### Parameters

#### config?

`WithUsageExtensionsConfig`

### Returns

`string`

## Call Signature

> **withGlobalUsage**(`config?`, `moreConfig?`): `string`

Defined in: node\_modules/@black-flag/extensions/dist/packages/extensions/src/index.d.ts:505

Generate command usage text consistently yet flexibly.

Defaults to: `Usage: $000\n\n${altDescription}` where `altDescription` is
`"$1."`.

### Parameters

#### config?

`string` | `WithUsageExtensionsConfig`

#### moreConfig?

`Omit`\<`WithUsageExtensionsConfig`, `"altDescription"`\>

### Returns

`string`
