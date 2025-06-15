import { common } from '@configs/common/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...common({
    tsconfigPath: './tsconfig.json',
  }),
];
