import { access as existsAsync } from 'node:fs/promises';

import { checkArrayNotEmpty } from '@-xun/cli';
import { softAssert } from '@-xun/cli/error';
import { LogTag, standardSuccessMessage } from '@-xun/cli/logging';
import { scriptBasename } from '@-xun/cli/util';
import { SINGLE_SPACE } from 'rejoinder';

import { getWellKnownConfigPath } from 'universe:configure.ts';

import {
  actualTargetProblems,
  globalCliName,
  globalLoggerNamespace,
  targetDatabases,
  targetYears,
  Task,
  tasks
} from 'universe:constant.ts';

import { ErrorMessage } from 'universe:error.ts';
import runBackupData from 'universe:tasks/backup-data.ts';
import runBanHammer from 'universe:tasks/ban-hammer.ts';
import runInitializeData from 'universe:tasks/initialize-data.ts';
import runPruneData from 'universe:tasks/prune-data.ts';
import runSimulateActivity from 'universe:tasks/simulate-activity.ts';

import {
  withGlobalBuilder,
  withGlobalUsage,
  withStandardListrTaskConfigFactory
} from 'universe:util.ts';

import type { AsStrictExecutionContext, RootConfiguration } from '@-xun/cli';
import type { GlobalCliArguments, GlobalExecutionContext } from 'universe:configure.ts';
import type { ListrTaskLiteral } from 'universe:util.ts';

export type CustomCliArguments = GlobalCliArguments & {
  tasks: Task[];
};

export default async function command({
  standardDebug,
  standardLog,
  getConfig,
  taskManager
}: AsStrictExecutionContext<GlobalExecutionContext>): Promise<
  RootConfiguration<CustomCliArguments, GlobalExecutionContext>
> {
  const allActualTasks = tasks.filter((task) => task !== Task.All);
  const configPath = await getWellKnownConfigPath();
  const doesConfigExist = await existsAsync(configPath).then(
    () => true,
    () => false
  );

  const [builder, withGlobalHandler] = withGlobalBuilder<CustomCliArguments>(
    {
      tasks: {
        alias: 'task',
        array: true,
        demandThisOption: true,
        choices: tasks,
        description: 'One or more tasks to run against target APIs',
        check: checkArrayNotEmpty('--tasks'),
        coerce(tasks: Task | Task[]) {
          return Array.from(
            new Set(
              [tasks].flat().flatMap((task) => {
                switch (task) {
                  case Task.All: {
                    return allActualTasks;
                  }

                  default: {
                    return task;
                  }
                }
              })
            )
          );
        }
      }
    },
    { additionalCommonOptions: ['version'] }
  );

  return {
    name: globalCliName,
    builder,
    description: 'A CLI tool for managing NHSCC cloud resources',
    usage: withGlobalUsage(
      `$1.

📜 Configuration File
---------------------

Location: ${configPath} (readable: ${doesConfigExist ? 'yes' : 'no'})

This JSON file holds sensitive credentials and configuration options for tasks supported by each API. It should be created manually and secured with 0600 permissions.

Within the file is an object with top-level keys corresponding to the problem statements named in the "Problem Statements + Database Servers" section (e.g. "elections", "airports"), and corresponding object values containing the sub-keys described below. For example:

{
${SINGLE_SPACE} // ⬐ top-level key
${SINGLE_SPACE} "elections": {
${SINGLE_SPACE}   "mongodbUri": "...",    ⟵ corresponding object value (with sub-keys)
${SINGLE_SPACE}   "supportedTasks": {
${SINGLE_SPACE}     ...
${SINGLE_SPACE}   }
${SINGLE_SPACE} },
${SINGLE_SPACE} // ⬐ top-level key
${SINGLE_SPACE} "airports": {
${SINGLE_SPACE}   "mongodbUri": "...",    ⟵ corresponding object value (with sub-keys)
${SINGLE_SPACE}   "supportedTasks": {
${SINGLE_SPACE}     ...
${SINGLE_SPACE}   }
${SINGLE_SPACE} },
${SINGLE_SPACE} ...
}

The following sub-keys are supported:

🟢 "mongodbUri"      A string containing the complete mongodb connect string
🟢 "supportedTasks"  An object containing per-task configuration objects

The "supportedTasks" object allows any of the following keys:

🔵 "ban-hammer"

${SINGLE_SPACE}  Unleash the mighty hammer of justice upon the foes of fairness. Banned IPs will be unable to exchange messages with any system monitored by this tool.

${SINGLE_SPACE}  Example
${SINGLE_SPACE}  -------

${SINGLE_SPACE}  {
${SINGLE_SPACE}    "elections": {
${SINGLE_SPACE}      "mongodbUri": "...",
${SINGLE_SPACE}      "supportedTasks": {
${SINGLE_SPACE}        "ban-hammer": {
${SINGLE_SPACE}          "willBeCalledEverySeconds": 60,
${SINGLE_SPACE}          "resolutionWindowSeconds": 1,
${SINGLE_SPACE}          "maxRequestsPerWindow": 10,
${SINGLE_SPACE}          "defaultBanTimeMinutes": 2,
${SINGLE_SPACE}          "recidivismPunishMultiplier": 5
${SINGLE_SPACE}        }
${SINGLE_SPACE}      }
${SINGLE_SPACE}    }
${SINGLE_SPACE}  }

${SINGLE_SPACE}  Recognized Keys + Defaults
${SINGLE_SPACE}  --------------------------

${SINGLE_SPACE}  🟣 "willBeCalledEverySeconds"    (default: 60)

${SINGLE_SPACE}     How often this script is going to be invoked. This doesn't determine anything automatically on its own (you still need to setup a cron); this is useful to ensure the script works no matter how often you decide to call it.

${SINGLE_SPACE}  🟣 "resolutionWindowSeconds"     (default: 1)

${SINGLE_SPACE}     How far back into the past this script looks when checking a key or ip against "maxRequestsPerWindow". In other words: this describes the size of the resolution window.

${SINGLE_SPACE}  🟣 "maxRequestsPerWindow"        (default: 10)

${SINGLE_SPACE}     The maximum number of requests allowed by a single client per resolution window as determined by "resolutionWindowSeconds".

${SINGLE_SPACE}  🟣 "defaultBanTimeMinutes"       (default: 2)

${SINGLE_SPACE}     The initial amount of time an offender is banned.

${SINGLE_SPACE}  🟣 "recidivismPunishMultiplier"  (default: 4)

${SINGLE_SPACE}     When an offender is banned twice in the same "period," they're banned for BAN_HAMMER_DEFAULT_BAN_TIME_MINUTES * BAN_HAMMER_RECIDIVISM_PUNISH_MULTIPLIER minutes instead of the default. This is also the length of the "period".

🔵 "prune-data"

${SINGLE_SPACE}  Ensure the health, warmth, and longevity of free-tier cloud databases by ensuring they never hit their data storage limits. Each collection within a database can be limited by total size on disk, or total number of documents, but not both.

${SINGLE_SPACE}  Example
${SINGLE_SPACE}  -------

${SINGLE_SPACE}  {
${SINGLE_SPACE}    "elections": {
${SINGLE_SPACE}      "mongodbUri": "...",
${SINGLE_SPACE}      "supportedTasks": {
${SINGLE_SPACE}        "prune-data": {
${SINGLE_SPACE}          "maxBytes": {
${SINGLE_SPACE}            "root.request-log": "100mb",
${SINGLE_SPACE}            "root.limited-log": "10mb",
${SINGLE_SPACE}            "app.elections": "100mb",
${SINGLE_SPACE}            "app.ballots": "120mb"
${SINGLE_SPACE}          }
${SINGLE_SPACE}        }
${SINGLE_SPACE}      }
${SINGLE_SPACE}    }
${SINGLE_SPACE}  }

${SINGLE_SPACE}  Recognized Keys + Defaults
${SINGLE_SPACE}  --------------------------

${SINGLE_SPACE}  🟣 "maxBytes" (defaults: none)

${SINGLE_SPACE}     An object containing the maximum size IN BYTES (value) of each collection (sub-key of the form "<database>.<collection>"). Matching collections in the database will not be allowed to exceed this size on disk. Usually the oldest entries are deleted first, though some collections in some APIs use other criteria, e.g. least-recently-used. Each value should be a byte size string (ending in "b") like "1kb", "1mb", "500b".

🔵 "initialize-data"

${SINGLE_SPACE}  Not implemented in this version of ${globalCliName}.

${SINGLE_SPACE}  Recognized Keys + Defaults
${SINGLE_SPACE}  --------------------------

${SINGLE_SPACE}  None.

🔵 "backup-data"

${SINGLE_SPACE}  Not implemented in this version of ${globalCliName}.

${SINGLE_SPACE}  Recognized Keys + Defaults
${SINGLE_SPACE}  --------------------------

${SINGLE_SPACE}  None.

🔵 "simulate-activity"

${SINGLE_SPACE}  Not implemented in this version of ${globalCliName}.

${SINGLE_SPACE}  Recognized Keys + Defaults
${SINGLE_SPACE}  --------------------------

${SINGLE_SPACE}  None.

📚 Problem Statements + Database Servers
----------------------------------------

${actualTargetProblems
  .map((name) =>
    `
- [${Object.entries(targetYears)
      .filter(([, names]) => (names as readonly string[]).includes(name))
      .map(
        ([year, names]) =>
          `${year}${names.length < 2 || names[1] === name ? '-actual' : '-sample'}`
      )
      .join(', ')}] ${name} (server: ${Object.entries(targetDatabases)
      .filter(([, named]) => named === name)
      .map(([server]) => server)
      .join(', ')})
`.trim()
  )
  .join('\n')}

---
`,
      { includeSubCommand: true, appendPeriod: false }
    ),
    handler: withGlobalHandler(async function ({
      $0: scriptFullName,
      hush: isHushed,
      quiet: isQuieted,
      silent: isSilenced,
      targets,
      tasks: requestedApiTasks
    }) {
      const debug = standardDebug.extend(`handler-${scriptBasename(scriptFullName)}`);

      debug('entered handler');

      debug('requested API tasks: %O', requestedApiTasks);
      debug('targets: %O', targets);
      debug('isHushed: %O', isHushed);
      debug('isQuieted: %O', isQuieted);
      debug('isSilenced: %O', isSilenced);

      standardLog([LogTag.IF_NOT_SILENCED], 'API tasks: %O', requestedApiTasks);
      standardLog.newline([LogTag.IF_NOT_SILENCED]);

      const apiTaskRenderOptions = {
        outputBar: Infinity,
        persistentOutput: true
      } satisfies Parameters<
        typeof withStandardListrTaskConfigFactory
      >[0]['rendererOptions'];

      const reifiedApiTasks = targets.map((target) => {
        const withStandardListrTaskConfig = withStandardListrTaskConfigFactory({
          standardLog,
          standardDebug,
          loggerNamespace: target
        });

        return withStandardListrTaskConfig({
          initialTitle: `API: ${target}`,
          task({ listrTask: targetListrTask }) {
            const subTasks: ListrTaskLiteral[] = [];
            let queued = false;

            if (requestedApiTasks.includes(Task.BanHammer)) {
              queued = true;
              subTasks.push(
                withStandardListrTaskConfig({
                  initialTitle: 'Queueing new task...',
                  rendererOptions: apiTaskRenderOptions,
                  async task(taskRunnerContext) {
                    await runBanHammer(
                      Task.BanHammer,
                      target,
                      getConfig,
                      taskRunnerContext
                    );
                  }
                })
              );
            }

            if (requestedApiTasks.includes(Task.PruneData)) {
              queued = true;
              subTasks.push(
                withStandardListrTaskConfig({
                  initialTitle: 'Queueing new task...',
                  rendererOptions: apiTaskRenderOptions,
                  async task(taskRunnerContext) {
                    await runPruneData(
                      Task.PruneData,
                      target,
                      getConfig,
                      taskRunnerContext
                    );
                  }
                })
              );
            }

            if (requestedApiTasks.includes(Task.InitializeData)) {
              queued = true;
              subTasks.push(
                withStandardListrTaskConfig({
                  initialTitle: 'Queueing new task...',
                  rendererOptions: apiTaskRenderOptions,
                  async task(taskRunnerContext) {
                    await runInitializeData(
                      Task.InitializeData,
                      target,
                      getConfig,
                      taskRunnerContext
                    );
                  }
                })
              );
            }

            if (requestedApiTasks.includes(Task.BackupData)) {
              queued = true;
              subTasks.push(
                withStandardListrTaskConfig({
                  initialTitle: 'Queueing new task...',
                  rendererOptions: apiTaskRenderOptions,
                  async task(taskRunnerContext) {
                    await runBackupData(
                      Task.BackupData,
                      target,
                      getConfig,
                      taskRunnerContext
                    );
                  }
                })
              );
            }

            if (requestedApiTasks.includes(Task.SimulateActivity)) {
              queued = true;
              subTasks.push(
                withStandardListrTaskConfig({
                  initialTitle: 'Queueing new task...',
                  rendererOptions: apiTaskRenderOptions,
                  async task(taskRunnerContext) {
                    await runSimulateActivity(
                      Task.SimulateActivity,
                      target,
                      getConfig,
                      taskRunnerContext
                    );
                  }
                })
              );
            }

            softAssert(queued, ErrorMessage.UnimplementedTasks());
            return targetListrTask.newListr(subTasks, { concurrent: true });
          }
        });
      });

      taskManager.add([
        withStandardListrTaskConfigFactory({
          standardLog,
          standardDebug,
          loggerNamespace: globalLoggerNamespace
        })({
          initialTitle: `Running applicable tasks across ${targets.length} API${targets.length === 1 ? '' : 's'}...`,
          task: function ({ listrTask: rootListrTask }) {
            return rootListrTask.newListr(
              [
                {
                  task: function (_, thisTask) {
                    return thisTask.newListr(reifiedApiTasks, { concurrent: true });
                  }
                },
                {
                  task: function () {
                    rootListrTask.title = `Ran all applicable tasks across ${targets.length} API${targets.length === 1 ? '' : 's'}`;
                  }
                }
              ],
              { concurrent: false }
            );
          }
        })
      ]);

      try {
        await taskManager.runAll();
      } finally {
        standardLog.newline([LogTag.IF_NOT_SILENCED]);
      }

      standardLog([LogTag.IF_NOT_SILENCED], standardSuccessMessage);
    })
  };
}
