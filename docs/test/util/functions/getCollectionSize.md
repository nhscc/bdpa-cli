[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [test/util](../README.md) / getCollectionSize

# Function: getCollectionSize()

## Call Signature

> **getCollectionSize**(`collection`): `Promise`\<`number`\>

Defined in: [test/util.ts:46](https://github.com/nhscc/bdpa-cli/blob/2e09fd4252f6e41b59aedfbc8db92acd3a6a9a39/test/util.ts#L46)

Accepts one or more database and collection names in the form
`database.collection` and returns the size of each collection in bytes.

### Parameters

#### collection

`string`

### Returns

`Promise`\<`number`\>

## Call Signature

> **getCollectionSize**(`collections`): `Promise`\<`Record`\<`string`, `number`\>\>

Defined in: [test/util.ts:47](https://github.com/nhscc/bdpa-cli/blob/2e09fd4252f6e41b59aedfbc8db92acd3a6a9a39/test/util.ts#L47)

Accepts one or more database and collection names in the form
`database.collection` and returns the size of each collection in bytes.

### Parameters

#### collections

readonly `string`[]

### Returns

`Promise`\<`Record`\<`string`, `number`\>\>
