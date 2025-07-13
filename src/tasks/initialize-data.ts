import { Task } from 'universe:constant.ts';
import { skipListrTask, waitForListr2OutputReady } from 'universe:util.ts';

import type { GlobalExecutionContext } from 'universe:configure.ts';
import type { ActualTargetProblem } from 'universe:constant.ts';
import type { TaskRunnerContext } from 'universe:util.ts';

const fullPrettyName = 'initialize data';
const taskType = Task.InitializeData;

export default async function task(
  taskName: string,
  target: ActualTargetProblem,
  getConfig: GlobalExecutionContext['getConfig'],
  { listrLog, listrTask, standardDebug: standardDebug_ }: TaskRunnerContext
) {
  listrTask.title = `Executing task "${fullPrettyName}"...`;

  let isNoop = false;
  const taskLog = listrLog.extend(taskName);
  const debug = standardDebug_.extend(taskType);

  switch (target) {
    // case TargetProblem.Drive: {
    //   break;
    // }

    // case TargetProblem.Qoverflow: {
    //   break;
    // }

    default: {
      isNoop = true as boolean;
      debug('target-task combination is no-op');
      break;
    }
  }

  await waitForListr2OutputReady(debug);

  // TODO:
  //taskLog([LogTag.IF_NOT_QUIETED], '(one-line after-action report goes here)');
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  (void taskLog, getConfig);

  if (isNoop) {
    skipListrTask(fullPrettyName, debug, listrTask);
  } else {
    listrTask.title = `Finished "${fullPrettyName}"`;
  }
}
