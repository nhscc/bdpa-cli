import { getClient, setSchemaConfig } from '@-xun/mongo-schema';
import { runWithMongoSchemaMultitenancy } from '@-xun/mongo-schema/multitenant';

import { TargetProblem, targetProblemBackends, Task } from 'universe:constant.ts';
import { ErrorMessage } from 'universe:error.ts';
import { skipListrTask, waitForListr2OutputReady } from 'universe:util.ts';

import type { Listr } from 'listr2';
import type { GlobalExecutionContext } from 'universe:configure.ts';
import type { ActualTargetProblem } from 'universe:constant.ts';
import type { TaskRunnerContext } from 'universe:util.ts';

const fullPrettyName = 'simulate activity';
const taskType = Task.SimulateActivity;

export default async function task(
  _taskName: string,
  target: ActualTargetProblem,
  getConfig: GlobalExecutionContext['getConfig'],
  { listrTask, standardDebug: standardDebug_ }: TaskRunnerContext
) {
  listrTask.title = `Executing task "${fullPrettyName}"...`;

  const debug = standardDebug_.extend(taskType);

  const keyPrefix = `${target}.supportedTasks.simulate-activity`;
  const keys = {
    generatorConcurrency: `${keyPrefix}.generatorConcurrency`,

    generateFlightsInAdvanceDays: `${keyPrefix}.flights.generateFlightsInAdvanceDays`,
    maxFlightTimeToLiveDays: `${keyPrefix}.flights.maxFlightTimeToLiveDays`,
    minSeatsPerClass: `${keyPrefix}.flights.minSeatsPerClass`,
    seatsPerFlight: `${keyPrefix}.flights.seatsPerFlight`,
    maxCheckedBagsPerFlier: `${keyPrefix}.flights.maxCheckedBagsPerFlier`,
    maxCarryBagsPerFlier: `${keyPrefix}.flights.maxCarryBagsPerFlier`,
    baseCheckedBagPriceDollars: `${keyPrefix}.flights.baseCheckedBagPriceDollars`,
    baseCarryBagPriceDollars: `${keyPrefix}.flights.baseCarryBagPriceDollars`,
    minBaseSeatPriceDollars: `${keyPrefix}.flights.minBaseSeatPriceDollars`,
    maxBaseSeatPriceDollars: `${keyPrefix}.flights.maxBaseSeatPriceDollars`,
    minBaseSeatPriceFfms: `${keyPrefix}.flights.minBaseSeatPriceFfms`,
    maxBaseSeatPriceFfms: `${keyPrefix}.flights.maxBaseSeatPriceFfms`,
    minBaseExtraPriceDollars: `${keyPrefix}.flights.minBaseExtraPriceDollars`,
    maxBaseExtraPriceDollars: `${keyPrefix}.flights.maxBaseExtraPriceDollars`,
    minBaseExtraPriceFfms: `${keyPrefix}.flights.minBaseExtraPriceFfms`,
    maxBaseExtraPriceFfms: `${keyPrefix}.flights.maxBaseExtraPriceFfms`,
    minBaseFlightFfmsEarned: `${keyPrefix}.flights.minBaseFlightFfmsEarned`,
    maxBaseFlightFfmsEarned: `${keyPrefix}.flights.maxBaseFlightFfmsEarned`,
    greedMultiplier: `${keyPrefix}.flights.greedMultiplier`,
    chanceOfNewFlightInAnAirportInAnHour: `${keyPrefix}.flights.chanceOfNewFlightInAnAirportInAnHour`,
    chanceOfNewFlightsInAnHour: `${keyPrefix}.flights.chanceOfNewFlightsInAnHour`,
    chanceOfExtrasItemOfferedOnAFlight: `${keyPrefix}.flights.chanceOfExtrasItemOfferedOnAFlight`,

    gateLettersCount: `${keyPrefix}.airports.gateLettersCount`,
    gateNumbersPerLetter: `${keyPrefix}.airports.gateNumbersPerLetter`,
    gatesPerAirport: `${keyPrefix}.airports.gatesPerAirport`
  };

  const tenantId = `${target}-${taskType}`;
  let backend;
  let runSimulationSubtask: (() => Promise<Listr>) | undefined;

  await waitForListr2OutputReady(debug);

  await runWithMongoSchemaMultitenancy(tenantId, async () => {
    switch (target) {
      case TargetProblem.ElectionsCpl:
      case TargetProblem.ElectionsIrv:
      case TargetProblem.Elections:
      case TargetProblem.Barker:
      case TargetProblem.Ghostmeme:
      case TargetProblem.Blogpress:
      case TargetProblem.Inbdpa:
      case TargetProblem.Drive:
      case TargetProblem.Qoverflow: {
        skipListrTask(fullPrettyName, debug, listrTask);
        return;
      }

      case TargetProblem.Airports: {
        backend = await targetProblemBackends.airports;
        const { generateFlights } =
          await import('universe:tasks/simulate-activity/subtasks/generate-flights.ts');

        const generatorConcurrency = getConfig<number>(
          keys.generatorConcurrency,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PositiveInteger(),
              value
            )
        );

        const generateFlightsInAdvanceDays = getConfig<number>(
          keys.generateFlightsInAdvanceDays,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PositiveInteger(),
              value
            )
        );

        const maxFlightTimeToLiveDays = getConfig<number>(
          keys.maxFlightTimeToLiveDays,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PositiveInteger(),
              value
            )
        );

        const minSeatsPerClass = getConfig<number>(
          keys.minSeatsPerClass,
          (value) =>
            (Number.isInteger(value) && Number(value) >= 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.NonNegativeInteger(),
              value
            )
        );

        const seatsPerFlight = getConfig<number>(
          keys.seatsPerFlight,
          (value) =>
            (Number.isInteger(value) && Number(value) > minSeatsPerClass) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.GreaterThanInteger(minSeatsPerClass),
              value
            )
        );

        const maxCheckedBagsPerFlier = getConfig<number>(
          keys.maxCheckedBagsPerFlier,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PositiveInteger(),
              value
            )
        );

        const maxCarryBagsPerFlier = getConfig<number>(
          keys.maxCarryBagsPerFlier,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PositiveInteger(),
              value
            )
        );

        const baseCheckedBagPriceDollars = getConfig<number>(
          keys.baseCheckedBagPriceDollars,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PositiveInteger(),
              value
            )
        );

        const baseCarryBagPriceDollars = getConfig<number>(
          keys.baseCarryBagPriceDollars,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PositiveInteger(),
              value
            )
        );

        const minBaseSeatPriceDollars = getConfig<number>(
          keys.minBaseSeatPriceDollars,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PositiveInteger(),
              value
            )
        );

        const maxBaseSeatPriceDollars = getConfig<number>(
          keys.maxBaseSeatPriceDollars,
          (value) =>
            (Number.isInteger(value) && Number(value) > minBaseSeatPriceDollars) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.GreaterThanInteger(minBaseSeatPriceDollars),
              value
            )
        );

        const minBaseSeatPriceFfms = getConfig<number>(
          keys.minBaseSeatPriceFfms,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PositiveInteger(),
              value
            )
        );

        const maxBaseSeatPriceFfms = getConfig<number>(
          keys.maxBaseSeatPriceFfms,
          (value) =>
            (Number.isInteger(value) && Number(value) > minBaseSeatPriceFfms) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.GreaterThanInteger(minBaseSeatPriceFfms),
              value
            )
        );

        const minBaseExtraPriceDollars = getConfig<number>(
          keys.minBaseExtraPriceDollars,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PositiveInteger(),
              value
            )
        );

        const maxBaseExtraPriceDollars = getConfig<number>(
          keys.maxBaseExtraPriceDollars,
          (value) =>
            (Number.isInteger(value) && Number(value) > minBaseExtraPriceDollars) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.GreaterThanInteger(minBaseExtraPriceDollars),
              value
            )
        );

        const minBaseExtraPriceFfms = getConfig<number>(
          keys.minBaseExtraPriceFfms,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PositiveInteger(),
              value
            )
        );

        const maxBaseExtraPriceFfms = getConfig<number>(
          keys.maxBaseExtraPriceFfms,
          (value) =>
            (Number.isInteger(value) && Number(value) > minBaseExtraPriceFfms) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.GreaterThanInteger(minBaseExtraPriceFfms),
              value
            )
        );

        const minBaseFlightFfmsEarned = getConfig<number>(
          keys.minBaseFlightFfmsEarned,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PositiveInteger(),
              value
            )
        );

        const maxBaseFlightFfmsEarned = getConfig<number>(
          keys.maxBaseFlightFfmsEarned,
          (value) =>
            (Number.isInteger(value) && Number(value) > minBaseFlightFfmsEarned) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.GreaterThanInteger(minBaseFlightFfmsEarned),
              value
            )
        );

        const greedMultiplier = getConfig<number>(
          keys.greedMultiplier,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PositiveInteger(),
              value
            )
        );

        const chanceOfNewFlightInAnAirportInAnHour = getConfig<number>(
          keys.chanceOfNewFlightInAnAirportInAnHour,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0 && Number(value) < 100) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PercentageExclusive(),
              value
            )
        );

        const chanceOfNewFlightsInAnHour = getConfig<number>(
          keys.chanceOfNewFlightsInAnHour,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0 && Number(value) < 100) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PercentageExclusive(),
              value
            )
        );

        const chanceOfExtrasItemOfferedOnAFlight = getConfig<number>(
          keys.chanceOfNewFlightsInAnHour,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0 && Number(value) < 100) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.PercentageExclusive(),
              value
            )
        );

        const gateLettersCount = getConfig<number>(
          keys.gateLettersCount,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0 && Number(value) < 27) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.WithinIntegerClampExclusive(0, 27),
              value
            )
        );

        const gateNumbersPerLetter = getConfig<number>(
          keys.gateNumbersPerLetter,
          (value) =>
            (Number.isInteger(value) && Number(value) > 0) ||
            ErrorMessage.UnexpectedValue(
              ErrorMessage.expectations.NonNegativeInteger(),
              value
            )
        );

        runSimulationSubtask = () =>
          generateFlights({
            tenantId,
            listrTask,
            taskGlobalDebug: debug,

            generatorConcurrency,
            generateFlightsInAdvanceDays,
            maxFlightTimeToLiveDays,
            minSeatsPerClass,
            seatsPerFlight,
            maxCheckedBagsPerFlier,
            maxCarryBagsPerFlier,
            baseCheckedBagPriceDollars,
            baseCarryBagPriceDollars,
            minBaseSeatPriceDollars,
            maxBaseSeatPriceDollars,
            minBaseSeatPriceFfms,
            maxBaseSeatPriceFfms,
            minBaseExtraPriceDollars,
            maxBaseExtraPriceDollars,
            minBaseExtraPriceFfms,
            maxBaseExtraPriceFfms,
            minBaseFlightFfmsEarned,
            maxBaseFlightFfmsEarned,
            greedMultiplier,
            chanceOfNewFlightInAnAirportInAnHour,
            chanceOfNewFlightsInAnHour,
            chanceOfExtrasItemOfferedOnAFlight,
            gateLettersCount,
            gateNumbersPerLetter
          });

        break;
      }

      default: {
        throw new Error(ErrorMessage.GuruMeditation());
      }
    }

    // ? Prewarm shared memory
    await getClient({
      MONGODB_URI: getConfig(`${target}.mongodbUri`, 'string')
    });

    setSchemaConfig(backend.db.getSchemaConfig());
  });

  if (!runSimulationSubtask) {
    return;
  }

  return listrTask.newListr(
    [
      {
        async task() {
          return runSimulationSubtask?.();
        }
      },
      {
        task() {
          listrTask.title = `Finished "${fullPrettyName}"`;
        }
      }
    ],
    { concurrent: false }
  );
}
