/* eslint-disable unicorn/no-array-reduce */
import { randomBytes, randomInt } from 'node:crypto';

import { runWithMongoSchemaMultitenancy } from '@-xun/mongo-schema/multitenant';

import {
  getAirlinesDb,
  getAirportsDb,
  getFlightsDb,
  getInfoDb
} from '@nhscc/backend-airports/db';

import { ObjectId } from 'mongodb';

import { ErrorMessage } from 'universe:error.ts';

import type {
  InternalAirline,
  InternalAirport,
  InternalFlight,
  InternalInfo
} from '@nhscc/backend-airports/db';

import type { Collection } from 'mongodb';
import type { ExtendedDebugger } from 'rejoinder';
import type { ListrTaskLiteral } from 'universe:util.ts';

type StatelessFlight = Omit<InternalFlight, 'stochasticStates'> & {
  stochasticStates?: InternalFlight['stochasticStates'];
};

const oneSecondInMs = 1000;
const OneMinuteInMs = 60 * oneSecondInMs;
const threeMinutesInMs = 3 * OneMinuteInMs;
const fiveMinutesInMs = 5 * OneMinuteInMs;
const tenMinutesInMs = 10 * OneMinuteInMs;
const fifteenMinutesInMs = 15 * OneMinuteInMs;
const sixteenMinutesInMs = 16 * OneMinuteInMs;
const thirtyMinutesInMs = 30 * OneMinuteInMs;
const thirtyOneMinutesInMs = 31 * OneMinuteInMs;
const oneHourInMs = 60 * OneMinuteInMs;
const oneDayInMs = 24 * oneHourInMs;
const sevenDaysInMs = 7 * oneDayInMs;

const objectIdRandom = randomBytes(5).toString('hex');
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

/**
 * Wrapper around randomInt that does a `Math.floor` on the operands first and
 * also switches them around if they're in the wrong order (min must always be
 * <= max).
 */
const safeRandomInt = ((...params) => {
  const args = params.map((n) => Math.floor(Number(n))).toSorted((a, b) => a - b);
  return Reflect.apply(randomInt, undefined, args);
}) as typeof randomInt;

let objectIdCounter = safeRandomInt(2 ** 10, 2 ** 21 - 1);

// ? Flight numbers can be any 4 digit number
const sortedFlightNumPerAirlinePool = Array.from({ length: 9999 }).map(
  (_, index) => index + 1
);

/**
 * Generates flight data for the BDPA airports problem statement.
 */
export async function generateFlights({
  tenantId,
  listrTask,
  taskGlobalDebug,
  ...generatorConfig
}: {
  generatorConcurrency: number;

  generateFlightsInAdvanceDays: number;
  maxFlightTimeToLiveDays: number;
  minSeatsPerClass: number;
  seatsPerFlight: number;
  maxCheckedBagsPerFlier: number;
  maxCarryBagsPerFlier: number;
  baseCheckedBagPriceDollars: number;
  baseCarryBagPriceDollars: number;
  minBaseSeatPriceDollars: number;
  maxBaseSeatPriceDollars: number;
  minBaseSeatPriceFfms: number;
  maxBaseSeatPriceFfms: number;
  minBaseExtraPriceDollars: number;
  maxBaseExtraPriceDollars: number;
  minBaseExtraPriceFfms: number;
  maxBaseExtraPriceFfms: number;
  minBaseFlightFfmsEarned: number;
  maxBaseFlightFfmsEarned: number;
  greedMultiplier: number;
  chanceOfNewFlightInAnAirportInAnHour: number;
  chanceOfNewFlightsInAnHour: number;
  chanceOfExtrasItemOfferedOnAFlight: number;
  gateLettersCount: number;
  gateNumbersPerLetter: number;

  tenantId: string;
  listrTask: Parameters<ListrTaskLiteral['task']>[1];
  taskGlobalDebug: ExtendedDebugger;
}) {
  taskGlobalDebug('active flight generator configuration: %O', generatorConfig);

  const {
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
  } = generatorConfig;

  const { airlinesDb, airportsDb, flightsDb, infoDb } = await getDatabases(tenantId);

  const airportsCursor = airportsDb.find();
  const airlinesCursor = airlinesDb.find();
  const infoCursor = infoDb.find();

  const [airports, airlines, info] = await Promise.all([
    airportsCursor.toArray(),
    airlinesCursor.toArray(),
    infoCursor.next()
  ]);

  await Promise.all([
    airportsCursor.close(),
    airlinesCursor.close(),
    infoCursor.close()
  ]);

  if (!info) {
    throw new Error(ErrorMessage.BadInfoDb());
  }

  if (airports.length < 2 || airlines.length < 2) {
    throw new Error(ErrorMessage.LessThanTwoAirportsOrAirlines());
  }

  const numOfDaysToGenerateFlightsForInMs = generateFlightsInAdvanceDays * oneDayInMs;
  taskGlobalDebug(
    'numOfDaysToGenerateFlightsForInMs: %O',
    numOfDaysToGenerateFlightsForInMs
  );

  // ? Prepare to execute tasks in parallel
  return listrTask.newListr(
    [
      {
        title: `Deleting flights older than ${maxFlightTimeToLiveDays} days...`,
        async task(_, thisTask) {
          // ? Delete any entries created more than X days ago
          const flightDeletionResult = await flightsDb.deleteMany({
            _id: { $lt: generateObjectIdFromMs(Date.now() - sevenDaysInMs) }
          });

          thisTask.title = `Deleted ${flightDeletionResult.deletedCount} flights over ${maxFlightTimeToLiveDays} days old`;
        },
        rendererOptions: { persistentOutput: true }
      },
      {
        title: 'Generate flights',
        async task(_, thisTask) {
          thisTask.title = 'Generating flights...';

          // ? Determine how many hours (if any) need flights generated for them
          const lastFlightId =
            (await flightsDb.find().sort({ _id: -1 }).limit(1).next())?._id ??
            new ObjectId();

          const lastFlightHourMs = roundDownToNearestHourInMs(
            lastFlightId.getTimestamp().getTime()
          );

          const totalHoursToGenerateFlightsFor =
            (roundDownToNearestHourInMs(Date.now() + numOfDaysToGenerateFlightsForInMs) -
              lastFlightHourMs) /
            oneHourInMs;

          taskGlobalDebug('last flight id: %O', lastFlightId);
          taskGlobalDebug('last flight hours (ms): %O', lastFlightHourMs);
          taskGlobalDebug(
            'total hours to generate flights for: %O',
            totalHoursToGenerateFlightsFor
          );

          if (totalHoursToGenerateFlightsFor <= 0) {
            thisTask.title =
              'Generated 0 hours worth of flights (more flights not needed)';

            return;
          }

          thisTask.title = `Generating ${totalHoursToGenerateFlightsFor} hours worth of flights...`;

          const sortedPerHourGatePool = alphabet
            .slice(0, gateLettersCount)
            .flatMap((x) => {
              return Array.from({ length: gateNumbersPerLetter }).map(
                (_, n) => `${x}${n + 1}`
              );
            });

          // ? Track total committed flights to database across all hours
          let totalGlobalCommittedFlightsCount = 0;

          // ? And now, for every hour, generate a bunch of flights concurrently
          return thisTask.newListr(
            [
              {
                task(_, thisTransparentTask) {
                  return thisTransparentTask.newListr(
                    Array.from({ length: totalHoursToGenerateFlightsFor }).map(
                      (_, index) => ({
                        title: `Queueing generation subtask for hour ${index + 1}...`,
                        async task(_, thisSubtask) {
                          // ? Track total committed flights to database in this hour
                          let totalCommittedFlightsCount = 0;

                          const currentHour = index + 1;
                          const currentHourInMs =
                            lastFlightHourMs + currentHour * oneHourInMs;

                          updateTitle();

                          const taskDebug = taskGlobalDebug.extend(
                            `hour-${currentHour.toString()}`
                          );

                          taskDebug('current hour: %O', currentHour);
                          taskDebug('current hour in ms: %O', currentHourInMs);

                          const flightsInAnHourOutcome = getRandomPercentage();

                          if (flightsInAnHourOutcome > chanceOfNewFlightsInAnHour) {
                            taskDebug(
                              'skipped generating flights for hour %O of %O due to chance (%O > %O)',
                              currentHour,
                              totalHoursToGenerateFlightsFor,
                              flightsInAnHourOutcome,
                              chanceOfNewFlightsInAnHour
                            );

                            updateTitle({ skipped: true });

                            return;
                          }

                          // ? We'll update mongo as we go, but we won't wait around!
                          const databaseInsertPromises: Promise<void>[] = [];
                          // ? Ensure a fair distribution of arrivals and departures
                          let isArrival = false;

                          const getRandomAirport = makeRandomIterationFunction(
                            airports,
                            {
                              withReplacement: true
                            }
                          ).next;
                          const getRandomAirline =
                            makeRandomIterationFunction(airlines).next;

                          const activeAirlines = Array.from({
                            length: safeRandomInt(2, airlines.length)
                          }).map(() => getRandomAirline());

                          taskDebug('active airlines: %O', activeAirlines);

                          const getFlightNumber = activeAirlines.reduce<{
                            [airline_id: string]: () => number;
                          }>((map, airline) => {
                            return {
                              ...map,
                              [airline._id.toHexString()]: makeRandomIterationFunction(
                                sortedFlightNumPerAirlinePool
                              ).next
                            };
                          }, {});

                          const getRandomAirportExcluding = (shortName: string) => {
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            while (true) {
                              const airport = getRandomAirport();

                              if (airport.shortName !== shortName) {
                                return airport;
                              }
                            }
                          };

                          // ? Arrivals land at firstAirport and came from secondAirport.
                          // ? Departures land at firstAirport and depart to
                          // ? secondAirport. Which airport they came from is randomly
                          // ? determined
                          airports.forEach((firstAirport) => {
                            const taskA1Debug = taskDebug.extend(firstAirport.shortName);
                            // ? Thanks to arrivals and departures both using firstAirport
                            // ? to land, we can prevent gate overlaps pretty easily
                            const { next: getGate, replace: releaseGate } =
                              makeRandomIterationFunction(sortedPerHourGatePool);

                            // ? Prepare a place to store unfinished business
                            const statelessFlights: StatelessFlight[] = [];

                            // ? First we generate stateless flight data
                            airports.forEach((secondAirport) => {
                              const taskA1A2Debug = taskA1Debug.extend(
                                secondAirport.shortName
                              );
                              const flightInAnAirportInAnHourOutcome =
                                getRandomPercentage();

                              // ? Sometimes we skip a source-dest pair in a given hour
                              if (
                                flightInAnAirportInAnHourOutcome >
                                chanceOfNewFlightInAnAirportInAnHour
                              ) {
                                taskA1A2Debug(
                                  'skipped generating flight between %O and %O during hour %O of %O due to chance (%O > %O)',
                                  firstAirport.name,
                                  secondAirport.name,
                                  currentHour,
                                  totalHoursToGenerateFlightsFor,
                                  flightInAnAirportInAnHourOutcome,
                                  chanceOfNewFlightInAnAirportInAnHour
                                );

                                return;
                              }

                              // ? Planes can't come from and land at the same airport
                              if (firstAirport._id.equals(secondAirport._id)) {
                                return;
                              }

                              activeAirlines.forEach((airline) => {
                                const flightNumber =
                                  airline.codePrefix +
                                  getFlightNumber[
                                    airline._id.toHexString()
                                  ]!().toString();

                                const flightDebug = taskA1A2Debug.extend(flightNumber);
                                flightDebug('generating new flight %O', flightNumber);

                                // ? This flight will be the opposite type of the last one
                                isArrival = !isArrival;

                                // ? Next, we determine how many checked bags and
                                // ? carry-ons people can bring and how much they'll be
                                // ? gouged
                                const maxChecked = safeRandomInt(
                                  1,
                                  maxCheckedBagsPerFlier
                                );
                                const maxCarry = safeRandomInt(1, maxCarryBagsPerFlier);

                                let previousSeatClass$ = safeRandomInt(
                                  minBaseSeatPriceDollars,
                                  maxBaseSeatPriceDollars
                                );

                                let previousSeatClassFfms = safeRandomInt(
                                  minBaseSeatPriceFfms,
                                  maxBaseSeatPriceFfms
                                );

                                // ? Ensure there's always one
                                const numSeatClasses = Math.max(
                                  1,
                                  info.seatClasses.length
                                );

                                // ? We do this out here so we can sort and sum them easily
                                const numSeats = Array.from({
                                  length: numSeatClasses
                                })
                                  .map(() => {
                                    return safeRandomInt(
                                      minSeatsPerClass,
                                      Math.floor(seatsPerFlight / numSeatClasses)
                                    );
                                  })
                                  .toSorted((a, b) => b - a);

                                // ? Give any remaining seats to the cheapest option
                                numSeats[0]! +=
                                  seatsPerFlight -
                                  numSeats.reduce((total, $) => total + $, 0);

                                flightDebug('isArrival: %O', isArrival);
                                flightDebug('maxChecked: %O', maxChecked);
                                flightDebug('maxCarry: %O', maxCarry);
                                flightDebug(
                                  'initial previousSeatClass$: %O',
                                  previousSeatClass$
                                );

                                flightDebug(
                                  'initial previousSeatClassFfms: %O',
                                  previousSeatClassFfms
                                );

                                flightDebug('numSeatClasses: %O', numSeatClasses);
                                flightDebug('numSeats: %O', numSeats);

                                // ? Now we calculate seat prices and availability
                                const seats: InternalFlight['seats'] = {
                                  [info.seatClasses[0]!]: {
                                    total: numSeats[0]!,
                                    priceDollars: previousSeatClass$,
                                    priceFfms: previousSeatClassFfms
                                  }
                                };

                                for (const [ndx, seatClass] of info.seatClasses
                                  .slice(1)
                                  .entries()) {
                                  // ? Greedy capitalists!
                                  previousSeatClass$ =
                                    safeRandomInt(
                                      previousSeatClass$,
                                      previousSeatClass$ * greedMultiplier
                                    ) + Number(Math.random().toFixed(2));

                                  previousSeatClassFfms = safeRandomInt(
                                    previousSeatClassFfms,
                                    previousSeatClassFfms * greedMultiplier
                                  );

                                  seats[seatClass] = {
                                    // * Guaranteed to be the same length at this point
                                    total: numSeats[ndx + 1]!,
                                    priceDollars: previousSeatClass$,
                                    priceFfms: previousSeatClassFfms
                                  };
                                }

                                flightDebug('seats: %O', seats);

                                // ? We also calculate prices and availability of extras
                                const extras: InternalFlight['extras'] = {};

                                let previousItem$ = safeRandomInt(
                                  minBaseExtraPriceDollars,
                                  maxBaseExtraPriceDollars
                                );

                                let previousItemFfms = safeRandomInt(
                                  minBaseExtraPriceFfms,
                                  maxBaseExtraPriceFfms
                                );

                                flightDebug('previousItem$: %O', previousItem$);
                                flightDebug('previousItemFfms: %O', previousItemFfms);

                                for (const item of info.allExtras) {
                                  const extrasItemOfferedOnAFlightOutcome =
                                    getRandomPercentage();

                                  // ? Sometimes we skip including one of the extras items
                                  if (
                                    extrasItemOfferedOnAFlightOutcome >
                                    chanceOfExtrasItemOfferedOnAFlight
                                  ) {
                                    flightDebug(
                                      'skipped adding extras item %O due to chance (%O > %O)',
                                      item,
                                      extrasItemOfferedOnAFlightOutcome,
                                      chanceOfExtrasItemOfferedOnAFlight
                                    );

                                    continue;
                                  }

                                  // ? Greedy capitalists!
                                  previousItem$ =
                                    safeRandomInt(
                                      previousItem$,
                                      previousItem$ * greedMultiplier
                                    ) + Number(Math.random().toFixed(2));
                                  previousItemFfms = safeRandomInt(
                                    previousItemFfms,
                                    previousItemFfms * 2
                                  );

                                  extras[item] = {
                                    priceDollars: previousItem$,
                                    priceFfms: previousItemFfms
                                  };
                                }

                                flightDebug('extras: %O', extras);

                                // ? Finally, let's put it all together...
                                statelessFlights.push({
                                  _id: generateObjectIdFromMs(currentHourInMs),
                                  booker_id: isArrival ? null : firstAirport.owner_id,
                                  type: isArrival ? 'arrival' : 'departure',
                                  airline: airline.name,

                                  comingFrom: isArrival
                                    ? secondAirport.shortName
                                    : getRandomAirportExcluding(firstAirport.shortName)
                                        .shortName,

                                  landingAt: firstAirport.shortName,
                                  departingTo: isArrival
                                    ? null
                                    : secondAirport.shortName,
                                  flightNumber,

                                  baggage: {
                                    checked: {
                                      max: maxChecked,
                                      prices: Array.from({ length: maxChecked }).reduce<
                                        number[]
                                      >(($) => {
                                        const previous = $.at(-1) || 0;
                                        return [
                                          ...$,
                                          // ? Greedy little airlines
                                          safeRandomInt(
                                            previous,
                                            (previous || baseCheckedBagPriceDollars) *
                                              greedMultiplier
                                          )
                                        ];
                                      }, [])
                                    },

                                    carry: {
                                      max: maxCarry,
                                      prices: Array.from({ length: maxCarry }).reduce<
                                        number[]
                                      >(($) => {
                                        const previous = $.at(-1) || 0;
                                        return [
                                          ...$,
                                          // ? Greedy little airlines
                                          safeRandomInt(
                                            previous,
                                            (previous || baseCarryBagPriceDollars) *
                                              greedMultiplier
                                          )
                                        ];
                                      }, [])
                                    }
                                  },

                                  ffms: safeRandomInt(
                                    minBaseFlightFfmsEarned,
                                    maxBaseFlightFfmsEarned
                                  ),

                                  seats,
                                  extras
                                });

                                flightDebug(
                                  'generated stateless flight: %O',
                                  statelessFlights.at(-1)
                                );
                              });
                            });

                            taskA1Debug(
                              'statelessFlights (pre markov chain): %O',
                              statelessFlights
                            );

                            // ? And now we run all the flights we generated for this
                            // ? airport through each stage of the markov model. For some
                            // ? stages, we loop through the entire repository of flights.
                            // ? This results in multiple passthroughs over the
                            // ? statelessFlights dataset. We do it this way so that we
                            // ? can maintain memory of which flights are using which
                            //?  gates and when

                            // ? Stages 1 and 2: initialize things
                            statelessFlights.forEach((flight) => {
                              let previousActiveAfter = 0;
                              let done = false;

                              const isArrival = flight.type === 'arrival';

                              const arriveAtReceiver = safeRandomInt(
                                currentHourInMs,
                                // ? We do the subtraction of minutes to ensure our
                                // ? stochastic process remains within the hour. This
                                // ? assumption is crucial to the functionality of this
                                // ? API!
                                currentHourInMs +
                                  oneHourInMs -
                                  (isArrival ? sixteenMinutesInMs : thirtyOneMinutesInMs)
                              );

                              // ? This is technically stage 1

                              // ? Initialize this flight's stochastic state
                              flight.stochasticStates = {
                                '0': {
                                  arriveAtReceiver,
                                  departFromSender:
                                    arriveAtReceiver -
                                    safeRandomInt(2 * oneHourInMs, 5 * oneHourInMs),
                                  departFromReceiver: isArrival
                                    ? null
                                    : arriveAtReceiver + fifteenMinutesInMs,
                                  // ? The flight hasn't taken off yet! (initial state)
                                  status: 'scheduled',
                                  gate: null
                                }
                              };

                              taskA1Debug.extend('markov-1').extend(flight.flightNumber)(
                                'stochastic states: %O',
                                flight.stochasticStates
                              );

                              // ? Here we use a markov model to generate future flight
                              // ? stochastic information states that we transition into
                              // ? sequentially over time, giving API users the impression
                              // ? that flight information is changing.
                              // ?
                              // ? There are 10 total stochastic decision making stages we
                              // ? run through to generate flight state (init state + 9).

                              // ? These are stages 2 and 3
                              for (let stage = 2; !done && stage < 4; ++stage) {
                                // ? Start from the initial state and rebase onto it
                                const state = { ...getMostRecentState(flight) };

                                switch (stage) {
                                  case 2: {
                                    // ? This flight just took off!
                                    previousActiveAfter = state.departFromSender;

                                    // ? 95% chance this flight is not cancelled
                                    if (getRandomPercentage() > 95) {
                                      state.status = 'cancelled';
                                      done = true;
                                    } else {
                                      state.status = 'on time';
                                    }

                                    flight.stochasticStates[
                                      previousActiveAfter.toString()
                                    ] = state;

                                    taskA1Debug
                                      .extend('markov-2')
                                      .extend(flight.flightNumber)(
                                      'stochastic states: %O',
                                      flight.stochasticStates
                                    );

                                    break;
                                  }

                                  case 3: {
                                    // ? 75% chance this flight is not delayed
                                    if (getRandomPercentage() > 75) {
                                      previousActiveAfter = safeRandomInt(
                                        state.arriveAtReceiver - 2 * oneHourInMs,
                                        state.departFromSender + fifteenMinutesInMs
                                      );

                                      state.status = 'delayed';
                                      state.arriveAtReceiver += safeRandomInt(
                                        fiveMinutesInMs,
                                        fifteenMinutesInMs
                                      );

                                      if (state.departFromReceiver) {
                                        state.departFromReceiver += safeRandomInt(
                                          fiveMinutesInMs,
                                          fifteenMinutesInMs
                                        );
                                      }

                                      flight.stochasticStates[
                                        previousActiveAfter.toString()
                                      ] = state;
                                    }

                                    taskA1Debug
                                      .extend('markov-3')
                                      .extend(flight.flightNumber)(
                                      'stochastic states: %O',
                                      flight.stochasticStates
                                    );

                                    break;
                                  }

                                  default: {
                                    throw new Error(ErrorMessage.GuruMeditation());
                                  }
                                }
                              }
                            });

                            // ? Second, third, and fourth passthroughs are sequential to
                            // ? keep track of gates

                            // ? Stage 4: this flight's gate gets determined now
                            statelessFlights.forEach((flight) => {
                              const taskA1M4Debug = taskA1Debug.extend('markov-4');

                              if (!flight.stochasticStates) {
                                throw new Error(
                                  ErrorMessage.ImpossibleStochasticState(3)
                                );
                              }

                              const recentState = getMostRecentState(flight);

                              if (recentState.status === 'cancelled') {
                                return;
                              }

                              flight.stochasticStates[
                                safeRandomInt(
                                  recentState.arriveAtReceiver - 2 * oneHourInMs,
                                  recentState.arriveAtReceiver - fifteenMinutesInMs
                                ).toString()
                              ] = {
                                ...recentState,
                                gate: getGate()
                              };

                              taskA1M4Debug.extend(flight.flightNumber)(
                                'stochastic states: %O',
                                flight.stochasticStates
                              );
                            });

                            // ? Stage 5: this flight just landed!
                            statelessFlights.forEach((flight) => {
                              if (!flight.stochasticStates) {
                                throw new Error(
                                  ErrorMessage.ImpossibleStochasticState(4)
                                );
                              }

                              const recentState = getMostRecentState(flight);

                              if (recentState.status === 'cancelled') {
                                return;
                              }

                              let gate = recentState.gate;

                              if (!gate) {
                                throw new Error(ErrorMessage.GateNotPredetermined());
                              }

                              // ? 50% chance this flight's gate changes
                              if (getRandomPercentage() > 50) {
                                releaseGate(gate);
                                gate = getGate();
                              }

                              flight.stochasticStates[
                                safeRandomInt(
                                  recentState.arriveAtReceiver - thirtyMinutesInMs,
                                  recentState.arriveAtReceiver - fiveMinutesInMs
                                ).toString()
                              ] = {
                                ...recentState,
                                gate,
                                status: 'landed'
                              };

                              taskA1Debug.extend('markov-5').extend(flight.flightNumber)(
                                'stochastic states: %O',
                                flight.stochasticStates
                              );
                            });

                            // ? Stage 6: this flight has arrived at the gate!
                            statelessFlights.forEach((flight) => {
                              if (!flight.stochasticStates) {
                                throw new Error(
                                  ErrorMessage.ImpossibleStochasticState(5)
                                );
                              }

                              const recentState = getMostRecentState(flight);

                              if (recentState.status === 'cancelled') {
                                return;
                              }

                              let gate = recentState.gate;
                              if (!gate) {
                                throw new Error(ErrorMessage.GateNotPredetermined());
                              }

                              // ? 15% chance this flight's gate changes again
                              if (getRandomPercentage() > 85) {
                                releaseGate(gate);
                                gate = getGate();
                              }

                              flight.stochasticStates[recentState.arriveAtReceiver] = {
                                ...recentState,
                                gate,
                                status: 'arrived'
                              };

                              taskA1Debug.extend('markov-6').extend(flight.flightNumber)(
                                'stochastic states: %O',
                                flight.stochasticStates
                              );
                            });

                            // ? Stages 7-10: wraps things up
                            statelessFlights.forEach((flight) => {
                              if (!flight.stochasticStates) {
                                throw new Error(
                                  ErrorMessage.ImpossibleStochasticState(6)
                                );
                              }

                              const recentState = getMostRecentState(flight);

                              if (recentState.status === 'cancelled') {
                                return;
                              }

                              let previousActiveAfter = 0;
                              let done = false;

                              const isArrival = flight.type === 'arrival';

                              for (let stage = 7; !done && stage <= 10; ++stage) {
                                const state = { ...recentState };

                                switch (stage) {
                                  case 7: {
                                    if (!isArrival) continue;

                                    // ? This flight is done!
                                    previousActiveAfter = currentHourInMs + oneHourInMs;
                                    state.status = 'past';
                                    state.gate = null;
                                    done = true;

                                    taskA1Debug
                                      .extend('markov-7')
                                      .extend(flight.flightNumber)(
                                      'stochastic states: %O',
                                      flight.stochasticStates
                                    );

                                    break;
                                  }

                                  case 8: {
                                    if (isArrival) {
                                      throw new Error(
                                        ErrorMessage.ArrivalTypeButDepartureExpected()
                                      );
                                    }

                                    // ? This flight has started boarding
                                    previousActiveAfter =
                                      state.arriveAtReceiver +
                                      safeRandomInt(threeMinutesInMs, tenMinutesInMs);

                                    state.status = 'boarding';

                                    taskA1Debug
                                      .extend('markov-8')
                                      .extend(flight.flightNumber)(
                                      'stochastic states: %O',
                                      flight.stochasticStates
                                    );

                                    break;
                                  }

                                  case 9: {
                                    // ? This flight just departed!
                                    if (!state.departFromReceiver) {
                                      throw new Error(
                                        ErrorMessage.IllegalDepartureState()
                                      );
                                    }

                                    previousActiveAfter = state.departFromReceiver;
                                    state.status = 'departed';

                                    taskA1Debug
                                      .extend('markov-9')
                                      .extend(flight.flightNumber)(
                                      'stochastic states: %O',
                                      flight.stochasticStates
                                    );

                                    break;
                                  }

                                  case 10: {
                                    // ? This flight is done!
                                    if (!state.departFromReceiver) {
                                      throw new Error(
                                        ErrorMessage.IllegalDepartureState()
                                      );
                                    }

                                    previousActiveAfter =
                                      state.departFromReceiver +
                                      safeRandomInt(2 * oneHourInMs, 5 * oneHourInMs);

                                    state.status = 'past';
                                    state.gate = null;

                                    taskA1Debug
                                      .extend('markov-10')
                                      .extend(flight.flightNumber)(
                                      'stochastic states: %O',
                                      flight.stochasticStates
                                    );

                                    break;
                                  }

                                  default: {
                                    throw new Error(ErrorMessage.GuruMeditation());
                                  }
                                }

                                flight.stochasticStates[previousActiveAfter.toString()] =
                                  state;
                              }
                            });

                            // ? Send these flights to the database
                            const statefulFlights = statelessFlights as InternalFlight[];

                            taskA1Debug('statefulFlights: %O', statefulFlights);

                            if (statefulFlights.length === 0) {
                              taskA1Debug(
                                'skipped inserting flight data into database because there is nothing to commit (statefulFlights is empty)'
                              );

                              return;
                            }

                            databaseInsertPromises.push(
                              (async function () {
                                const operation =
                                  await flightsDb.insertMany(statefulFlights);

                                if (!operation.acknowledged) {
                                  throw new Error(
                                    ErrorMessage.DatabaseInsertNotAcknowledged()
                                  );
                                }

                                if (operation.insertedCount !== statefulFlights.length) {
                                  throw new Error(
                                    ErrorMessage.IncompleteDatabaseInsert(
                                      statefulFlights.length,
                                      operation.insertedCount
                                    )
                                  );
                                }

                                totalCommittedFlightsCount += operation.insertedCount;
                                totalGlobalCommittedFlightsCount +=
                                  operation.insertedCount;
                                updateTitle();
                              })()
                            );
                          });

                          taskDebug('awaiting final database insertion promises...');

                          // ? Wait for any remaining database update actions to finish
                          await Promise.all(databaseInsertPromises);

                          updateTitle();

                          function updateTitle({ skipped = false } = {}) {
                            thisSubtask.title = `${skipped ? '[SKIPPED] ' : ''}Generated ${totalCommittedFlightsCount} flights for hour ${currentHourInMs} (${currentHour}/${totalHoursToGenerateFlightsFor})`;
                          }
                        }
                      })
                    ),
                    {
                      concurrent: generatorConcurrency
                    }
                  );
                }
              },
              {
                task() {
                  thisTask.title = `Generated ${totalGlobalCommittedFlightsCount} total flights across ${totalHoursToGenerateFlightsFor} hours`;
                }
              }
            ],

            {
              concurrent: false
            }
          );
        }
      }
    ],
    { concurrent: false }
  );
}

async function getDatabases(tenantId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let flightsDb: Collection<InternalFlight> = undefined as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let airportsDb: Collection<InternalAirport> = undefined as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let airlinesDb: Collection<InternalAirline> = undefined as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let infoDb: Collection<InternalInfo> = undefined as any;

  await runWithMongoSchemaMultitenancy(tenantId, async () => {
    flightsDb = (await getFlightsDb()).flightsDb;
    airportsDb = (await getAirportsDb()).airportsDb;
    airlinesDb = (await getAirlinesDb()).airlinesDb;
    infoDb = (await getInfoDb()).infoDb;
  });

  return { flightsDb, airportsDb, airlinesDb, infoDb };
}

// ? We make our own MongoDb Ids so that we can sort them and quickly delete
// ? outdated flights. Very cool!
// * See: https://docs.mongodb.com/manual/reference/method/ObjectId/#ObjectId
function generateObjectIdFromMs(epoch: number) {
  const hex = (
    Math.floor(epoch / 1000).toString(16) +
    objectIdRandom +
    (++objectIdCounter).toString(16)
  ).padEnd(24, '0');

  return new ObjectId(hex);
}

function getRandomPercentage() {
  return safeRandomInt(1, 100);
}

function roundDownToNearestHourInMs(epoch: number) {
  return Math.floor(epoch / oneHourInMs) * oneHourInMs;
}

/**
 * Clones `array` and returns two functions. The first will pull random unique
 * values from `array`. The second will push elements back onto `array`.
 *
 * Set `withReplacement` to `true` to allow duplicates (values are no longer
 * guaranteed unique).
 */
function makeRandomIterationFunction<T extends NonNullable<unknown>>(
  array: T[],
  { withReplacement = false } = {}
) {
  const clonedArray = Array.from(array);
  const replaceByDefault = withReplacement;

  function next({ withReplacement = replaceByDefault } = {}) {
    const index = safeRandomInt(clonedArray.length);
    const element = withReplacement
      ? clonedArray[index]
      : clonedArray.splice(index, 1)[0];

    if (element === undefined) {
      throw new Error(ErrorMessage.IteratorRanOutOfElements());
    }

    return element;
  }

  function replace(element: T) {
    clonedArray.push(element);
  }

  return { next, replace };
}

function getMostRecentState(flight: StatelessFlight) {
  if (!flight.stochasticStates) {
    throw new Error(ErrorMessage.MissingStochasticState());
  }

  return Object.values(flight.stochasticStates).at(-1)!;
}
