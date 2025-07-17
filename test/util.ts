/**
 ** This file exports test utilities specific to this project and beyond what is
 ** exported by @-xun/jest; these can be imported using the testversal aliases.
 */

import assert from 'node:assert';

import { getDb, setSchemaConfig } from '@-xun/mongo-schema';

import {
  runWithMongoSchemaMultitenancy,
  setupForcedMultitenancyOverride
} from '@-xun/mongo-schema/multitenant';

import { setDummyData } from '@-xun/mongo-test';
import { createDebugLogger, createGenericLogger } from 'rejoinder';

import { configureExecutionContext } from 'universe:configure.ts';
import { globalDebuggerNamespace } from 'universe:constant.ts';
import { ErrorMessage } from 'universe:error.ts';

import type { ExecutionContext } from '@-xun/cli';
import type { DbSchema } from '@-xun/mongo-schema';
import type { DummyData, setupMemoryServerOverride } from '@-xun/mongo-test';
import type { Functionable } from '@-xun/types';
import type { JsonPrimitive } from 'type-fest';
import type { TaskRunnerContext } from 'universe:util.ts';

// ? These will always come from @-xun/symbiote and @-xun/jest (transitively)
// {@symbiote/notInvalid
//   - @-xun/jest
//   - @-xun/test-mock-argv
//   - @-xun/test-mock-exit
//   - @-xun/test-mock-import
//   - @-xun/test-mock-env
//   - @-xun/test-mock-fixture
//   - @-xun/test-mock-output
// }

export * from '@-xun/jest';

/**
 * Accepts one or more database and collection names in the form
 * `database.collection` and returns the size of each collection in bytes.
 */
export async function getCollectionSize(collection: string): Promise<number>;
export async function getCollectionSize(
  collections: readonly string[]
): Promise<Record<string, number>>;
export async function getCollectionSize(
  collections: string | readonly string[]
): Promise<number | Record<string, number>> {
  const targetCollections = [collections].flat();
  const result = Object.fromEntries(
    await Promise.all(
      targetCollections.map(async (dbCollection) => {
        const [dbName, ...rawCollectionName] = dbCollection.split('.');

        assert(
          dbName && rawCollectionName.length === 1,
          ErrorMessage.InvalidCollectionSizeInput(dbCollection)
        );

        const colDb = (await getDb({ name: dbName })).collection(rawCollectionName[0]!);

        return colDb
          .aggregate<{ size: number }>([
            {
              $group: {
                _id: null,
                size: { $sum: { $bsonSize: '$$ROOT' } }
              }
            }
          ])
          .next()
          .then((r) => [dbCollection, r?.size ?? 0] as const);
      })
    )
  );

  const resultLength = Object.keys(result).length;
  assert(resultLength === targetCollections.length, ErrorMessage.GuruMeditation());

  return typeof collections === 'string' ? result[collections]! : result;
}

/**
 * Make and return a `getConfig` function.
 */
export async function makeGetConfig() {
  const { getConfig } = await configureExecutionContext({
    state: {}
  } as ExecutionContext);

  return getConfig;
}

/**
 * Make and return a fake `TaskRunnerContext` instance.
 */
export function makeTaskRunnerContext() {
  const mockedListrLog = createGenericLogger({ namespace: globalDebuggerNamespace });
  const mockedStandardLog = createGenericLogger({ namespace: globalDebuggerNamespace });
  const mockedStandardDebug = createDebugLogger({ namespace: globalDebuggerNamespace });

  mockedListrLog.enabled = true;
  mockedStandardLog.enabled = true;
  mockedStandardDebug.enabled = true;

  return {
    mockedListrLog,
    mockedStandardLog,
    mockedStandardDebug,
    taskRunnerContext: {
      listrContext: {},
      listrLog: mockedListrLog,
      listrTask: {},
      standardDebug: mockedStandardDebug,
      standardLog: mockedStandardLog
    } as TaskRunnerContext
  };
}

/**
 * This function takes several return values from `setupMemoryServerOverride({
 * defer: 'without-hooks' })`, a `supportedTask` sub-object configuration (e.g.
 * the object value of the `'ban-hammer'` or `'prune-data'` sub-keys), and a
 * target name (e.g. `'drive'` or `'qoverflow'`).
 *
 * This function calls `beforeEach` and `afterEach` and then returns a
 * `setupTest` function that, when invoked, returns useful primitives for
 * testing the target backend.
 *
 * `makeSetupTestFunction` is meant to be called within a Jest `describe` block
 * but outside of any `test`/`it` blocks. On the other hand, `setupTest` _is_
 * meant to be called within a `test`/`it` block.
 */
export function makeSetupTestFunction<
  const TaskConfig extends Record<string, JsonPrimitive>,
  const TaskConfigIsCollections extends boolean = true
>({
  target,
  taskType,
  initializeMemoryServerOverride,
  killMemoryServerOverride,
  reinitializeServerDatabases,
  resetSharedMemory,
  schema,
  data,
  taskConfig,
  taskConfigIsCollections = true as TaskConfigIsCollections
}: {
  target: string;
  taskType: string;
  schema: Functionable<DbSchema>;
  data: Functionable<DummyData>;
  taskConfig: TaskConfig;
  taskConfigIsCollections?: TaskConfigIsCollections;
} & Pick<
  ReturnType<typeof setupMemoryServerOverride>,
  | 'initializeMemoryServerOverride'
  | 'killMemoryServerOverride'
  | 'resetSharedMemory'
  | 'reinitializeServerDatabases'
>) {
  beforeEach(async () => {
    await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
      await initializeMemoryServerOverride();
    });
  });

  afterEach(async () => {
    await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
      resetSharedMemory();
      setupForcedMultitenancyOverride('multitenant');
      await killMemoryServerOverride();
    });
  });

  return { setupTest };

  async function setupTest() {
    let result = {} as {
      getConfig: Awaited<ReturnType<typeof makeGetConfig>>;
      taskConfig: TaskConfig;
    } & ReturnType<typeof makeTaskRunnerContext> &
      (TaskConfigIsCollections extends true
        ? {
            collectionsUnderTest: (keyof TaskConfig)[];
            initialSizes: Record<keyof TaskConfig, number>;
          }
        : { taskConfigKeys: (keyof TaskConfig)[] });

    await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
      setSchemaConfig(schema);
      setDummyData(data);

      await reinitializeServerDatabases();

      const getConfig = (() => taskConfig) as (typeof result)['getConfig'];
      const taskConfigKeys = Object.keys(taskConfig);
      const mockTaskRunnerContext = makeTaskRunnerContext();

      result = {
        getConfig,
        taskConfig,
        ...mockTaskRunnerContext,
        ...(taskConfigIsCollections
          ? {
              collectionsUnderTest: taskConfigKeys,
              initialSizes: (await getCollectionSize(taskConfigKeys)) as Record<
                keyof TaskConfig,
                number
              >
            }
          : { taskConfigKeys })
      } as unknown as typeof result;
    });

    return result;
  }
}
