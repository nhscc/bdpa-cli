[**@nhscc/bdpa-cli**](../../../../README.md)

***

[@nhscc/bdpa-cli](../../../../README.md) / [src/tasks/prune-data](../README.md) / CollectionDataLimit

# Type Alias: CollectionDataLimit

> **CollectionDataLimit** = `object`

Defined in: [src/tasks/prune-data.ts:30](https://github.com/nhscc/bdpa-cli/blob/ff937d5fa5de96938ab72f8ce38af693e479fb18/src/tasks/prune-data.ts#L30)

An object describing the maximum number of bytes a collection's documents may
occupy, along with strategies for deleting said documents when they grow too
numerous.

## Properties

### deleteFn()?

> `optional` **deleteFn**: (`thresholdEntry`) => `Promisable`\<`number`\>

Defined in: [src/tasks/prune-data.ts:50](https://github.com/nhscc/bdpa-cli/blob/ff937d5fa5de96938ab72f8ce38af693e479fb18/src/tasks/prune-data.ts#L50)

By default, documents are unceremoniously deleted from the collection
without care for referential integrity. Use this function when deletions
are necessarily more involved, such as to invoke a `@nhscc/backend-X`
library function.

#### Parameters

##### thresholdEntry

`WithId`\<`Document`\>

#### Returns

`Promisable`\<`number`\>

***

### limit

> **limit**: `object`

Defined in: [src/tasks/prune-data.ts:34](https://github.com/nhscc/bdpa-cli/blob/ff937d5fa5de96938ab72f8ce38af693e479fb18/src/tasks/prune-data.ts#L34)

Maximum number of bytes documents in this collection can use.

#### maxBytes

> **maxBytes**: `number`

***

### orderBy?

> `optional` **orderBy**: `string`

Defined in: [src/tasks/prune-data.ts:43](https://github.com/nhscc/bdpa-cli/blob/ff937d5fa5de96938ab72f8ce38af693e479fb18/src/tasks/prune-data.ts#L43)

When deleting documents that violate `limit`, oldest documents are deleted
first by default. `orderBy` is the name of the document property to sort by
before initiating deletion; documents are deleted starting from the first
document in the ordered result.

#### Default

```ts
"_id"
```
