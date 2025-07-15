// * These tests ensure the exported interfaces under test function as expected.

import { runWithMongoSchemaMultitenancy } from '@-xun/mongo-schema/multitenant';
import { setupMemoryServerOverride } from '@-xun/mongo-test';
import { getSchemaConfig } from '@nhscc/backend-drive/db';
import { getDummyData } from '@nhscc/backend-drive/dummy';

import pruneData from 'universe:tasks/prune-data.ts';

import {
  getCollectionSize,
  makeSetupTestFunction,
  useMockDateNow,
  withMockedOutput
} from 'testverse:util.ts';

useMockDateNow();

const {
  initializeMemoryServerOverride,
  killMemoryServerOverride,
  resetSharedMemory,
  reinitializeServerDatabases
} = setupMemoryServerOverride({ defer: 'without-hooks' });

describe('target: drive', () => {
  const target = 'drive';

  const { setupTest } = makeSetupTestFunction({
    target,
    initializeMemoryServerOverride,
    killMemoryServerOverride,
    reinitializeServerDatabases,
    resetSharedMemory,
    schema: getSchemaConfig(),
    data: getDummyData(),
    taskConfig: {
      'root.request-log': '100mb',
      'root.limited-log': '10mb',
      'app.users': '100mb',
      'app.file-nodes': '200mb',
      'app.meta-nodes': '40mb'
    }
  });

  it('prunes documents from target collections with respect to secrets.json', async () => {
    expect.hasAssertions();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { getConfig, collectionsUnderTest, initialSizes, taskRunnerContext } =
      await setupTest();

    // ? Expect the pruning algorithm to shrink the database by ~1/2 documents
    await withMockedOutput(async ({ nodeLogSpy }) => {
      const expectedSizes = Object.fromEntries(
        Object.entries(initialSizes).map(([k, v]) => [k, Math.round(v / 2)] as const)
      );

      const fakeGetConfig = (() => {
        return Object.fromEntries(
          Object.entries(expectedSizes).map(([k, v]) => [k, v.toString() + 'b'] as const)
        );
      }) as typeof getConfig;

      await pruneData('test', target, fakeGetConfig, taskRunnerContext);

      await runWithMongoSchemaMultitenancy(target, async () => {
        const actualSizesEntries = Object.entries(
          await getCollectionSize(collectionsUnderTest)
        );

        for (const [index, [dbCollection, size]] of actualSizesEntries.entries()) {
          const collectionNameUnderTest = collectionsUnderTest[index]!;

          expect({ dbCollection, size }).toStrictEqual({
            dbCollection,
            size: expect.toBeWithin(0, expectedSizes[collectionNameUnderTest]!)
          });
        }
      });

      expect(nodeLogSpy).toHaveBeenCalledTimes(collectionsUnderTest.length);
    });

    // ? Expect the pruning algorithm to shrink the database to 0 documents
    await withMockedOutput(async ({ nodeLogSpy }) => {
      const fakeGetConfig = (() => {
        return Object.fromEntries(
          Object.entries(initialSizes).map(([k, _v]) => [k, '1b'] as const)
        );
      }) as typeof getConfig;

      await pruneData('test', target, fakeGetConfig, taskRunnerContext);

      await runWithMongoSchemaMultitenancy(target, async () => {
        const actualSizesEntries = Object.entries(
          await getCollectionSize(collectionsUnderTest)
        );

        for (const [dbCollection, size] of actualSizesEntries) {
          expect({ dbCollection, size }).toStrictEqual({ dbCollection, size: 0 });
        }
      });

      expect(nodeLogSpy).toHaveBeenCalledTimes(collectionsUnderTest.length);
    });
  });

  it('only deletes entries if necessary', async () => {
    expect.hasAssertions();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { getConfig, collectionsUnderTest, initialSizes, taskRunnerContext } =
      await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      const fakeGetConfig = (() => {
        return Object.fromEntries(
          Object.entries(initialSizes).map(([k, _v]) => [k, '100gb'] as const)
        );
      }) as typeof getConfig;

      await pruneData('test', target, fakeGetConfig, taskRunnerContext);

      await runWithMongoSchemaMultitenancy(target, async () => {
        const actualSizesEntries = Object.entries(
          await getCollectionSize(collectionsUnderTest)
        );

        for (const [index, [dbCollection, size]] of actualSizesEntries.entries()) {
          const collectionNameUnderTest = collectionsUnderTest[index]!;

          expect({ dbCollection, size }).toStrictEqual({
            dbCollection,
            size: initialSizes[collectionNameUnderTest]
          });
        }
      });

      expect(nodeLogSpy).toHaveBeenCalledTimes(collectionsUnderTest.length);
    });
  });
});

describe('target: qoverflow', () => {
  const target = 'qoverflow';

  const { setupTest } = makeSetupTestFunction({
    target,
    initializeMemoryServerOverride,
    killMemoryServerOverride,
    reinitializeServerDatabases,
    resetSharedMemory,
    schema: getSchemaConfig(),
    data: getDummyData(),
    taskConfig: {
      'root.request-log': '50mb',
      'root.limited-log': '10mb',
      'app.mail': '10mb',
      'app.questions': '350mb',
      'app.users': '30mb'
    }
  });

  it('prunes documents from target collections with respect to secrets.json', async () => {
    expect.hasAssertions();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { getConfig, collectionsUnderTest, initialSizes, taskRunnerContext } =
      await setupTest();

    // ? Expect the pruning algorithm to shrink the database by ~1/2 documents
    await withMockedOutput(async ({ nodeLogSpy }) => {
      const expectedSizes = Object.fromEntries(
        Object.entries(initialSizes).map(([k, v]) => [k, Math.round(v / 2)] as const)
      );

      const fakeGetConfig = (() => {
        return Object.fromEntries(
          Object.entries(expectedSizes).map(([k, v]) => [k, v.toString() + 'b'] as const)
        );
      }) as typeof getConfig;

      await pruneData('test', target, fakeGetConfig, taskRunnerContext);

      await runWithMongoSchemaMultitenancy(target, async () => {
        const actualSizesEntries = Object.entries(
          await getCollectionSize(collectionsUnderTest)
        );

        for (const [index, [dbCollection, size]] of actualSizesEntries.entries()) {
          const collectionNameUnderTest = collectionsUnderTest[index]!;
          const expectedSize = expectedSizes[collectionNameUnderTest]!;

          expect({ dbCollection, size }).toStrictEqual({
            dbCollection,
            size: expectedSize === 0 ? 0 : expect.toBeWithin(0, expectedSize)
          });
        }
      });

      expect(nodeLogSpy).toHaveBeenCalledTimes(collectionsUnderTest.length);
    });

    // ? Expect the pruning algorithm to shrink the database to 0 documents
    await withMockedOutput(async ({ nodeLogSpy }) => {
      const fakeGetConfig = (() => {
        return Object.fromEntries(
          Object.entries(initialSizes).map(([k, _v]) => [k, '1b'] as const)
        );
      }) as typeof getConfig;

      await pruneData('test', target, fakeGetConfig, taskRunnerContext);

      await runWithMongoSchemaMultitenancy(target, async () => {
        const actualSizesEntries = Object.entries(
          await getCollectionSize(collectionsUnderTest)
        );

        for (const [dbCollection, size] of actualSizesEntries) {
          expect({ dbCollection, size }).toStrictEqual({ dbCollection, size: 0 });
        }
      });

      expect(nodeLogSpy).toHaveBeenCalledTimes(collectionsUnderTest.length);
    });
  });

  it('only deletes entries if necessary', async () => {
    expect.hasAssertions();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { getConfig, collectionsUnderTest, initialSizes, taskRunnerContext } =
      await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      const fakeGetConfig = (() => {
        return Object.fromEntries(
          Object.entries(initialSizes).map(([k, _v]) => [k, '100gb'] as const)
        );
      }) as typeof getConfig;

      await pruneData('test', target, fakeGetConfig, taskRunnerContext);

      await runWithMongoSchemaMultitenancy(target, async () => {
        const actualSizesEntries = Object.entries(
          await getCollectionSize(collectionsUnderTest)
        );

        for (const [index, [dbCollection, size]] of actualSizesEntries.entries()) {
          const collectionNameUnderTest = collectionsUnderTest[index]!;

          expect({ dbCollection, size }).toStrictEqual({
            dbCollection,
            size: initialSizes[collectionNameUnderTest]
          });
        }
      });

      expect(nodeLogSpy).toHaveBeenCalledTimes(collectionsUnderTest.length);
    });
  });
});
