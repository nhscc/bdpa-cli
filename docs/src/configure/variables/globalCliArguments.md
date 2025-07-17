[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [src/configure](../README.md) / globalCliArguments

# Variable: globalCliArguments

> `const` **globalCliArguments**: `object`

Defined in: [src/configure.ts:119](https://github.com/nhscc/bdpa-cli/blob/c94db553ec39d857ac60551d2e8f859ed5e499b8/src/configure.ts#L119)

This BfeBuilderObject instance describes the CLI arguments available
in the `argv` object of any command that uses [withGlobalBuilder](../../util/functions/withGlobalBuilder.md) to
construct its `builder`.

This object is manually synchronized with [GlobalCliArguments](../type-aliases/GlobalCliArguments.md), but the
keys may differ slightly (e.g. hyphens may be elided in favor of camelCase).

When providing a custom BfeBuilderObject instance to
[withGlobalBuilder](../../util/functions/withGlobalBuilder.md), any key specified in that instance that is also a
key in this object (`globalCliArguments`) will have its value merged with the
value in this object _instead_ of fully overwriting it. This means you can
pass minimal configuration values for the keys that are also in
`globalCliArguments` and those values will be merged over the corresponding
default configuration value in `globalCliArguments`.

## Type declaration

### targets

> **targets**: `object`

#### targets.alias

> **alias**: `string` = `'target'`

#### targets.array

> **array**: `true` = `true`

#### targets.check()

> **check**: (`currentArg`) => `string` \| `true`

##### Parameters

###### currentArg

`unknown`

##### Returns

`string` \| `true`

#### targets.choices

> **choices**: ([`TargetProblem`](../../constant/type-aliases/TargetProblem.md) \| `2019` \| `2020` \| `2021` \| `2022` \| `2023` \| `2024` \| `2025` \| `"mars"` \| `"neptune"` \| `"saturn"` \| `"pluto"` \| `"venus"` \| `"jupiter"` \| `"uranus"` \| `"ganymede"` \| `"callisto"` \| `"io"`)[] = `inputTargets`

#### targets.demandThisOption

> **demandThisOption**: `true` = `true`

#### targets.description

> **description**: `string` = `'One or more APIs against which tasks are run'`

#### targets.coerce()

> **coerce**(`targets`): (`"elections"` \| `"airports"` \| `"barker"` \| `"ghostmeme"` \| `"drive"` \| `"qoverflow"` \| `"blogpress"` \| `"inbdpa"` \| `"elections-irv"` \| `"elections-cpl"` \| `2019` \| `2020` \| `2021` \| `2022` \| `2023` \| `2024` \| `2025` \| `"mars"` \| `"neptune"` \| `"saturn"` \| `"pluto"` \| `"venus"` \| `"jupiter"` \| `"uranus"` \| `"ganymede"` \| `"callisto"` \| `"io"`)[]

##### Parameters

###### targets

`Arrayable`\<[`TargetProblem`](../../constant/type-aliases/TargetProblem.md) \| `2019` \| `2020` \| `2021` \| `2022` \| `2023` \| `2024` \| `2025` \| `"mars"` \| `"neptune"` \| `"saturn"` \| `"pluto"` \| `"venus"` \| `"jupiter"` \| `"uranus"` \| `"ganymede"` \| `"callisto"` \| `"io"`\>

##### Returns

(`"elections"` \| `"airports"` \| `"barker"` \| `"ghostmeme"` \| `"drive"` \| `"qoverflow"` \| `"blogpress"` \| `"inbdpa"` \| `"elections-irv"` \| `"elections-cpl"` \| `2019` \| `2020` \| `2021` \| `2022` \| `2023` \| `2024` \| `2025` \| `"mars"` \| `"neptune"` \| `"saturn"` \| `"pluto"` \| `"venus"` \| `"jupiter"` \| `"uranus"` \| `"ganymede"` \| `"callisto"` \| `"io"`)[]

## See

StandardCommonCliArguments
