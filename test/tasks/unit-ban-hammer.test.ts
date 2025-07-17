// * These tests ensure the exported interfaces under test function as expected.

import { BANNED_BEARER_TOKEN } from '@-xun/api-strategy/auth';
import { getDb } from '@-xun/mongo-schema';
import { runWithMongoSchemaMultitenancy } from '@-xun/mongo-schema/multitenant';
import { setupMemoryServerOverride } from '@-xun/mongo-test';

import { oneSecondInMs } from 'universe:constant.ts';
import unleashBanHammer, { taskType } from 'universe:tasks/ban-hammer.ts';

import {
  makeSetupTestFunction,
  mockDateNowMs,
  useMockDateNow,
  withMockedOutput
} from 'testverse:util.ts';

import type { GlobalExecutionContext } from 'universe:configure.ts';

useMockDateNow();

// ! The MongoDB aggregation under test uses the `"$$NOW"` magic variable in
// ! production, but uses the `Date.now() + 500` expression when NODE_ENV=test.
// ! This means all results will always be calculated as if the runtime were
// ! 500ms in the future. Without this, tests become flaky depending on how long
// ! they take to run.

const now = mockDateNowMs - oneSecondInMs;
const TEN_MINUTES_MS = 10 * 60 * oneSecondInMs;

const {
  initializeMemoryServerOverride,
  killMemoryServerOverride,
  resetSharedMemory,
  reinitializeServerDatabases
} = setupMemoryServerOverride({ defer: 'without-hooks' });

const taskConfig = {
  willBeCalledEverySeconds: 60,
  resolutionWindowSeconds: 1,
  maxRequestsPerWindow: 10,
  defaultBanTimeMinutes: 2,
  recidivismPunishMultiplier: 5
};

function makeGetConfig(
  overrides: Partial<Record<keyof typeof taskConfig, number>> = {}
) {
  return function (key: string) {
    const actualKey = key.split('.').at(-1) as keyof typeof taskConfig | 'mongodbUri';

    if (actualKey === 'mongodbUri') {
      return 'fake';
    }

    return actualKey in overrides ? overrides[actualKey] : taskConfig[actualKey];
  } as GlobalExecutionContext['getConfig'];
}

describe(`target: drive`, () => {
  const target = 'drive';

  const { setupTest } = makeSetupTestFunction({
    target,
    taskType,
    taskConfigIsCollections: false,
    initializeMemoryServerOverride,
    killMemoryServerOverride,
    reinitializeServerDatabases,
    resetSharedMemory,
    schema: require(`@nhscc/backend-${target}/db`).getSchemaConfig(),
    data: require(`@nhscc/backend-${target}/dummy`).getDummyData(),
    taskConfig
  });

  it('rate limits clients that exceed max requests per window by ip and header', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const limitDb = await getRateLimitsCollection();
        const logDb = await getRequestLogCollection();

        await limitDb.deleteMany({});

        await logDb.updateMany({}, { $set: { createdAt: now } });

        await unleashBanHammer('test', target, makeGetConfig(), taskRunnerContext);

        await expect(getRateLimits()).resolves.toIncludeSameMembers([
          { ip: '1.2.3.4' },
          { header: `bearer ${BANNED_BEARER_TOKEN}` }
        ]);

        expect(nodeLogSpy).toHaveBeenCalled();
      });
    });
  });

  // TODO: fix timing bug and pray it is not a bug in mongodb's driver
  // eslint-disable-next-line jest/no-commented-out-tests
  // it('only rate limits ips and headers that exceed max requests per window', async () => {
  //   expect.hasAssertions();

  //   const { taskRunnerContext } = await setupTest();

  //   await withMockedOutput(async ({ nodeLogSpy }) => {
  //     await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
  //       const logDb = await getRequestLogCollection();
  //       const limitDb = await getRateLimitsCollection();

  //       const defaultResolutionWindowMs =
  //         // ? $$NOW will be 500ms into the future compared to Date.now(),
  //         // ? so subtracting by defaultResolutionWindowMs should be enough
  //         taskConfig.resolutionWindowSeconds * oneSecondInMs;

  //       await limitDb.deleteMany({});

  //       await logDb.updateMany({}, { $set: { createdAt: now } });

  //       await logDb.updateMany(
  //         { header: `bearer ${BANNED_BEARER_TOKEN}` },
  //         { $set: { ip: '9.8.7.6' } }
  //       );

  //       await logDb.insertMany([
  //         {
  //           _id: new ObjectId(),
  //           ip: '1.2.3.4',
  //           header: `bearer ${BANNED_BEARER_TOKEN}`,
  //           method: 'PUT',
  //           resStatusCode: 200,
  //           route: 'jest/test',
  //           endpoint: '/fake/:jest',
  //           // ? Outside the default window
  //           createdAt: now - defaultResolutionWindowMs,
  //           durationMs: 1234
  //         },
  //         {
  //           _id: new ObjectId(),
  //           ip: '7.7.7.7',
  //           header: `bearer ${DUMMY_BEARER_TOKEN}`,
  //           method: 'PATCH',
  //           resStatusCode: 200,
  //           route: 'jest/test',
  //           endpoint: '/fake/:jest',
  //           // ? Outside the default window
  //           createdAt: now - defaultResolutionWindowMs,
  //           durationMs: 1234
  //         }
  //       ]);

  //       await unleashBanHammer(
  //         'test',
  //         target,
  //         makeGetConfig({ maxRequestsPerWindow: 11 }),
  //         taskRunnerContext
  //       );

  //       expect(nodeLogSpy).toHaveBeenCalledTimes(1);

  //       await expect(getRateLimits()).resolves.toBeArrayOfSize(0);

  //       await unleashBanHammer(
  //         'test',
  //         target,
  //         makeGetConfig({ maxRequestsPerWindow: 11, resolutionWindowSeconds: 5 }),
  //         taskRunnerContext
  //       );

  //       expect(nodeLogSpy).toHaveBeenCalledTimes(2);

  //       await expect(getRateLimits()).resolves.toIncludeSameMembers([
  //         { ip: '1.2.3.4' },
  //         { header: `bearer ${BANNED_BEARER_TOKEN}` }
  //       ]);
  //     });

  //     expect(nodeLogSpy).toHaveBeenCalledTimes(2);
  //   });
  // });

  it('rate limits multiple ips that exceed max requests per window', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const limitDb = await getRateLimitsCollection();
        const logDb = await getRequestLogCollection();

        await limitDb.deleteMany({});

        await logDb.updateMany({}, { $set: { createdAt: now } });

        await logDb.updateMany(
          { header: `bearer ${BANNED_BEARER_TOKEN}` },
          { $set: { ip: '9.8.7.6' } }
        );

        await unleashBanHammer('test', target, makeGetConfig(), taskRunnerContext);
        expect(nodeLogSpy).toHaveBeenCalledTimes(1);

        await expect(getRateLimits()).resolves.toIncludeSameMembers([
          { ip: '1.2.3.4' },
          { ip: '9.8.7.6' },
          { header: `bearer ${BANNED_BEARER_TOKEN}` }
        ]);
      });

      expect(nodeLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('rate limits 0 clients if none exceed max requests per window', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const logDb = await getRequestLogCollection();
        const limitDb = await getRateLimitsCollection();

        await limitDb.deleteMany({});

        await logDb.updateMany({}, { $set: { createdAt: now } });

        await logDb.updateMany(
          { header: `bearer ${BANNED_BEARER_TOKEN}` },
          { $set: { ip: '9.8.7.6' } }
        );

        await unleashBanHammer(
          'test',
          target,
          makeGetConfig({ maxRequestsPerWindow: 11 }),
          taskRunnerContext
        );

        await expect(getRateLimits()).resolves.toBeArrayOfSize(0);
      });

      expect(nodeLogSpy).toHaveBeenCalled();
    });
  });

  it('rate limits with respect to invocation interval', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const logDb = await getRequestLogCollection();
        const limitDb = await getRateLimitsCollection();

        await limitDb.deleteMany({});

        await logDb.updateMany({}, { $set: { createdAt: now } });

        await logDb.updateMany(
          { header: `bearer ${BANNED_BEARER_TOKEN}` },
          { $set: { ip: '9.8.7.6' } }
        );

        await unleashBanHammer(
          'test',
          target,
          makeGetConfig({
            resolutionWindowSeconds: 5, // ? Normally 1
            willBeCalledEverySeconds: 1 // ? Normally 1
          }),
          taskRunnerContext
        );

        await expect(getRateLimits()).resolves.toBeArrayOfSize(0);

        await unleashBanHammer(
          'test',
          target,
          makeGetConfig({
            resolutionWindowSeconds: 5, // ? Normally 1
            willBeCalledEverySeconds: 8 // ? Normally 8
          }),
          taskRunnerContext
        );

        await expect(getRateLimits()).resolves.toIncludeSameMembers([
          { header: `bearer ${BANNED_BEARER_TOKEN}` },
          { ip: '9.8.7.6' },
          { ip: '1.2.3.4' }
        ]);
      });

      expect(nodeLogSpy).toHaveBeenCalled();
    });
  });

  it('repeat offenders are punished to the maximum extent possible', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const limitDb = await getRateLimitsCollection();
        const logDb = await getRequestLogCollection();

        await limitDb.deleteMany({});

        await logDb.updateMany({}, { $set: { createdAt: now } });

        await logDb.updateMany(
          { header: `bearer ${BANNED_BEARER_TOKEN}` },
          { $set: { ip: '9.8.7.6' } }
        );

        await unleashBanHammer(
          'test',
          target,
          makeGetConfig({
            defaultBanTimeMinutes: 10 // ? Normally 2
          }),
          taskRunnerContext
        );

        {
          const untils = await getRateLimitUntils();
          expect(untils).toBeArrayOfSize(3);

          untils.forEach((u) => {
            expect({
              until: u.until,
              untilMinusNow: u.until - now,
              untilMinusNow10Minutes: u.until - (now + TEN_MINUTES_MS)
            }).toStrictEqual({
              until: u.until,
              untilMinusNow: u.until - now,
              // ? $$NOW = Date.now() + 500 milliseconds
              // ? now = Date.now() - 1000 milliseconds
              // ? ban = TEN_MINUTES_MS
              // ? until = $$NOW + ban = Date.now() + 500 + TEN_MINUTES_MS
              // ? So, until - now - ban = 500 + 1000 = 1500
              untilMinusNow10Minutes: 1500
            });
          });
        }

        await limitDb.deleteMany({});

        await unleashBanHammer(
          'test',
          target,
          makeGetConfig({
            defaultBanTimeMinutes: 20, // ? Normally 2
            recidivismPunishMultiplier: 10 // ? Normally 5
          }),
          taskRunnerContext
        );

        {
          const untils = await getRateLimitUntils();
          expect(untils).toBeArrayOfSize(3);

          untils.forEach((u) => {
            expect({
              until: u.until,
              untilMinusNow: u.until - now,
              untilMinusNow20Minutes: u.until - (now + 2 * TEN_MINUTES_MS)
            }).toStrictEqual({
              until: u.until,
              untilMinusNow: u.until - now,
              // ? $$NOW = Date.now() + 500 milliseconds
              // ? now = Date.now() - 1000 milliseconds
              // ? ban = 2 * TEN_MINUTES_MS
              // ? until = $$NOW + ban = Date.now() + 500 + 2 * TEN_MINUTES_MS
              // ? So, until - now - ban = 500 + 1000 = 1500
              untilMinusNow20Minutes: 1500
            });
          });
        }

        await unleashBanHammer(
          'test',
          target,
          makeGetConfig({
            defaultBanTimeMinutes: 20, // ? Normally 2
            recidivismPunishMultiplier: 10 // ? Normally 5
          }),
          taskRunnerContext
        );

        {
          const untils = await getRateLimitUntils();
          expect(untils).toBeArrayOfSize(3);

          untils.forEach((u) => {
            expect({
              until: u.until,
              untilMinusNow: u.until - now,
              untilMinusNow200Minutes: u.until - (now + 20 * TEN_MINUTES_MS)
            }).toStrictEqual({
              until: u.until,
              untilMinusNow: u.until - now,
              // ? $$NOW = Date.now() + 500 milliseconds
              // ? now = Date.now() - 1000 milliseconds
              // ? ban = 20 * TEN_MINUTES_MS
              // ? until = $$NOW + ban = Date.now() + 500 + 20 * TEN_MINUTES_MS
              // ? So, until - now - ban = 500 + 1000 = 1500
              untilMinusNow200Minutes: 1500
            });
          });
        }
      });

      expect(nodeLogSpy).toHaveBeenCalled();
    });
  });

  it('does not replace longer bans with shorter bans', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const limitDb = await getRateLimitsCollection();

        await expect(getRateLimits()).resolves.toBeArrayOfSize(3);

        await limitDb.updateMany(
          { ip: { $ne: '5.6.7.8' } },
          { $set: { until: 9_998_784_552_826 } }
        );

        await unleashBanHammer('test', target, makeGetConfig(), taskRunnerContext);

        let saw = 0;
        (await getRateLimitUntils()).forEach(
          (u) => u.until === 9_998_784_552_826 && saw++
        );

        expect(saw).toBe(2);
      });

      expect(nodeLogSpy).toHaveBeenCalled();
    });
  });

  it('deletes outdated entries outside the punishment period', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const logDb = await getRequestLogCollection();
        const limitDb = await getRateLimitsCollection();

        await logDb.updateMany({}, { $set: { createdAt: now } });

        await expect(getRateLimits()).resolves.toBeArrayOfSize(3);

        await limitDb.updateMany({ ip: '5.6.7.8' }, { $set: { until: 0 } });

        await unleashBanHammer('test', target, makeGetConfig(), taskRunnerContext);

        await expect(getRateLimits()).resolves.toIncludeSameMembers([
          { ip: '1.2.3.4' },
          { header: `bearer ${BANNED_BEARER_TOKEN}` }
        ]);
      });

      expect(nodeLogSpy).toHaveBeenCalled();
    });
  });
});

describe(`target: qoverflow`, () => {
  const target = 'qoverflow';

  const { setupTest } = makeSetupTestFunction({
    target,
    taskType,
    taskConfigIsCollections: false,
    initializeMemoryServerOverride,
    killMemoryServerOverride,
    reinitializeServerDatabases,
    resetSharedMemory,
    schema: require(`@nhscc/backend-${target}/db`).getSchemaConfig(),
    data: require(`@nhscc/backend-${target}/dummy`).getDummyData(),
    taskConfig
  });

  it('rate limits clients that exceed max requests per window by ip and header', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const limitDb = await getRateLimitsCollection();
        const logDb = await getRequestLogCollection();

        await limitDb.deleteMany({});

        await logDb.updateMany({}, { $set: { createdAt: now } });

        await unleashBanHammer('test', target, makeGetConfig(), taskRunnerContext);

        await expect(getRateLimits()).resolves.toIncludeSameMembers([
          { ip: '1.2.3.4' },
          { header: `bearer ${BANNED_BEARER_TOKEN}` }
        ]);

        expect(nodeLogSpy).toHaveBeenCalled();
      });
    });
  });

  // TODO: fix timing bug and pray it is not a bug in mongodb's driver
  // eslint-disable-next-line jest/no-commented-out-tests
  // it('only rate limits ips and headers that exceed max requests per window', async () => {
  //   expect.hasAssertions();

  //   const { taskRunnerContext } = await setupTest();

  //   await withMockedOutput(async ({ nodeLogSpy }) => {
  //     await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
  //       const logDb = await getRequestLogCollection();
  //       const limitDb = await getRateLimitsCollection();

  //       const defaultResolutionWindowMs =
  //         // ? $$NOW will be 500ms into the future compared to Date.now(),
  //         // ? so subtracting by defaultResolutionWindowMs should be enough
  //         taskConfig.resolutionWindowSeconds * oneSecondInMs;

  //       await limitDb.deleteMany({});

  //       await logDb.updateMany({}, { $set: { createdAt: now } });

  //       await logDb.updateMany(
  //         { header: `bearer ${BANNED_BEARER_TOKEN}` },
  //         { $set: { ip: '9.8.7.6' } }
  //       );

  //       await logDb.insertMany([
  //         {
  //           _id: new ObjectId(),
  //           ip: '1.2.3.4',
  //           header: `bearer ${BANNED_BEARER_TOKEN}`,
  //           method: 'PUT',
  //           resStatusCode: 200,
  //           route: 'jest/test',
  //           endpoint: '/fake/:jest',
  //           // ? Outside the default window
  //           createdAt: now - defaultResolutionWindowMs,
  //           durationMs: 1234
  //         },
  //         {
  //           _id: new ObjectId(),
  //           ip: '7.7.7.7',
  //           header: `bearer ${DUMMY_BEARER_TOKEN}`,
  //           method: 'PATCH',
  //           resStatusCode: 200,
  //           route: 'jest/test',
  //           endpoint: '/fake/:jest',
  //           // ? Outside the default window
  //           createdAt: now - defaultResolutionWindowMs,
  //           durationMs: 1234
  //         }
  //       ]);

  //       await unleashBanHammer(
  //         'test',
  //         target,
  //         makeGetConfig({ maxRequestsPerWindow: 11 }),
  //         taskRunnerContext
  //       );

  //       expect(nodeLogSpy).toHaveBeenCalledTimes(1);

  //       await expect(getRateLimits()).resolves.toBeArrayOfSize(0);

  //       await unleashBanHammer(
  //         'test',
  //         target,
  //         makeGetConfig({ maxRequestsPerWindow: 11, resolutionWindowSeconds: 5 }),
  //         taskRunnerContext
  //       );

  //       expect(nodeLogSpy).toHaveBeenCalledTimes(2);

  //       await expect(getRateLimits()).resolves.toIncludeSameMembers([
  //         { ip: '1.2.3.4' },
  //         { header: `bearer ${BANNED_BEARER_TOKEN}` }
  //       ]);
  //     });

  //     expect(nodeLogSpy).toHaveBeenCalledTimes(2);
  //   });
  // });

  it('rate limits multiple ips that exceed max requests per window', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const limitDb = await getRateLimitsCollection();
        const logDb = await getRequestLogCollection();

        await limitDb.deleteMany({});

        await logDb.updateMany({}, { $set: { createdAt: now } });

        await logDb.updateMany(
          { header: `bearer ${BANNED_BEARER_TOKEN}` },
          { $set: { ip: '9.8.7.6' } }
        );

        await unleashBanHammer('test', target, makeGetConfig(), taskRunnerContext);
        expect(nodeLogSpy).toHaveBeenCalledTimes(1);

        await expect(getRateLimits()).resolves.toIncludeSameMembers([
          { ip: '1.2.3.4' },
          { ip: '9.8.7.6' },
          { header: `bearer ${BANNED_BEARER_TOKEN}` }
        ]);
      });

      expect(nodeLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('rate limits 0 clients if none exceed max requests per window', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const logDb = await getRequestLogCollection();
        const limitDb = await getRateLimitsCollection();

        await limitDb.deleteMany({});

        await logDb.updateMany({}, { $set: { createdAt: now } });

        await logDb.updateMany(
          { header: `bearer ${BANNED_BEARER_TOKEN}` },
          { $set: { ip: '9.8.7.6' } }
        );

        await unleashBanHammer(
          'test',
          target,
          makeGetConfig({ maxRequestsPerWindow: 11 }),
          taskRunnerContext
        );

        await expect(getRateLimits()).resolves.toBeArrayOfSize(0);
      });

      expect(nodeLogSpy).toHaveBeenCalled();
    });
  });

  it('rate limits with respect to invocation interval', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const logDb = await getRequestLogCollection();
        const limitDb = await getRateLimitsCollection();

        await limitDb.deleteMany({});

        await logDb.updateMany({}, { $set: { createdAt: now } });

        await logDb.updateMany(
          { header: `bearer ${BANNED_BEARER_TOKEN}` },
          { $set: { ip: '9.8.7.6' } }
        );

        await unleashBanHammer(
          'test',
          target,
          makeGetConfig({
            resolutionWindowSeconds: 5, // ? Normally 1
            willBeCalledEverySeconds: 1 // ? Normally 1
          }),
          taskRunnerContext
        );

        await expect(getRateLimits()).resolves.toBeArrayOfSize(0);

        await unleashBanHammer(
          'test',
          target,
          makeGetConfig({
            resolutionWindowSeconds: 5, // ? Normally 1
            willBeCalledEverySeconds: 8 // ? Normally 8
          }),
          taskRunnerContext
        );

        await expect(getRateLimits()).resolves.toIncludeSameMembers([
          { header: `bearer ${BANNED_BEARER_TOKEN}` },
          { ip: '9.8.7.6' },
          { ip: '1.2.3.4' }
        ]);
      });

      expect(nodeLogSpy).toHaveBeenCalled();
    });
  });

  it('repeat offenders are punished to the maximum extent possible', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const limitDb = await getRateLimitsCollection();
        const logDb = await getRequestLogCollection();

        await limitDb.deleteMany({});

        await logDb.updateMany({}, { $set: { createdAt: now } });

        await logDb.updateMany(
          { header: `bearer ${BANNED_BEARER_TOKEN}` },
          { $set: { ip: '9.8.7.6' } }
        );

        await unleashBanHammer(
          'test',
          target,
          makeGetConfig({
            defaultBanTimeMinutes: 10 // ? Normally 2
          }),
          taskRunnerContext
        );

        {
          const untils = await getRateLimitUntils();
          expect(untils).toBeArrayOfSize(3);

          untils.forEach((u) => {
            expect({
              until: u.until,
              untilMinusNow: u.until - now,
              untilMinusNow10Minutes: u.until - (now + TEN_MINUTES_MS)
            }).toStrictEqual({
              until: u.until,
              untilMinusNow: u.until - now,
              // ? $$NOW = Date.now() + 500 milliseconds
              // ? now = Date.now() - 1000 milliseconds
              // ? ban = TEN_MINUTES_MS
              // ? until = $$NOW + ban = Date.now() + 500 + TEN_MINUTES_MS
              // ? So, until - now - ban = 500 + 1000 = 1500
              untilMinusNow10Minutes: 1500
            });
          });
        }

        await limitDb.deleteMany({});

        await unleashBanHammer(
          'test',
          target,
          makeGetConfig({
            defaultBanTimeMinutes: 20, // ? Normally 2
            recidivismPunishMultiplier: 10 // ? Normally 5
          }),
          taskRunnerContext
        );

        {
          const untils = await getRateLimitUntils();
          expect(untils).toBeArrayOfSize(3);

          untils.forEach((u) => {
            expect({
              until: u.until,
              untilMinusNow: u.until - now,
              untilMinusNow20Minutes: u.until - (now + 2 * TEN_MINUTES_MS)
            }).toStrictEqual({
              until: u.until,
              untilMinusNow: u.until - now,
              // ? $$NOW = Date.now() + 500 milliseconds
              // ? now = Date.now() - 1000 milliseconds
              // ? ban = 2 * TEN_MINUTES_MS
              // ? until = $$NOW + ban = Date.now() + 500 + 2 * TEN_MINUTES_MS
              // ? So, until - now - ban = 500 + 1000 = 1500
              untilMinusNow20Minutes: 1500
            });
          });
        }

        await unleashBanHammer(
          'test',
          target,
          makeGetConfig({
            defaultBanTimeMinutes: 20, // ? Normally 2
            recidivismPunishMultiplier: 10 // ? Normally 5
          }),
          taskRunnerContext
        );

        {
          const untils = await getRateLimitUntils();
          expect(untils).toBeArrayOfSize(3);

          untils.forEach((u) => {
            expect({
              until: u.until,
              untilMinusNow: u.until - now,
              untilMinusNow200Minutes: u.until - (now + 20 * TEN_MINUTES_MS)
            }).toStrictEqual({
              until: u.until,
              untilMinusNow: u.until - now,
              // ? $$NOW = Date.now() + 500 milliseconds
              // ? now = Date.now() - 1000 milliseconds
              // ? ban = 20 * TEN_MINUTES_MS
              // ? until = $$NOW + ban = Date.now() + 500 + 20 * TEN_MINUTES_MS
              // ? So, until - now - ban = 500 + 1000 = 1500
              untilMinusNow200Minutes: 1500
            });
          });
        }
      });

      expect(nodeLogSpy).toHaveBeenCalled();
    });
  });

  it('does not replace longer bans with shorter bans', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const limitDb = await getRateLimitsCollection();

        await expect(getRateLimits()).resolves.toBeArrayOfSize(3);

        await limitDb.updateMany(
          { ip: { $ne: '5.6.7.8' } },
          { $set: { until: 9_998_784_552_826 } }
        );

        await unleashBanHammer('test', target, makeGetConfig(), taskRunnerContext);

        let saw = 0;
        (await getRateLimitUntils()).forEach(
          (u) => u.until === 9_998_784_552_826 && saw++
        );

        expect(saw).toBe(2);
      });

      expect(nodeLogSpy).toHaveBeenCalled();
    });
  });

  it('deletes outdated entries outside the punishment period', async () => {
    expect.hasAssertions();

    const { taskRunnerContext } = await setupTest();

    await withMockedOutput(async ({ nodeLogSpy }) => {
      await runWithMongoSchemaMultitenancy(`${target}-${taskType}`, async () => {
        const logDb = await getRequestLogCollection();
        const limitDb = await getRateLimitsCollection();

        await logDb.updateMany({}, { $set: { createdAt: now } });

        await expect(getRateLimits()).resolves.toBeArrayOfSize(3);

        await limitDb.updateMany({ ip: '5.6.7.8' }, { $set: { until: 0 } });

        await unleashBanHammer('test', target, makeGetConfig(), taskRunnerContext);

        await expect(getRateLimits()).resolves.toIncludeSameMembers([
          { ip: '1.2.3.4' },
          { header: `bearer ${BANNED_BEARER_TOKEN}` }
        ]);
      });

      expect(nodeLogSpy).toHaveBeenCalled();
    });
  });
});

async function getRequestLogCollection() {
  return (await getDb({ name: 'root' })).collection('request-log');
}

async function getRateLimitsCollection() {
  return (await getDb({ name: 'root' })).collection('limited-log');
}

async function getRateLimits() {
  return (await getRateLimitsCollection())
    .find()
    .project({ _id: 0, ip: 1, header: 1 })
    .toArray();
}

async function getRateLimitUntils() {
  return (await getRateLimitsCollection())
    .find()
    .project({ _id: 0, until: 1 })
    .toArray();
}
