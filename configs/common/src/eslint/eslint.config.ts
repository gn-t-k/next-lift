import { common as acommon } from '@praha/eslint-config-common';
import { define } from '@praha/eslint-config-definer';
import { javascript } from '@praha/eslint-config-javascript';
import { style } from '@praha/eslint-config-style';
import { typescript } from '@praha/eslint-config-typescript';

import type { Linter } from 'eslint';

export const common = define([
  acommon,
  javascript,
  typescript,
  style,
  (): Linter.Config[] => [
    {
      rules: {
        'unicorn/consistent-function-scoping': 'off',
      },
    },
    {
      // 「`vi.mock`実行より前にmock対象のファイルがimportされるため、モックが適用されない」問題への対策。
      // モックファイルのimport（例: `import { ... } from '**/*.mock'`）が前に来るように、テストファイルにおいてはimport順を変える。
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'import-x/order': ['error', {
          'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          'newlines-between': 'always',
          'pathGroupsExcludedImportTypes': ['builtin'],
          'alphabetize': { order: 'asc', caseInsensitive: true },
        }],
      },
    },
  ],
]);
