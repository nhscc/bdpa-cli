[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [src/error](../README.md) / ErrorMessage

# Variable: ErrorMessage

> `const` **ErrorMessage**: `object`

Defined in: [src/error.ts:8](https://github.com/nhscc/bdpa-cli/blob/c8a325cdd3d6bbbd34604fbd2249eb233fe4776a/src/error.ts#L8)

A collection of possible error and warning messages.

## Type declaration

### GuruMeditation()

> **GuruMeditation**: () => `string` = `UpstreamErrorMessage.GuruMeditation`

#### Returns

`string`

### InvalidBytes()

> **InvalidBytes**(`bytes`): `string`

#### Parameters

##### bytes

`unknown`

#### Returns

`string`

### InvalidCollectionSizeInput()

> **InvalidCollectionSizeInput**(`dbCollection`): `string`

#### Parameters

##### dbCollection

`string`

#### Returns

`string`

### InvalidConfigFile()

> **InvalidConfigFile**(`key`, `path`, `problem`): `string`

#### Parameters

##### key

`string`

##### path

`undefined` | `string`

##### problem

`undefined` | `string`

#### Returns

`string`

### TooManyBytes()

> **TooManyBytes**(`bytes`, `maxBytes`): `string`

#### Parameters

##### bytes

`number`

##### maxBytes

`number`

#### Returns

`string`

### UnexpectedValue()

> **UnexpectedValue**(`expectation`, `actual`): `string`

#### Parameters

##### expectation

`string`

##### actual

`unknown`

#### Returns

`string`

### UnimplementedTasks()

> **UnimplementedTasks**(): `string`

#### Returns

`string`

### UnreadableConfigFile()

> **UnreadableConfigFile**(`path`): `string`

#### Parameters

##### path

`string`

#### Returns

`string`
