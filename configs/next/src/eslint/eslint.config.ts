import { react } from '@configs/react/eslint';
import { define } from '@praha/eslint-config-definer';
import { next as prahaNext } from '@praha/eslint-config-next';

export const next = define([
  react,
  prahaNext,
]);
