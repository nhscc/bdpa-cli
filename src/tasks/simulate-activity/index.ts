import { getClient, setSchemaConfig } from '@-xun/mongo-schema';
import { runWithMongoSchemaMultitenancy } from '@-xun/mongo-schema/multitenant';

import { TargetProblem, targetProblemBackends, Task } from 'universe:constant.ts';
import { ErrorMessage } from 'universe:error.ts';
import { skipListrTask, waitForListr2OutputReady } from 'universe:util.ts';

import type { GlobalExecutionContext } from 'universe:configure.ts';
import type { ActualTargetProblem } from 'universe:constant.ts';
import type { TaskRunnerContext } from 'universe:util.ts';

const fullPrettyName = 'simulate activity';
const taskType = Task.SimulateActivity;

export default async function task(
  taskName: string,
  target: ActualTargetProblem,
  getConfig: GlobalExecutionContext['getConfig'],
  { listrTask, standardDebug: standardDebug_ }: TaskRunnerContext
) {
  listrTask.title = `Executing task "${fullPrettyName}"...`;

  const debug = standardDebug_.extend(taskType);

  const keyPrefix = `${target}.simulate-activity`;
  const keys = {
    generatorConcurrency: `${keyPrefix}.flights.generatorConcurrency`,

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

  await waitForListr2OutputReady(debug);

  await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
    let backend, runAndThenCleanupSimulation: () => Promise<void>;

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

        runAndThenCleanupSimulation = () => {
          const generatorConcurrency = getConfig<number>(
            keys.generatorConcurrency,
            (value) =>
              (Number.isInteger(value) && Number(value) > 0) ||
              ErrorMessage.InvalidConfigFile(
                keys.generatorConcurrency,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PositiveInteger(),
                  value
                )
              )
          );

          const generateFlightsInAdvanceDays = getConfig<number>(
            keys.generateFlightsInAdvanceDays,
            (value) =>
              Number(value) > 0 ||
              ErrorMessage.InvalidConfigFile(
                keys.generateFlightsInAdvanceDays,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PositiveNumber(),
                  value
                )
              )
          );

          const maxFlightTimeToLiveDays = getConfig<number>(
            keys.maxFlightTimeToLiveDays,
            (value) =>
              Number(value) > generateFlightsInAdvanceDays ||
              ErrorMessage.InvalidConfigFile(
                keys.maxFlightTimeToLiveDays,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.GreaterThan(generateFlightsInAdvanceDays),
                  value
                )
              )
          );

          const minSeatsPerClass = getConfig<number>(
            keys.minSeatsPerClass,
            (value) =>
              Number(value) >= 0 ||
              ErrorMessage.InvalidConfigFile(
                keys.minSeatsPerClass,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.NonNegativeNumber(),
                  value
                )
              )
          );

          const seatsPerFlight = getConfig<number>(
            keys.seatsPerFlight,
            (value) =>
              Number(value) > minSeatsPerClass ||
              ErrorMessage.InvalidConfigFile(
                keys.seatsPerFlight,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.GreaterThan(minSeatsPerClass),
                  value
                )
              )
          );

          const maxCheckedBagsPerFlier = getConfig<number>(
            keys.maxCheckedBagsPerFlier,
            (value) =>
              Number(value) > 0 ||
              ErrorMessage.InvalidConfigFile(
                keys.maxCheckedBagsPerFlier,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PositiveNumber(),
                  value
                )
              )
          );

          const maxCarryBagsPerFlier = getConfig<number>(
            keys.maxCarryBagsPerFlier,
            (value) =>
              Number(value) > 0 ||
              ErrorMessage.InvalidConfigFile(
                keys.maxCarryBagsPerFlier,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PositiveNumber(),
                  value
                )
              )
          );

          const baseCheckedBagPriceDollars = getConfig<number>(
            keys.baseCheckedBagPriceDollars,
            (value) =>
              Number(value) > 0 ||
              ErrorMessage.InvalidConfigFile(
                keys.baseCheckedBagPriceDollars,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PositiveNumber(),
                  value
                )
              )
          );

          const baseCarryBagPriceDollars = getConfig<number>(
            keys.baseCarryBagPriceDollars,
            (value) =>
              Number(value) > 0 ||
              ErrorMessage.InvalidConfigFile(
                keys.baseCarryBagPriceDollars,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PositiveNumber(),
                  value
                )
              )
          );

          const minBaseSeatPriceDollars = getConfig<number>(
            keys.minBaseSeatPriceDollars,
            (value) =>
              Number(value) > 0 ||
              ErrorMessage.InvalidConfigFile(
                keys.minBaseSeatPriceDollars,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PositiveNumber(),
                  value
                )
              )
          );

          const maxBaseSeatPriceDollars = getConfig<number>(
            keys.maxBaseSeatPriceDollars,
            (value) =>
              Number(value) > minBaseSeatPriceDollars ||
              ErrorMessage.InvalidConfigFile(
                keys.maxBaseSeatPriceDollars,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.GreaterThan(minBaseSeatPriceDollars),
                  value
                )
              )
          );

          const minBaseSeatPriceFfms = getConfig<number>(
            keys.minBaseSeatPriceFfms,
            (value) =>
              Number(value) > 0 ||
              ErrorMessage.InvalidConfigFile(
                keys.minBaseSeatPriceFfms,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PositiveNumber(),
                  value
                )
              )
          );

          const maxBaseSeatPriceFfms = getConfig<number>(
            keys.maxBaseSeatPriceFfms,
            (value) =>
              Number(value) > minBaseSeatPriceFfms ||
              ErrorMessage.InvalidConfigFile(
                keys.maxBaseSeatPriceFfms,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.GreaterThan(minBaseSeatPriceFfms),
                  value
                )
              )
          );

          const minBaseExtraPriceDollars = getConfig<number>(
            keys.minBaseExtraPriceDollars,
            (value) =>
              Number(value) > 0 ||
              ErrorMessage.InvalidConfigFile(
                keys.minBaseExtraPriceDollars,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PositiveNumber(),
                  value
                )
              )
          );

          const maxBaseExtraPriceDollars = getConfig<number>(
            keys.maxBaseExtraPriceDollars,
            (value) =>
              Number(value) > minBaseExtraPriceDollars ||
              ErrorMessage.InvalidConfigFile(
                keys.maxBaseExtraPriceDollars,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.GreaterThan(minBaseExtraPriceDollars),
                  value
                )
              )
          );

          const minBaseExtraPriceFfms = getConfig<number>(
            keys.minBaseExtraPriceFfms,
            (value) =>
              Number(value) > 0 ||
              ErrorMessage.InvalidConfigFile(
                keys.minBaseExtraPriceFfms,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PositiveNumber(),
                  value
                )
              )
          );

          const maxBaseExtraPriceFfms = getConfig<number>(
            keys.maxBaseExtraPriceFfms,
            (value) =>
              Number(value) > minBaseExtraPriceFfms ||
              ErrorMessage.InvalidConfigFile(
                keys.maxBaseExtraPriceFfms,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.GreaterThan(minBaseExtraPriceFfms),
                  value
                )
              )
          );

          const minBaseFlightFfmsEarned = getConfig<number>(
            keys.minBaseFlightFfmsEarned,
            (value) =>
              Number(value) > 0 ||
              ErrorMessage.InvalidConfigFile(
                keys.minBaseFlightFfmsEarned,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PositiveNumber(),
                  value
                )
              )
          );

          const maxBaseFlightFfmsEarned = getConfig<number>(
            keys.maxBaseFlightFfmsEarned,
            (value) =>
              Number(value) > minBaseFlightFfmsEarned ||
              ErrorMessage.InvalidConfigFile(
                keys.maxBaseFlightFfmsEarned,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.GreaterThan(minBaseFlightFfmsEarned),
                  value
                )
              )
          );

          const greedMultiplier = getConfig<number>(
            keys.greedMultiplier,
            (value) =>
              Number(value) > 0 ||
              ErrorMessage.InvalidConfigFile(
                keys.greedMultiplier,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PositiveNumber(),
                  value
                )
              )
          );

          const chanceOfNewFlightInAnAirportInAnHour = getConfig<number>(
            keys.chanceOfNewFlightInAnAirportInAnHour,
            (value) =>
              (Number(value) > 0 && Number(value) < 100) ||
              ErrorMessage.InvalidConfigFile(
                keys.chanceOfNewFlightInAnAirportInAnHour,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PercentageExclusive(),
                  value
                )
              )
          );

          const chanceOfNewFlightsInAnHour = getConfig<number>(
            keys.chanceOfNewFlightsInAnHour,
            (value) =>
              (Number(value) > 0 && Number(value) < 100) ||
              ErrorMessage.InvalidConfigFile(
                keys.chanceOfNewFlightsInAnHour,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PercentageExclusive(),
                  value
                )
              )
          );

          const chanceOfExtrasItemOfferedOnAFlight = getConfig<number>(
            keys.chanceOfNewFlightsInAnHour,
            (value) =>
              (Number(value) > 0 && Number(value) < 100) ||
              ErrorMessage.InvalidConfigFile(
                keys.chanceOfNewFlightsInAnHour,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.PercentageExclusive(),
                  value
                )
              )
          );

          const gateLettersCount = getConfig<number>(
            keys.gateLettersCount,
            (value) =>
              (Number(value) > 0 && Number(value) < 27) ||
              ErrorMessage.InvalidConfigFile(
                keys.gateLettersCount,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.WithinClampExclusive(0, 27),
                  value
                )
              )
          );

          const gateNumbersPerLetter = getConfig<number>(
            keys.gateNumbersPerLetter,
            (value) =>
              Number(value) > 0 ||
              ErrorMessage.InvalidConfigFile(
                keys.gateNumbersPerLetter,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.NonNegativeNumber(),
                  value
                )
              )
          );

          const gatesPerAirport = getConfig<number>(keys.gatesPerAirport, (value_) => {
            const value = Number(value_);
            const upperClamp = gateLettersCount * gateNumbersPerLetter + 1;

            return (
              (value > 0 && value < upperClamp) ||
              ErrorMessage.InvalidConfigFile(
                keys.gatesPerAirport,
                undefined,
                ErrorMessage.UnexpectedValue(
                  ErrorMessage.expectations.WithinClampExclusive(0, upperClamp),
                  value
                )
              )
            );
          });

          return (
            require('universe:tasks/simulate-activity/generate-flights.ts') as typeof import('universe:tasks/simulate-activity/generate-flights.ts')
          ).generateFlights({
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
            gateNumbersPerLetter,
            gatesPerAirport
          });
        };

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

    await runAndThenCleanupSimulation();
  });

  listrTask.title = `Finished "${fullPrettyName}"`;
}
