import { readFile } from 'node:fs/promises';

import { checkArrayNotEmpty, CliError } from '@-xun/cli';

import {
  makeStandardConfigureErrorHandlingEpilogue,
  makeStandardConfigureExecutionContext
} from '@-xun/cli/configure';

import { createDebugLogger, createGenericLogger } from 'rejoinder';

import {
  actualTargetProblems,
  configDirNameComponent,
  globalDebuggerNamespace,
  globalLoggerNamespace,
  inputTargets,
  targetDatabases,
  TargetProblem,
  targetYears
} from 'universe:constant.ts';

import { ErrorMessage } from 'universe:error.ts';

import type {
  BfeBuilderObject,
  ConfigureErrorHandlingEpilogue,
  ConfigureExecutionContext
} from '@-xun/cli';

import type {
  StandardCommonCliArguments,
  StandardExecutionContextWithListr2
} from '@-xun/cli/extensions';

import type { Arrayable, JsonObject, JsonValue, LiteralUnion } from 'type-fest';
import type { ActualTargetProblem } from 'universe:constant.ts';

import type {
  // ? Used in documentation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withGlobalBuilder
} from 'universe:util.ts';

const rootGenericLogger = createGenericLogger({ namespace: globalLoggerNamespace });
const rootDebugLogger = createDebugLogger({ namespace: globalDebuggerNamespace });

export { $executionContext } from '@-xun/cli';

/**
 * The expected shape of an incoming JSON configuration object.
 */
export type Configuration = Record<keyof TargetProblem, JsonObject>;

export type GlobalExecutionContext = StandardExecutionContextWithListr2 & {
  startupError: Error | undefined;
  /**
   * Call this function to grab a value from global configuration. Nested `key`
   * is supported (e.g. `a.b.c`). Use `validator` to validate the value. Pass a
   * custom function to `validator` that returns `true` if valid, or false / an
   * error string if invalid.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConfig: <T>(
    key: string,
    validator:
      | 'string'
      | 'number'
      | 'boolean'
      | 'null'
      | ((value: unknown) => boolean | string)
  ) => T;
};

/**
 * These properties will be available in the `argv` object of any command that
 * uses {@link withGlobalBuilder} to construct its `builder`.
 *
 * This type is manually synchronized with {@link globalCliArguments}, but the
 * keys may differ slightly (e.g. hyphens may be elided in favor of camelCase).
 *
 * @see {@link StandardCommonCliArguments}
 */
export type GlobalCliArguments = StandardCommonCliArguments & {
  targets: ActualTargetProblem[];
};

/**
 * Returns a well-known configuration path.
 */
export async function getWellKnownConfigPath() {
  const { config: configDirPath } = (await import('env-paths')).default(
    configDirNameComponent
  );

  return `${configDirPath}/secrets.json`;
}

/**
 * This {@link BfeBuilderObject} instance describes the CLI arguments available
 * in the `argv` object of any command that uses {@link withGlobalBuilder} to
 * construct its `builder`.
 *
 * This object is manually synchronized with {@link GlobalCliArguments}, but the
 * keys may differ slightly (e.g. hyphens may be elided in favor of camelCase).
 *
 * When providing a custom {@link BfeBuilderObject} instance to
 * {@link withGlobalBuilder}, any key specified in that instance that is also a
 * key in this object (`globalCliArguments`) will have its value merged with the
 * value in this object _instead_ of fully overwriting it. This means you can
 * pass minimal configuration values for the keys that are also in
 * `globalCliArguments` and those values will be merged over the corresponding
 * default configuration value in `globalCliArguments`.
 *
 * @see {@link StandardCommonCliArguments}
 */
export const globalCliArguments = {
  targets: {
    alias: 'target',
    array: true,
    demandThisOption: true,
    choices: inputTargets,
    description: 'One or more APIs against which tasks are run',
    check: checkArrayNotEmpty('--targets'),
    coerce(targets: Arrayable<(typeof inputTargets)[number]>) {
      return Array.from(
        new Set(
          [targets].flat().flatMap((target) => {
            if (target === TargetProblem.All) {
              return actualTargetProblems;
            }

            if (target in targetYears) {
              return targetYears[target as keyof typeof targetYears];
            }

            if (target in targetDatabases) {
              return targetDatabases[target as keyof typeof targetDatabases];
            }

            return target;
          })
        )
      );
    }
  }
} satisfies BfeBuilderObject<Record<string, unknown>, GlobalExecutionContext>;

export const configureExecutionContext = async function (context) {
  const standardContextFactory = await makeStandardConfigureExecutionContext({
    rootGenericLogger,
    rootDebugLogger,
    withListr2Support: true
  });

  let startupError = undefined as undefined | Error;

  const [standardContext, [configPath, config]] = await Promise.all([
    standardContextFactory(context),
    getWellKnownConfigPath().then(async (path) => {
      try {
        return [path, JSON.parse(await readFile(path, 'utf8')) as JsonValue] as const;
      } catch (error) {
        startupError = new CliError(ErrorMessage.UnreadableConfigFile(path), {
          cause: error
        });
        return [path, {} as JsonValue] as const;
      }
    })
  ] as const);

  return {
    ...standardContext,
    startupError,
    getConfig
  };

  function getConfig(
    key: string,
    validator: LiteralUnion<Parameters<GlobalExecutionContext['getConfig']>[1], string>,
    fullKey: string = key,
    currentConfig: unknown = config
  ) {
    const [firstKey, ...remainingKeys] = key.split('.');
    const currentConfigWasAPlainObject = isPlainObject(currentConfig);

    currentConfig =
      firstKey && isPlainObject(currentConfig) && firstKey in currentConfig
        ? currentConfig[firstKey as keyof typeof currentConfig]
        : undefined;

    if (currentConfigWasAPlainObject && remainingKeys.length) {
      return getConfig(remainingKeys.join('.'), validator, fullKey, currentConfig);
    }

    if (typeof validator === 'function') {
      const isValid = validator(currentConfig);

      if (isValid !== true) {
        throw new CliError(
          ErrorMessage.InvalidConfigFile(
            fullKey,
            configPath,
            typeof isValid === 'string' ? isValid : undefined
          )
        );
      }
    } else {
      let errored = false;

      switch (validator) {
        case 'boolean': {
          if (typeof currentConfig !== 'boolean') {
            errored = true;
          }

          break;
        }

        case 'null': {
          if (currentConfig !== null) {
            errored = true;
          }

          break;
        }

        case 'number': {
          if (typeof currentConfig !== 'number') {
            errored = true;
          }

          break;
        }

        case 'string': {
          if (typeof currentConfig !== 'string') {
            errored = true;
          }

          break;
        }

        default: {
          throw new CliError(ErrorMessage.GuruMeditation());
          break;
        }
      }

      if (errored) {
        throw new CliError(
          ErrorMessage.InvalidConfigFile(
            fullKey,
            configPath,
            ErrorMessage.UnexpectedValue(
              `to be of type "${validator}"`,
              typeof currentConfig
            )
          )
        );
      }
    }

    return currentConfig;
  }
} as ConfigureExecutionContext<GlobalExecutionContext>;

export const configureErrorHandlingEpilogue =
  makeStandardConfigureErrorHandlingEpilogue() as ConfigureErrorHandlingEpilogue<GlobalExecutionContext>;

const isPlainObject = (o: unknown): o is object =>
  !!o && typeof o === 'object' && !Array.isArray(o);
