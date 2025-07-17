import { isNativeError } from 'node:util/types';

import { $executionContext } from '@-xun/cli';
import { withStandardBuilder, withStandardUsage } from '@-xun/cli/extensions';
import { LogTag } from '@-xun/cli/logging';
import { toSentenceCase } from '@-xun/cli/util';
import { createListrTaskLogger } from 'rejoinder-listr2';

import { globalCliArguments } from 'universe:configure.ts';

import type { ExtendedDebugger, ExtendedLogger } from 'rejoinder';
import type { ListrManager } from 'rejoinder-listr2';
import type { GlobalCliArguments, GlobalExecutionContext } from 'universe:configure.ts';

export { withStandardUsage as withGlobalUsage };

export type ListrTaskLiteral = Exclude<
  Parameters<ListrManager['add']>[0],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  Function
>[number];

export type TaskRunnerContext<
  ListrContext extends Record<string, unknown> = Record<string, unknown>
> = {
  standardLog: ExtendedLogger;
  standardDebug: ExtendedDebugger;
  listrContext: ListrContext;
  listrTask: Parameters<ListrTaskLiteral['task']>[1];
  listrLog: ExtendedLogger;
};

export type InitialTaskRunnerContext<
  ListrContext extends Record<string, unknown> = Record<string, unknown>
> = Omit<TaskRunnerContext<ListrContext>, `listr${string}`> & {
  loggerNamespace: string;
};

/**
 * Skip a listr2 task.
 */
export function skipListrTask(
  fullPrettyName: string,
  debugLog: ExtendedLogger,
  listrTask: TaskRunnerContext['listrTask']
) {
  debugLog(
    [LogTag.IF_NOT_QUIETED],
    '%O target-task combination is no-op',
    fullPrettyName
  );
  listrTask.title = `Skipped task "${fullPrettyName}"`;
  listrTask.skip(`Task not supported by target`);
}

/**
 * Call this hack once before attempting to output using rejoinder within listr2
 * in the specific circumstance that (1) you're using the `permanent` render
 * option to keep the output text around and (2) it is not impossible that
 * <100ms will pass before the first attempted output and (3) it is extremely
 * important that the user sees every single line of this output text.
 *
 * Otherwise, stay away from this function. This issue needs further
 * investigation!
 */
export async function waitForListr2OutputReady(standardDebug: ExtendedDebugger) {
  // TODO: investigate this
  // ? A bug in either rejoinder or listr2 makes stdout not work for some
  // ? small amount of time, meaning messages output to stdout via
  // ? rejoinder will disappear for a short while. This "fixes" that:

  standardDebug.warn('waiting 100ms due to bug workaround (fixme)...');
  await new Promise((r) => setTimeout(r, 100));
}

// TODO: taken from xunnctl; this needs to be added to @-xun/cli and replaced
// TODO: here and in xunnctl (THIS IS THE LATEST VERSION AS OF 6/2025)
export function withStandardListrTaskConfigFactory<
  ListrContext extends Record<string, unknown> = Record<string, unknown>
>(
  initialTaskRunnerContext: InitialTaskRunnerContext<ListrContext> &
    Partial<Omit<ListrTaskLiteral, 'title' | 'task' | 'retry'>>
) {
  return function withStandardListrTaskConfig(
    config: {
      initialTitle: string;
      shouldRetry?: number | boolean;
      task: (context: TaskRunnerContext) => ReturnType<ListrTaskLiteral['task']>;
    } & Omit<ListrTaskLiteral, 'title' | 'task' | 'retry'>
  ) {
    const {
      initialTitle,
      shouldRetry = false,
      task,
      ...listrTaskLiteralConfig
    } = config;

    const {
      loggerNamespace,
      standardLog: standardLog_,
      standardDebug: standardDebug_
    } = initialTaskRunnerContext;

    if (
      !standardLog_.namespace.includes(`${loggerNamespace}:`) &&
      !standardLog_.namespace.includes(`:${loggerNamespace}`)
    ) {
      initialTaskRunnerContext.standardLog = standardLog_.extend(loggerNamespace);
    }

    if (
      !standardDebug_.namespace.includes(`${loggerNamespace}:`) &&
      !standardDebug_.namespace.includes(`:${loggerNamespace}`)
    ) {
      initialTaskRunnerContext.standardDebug = standardDebug_.extend(loggerNamespace);
    }

    return {
      rendererOptions: { outputBar: 3 },
      ...initialTaskRunnerContext,
      ...listrTaskLiteralConfig,
      title: initialTitle,
      ...(shouldRetry
        ? {
            retry: {
              tries: typeof shouldRetry === 'number' ? shouldRetry : 3,
              delay: 5000
            }
          }
        : {}),
      task: async function (listrContext: { initialTitle?: string }, thisTask) {
        // TODO: does listr2 handle retry logic by itself properly yet?
        if (shouldRetry) {
          const retryData = thisTask.isRetrying();
          const retryCount = Number(retryData?.count || 0);
          initialTaskRunnerContext.standardDebug('retryData: %O', retryData);

          if (retryCount !== 3) {
            listrContext.initialTitle ||= thisTask.task.initialTitle;

            if (listrContext.initialTitle) {
              // @ts-expect-error: yeah, we're being bad here
              thisTask.task.initialTitle = `[RETRY ${retryCount + 1}/3] ${listrContext.initialTitle}`;
            }
          }
        }

        const taskLog = createListrTaskLogger({
          namespace: loggerNamespace,
          task: thisTask
        });

        try {
          return await task({
            ...initialTaskRunnerContext,
            listrContext,
            listrTask: thisTask,
            listrLog: taskLog
          });
        } catch (error) {
          throw new Error(
            toSentenceCase(isNativeError(error) ? error.message : String(error)),
            isNativeError(error) && error.cause ? { cause: error.cause } : {}
          );
        }
      }
    } as ListrTaskLiteral;
  };
}

/**
 * A version of {@link withStandardBuilder} that expects `CustomCliArguments` to
 * extend {@link GlobalCliArguments} and implements any related global handler
 * functionality.
 *
 * {@link globalCliArguments} is included in `additionalCommonOptions`
 * automatically. See {@link withStandardBuilder} for more details on how this
 * function semi-deep merges various common option configurations.
 */
export function withGlobalBuilder<CustomCliArguments extends GlobalCliArguments>(
  ...[customBuilder, settings]: Parameters<
    typeof withStandardBuilder<CustomCliArguments, GlobalExecutionContext>
  >
): ReturnType<typeof withStandardBuilder<CustomCliArguments, GlobalExecutionContext>> {
  const { targets, ...optionalGlobalCliArguments } = globalCliArguments;

  const [globalBuilder, withStandardHandlerExtensions] = withStandardBuilder<
    CustomCliArguments,
    GlobalExecutionContext
  >(
    function builder(blackFlag, helpOrVersionSet, argv) {
      const customCliArguments =
        (typeof customBuilder === 'function'
          ? customBuilder(blackFlag, helpOrVersionSet, argv)
          : customBuilder) || {};

      // ? Do not duplicate required options across groupings
      return { targets, ...customCliArguments };
    },
    {
      ...settings,
      // ...
      additionalCommonOptions: [
        optionalGlobalCliArguments,
        ...(settings?.additionalCommonOptions || [])
      ]
    }
  );

  return [
    globalBuilder,
    function withGlobalHandler(customHandler) {
      return withStandardHandlerExtensions(async function customGlobalHandler(argv) {
        const {
          targets,
          [$executionContext]: { standardLog, standardDebug, startupError }
        } = argv;

        const debug = standardDebug.extend('handler-wrapper');

        debug('entered customHandler wrapper function');

        if (startupError) {
          debug.error('encountered startup error: %O', startupError);
          throw startupError;
        }

        standardLog([LogTag.IF_NOT_SILENCED], 'API targets: %O', targets);

        debug(
          'exiting customHandler wrapper function (triggering actual customHandler)'
        );

        return customHandler?.(argv);
      });
    }
  ];
}

// ? Duplicated on purpose
export function isRecord(o: unknown): o is Record<string, unknown> {
  return !!o && typeof o === 'object' && !Array.isArray(o);
}
