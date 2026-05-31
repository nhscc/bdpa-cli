[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [src/util](../README.md) / withStandardListrTaskConfigFactory

# Function: withStandardListrTaskConfigFactory()

> **withStandardListrTaskConfigFactory**\<`ListrContext`\>(`initialTaskRunnerContext`): (`config`) => `ListrTask`\<`unknown`, *typeof* `DefaultRenderer` \| *typeof* `VerboseRenderer`, *typeof* `SimpleRenderer`\>

Defined in: [src/util.ts:76](https://github.com/nhscc/bdpa-cli/blob/2e09fd4252f6e41b59aedfbc8db92acd3a6a9a39/src/util.ts#L76)

## Type Parameters

### ListrContext

`ListrContext` *extends* `Record`\<`string`, `unknown`\> = `Record`\<`string`, `unknown`\>

## Parameters

### initialTaskRunnerContext

`Omit`\<[`TaskRunnerContext`](../type-aliases/TaskRunnerContext.md)\<`ListrContext`\>, `` `listr${string}` ``\> & `object` & `Partial`\<`Omit`\<`ListrTask`\<`unknown`, *typeof* `DefaultRenderer` \| *typeof* `VerboseRenderer`, *typeof* `SimpleRenderer`\>, `"title"` \| `"task"` \| `"retry"`\>\>

## Returns

(`config`) => `ListrTask`\<`unknown`, *typeof* `DefaultRenderer` \| *typeof* `VerboseRenderer`, *typeof* `SimpleRenderer`\>
