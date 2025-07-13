[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [src/error](../README.md) / ErrorMessage

# Variable: ErrorMessage

> `const` **ErrorMessage**: `object`

Defined in: [src/error.ts:8](https://github.com/nhscc/bdpa-cli/blob/8ad58c8c8508bf539936ccdd28c6f77ce4493fea/src/error.ts#L8)

A collection of possible error and warning messages.

## Type declaration

### BadOptionValue()

> **BadOptionValue**(`name`, `value`, `context?`): `string`

#### Parameters

##### name

`string`

##### value

`unknown`

##### context?

`string`

#### Returns

`string`

### CommandDidNotComplete()

> **CommandDidNotComplete**(`command`): `string`

#### Parameters

##### command

`string`

#### Returns

`string`

### GuruMeditation()

> **GuruMeditation**(): `string`

#### Returns

`string`

### IgnoredOptions()

> **IgnoredOptions**(`args`): `string`

#### Parameters

##### args

`string`[]

#### Returns

`string`

### InvalidConfigFile()

> **InvalidConfigFile**(`key`, `path`, `problem`): `string`

#### Parameters

##### key

`string`

##### path

`string`

##### problem

`undefined` | `string`

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

### UnsupportedCommand()

> **UnsupportedCommand**(): `string`

#### Returns

`string`
