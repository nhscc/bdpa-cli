import assert from 'node:assert';

import { LogTag } from '@-xun/cli/logging';
import { getClient, getDb, setSchemaConfig } from '@-xun/mongo-schema';
import { runWithMongoSchemaMultitenancy } from '@-xun/mongo-schema/multitenant';
import { format as stringifyBytes, parse as parseBytes } from 'bytes';

import { TargetProblem, targetProblemBackends, Task } from 'universe:constant.ts';
import { ErrorMessage } from 'universe:error.ts';
import { isRecord, skipListrTask, waitForListr2OutputReady } from 'universe:util.ts';

import type DriveDb from '@nhscc/backend-drive/db';
import type QoverflowDb from '@nhscc/backend-qoverflow/db';
import type { Document, ObjectId, WithId } from 'mongodb';
import type { Promisable } from 'type-fest';
import type { GlobalExecutionContext } from 'universe:configure.ts';
import type { ActualTargetProblem } from 'universe:constant.ts';
import type { TaskRunnerContext } from 'universe:util.ts';

export const fullPrettyName = 'prune data';
export const taskType = Task.PruneData;

const maxAllowedBytes = parseBytes('450mb')!;

/**
 * An object describing the maximum number of bytes a collection's documents may
 * occupy, along with strategies for deleting said documents when they grow too
 * numerous.
 */
export type CollectionDataLimit = {
  /**
   * Maximum number of bytes documents in this collection can use.
   */
  limit: { maxBytes: number };
  /**
   * When deleting documents that violate `limit`, oldest documents are deleted
   * first by default. `orderBy` is the name of the document property to sort by
   * before initiating deletion; documents are deleted starting from the first
   * document in the ordered result.
   *
   * @default "_id"
   */
  orderBy?: string;
  /**
   * By default, documents are unceremoniously deleted from the collection
   * without care for referential integrity. Use this function when deletions
   * are necessarily more involved, such as to invoke a `@nhscc/backend-X`
   * library function.
   */
  deleteFn?: (thresholdEntry: WithId<Document>) => Promisable<number>;
};

export default async function task(
  taskName: string,
  target: ActualTargetProblem,
  getConfig: GlobalExecutionContext['getConfig'],
  { listrLog, listrTask, standardDebug: standardDebug_ }: TaskRunnerContext
) {
  listrTask.title = `Executing task "${fullPrettyName}"...`;

  assert(
    maxAllowedBytes && maxAllowedBytes > 0,
    ErrorMessage.InvalidBytes(maxAllowedBytes)
  );

  const debug = standardDebug_.extend(taskType);
  const taskLog = listrLog.extend(taskName);

  await waitForListr2OutputReady(debug);

  await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
    switch (target) {
      case TargetProblem.ElectionsCpl:
      case TargetProblem.ElectionsIrv:
      case TargetProblem.Elections: {
        const config = getConfigFor(target, [
          'root.request-log',
          'root.limited-log',
          'app.elections',
          'app.ballots'
        ]);

        skipListrTask(fullPrettyName, debug, listrTask);
        // TODO: unskip this task when required @nhscc/backend-X package exists
        return;

        const backend =
          target === TargetProblem.ElectionsCpl
            ? targetProblemBackends['elections-cpl']
            : target === TargetProblem.ElectionsIrv
              ? targetProblemBackends['elections-irv']
              : targetProblemBackends.elections;

        // TODO: remove the next line
        // @ts-expect-error needs to be implemented
        setSchemaConfig(backend.db.getSchemaConfig());

        const limits: Record<keyof typeof config, CollectionDataLimit> = {
          'root.request-log': {
            limit: { maxBytes: config['root.request-log'] }
          },
          'root.limited-log': {
            limit: { maxBytes: config['root.limited-log'] }
          },
          'app.elections': {
            limit: { maxBytes: config['app.elections'] }
          },
          'app.ballots': {
            limit: { maxBytes: config['app.ballots'] }
          }
        };

        await prune(limits);
        break;
      }

      // * Pruning for this API's remaining collections is handled elsewhere,
      // * likely during activity simulation.
      case TargetProblem.Airports: {
        const config = getConfigFor(target, ['root.request-log', 'root.limited-log']);

        skipListrTask(fullPrettyName, debug, listrTask);
        // TODO: unskip this task when required @nhscc/backend-X package exists
        return;

        const limits: Record<keyof typeof config, CollectionDataLimit> = {
          'root.request-log': {
            limit: { maxBytes: config['root.request-log'] }
          },
          'root.limited-log': {
            limit: { maxBytes: config['root.limited-log'] }
          }
        };

        await prune(limits);
        break;
      }

      case TargetProblem.Barker: {
        const config = getConfigFor(target, [
          'root.request-log',
          'root.limited-log',
          'app.barks',
          'app.users'
        ]);

        skipListrTask(fullPrettyName, debug, listrTask);
        // TODO: unskip this task when required @nhscc/backend-X package exists
        return;

        const limits: Record<keyof typeof config, CollectionDataLimit> = {
          'root.request-log': {
            limit: { maxBytes: config['root.request-log'] }
          },
          'root.limited-log': {
            limit: { maxBytes: config['root.limited-log'] }
          },
          'app.barks': {
            limit: { maxBytes: config['app.barks'] }
          },
          'app.users': {
            limit: { maxBytes: config['app.users'] }
          }
        };

        await prune(limits);
        break;
      }

      case TargetProblem.Ghostmeme: {
        const config = getConfigFor(target, [
          'root.request-log',
          'root.limited-log',
          'app.users',
          'app.memes',
          'app.uploads'
        ]);

        skipListrTask(fullPrettyName, debug, listrTask);
        // TODO: unskip this task when required @nhscc/backend-X package exists
        return;

        const limits: Record<keyof typeof config, CollectionDataLimit> = {
          'root.request-log': {
            limit: { maxBytes: config['root.request-log'] }
          },
          'root.limited-log': {
            limit: { maxBytes: config['root.limited-log'] }
          },
          'app.users': {
            limit: { maxBytes: config['app.users'] }
          },
          'app.memes': {
            limit: { maxBytes: config['app.memes'] }
          },
          'app.uploads': {
            limit: { maxBytes: config['app.uploads'] }
          }
        };

        await prune(limits);
        break;
      }

      case TargetProblem.Drive: {
        const config = getConfigFor(target, [
          'root.request-log',
          'root.limited-log',
          'app.users',
          'app.file-nodes',
          'app.meta-nodes'
        ]);

        const backend = await targetProblemBackends.drive;

        // ? Prewarm shared memory
        await getClient({
          MONGODB_URI: getConfig(`${target}.mongodbUri`, 'string')
        });

        setSchemaConfig(backend.db.getSchemaConfig());

        const limits: Record<keyof typeof config, CollectionDataLimit> = {
          'root.request-log': {
            limit: { maxBytes: config['root.request-log'] }
          },
          'root.limited-log': {
            limit: { maxBytes: config['root.limited-log'] }
          },
          'app.users': {
            limit: { maxBytes: config['app.users'] },
            async deleteFn(thresholdEntry) {
              const users = (
                await getDb({ name: 'app' })
              ).collection<QoverflowDb.InternalUser>('users');

              const usernames = (
                await users.find({ _id: { $lte: thresholdEntry._id } }).toArray()
              ).map((user) => user.username);

              await Promise.all(
                usernames.map((username) => backend.deleteUser({ username }))
              );

              return usernames.length;
            }
          },
          'app.file-nodes': {
            limit: { maxBytes: config['app.file-nodes'] },
            async deleteFn(thresholdEntry) {
              const db = await getDb({ name: 'app' });

              const fileNodes = db.collection<DriveDb.InternalNode>('file-nodes');
              const metaNodes = db.collection<DriveDb.InternalNode>('meta-nodes');

              const ids = (
                await fileNodes.find({ _id: { $lte: thresholdEntry._id } }).toArray()
              ).map((node) => node._id);

              await Promise.all([
                fileNodes.deleteMany({ _id: { $in: ids } }),
                metaNodes.updateMany(
                  // * Is this more optimal than a full scan?
                  { contents: { $in: ids } },
                  { $pull: { contents: { $in: ids } } }
                )
              ]);

              return ids.length;
            }
          },
          'app.meta-nodes': {
            limit: { maxBytes: config['app.meta-nodes'] },
            async deleteFn(thresholdEntry) {
              const db = await getDb({ name: 'app' });
              const metaNodes = db.collection<DriveDb.InternalNode>('meta-nodes');
              const ids = (
                await metaNodes.find({ _id: { $lte: thresholdEntry._id } }).toArray()
              ).map((node) => node._id);

              await metaNodes.deleteMany({ _id: { $in: ids } });
              await metaNodes.updateMany(
                // * Is this more optimal than a full scan?
                { contents: { $in: ids } },
                { $pull: { contents: { $in: ids } } }
              );

              return ids.length;
            }
          }
        };

        await prune(limits);
        break;
      }

      case TargetProblem.Qoverflow: {
        const config = getConfigFor(target, [
          'root.request-log',
          'root.limited-log',
          'app.mail',
          'app.questions',
          'app.users'
        ]);

        const backend = await targetProblemBackends.qoverflow;

        // ? Prewarm shared memory
        await getClient({
          MONGODB_URI: getConfig(`${target}.mongodbUri`, 'string')
        });

        setSchemaConfig(backend.db.getSchemaConfig());

        const limits: Record<keyof typeof config, CollectionDataLimit> = {
          'root.request-log': {
            limit: { maxBytes: config['root.request-log'] }
          },
          'root.limited-log': {
            limit: { maxBytes: config['root.limited-log'] }
          },
          'app.mail': {
            limit: { maxBytes: config['app.mail'] }
          },
          'app.questions': {
            limit: { maxBytes: config['app.questions'] }
          },
          'app.users': {
            limit: { maxBytes: config['app.users'] },
            async deleteFn(thresholdEntry) {
              const users = (
                await getDb({ name: 'app' })
              ).collection<QoverflowDb.InternalUser>('users');

              const usernames = (
                await users.find({ _id: { $lte: thresholdEntry._id } }).toArray()
              ).map((user) => user.username);

              await Promise.all(
                usernames.map((username) => backend.deleteUser({ username }))
              );
              return usernames.length;
            }
          }
        };

        await prune(limits);
        break;
      }

      case TargetProblem.Blogpress: {
        const config = getConfigFor(target, [
          'root.request-log',
          'root.limited-log',
          'app.users',
          'app.sessions',
          'app.pages'
        ]);

        skipListrTask(fullPrettyName, debug, listrTask);
        // TODO: unskip this task when required @nhscc/backend-X package exists
        return;

        const limits: Record<keyof typeof config, CollectionDataLimit> = {
          'root.request-log': {
            limit: { maxBytes: config['root.request-log'] }
          },
          'root.limited-log': {
            limit: { maxBytes: config['root.limited-log'] }
          },
          'app.users': {
            limit: { maxBytes: config['app.users'] }
          },
          'app.sessions': {
            limit: { maxBytes: config['app.sessions'] }
          },
          'app.pages': {
            limit: { maxBytes: config['app.pages'] }
          }
        };

        await prune(limits);
        break;
      }

      case TargetProblem.Inbdpa: {
        const config = getConfigFor(target, [
          'root.request-log',
          'root.limited-log',
          'app.articles',
          'app.opportunities',
          'app.sessions',
          'app.users'
        ]);

        skipListrTask(fullPrettyName, debug, listrTask);
        // TODO: unskip this task when required @nhscc/backend-X package exists
        return;

        const limits: Record<keyof typeof config, CollectionDataLimit> = {
          'root.request-log': {
            limit: { maxBytes: config['root.request-log'] }
          },
          'root.limited-log': {
            limit: { maxBytes: config['root.limited-log'] }
          },
          'app.articles': {
            limit: { maxBytes: config['app.articles'] }
          },
          'app.opportunities': {
            limit: { maxBytes: config['app.opportunities'] }
          },
          'app.sessions': {
            limit: { maxBytes: config['app.sessions'] }
          },
          'app.users': {
            limit: { maxBytes: config['app.users'] }
          }
        };

        await prune(limits);
        break;
      }

      default: {
        throw new Error(ErrorMessage.GuruMeditation());
      }
    }
  });

  listrTask.title = `Finished "${fullPrettyName}"`;

  async function prune(limitsConfig: Record<string, CollectionDataLimit>) {
    debug('active pruner configuration: %O', limitsConfig);

    await Promise.all(
      Object.entries(limitsConfig).map(async ([targetPath, colLimitsObj]) => {
        const [dbName, collectionName] = targetPath.split('.');

        assert(dbName && collectionName);

        const db = await getDb({ name: dbName });
        const name = `${dbName}.${collectionName}`;

        debug('collection %O is a target for pruning', name);

        const subLog = taskLog.extend(name);
        const collection = db.collection(collectionName);
        const totalCount = await collection.countDocuments();

        const { limit: limitSpec, orderBy = '_id', deleteFn = undefined } = colLimitsObj;

        debug('limiting metric: document size');

        const { maxBytes } = limitSpec;

        debug('sorting %O by %O', name, orderBy);
        debug(
          `iteratively summing document size until limit (%O bytes) is reached`,
          maxBytes
        );

        // ? Use $bsonSize operator to sort by most recent first, then sum
        // ? them until either documents are exhausted or total size >
        // ? limit, then delete the (old) documents that exist beyond the
        // ? limit.
        const cursor = collection.aggregate<WithId<{ size: number }>>([
          { $sort: { [orderBy]: -1 } },
          { $project: { _id: true, size: { $bsonSize: '$$ROOT' } } }
        ]);

        let totalSizeBytes = 0;
        let thresholdId = null as ObjectId | null;
        let foundThresholdId = false as boolean;

        for await (const { _id, size } of cursor) {
          totalSizeBytes += size;

          if (!foundThresholdId) {
            thresholdId = _id;

            if (totalSizeBytes > maxBytes) {
              foundThresholdId = true;
              break;
            }
          }
        }

        const totalSizeBytesString = stringifyBytes(totalSizeBytes, {
          decimalPlaces: 1,
          unit: 'mb'
        });

        const maxBytesString = stringifyBytes(maxBytes, {
          decimalPlaces: 1,
          unit: 'mb'
        });

        assert(totalSizeBytesString !== null && maxBytesString !== null);

        await pruneCollectionAtThreshold(
          foundThresholdId && thresholdId ? { _id: thresholdId } : null,
          deleteFn,
          `${totalCount} pruned (${totalSizeBytesString} >= ${maxBytesString})`,
          `${totalCount} pruned (${totalSizeBytesString} <= ${maxBytesString})`
        ).then(() => cursor.close());

        async function pruneCollectionAtThreshold(
          thresholdEntry: WithId<Document> | null,
          deleteFn: CollectionDataLimit['deleteFn'],
          pruneMessage: string,
          noPruneMessage: string
        ) {
          if (thresholdEntry) {
            debug('determined threshold entry: %O', thresholdEntry._id);
            let deletedCount: number;

            if (deleteFn) {
              debug('using custom pruning strategy');
              deletedCount = await deleteFn(thresholdEntry);
            } else {
              debug('using default pruning strategy');
              assert(thresholdEntry[orderBy] !== undefined);

              deletedCount = (
                await collection.deleteMany({
                  [orderBy]: { $lte: thresholdEntry[orderBy] }
                })
              ).deletedCount;
            }

            subLog([LogTag.IF_NOT_QUIETED], `${deletedCount}/${pruneMessage}`);
          } else {
            subLog([LogTag.IF_NOT_QUIETED], `0/${noPruneMessage}`);
          }
        }
      })
    );
  }

  function getConfigFor<const ExpectedKeys extends string[]>(
    target: ActualTargetProblem,
    expectedKeys: ExpectedKeys
  ): Record<ExpectedKeys[number], number> {
    const configFullKey = `${target}.supportedTasks.prune-data.maxBytes`;

    const incomingConfig = getConfig<
      Record<ExpectedKeys[number], `${number}${string}b`>
    >(configFullKey, (maxBytes) => {
      // * If validation becomes any more complicated than what it is now, just
      // * use ArkType instead.

      const expectedKeysSet = new Set(expectedKeys);

      const hasValidValues =
        isRecord(maxBytes) &&
        Object.entries(maxBytes).every(
          ([_, v]) => typeof v === 'string' && v.endsWith('b')
        );

      if (!hasValidValues) {
        return ErrorMessage.InvalidConfigFile(
          configFullKey,
          undefined,
          'improperly structured (one or more invalid or non-byte string values)'
        );
      }

      const currentKeys = new Set(Object.keys(maxBytes));
      const missingKeys = expectedKeysSet.difference(currentKeys);
      const extraKeys = currentKeys.difference(expectedKeysSet);

      if (missingKeys.size) {
        return ErrorMessage.InvalidConfigFile(
          configFullKey,
          undefined,
          `missing the following keys: ${Array.from(missingKeys).join(',')}`
        );
      }

      if (extraKeys.size) {
        return ErrorMessage.InvalidConfigFile(
          configFullKey,
          undefined,
          `containing the following extraneous keys: ${Array.from(extraKeys).join(',')}`
        );
      }

      return true;
    });

    let bytesCount = 0;
    const finalConfig = Object.fromEntries(
      Object.entries(incomingConfig).map(([k, v]) => {
        const bytes = parseBytes(String(v));
        assert(bytes !== null && bytes >= 0, ErrorMessage.InvalidBytes(maxAllowedBytes));

        bytesCount += bytes;
        return [k, bytes] as const;
      })
    ) as ReturnType<typeof getConfigFor<ExpectedKeys>>;

    assert(bytesCount > 0, ErrorMessage.TooManyBytes(bytesCount, maxAllowedBytes));
    return finalConfig;
  }
}
