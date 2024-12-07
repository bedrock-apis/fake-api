// @ts-check

import jseslint from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import("typescript-eslint").Config} */
const custom = [
  {
    files: ['src/api-builder/**'],
    plugins: {
      custom: customPlugin(),
    },
    rules: {
      'custom/no-globals': 'error',
    },
  },
];

/** @type {import("typescript-eslint").Config} */
export default [
  { ignores: ['**/*.js', '**/*.test.ts'] },
  { files: ['src/**/*.ts'] },
  jseslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit' }],
    },
  },
  ...custom,
];

import { ESLintUtils } from '@typescript-eslint/utils';
function customPlugin() {
  const noGlobals = ESLintUtils.RuleCreator.withoutDocs({
    create(context) {
      /**
       * @param {string} node
       */
      function isRestricted(node) {
        const isInGlobalThis = node in globalThis;
        if (!isInGlobalThis) return false;
        return node != 'undefined';
      }

      const source = context.sourceCode.text;
      const sourceCode = context.sourceCode;

      return {
        Program(node) {
          if (context.filename.includes('package-builder')) return;
          const scope = sourceCode.getScope(node);

          // Report variables declared elsewhere (ex: variables defined as "global" by eslint)
          scope.variables.forEach(variable => {
            if (!variable.defs.length && isRestricted(variable.name)) {
              variable.references.forEach(variable => reportReference(variable.identifier));
            }
          });

          // Report variables not declared at all
          scope.through.forEach(reference => {
            if (isRestricted(reference.identifier.name)) {
              if (reference.isTypeReference) return;
              reportReference(reference.identifier);
            }
          });
        },
      };

      /**
       * @param {import("@typescript-eslint/utils").TSESTree.Identifier | import("@typescript-eslint/utils").TSESTree.JSXIdentifier} node
       */
      function reportReference(node) {
        if (node.parent.type.startsWith('TS')) return;

        const name = node.name;
        context.report({
          node,
          messageId: 'useKernel',
          data: {
            name,
          },
          fix(fixer) {
            const getRange = (/** @type {import("@typescript-eslint/utils").TSESTree.Node} */ node) => {
              const [start, end] = node.range;
              return { start, end };
            };
            const parent = getRange(node.parent);
            const our = getRange(node);
            const args = source.substring(parent.start + our.start - parent.start + name.length + 1, parent.end);

            //We could check for available symbols in srcFile

            // It doesn't check whenter id comes from globalThis or is defined locally
            // possibly use rule source of the https://github.com/eslint/eslint/blob/main/lib/rules/no-restricted-globals.js
            return [
              fixer.replaceTextRange(
                [parent.start, parent.end],
                `Kernel.Construct("${name}"${node.parent.type === 'NewExpression' ? ', true, ' + args : ')'}`,
              ),
            ];
          },
        });
      }
    },
    meta: {
      type: 'problem',
      hasSuggestions: true,
      fixable: 'code',
      messages: {
        useKernel: 'Use Kernel.Construct("{{ name }}") instead',
      },
      schema: [],
    },
    defaultOptions: [],
  });

  return {
    rules: {
      'no-globals': noGlobals,
    },
  };
}
