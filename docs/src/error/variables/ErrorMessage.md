[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [src/error](../README.md) / ErrorMessage

# Variable: ErrorMessage

> `const` **ErrorMessage**: `object`

Defined in: [src/error.ts:8](https://github.com/nhscc/bdpa-cli/blob/2e09fd4252f6e41b59aedfbc8db92acd3a6a9a39/src/error.ts#L8)

A collection of possible error and warning messages.

## Type Declaration

### expectations

> **expectations**: `object`

#### expectations.GreaterThanInteger()

> **GreaterThanInteger**(`lower`): `string`

##### Parameters

###### lower

`number`

##### Returns

`string`

#### expectations.NonNegativeInteger()

> **NonNegativeInteger**(): `string`

##### Returns

`string`

#### expectations.PercentageExclusive()

> **PercentageExclusive**(): `string`

##### Returns

`string`

#### expectations.PositiveInteger()

> **PositiveInteger**(): `string`

##### Returns

`string`

#### expectations.WithinIntegerClampExclusive()

> **WithinIntegerClampExclusive**(`lower`, `upper`): `string`

##### Parameters

###### lower

`number`

###### upper

`number`

##### Returns

`string`

### GuruMeditation

> **GuruMeditation**: () => `string` = `UpstreamErrorMessage.GuruMeditation`

#### Returns

`string`

### ArrivalTypeButDepartureExpected()

> **ArrivalTypeButDepartureExpected**(): `string`

#### Returns

`string`

### BadInfoDb()

> **BadInfoDb**(): `string`

#### Returns

`string`

### DatabaseInsertNotAcknowledged()

> **DatabaseInsertNotAcknowledged**(): `string`

#### Returns

`string`

### GateNotPredetermined()

> **GateNotPredetermined**(): `string`

#### Returns

`string`

### IllegalDepartureState()

> **IllegalDepartureState**(): `string`

#### Returns

`string`

### ImpossibleStochasticState()

> **ImpossibleStochasticState**(`stage`): `string`

#### Parameters

##### stage

`number`

#### Returns

`string`

### IncompleteDatabaseInsert()

> **IncompleteDatabaseInsert**(`expected`, `actual`): `string`

#### Parameters

##### expected

`number`

##### actual

`number`

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

`string` \| `undefined`

##### problem

`string` \| `undefined`

#### Returns

`string`

### IteratorRanOutOfElements()

> **IteratorRanOutOfElements**(): `string`

#### Returns

`string`

### LessThanTwoAirportsOrAirlines()

> **LessThanTwoAirportsOrAirlines**(): `string`

#### Returns

`string`

### MissingStochasticState()

> **MissingStochasticState**(): `string`

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
