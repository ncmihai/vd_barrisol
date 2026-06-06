import * as migration_20260606_140813_initial from './20260606_140813_initial';

export const migrations = [
  {
    up: migration_20260606_140813_initial.up,
    down: migration_20260606_140813_initial.down,
    name: '20260606_140813_initial'
  },
];
