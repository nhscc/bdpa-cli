/**
 * The name of the command line interface.
 */
export const globalCliName = 'bdpa-cli';

/**
 * The CLI-wide namespace that appears in logger output.
 */
export const globalLoggerNamespace = 'bdpa';

/**
 * The CLI-wide namespace that appears in debugger output.
 */
export const globalDebuggerNamespace = globalLoggerNamespace;

/**
 * The unique string used in this CLI's config directory.
 */
export const configDirNameComponent = 'bdpa-cli';

/**
 * Available HSCC cloud services organized by problem statement name.
 *
 * @see {@link targetDatabases}
 * @see {@link targetYears}
 */
export const TargetProblem = {
  All: 'all',

  Elections: 'elections',
  Airports: 'airports',
  Barker: 'barker',
  Ghostmeme: 'ghostmeme',
  Drive: 'drive',
  Qoverflow: 'qoverflow',
  Blogpress: 'blogpress',
  Inbdpa: 'inbdpa',
  ElectionsIrv: 'elections-irv',
  ElectionsCpl: 'elections-cpl'
} as const;

export type TargetProblem = (typeof TargetProblem)[keyof typeof TargetProblem];

/**
 * @see {@link TargetProblem}
 */
export type ActualTargetProblem = Exclude<TargetProblem, 'all'>;

/**
 * A map of HSCC cloud services to their respective backend implementations.
 *
 * @see {@link TargetProblem}
 */
export const targetProblemBackends = {
  get elections() {
    return Promise.reject(
      new Error(`the backend package for "elections" is not loadable in this version`)
    );
  },
  get airports() {
    return Promise.reject(
      new Error(`the backend package for "airports" is not loadable in this version`)
    );
  },
  get barker() {
    return Promise.reject(
      new Error(`the backend package for "barker" is not loadable in this version`)
    );
  },
  get ghostmeme() {
    return Promise.reject(
      new Error(`the backend package for "ghostmeme" is not loadable in this version`)
    );
  },
  get drive() {
    return import('@nhscc/backend-drive');
  },
  get qoverflow() {
    return import('@nhscc/backend-qoverflow');
  },
  get blogpress() {
    return Promise.reject(
      new Error(`the backend package for "blogpress" is not loadable in this version`)
    );
  },
  get inbdpa() {
    return Promise.reject(
      new Error(`the backend package for "inbdpa" is not loadable in this version`)
    );
  },
  get 'elections-irv'() {
    return Promise.reject(
      new Error(
        `the backend package for "elections-irv" is not loadable in this version`
      )
    );
  },
  get 'elections-cpl'() {
    return Promise.reject(
      new Error(
        `the backend package for "elections-cpl" is not loadable in this version`
      )
    );
  }
} as const satisfies { [key in ActualTargetProblem]: Promise<object> };

/**
 * Available HSCC cloud services organized by problem statement release year.
 *
 * Per-year syntax is: `[sample problem statement, actual problem statement]`
 *
 * @see {@link TargetProblem}
 */
export const targetYears = {
  2019: [TargetProblem.Elections],
  2020: [TargetProblem.Elections, TargetProblem.Airports],
  2021: [TargetProblem.Barker, TargetProblem.Ghostmeme],
  2022: [TargetProblem.Drive, TargetProblem.Qoverflow],
  2023: [TargetProblem.Blogpress, TargetProblem.Inbdpa],
  2024: [TargetProblem.ElectionsCpl, TargetProblem.ElectionsIrv],
  2025: [TargetProblem.Drive, TargetProblem.Qoverflow]
} as const;

/**
 * Available HSCC cloud services organized by Atlas server designation.
 *
 * @see {@link TargetProblem}
 */
export const targetDatabases = {
  mars: TargetProblem.Elections,
  neptune: TargetProblem.Airports,
  saturn: TargetProblem.Barker,
  pluto: TargetProblem.Ghostmeme,
  venus: TargetProblem.Drive,
  jupiter: TargetProblem.Qoverflow,
  uranus: TargetProblem.Blogpress,
  ganymede: TargetProblem.Inbdpa,
  callisto: TargetProblem.ElectionsCpl,
  io: TargetProblem.ElectionsIrv
} as const;

/**
 * Available tasks for the root command.
 */
export const Task = {
  All: 'all',

  InitializeData: 'initialize',
  BanHammer: 'ban',
  PruneData: 'prune',
  SimulateActivity: 'simulate',
  BackupData: 'backup'
} as const;

export type Task = (typeof Task)[keyof typeof Task];

/**
 * @see {@link Task}
 */
export const tasks = Object.values(Task);

/**
 * All possible ways to identify a problem statement (its name, year, or db).
 *
 * @see {@link TargetProblem}
 * @see {@link targetYears}
 * @see {@link targetDatabases}
 */
export const inputTargets = [
  Object.values(TargetProblem),
  Object.keys(targetYears),
  Object.keys(targetDatabases)
].flat() as (TargetProblem | keyof typeof targetYears | keyof typeof targetDatabases)[];

/**
 * The values of {@link TargetProblem} excluding `'all'`.
 */
export const actualTargetProblems = Object.values(TargetProblem).filter(
  (target) => target !== TargetProblem.All
);

export const oneSecondInMs = 1000;
