import { common } from '@configs/common/eslint';
import { define } from '@praha/eslint-config-definer';
import { react as prahaReact } from '@praha/eslint-config-react';
import storybook from 'eslint-plugin-storybook';

export const react = define([
  common,
  prahaReact,
  // @ts-expect-error `exactOptionalPropertyTypes`設定入れてると怒られる。
  () => storybook.configs['flat/recommended'],
]);
