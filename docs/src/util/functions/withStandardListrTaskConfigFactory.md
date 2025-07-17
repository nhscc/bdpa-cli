[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [src/util](../README.md) / withStandardListrTaskConfigFactory

# Function: withStandardListrTaskConfigFactory()

> **withStandardListrTaskConfigFactory**\<`ListrContext`\>(`initialTaskRunnerContext`): (`config`) => `ListrTask`\<`unknown`, *typeof* `DefaultRenderer` \| *typeof* `VerboseRenderer`, *typeof* `SimpleRenderer`\>

Defined in: [src/util.ts:78](https://github.com/nhscc/bdpa-cli/blob/c94db553ec39d857ac60551d2e8f859ed5e499b8/src/util.ts#L78)

## Type Parameters

### ListrContext

`ListrContext` *extends* `Record`\<`string`, `unknown`\> = `Record`\<`string`, `unknown`\>

## Parameters

### initialTaskRunnerContext

`Omit`\<[`TaskRunnerContext`](../type-aliases/TaskRunnerContext.md)\<`ListrContext`\>, `` `listr${string}` ``\> & `object` & `Partial`\<`Omit`\<`ListrTask`\<`unknown`, *typeof* `DefaultRenderer` \| *typeof* `VerboseRenderer`, *typeof* `SimpleRenderer`\>, `"title"` \| `"task"` \| `"retry"`\>\>

## Returns

> (`config`): `ListrTask`\<`unknown`, *typeof* `DefaultRenderer` \| *typeof* `VerboseRenderer`, *typeof* `SimpleRenderer`\>

### Parameters

#### config

`object` & `Omit`\<`ListrTask`\<`unknown`, *typeof* `DefaultRenderer` \| *typeof* `VerboseRenderer`, *typeof* `SimpleRenderer`\>, `"title"` \| `"task"` \| `"retry"`\>

### Returns

`ListrTask`\<`unknown`, *typeof* `DefaultRenderer` \| *typeof* `VerboseRenderer`, *typeof* `SimpleRenderer`\>
