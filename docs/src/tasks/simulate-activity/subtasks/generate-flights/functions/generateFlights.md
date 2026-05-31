[**@nhscc/bdpa-cli**](../../../../../../README.md)

***

[@nhscc/bdpa-cli](../../../../../../README.md) / [src/tasks/simulate-activity/subtasks/generate-flights](../README.md) / generateFlights

# Function: generateFlights()

> **generateFlights**(`__namedParameters`): `Promise`\<`Listr`\<`unknown`, `any`, `any`\>\>

Defined in: [src/tasks/simulate-activity/subtasks/generate-flights.ts:68](https://github.com/nhscc/bdpa-cli/blob/0d71d1aa44b2e7aac852a99410ddf87be49531b0/src/tasks/simulate-activity/subtasks/generate-flights.ts#L68)

Generates flight data for the BDPA airports problem statement.

## Parameters

### \_\_namedParameters

#### baseCarryBagPriceDollars

`number`

#### baseCheckedBagPriceDollars

`number`

#### chanceOfExtrasItemOfferedOnAFlight

`number`

#### chanceOfNewFlightInAnAirportInAnHour

`number`

#### chanceOfNewFlightsInAnHour

`number`

#### gateLettersCount

`number`

#### gateNumbersPerLetter

`number`

#### generateFlightsInAdvanceDays

`number`

#### generatorConcurrency

`number`

#### greedMultiplier

`number`

#### listrTask

`TaskWrapper`\<`unknown`, *typeof* `DefaultRenderer` \| *typeof* `VerboseRenderer`, *typeof* `SimpleRenderer`\>

#### maxBaseExtraPriceDollars

`number`

#### maxBaseExtraPriceFfms

`number`

#### maxBaseFlightFfmsEarned

`number`

#### maxBaseSeatPriceDollars

`number`

#### maxBaseSeatPriceFfms

`number`

#### maxCarryBagsPerFlier

`number`

#### maxCheckedBagsPerFlier

`number`

#### maxFlightTimeToLiveDays

`number`

#### minBaseExtraPriceDollars

`number`

#### minBaseExtraPriceFfms

`number`

#### minBaseFlightFfmsEarned

`number`

#### minBaseSeatPriceDollars

`number`

#### minBaseSeatPriceFfms

`number`

#### minSeatsPerClass

`number`

#### seatsPerFlight

`number`

#### taskGlobalDebug

`ExtendedDebugger`

#### tenantId

`string`

## Returns

`Promise`\<`Listr`\<`unknown`, `any`, `any`\>\>
