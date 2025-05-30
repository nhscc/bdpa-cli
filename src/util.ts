import { $executionContext } from '@-xun/cli';
import { withStandardBuilder, withStandardUsage } from '@-xun/cli/extensions';
import { LogTag } from '@-xun/cli/logging';
import { createListrTaskLogger } from 'rejoinder-listr2';

import { globalCliArguments } from 'universe:configure.ts';

import type { ExtendedDebugger, ExtendedLogger } from 'rejoinder';
import type { ListrManager } from 'rejoinder-listr2';
import type { GlobalCliArguments, GlobalExecutionContext } from 'universe:configure.ts';

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
> = Omit<TaskRunnerContext<ListrContext>, `listr${string}`>;

// TODO: taken from xunnctl; this needs to be added to @-xun/cli and replaced
// TODO: here and in xunnctl (THIS IS THE LATEST VERSION AS OF 6/2025)
export function withStandardListrTaskConfigFactory<
  ListrContext extends Record<string, unknown> = Record<string, unknown>
>(initialTaskRunnerContext: InitialTaskRunnerContext<ListrContext>) {
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

    return {
      rendererOptions: { outputBar: 3 },
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
          namespace: 'task',
          task: thisTask
        });

        return task({
          ...initialTaskRunnerContext,
          listrContext,
          listrTask: thisTask,
          listrLog: taskLog
        });
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

export { withStandardUsage as withGlobalUsage };
