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
  UnimplementedTasks() {
    return `one or more of the given tasks have not been properly implemented by the developer`;
  },
  UnexpectedValue(expectation: string, actual: unknown) {
    return `expected value${expectation}; saw instead: "${String(actual)}"`;
  }
};
