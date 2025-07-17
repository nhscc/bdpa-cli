import { LogTag } from '@-xun/cli/logging';
import { getClient, getDb, setSchemaConfig } from '@-xun/mongo-schema';
import { runWithMongoSchemaMultitenancy } from '@-xun/mongo-schema/multitenant';

import {
  oneSecondInMs,
  TargetProblem,
  targetProblemBackends,
  Task
} from 'universe:constant.ts';

import { ErrorMessage } from 'universe:error.ts';
import { skipListrTask, waitForListr2OutputReady } from 'universe:util.ts';

import type { GlobalExecutionContext } from 'universe:configure.ts';
import type { ActualTargetProblem } from 'universe:constant.ts';
import type { TaskRunnerContext } from 'universe:util.ts';

export const fullPrettyName = 'ban hammer';
export const taskType = Task.BanHammer;

export default async function task(
  taskName: string,
  target: ActualTargetProblem,
  getConfig: GlobalExecutionContext['getConfig'],
  { listrLog, listrTask, standardDebug: standardDebug_ }: TaskRunnerContext
) {
  listrTask.title = `Executing task "${fullPrettyName}"...`;

  const debug = standardDebug_.extend(taskType);
  const taskLog = listrLog.extend(taskName);

  await waitForListr2OutputReady(debug);

  await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
    let backend;

    switch (target) {
      case TargetProblem.ElectionsCpl:
      case TargetProblem.ElectionsIrv:
      case TargetProblem.Elections:
      case TargetProblem.Airports:
      case TargetProblem.Barker:
      case TargetProblem.Ghostmeme:
      case TargetProblem.Blogpress:
      case TargetProblem.Inbdpa: {
        skipListrTask(fullPrettyName, debug, listrTask);
        // TODO: unskip this task when required @nhscc/backend-X package exists
        return;
      }

      case TargetProblem.Drive: {
        backend = await targetProblemBackends.drive;
        break;
      }

      case TargetProblem.Qoverflow: {
        backend = await targetProblemBackends.qoverflow;
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

    const [bannedCount, cursor] = await unleashBanHammer();

    await cursor.close();
    taskLog([LogTag.IF_NOT_QUIETED], '~%O clients are currently banned', bannedCount);
  });

  listrTask.title = `Finished "${fullPrettyName}"`;

  async function unleashBanHammer() {
    const config = getConfigFor(target);
    debug('active ban-hammer configuration: %O', config);

    const {
      willBeCalledEverySeconds,
      resolutionWindowSeconds,
      maxRequestsPerWindow,
      defaultBanTimeMinutes,
      recidivismPunishMultiplier
    } = config;

    const calledEveryMs = oneSecondInMs * willBeCalledEverySeconds;
    const defaultBanTimeMs = oneSecondInMs * 60 * defaultBanTimeMinutes;
    const resolutionWindowMs = oneSecondInMs * resolutionWindowSeconds;
    const db = await getDb({ name: 'root' });

    // ? Needed because tests can take a variable amount of time and using
    // ? "$$NOW" directly leads to flakiness when testing for outputs
    const isTesting = process.env.NODE_ENV === 'test';
    const NOW = isTesting ? Date.now() + 500 : { $toLong: '$$NOW' };

    const pipeline = [
      {
        $limit: 1
      },
      {
        $project: { _id: 1 }
      },
      {
        $project: { _id: 0 }
      },
      {
        $lookup: {
          from: 'request-log',
          as: 'headerBased',
          pipeline: [
            {
              $match: {
                header: { $ne: null },
                $expr: {
                  $gte: ['$createdAt', { $subtract: [NOW, calledEveryMs] }]
                }
              }
            },
            {
              $group: {
                _id: {
                  header: '$header',
                  interval: {
                    $subtract: [
                      '$createdAt',
                      { $mod: ['$createdAt', resolutionWindowMs] }
                    ]
                  }
                },
                count: { $sum: 1 }
              }
            },
            {
              $match: {
                count: { $gt: maxRequestsPerWindow }
              }
            },
            {
              $project: {
                header: '$_id.header',
                until: { $add: [NOW, defaultBanTimeMs] }
              }
            },
            {
              $project: {
                _id: 0,
                count: 0
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'request-log',
          as: 'ipBased',
          pipeline: [
            {
              $match: {
                $expr: {
                  $gte: ['$createdAt', { $subtract: [NOW, calledEveryMs] }]
                }
              }
            },
            {
              $group: {
                _id: {
                  ip: '$ip',
                  interval: {
                    $subtract: [
                      '$createdAt',
                      { $mod: ['$createdAt', resolutionWindowMs] }
                    ]
                  }
                },
                count: { $sum: 1 }
              }
            },
            {
              $match: {
                count: { $gt: maxRequestsPerWindow }
              }
            },
            {
              $project: {
                ip: '$_id.ip',
                until: { $add: [NOW, defaultBanTimeMs] }
              }
            },
            {
              $project: {
                _id: 0,
                count: 0
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'limited-log',
          as: 'previous',
          pipeline: [
            {
              $match: {
                $expr: {
                  $gte: [
                    '$until',
                    {
                      $subtract: [NOW, defaultBanTimeMs * recidivismPunishMultiplier]
                    }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 0
              }
            }
          ]
        }
      },
      {
        $project: {
          union: { $concatArrays: ['$headerBased', '$ipBased', '$previous'] }
        }
      },
      {
        $unwind: {
          path: '$union'
        }
      },
      {
        $replaceRoot: {
          // eslint-disable-next-line unicorn/no-keyword-prefix
          newRoot: '$union'
        }
      },
      {
        $group: {
          _id: {
            ip: '$ip',
            header: '$header'
          },
          count: {
            $sum: 1
          },
          until: {
            $max: '$until'
          }
        }
      },
      {
        $set: {
          until: {
            $cond: {
              if: { $ne: ['$count', 1] },
              // eslint-disable-next-line unicorn/no-thenable
              then: {
                $max: [
                  {
                    $add: [NOW, defaultBanTimeMs * recidivismPunishMultiplier]
                  },
                  '$until'
                ]
              },
              else: '$until'
            }
          },
          ip: '$_id.ip',
          header: '$_id.header'
        }
      },
      {
        $project: {
          count: 0,
          _id: 0
        }
      },
      {
        $out: 'limited-log'
      }
    ];

    debug('aggregation pipeline: %O', pipeline);

    const cursor = db.collection('request-log').aggregate(pipeline);
    await cursor.toArray();

    return [db.collection('limited-log').estimatedDocumentCount(), cursor] as const;
  }

  function getConfigFor(target: ActualTargetProblem) {
    const prefix = `${target}.supportedTasks.ban-hammer`;

    const configs = [
      [
        'willBeCalledEverySeconds',
        getConfig<number>(`${prefix}.willBeCalledEverySeconds`, 'number')
      ],
      [
        'resolutionWindowSeconds',
        getConfig<number>(`${prefix}.resolutionWindowSeconds`, 'number')
      ],
      [
        'maxRequestsPerWindow',
        getConfig<number>(`${prefix}.maxRequestsPerWindow`, 'number')
      ],
      [
        'defaultBanTimeMinutes',
        getConfig<number>(`${prefix}.defaultBanTimeMinutes`, 'number')
      ],
      [
        'recidivismPunishMultiplier',
        getConfig<number>(`${prefix}.recidivismPunishMultiplier`, 'number')
      ]
    ] as const;

    for (const [key, value] of configs) {
      if (value <= 0) {
        throw new Error(
          ErrorMessage.InvalidConfigFile(
            key,
            undefined,
            ErrorMessage.UnexpectedValue('greater than zero', value)
          )
        );
      }
    }

    return Object.fromEntries(configs) as Record<(typeof configs)[number][0], number>;
  }
}
