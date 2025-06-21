import { next } from '@configs/next/eslint';

export default [
  ...next({
    tsconfigPath: './tsconfig.json',
  }),
];
