import { CliErrorMessage as UpstreamErrorMessage } from '@-xun/cli/error';
import { TAB } from 'rejoinder';

/**
 * A collection of possible error and warning messages.
 */
/* istanbul ignore next */
export const ErrorMessage = {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  GuruMeditation: UpstreamErrorMessage.GuruMeditation,
  InvalidBytes(bytes: unknown) {
    return `specified byte value "${String(bytes)}" is either non-numeric or non-positive`;
  },
  InvalidCollectionSizeInput(dbCollection: string) {
    return `invalid input "${dbCollection}" to countCollection`;
  },
  TooManyBytes(bytes: number, maxBytes: number) {
    return `"${String(bytes)}b" total bytes is greater than the max allowed (${maxBytes}b)`;
  },
  UnreadableConfigFile(path: string) {
    return `expected readable configuration file to exist at:\n${TAB}${path}\n\nIf this file does not already exist, please create it`;
  },
  InvalidConfigFile(key: string, path: string | undefined, problem: string | undefined) {
    return (
      `configuration key "${key}" is missing or has invalid value${
        path === undefined ? '' : ` in file: ${path}`
      }` + (problem === undefined ? '' : `\n\nProblem: ${problem}`)
    );
  },
  UnexpectedValue(expectation: string, actual: unknown) {
    return `expected value ${expectation}; saw instead: "${String(actual)}"`;
  },
  UnimplementedTasks() {
    return 'one or more of the given tasks have not been properly implemented by the developer';
  },
  BadInfoDb() {
    return 'expected info db first entry to be non-null';
  },
  LessThanTwoAirportsOrAirlines() {
    return 'cannot generate flights without at least two airports and airlines';
  },
  IteratorRanOutOfElements() {
    return 'an iterable ran out of elements to iterate over';
  },
  MissingStochasticState() {
    return 'expected stochastic state to exist';
  },
  ImpossibleStochasticState(stage: number) {
    return `stage ${stage} encountered impossible condition`;
  },
  GateNotPredetermined() {
    return 'gate was not predetermined?!';
  },
  ArrivalTypeButDepartureExpected() {
    return 'arrival type encountered in departure-only model';
  },
  IllegalDepartureState() {
    return 'arrival type encountered in departure-only model';
  },
  DatabaseInsertNotAcknowledged() {
    return 'flight insertion failed: operation not acknowledged';
  },
  IncompleteDatabaseInsert(expected: number, actual: number) {
    return `generated ${expected} flights but only ${actual} were inserted`;
  },

  expectations: {
    NonNegativeInteger() {
      return `to be a non-negative integer`;
    },
    PositiveInteger() {
      return `to be a positive integer`;
    },
    GreaterThanInteger(lower: number) {
      return `to be an integer greater than ${lower}`;
    },
    PercentageExclusive() {
      return ErrorMessage.expectations.WithinIntegerClampExclusive(0, 100);
    },
    WithinIntegerClampExclusive(lower: number, upper: number) {
      return `to be integer greater than ${lower} but less than ${upper}`;
    }
  }
};
