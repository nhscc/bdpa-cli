[**@nhscc/bdpa-cli**](../../../README.md)

***

[@nhscc/bdpa-cli](../../../README.md) / [src/util](../README.md) / waitForListr2OutputReady

# Function: waitForListr2OutputReady()

> **waitForListr2OutputReady**(`standardDebug`): `Promise`\<`void`\>

Defined in: [src/util.ts:66](https://github.com/nhscc/bdpa-cli/blob/ff937d5fa5de96938ab72f8ce38af693e479fb18/src/util.ts#L66)

Call this hack once before attempting to output using rejoinder within listr2
in the specific circumstance that (1) you're using the `permanent` render
option to keep the output text around and (2) it is not impossible that
<100ms will pass before the first attempted output and (3) it is extremely
important that the user sees every single line of this output text.

Otherwise, stay away from this function. This issue needs further
investigation!

## Parameters

### standardDebug

`ExtendedDebugger`

## Returns

`Promise`\<`void`\>
