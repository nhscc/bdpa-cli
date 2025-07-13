import { LogTag } from '@-xun/cli/logging';

import { Task } from 'universe:constant.ts';
import { ErrorMessage } from 'universe:error.ts';
import { waitForListr2OutputReady } from 'universe:util.ts';

import type { GlobalExecutionContext } from 'universe:configure.ts';
import type { ActualTargetProblem } from 'universe:constant.ts';
import type { TaskRunnerContext } from 'universe:util.ts';

const fullPrettyName = 'ban hammer';
const taskType = Task.BanHammer;

export default async function task(
  taskName: string,
  target: ActualTargetProblem,
  getConfig: GlobalExecutionContext['getConfig'],
  { listrLog, listrTask, standardDebug: standardDebug_ }: TaskRunnerContext
) {
  listrTask.title = `Executing task "${fullPrettyName}"...`;

  const debug = standardDebug_.extend(taskType);
  const taskLog = listrLog.extend(taskName);

  const {
    willBeCalledEverySeconds,
    resolutionWindowSeconds,
    maxRequestsPerWindow,
    defaultBanTimeMinutes,
    recidivismPunishMultiplier
  } = getConfigFor(target);

  if (willBeCalledEverySeconds <= 0) {
    throw new Error(
      ErrorMessage.InvalidConfigFile(
        'willBeCalledEverySeconds',
        undefined,
        ErrorMessage.UnexpectedValue('greater than zero', willBeCalledEverySeconds)
      )
    );
  }

  if (resolutionWindowSeconds <= 0) {
    throw new Error(
      ErrorMessage.InvalidConfigFile(
        'resolutionWindowSeconds',
        undefined,
        ErrorMessage.UnexpectedValue('greater than zero', resolutionWindowSeconds)
      )
    );
  }

  if (maxRequestsPerWindow <= 0) {
    throw new Error(
      ErrorMessage.InvalidConfigFile(
        'maxRequestsPerWindow',
        undefined,
        ErrorMessage.UnexpectedValue('greater than zero', maxRequestsPerWindow)
      )
    );
  }

  if (defaultBanTimeMinutes <= 0) {
    throw new Error(
      ErrorMessage.InvalidConfigFile(
        'defaultBanTimeMinutes',
        undefined,
        ErrorMessage.UnexpectedValue('greater than zero', defaultBanTimeMinutes)
      )
    );
  }

  if (recidivismPunishMultiplier <= 0) {
    throw new Error(
      ErrorMessage.InvalidConfigFile(
        'recidivismPunishMultiplier',
        undefined,
        ErrorMessage.UnexpectedValue('greater than zero', recidivismPunishMultiplier)
      )
    );
  }

  // const calledEveryMs = oneSecondInMs * willBeCalledEverySeconds;
  // const defaultBanTimeMs = oneSecondInMs * 60 * defaultBanTimeMinutes;
  // const resolutionWindowMs = oneSecondInMs * resolutionWindowSeconds;
  // const db = await getDb({ name: 'heimdall' });

  // const pipeline = [
  //   {
  //     $limit: 1
  //   },
  //   {
  //     $project: { _id: 1 }
  //   },
  //   {
  //     $project: { _id: 0 }
  //   },
  //   {
  //     $lookup: {
  //       from: 'request-log',
  //       as: 'headerBased',
  //       pipeline: [
  //         {
  //           $match: {
  //             header: { $ne: null },
  //             origin: target,
  //             $expr: {
  //               $gte: [
  //                 '$createdAt',
  //                 { $subtract: [{ $toLong: '$$NOW' }, calledEveryMs] }
  //               ]
  //             }
  //           }
  //         },
  //         {
  //           $group: {
  //             _id: {
  //               header: '$header',
  //               interval: {
  //                 $subtract: ['$createdAt', { $mod: ['$createdAt', resolutionWindowMs] }]
  //               }
  //             },
  //             count: { $sum: 1 }
  //           }
  //         },
  //         {
  //           $match: {
  //             count: { $gt: maxRequestsPerWindow }
  //           }
  //         },
  //         {
  //           $project: {
  //             header: '$_id.header',
  //             until: { $add: [{ $toLong: '$$NOW' }, defaultBanTimeMs] }
  //           }
  //         },
  //         {
  //           $project: {
  //             _id: 0,
  //             count: 0
  //           }
  //         }
  //       ]
  //     }
  //   },
  //   {
  //     $lookup: {
  //       from: 'request-log',
  //       as: 'ipBased',
  //       pipeline: [
  //         {
  //           $match: {
  //             origin: target,
  //             $expr: {
  //               $gte: [
  //                 '$createdAt',
  //                 { $subtract: [{ $toLong: '$$NOW' }, calledEveryMs] }
  //               ]
  //             }
  //           }
  //         },
  //         {
  //           $group: {
  //             _id: {
  //               ip: '$ip',
  //               interval: {
  //                 $subtract: ['$createdAt', { $mod: ['$createdAt', resolutionWindowMs] }]
  //               }
  //             },
  //             count: { $sum: 1 }
  //           }
  //         },
  //         {
  //           $match: {
  //             count: { $gt: maxRequestsPerWindow }
  //           }
  //         },
  //         {
  //           $project: {
  //             ip: '$_id.ip',
  //             until: { $add: [{ $toLong: '$$NOW' }, defaultBanTimeMs] }
  //           }
  //         },
  //         {
  //           $project: {
  //             _id: 0,
  //             count: 0
  //           }
  //         }
  //       ]
  //     }
  //   },
  //   {
  //     $lookup: {
  //       from: 'limited-log',
  //       as: 'previous',
  //       pipeline: [
  //         {
  //           $match: {
  //             origin: target,
  //             $expr: {
  //               $gte: [
  //                 '$until',
  //                 {
  //                   $subtract: [
  //                     { $toLong: '$$NOW' },
  //                     defaultBanTimeMs * recidivismPunishMultiplier
  //                   ]
  //                 }
  //               ]
  //             }
  //           }
  //         },
  //         {
  //           $project: {
  //             _id: 0
  //           }
  //         }
  //       ]
  //     }
  //   },
  //   {
  //     $project: {
  //       union: { $concatArrays: ['$headerBased', '$ipBased', '$previous'] }
  //     }
  //   },
  //   {
  //     $unwind: {
  //       path: '$union'
  //     }
  //   },
  //   {
  //     $replaceRoot: {
  //       // eslint-disable-next-line unicorn/no-keyword-prefix
  //       newRoot: '$union'
  //     }
  //   },
  //   {
  //     $group: {
  //       _id: {
  //         ip: '$ip',
  //         header: '$header'
  //       },
  //       count: {
  //         $sum: 1
  //       },
  //       until: {
  //         $max: '$until'
  //       }
  //     }
  //   },
  //   {
  //     $set: {
  //       until: {
  //         $cond: {
  //           if: { $ne: ['$count', 1] },
  //           // eslint-disable-next-line unicorn/no-thenable
  //           then: {
  //             $max: [
  //               {
  //                 $add: [
  //                   { $toLong: '$$NOW' },
  //                   defaultBanTimeMs * recidivismPunishMultiplier
  //                 ]
  //               },
  //               '$until'
  //             ]
  //           },
  //           else: '$until'
  //         }
  //       },
  //       ip: '$_id.ip',
  //       header: '$_id.header',
  //       origin: target
  //     }
  //   },
  //   {
  //     $project: {
  //       count: 0,
  //       _id: 0
  //     }
  //   },
  //   {
  //     $out: 'limited-log'
  //   }
  // ];

  // debug('aggregation pipeline: %O', pipeline);

  // const cursor = db.collection('request-log').aggregate(pipeline);

  // await cursor.next();
  // await cursor.close();

  await waitForListr2OutputReady(debug);

  // TODO:
  taskLog([LogTag.IF_NOT_QUIETED], '(one-line after-action report goes here)');
  listrTask.title = `Finished "${fullPrettyName}"`;

  function getConfigFor(target: ActualTargetProblem) {
    const prefix = `${target}.supportedTasks.ban-hammer`;

    return {
      willBeCalledEverySeconds: getConfig<number>(
        `${prefix}.willBeCalledEverySeconds`,
        'number'
      ),
      resolutionWindowSeconds: getConfig<number>(
        `${prefix}.resolutionWindowSeconds`,
        'number'
      ),
      maxRequestsPerWindow: getConfig<number>(
        `${prefix}.maxRequestsPerWindow`,
        'number'
      ),
      defaultBanTimeMinutes: getConfig<number>(
        `${prefix}.defaultBanTimeMinutes`,
        'number'
      ),
      recidivismPunishMultiplier: getConfig<number>(
        `${prefix}.recidivismPunishMultiplier`,
        'number'
      )
    };
  }
}
