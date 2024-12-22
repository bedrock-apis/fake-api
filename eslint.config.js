import eslint from '@eslint/js';
import { ESLintUtils } from '@typescript-eslint/utils';
import tseslint from 'typescript-eslint';

export default tseslint.config([
   { ignores: ['**/*.js', '**/*.test.ts'] },
   { files: ['src/**/*.ts'] },
   eslint.configs.recommended,
   ...tseslint.configs.strict,
   {
      linterOptions: { reportUnusedDisableDirectives: true },
      rules: {
         '@typescript-eslint/no-extraneous-class': 'off',
         '@typescript-eslint/no-unused-vars': 'off',
         '@typescript-eslint/explicit-member-accessibility': ['warn', { accessibility: 'explicit' }],
         '@typescript-eslint/naming-convention': ['warn', ...namingConvention()],
      },
   },
   ...customPluginConfig(),
]);

function customPluginConfig() {
   return tseslint.config([
      {
         files: ['src/api-builder/**'],
         plugins: {
            custom: customPlugin(),
         },
         rules: {
            'custom/no-globals': 'error',
            'custom/no-default-extends': 'error',
            'custom/no-iterators': 'error'
         },
      },
   ]);
}

function customPlugin() {
   const kernelConstruct = 'Kernel.Construct';

   const noGlobals = ESLintUtils.RuleCreator.withoutDocs({
      meta: {
         type: 'problem',
         hasSuggestions: true,
         fixable: 'code',
         messages: {
            useKernel: `Use ${kernelConstruct}{{ args }} instead`,
            useArray: `You cannot construct array with one element using Kernel.Construct because it will create empty array.`,
         },
         schema: [],
      },
      create(context) {
         if (context.filename.includes('package-builder')) return {};

         /** @param {string} name */
         function isRestricted(name) {
            if (name === 'undefined') return false;

            return name in globalThis;
         }

         const source = context.sourceCode.text;
         const sourceCode = context.sourceCode;

         return {
            Program(node) {
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
            ArrayExpression(node) {
               if (
                  node.parent.type === 'TSAsExpression' &&
                  node.parent.typeAnnotation.type === 'TSTypeReference' &&
                  node.parent.typeAnnotation.typeName.type === 'Identifier' &&
                  node.parent.typeAnnotation.typeName.name === 'const'
               )
                  return; // ignore const a = [] as const because array will be not modified;

               reportReference({ ...node, parent: node });
            },
         };

         /**
          * @import {TSESTree} from "@typescript-eslint/utils"
          */

         /**
          * @param {TSESTree.Identifier | TSESTree.JSXIdentifier | TSESTree.ArrayExpression} node
          */
         function reportReference(node) {
            if (node.parent.type.startsWith('TS')) return;

            const parent = getRange(node.parent);
            const our = getRange(node);
            const name = node.type === 'ArrayExpression' ? 'Array' : node.name;
            const originalArgs =
               node.parent.type === 'NewExpression'
                  ? source.substring(parent.start + our.start - parent.start + name.length + 1, parent.end - 1)
                  : node.parent.type === 'ArrayExpression'
                     ? source.substring(our.start + 1, our.end - 1)
                     : '';

            const args = `("${name}"${originalArgs ? ', ' + originalArgs : ''})`;
            const isArrayWithOneElement =
               node.type === 'ArrayExpression' &&
               node.elements.length === 1 &&
               node.elements[0] &&
               node.elements[0].type === 'Literal' &&
               typeof node.elements[0].value === 'number';

            context.report({
               node,
               messageId: isArrayWithOneElement ? 'useArray' : 'useKernel',
               data: { args },
               fix: !isArrayWithOneElement
                  ? fixer => {
                     return [fixer.replaceTextRange([parent.start, parent.end], `${kernelConstruct}${args}`)];
                  }
                  : undefined,
            });
         }
      },
      defaultOptions: [],
   });

   const noDefaultClasses = ESLintUtils.RuleCreator.withoutDocs({
      meta: {
         type: 'problem',
         hasSuggestions: true,
         fixable: 'code',
         messages: {
            extendsEmpty: `Use Kernel.Empty as parent class for isolation security`,
         },
         schema: [],
      },
      create(context) {
         return {
            ClassDeclaration(node) {
               if (node.superClass === null) {
                  context.report({
                     messageId: 'extendsEmpty',
                     node: node.id,
                     fix: fixer => {
                        return [fixer.insertTextBefore(node.body, ' extends Kernel.Empty')];
                     },
                  });
               }
            },
         };
      },
      defaultOptions: [],
   });

   const noUnsafeIterators = ESLintUtils.RuleCreator.withoutDocs({
      meta: {
         type: 'problem',
         hasSuggestions: false,
         fixable: 'code',
         messages: {
            unsafeIterator: `Using iterators is unsafe as iterators are not isolated`,
            forOfDestructor: `Using destructors in for-of is not permitted.`,
         },
         schema: [],
      },
      create(context) {
         return {
            YieldExpression(node) {
               if (!node.delegate) return;
               node = node.argument;
               if (node.type !== "CallExpression") context.report({
                  messageId: 'unsafeIterator',
                  node: node
               });
               else if (node.callee.object?.name !== "Kernel") context.report({
                  messageId: 'unsafeIterator',
                  node: node.node
               });
            },
            ForOfStatement(node) {
               for (const n of node.left.declarations) {
                  if (n.id.type === "ArrayPattern") context.report({
                     messageId: 'forOfDestructor',
                     node: n.id
                  });
               }
               if (node.right.type !== "CallExpression") context.report({
                  messageId: 'unsafeIterator',
                  node: node.right
               });
               else if (node.right.callee.object?.name !== "Kernel") context.report({
                  messageId: 'unsafeIterator',
                  node: node.right
               });
            },
            ArrayPattern(node) {
               if (node.parent.type === "VariableDeclarator") {
                  if (!node.parent.init) return;
                  if (node.parent.init.type !== "CallExpression") context.report({
                     messageId: 'unsafeIterator',
                     node: node.parent.init
                  });
                  else if (node.parent.init.callee.object?.name !== "Kernel") context.report({
                     messageId: 'unsafeIterator',
                     node: node.parent.init
                  });
               }
            }
         }
      },
      defaultOptions: [],
   });

   /**
    * @param {import("@typescript-eslint/utils").TSESTree.Node} node
    */
   function getRange(node) {
      const [start, end] = node.range;
      return { start, end };
   }

   return {
      rules: {
         'no-globals': noGlobals,
         'no-default-extends': noDefaultClasses,
         'no-iterators': noUnsafeIterators
      },
   };
}

// https://typescript-eslint.io/rules/naming-convention/
function namingConvention() {
   return [
      {
         selector: 'variable',
         modifiers: ['const', 'global', 'exported'],
         format: ['UPPER_CASE'],
      },
      {
         selector: 'variable',
         modifiers: ['const', 'global'],
         // PascalCase here is for aliases such as const Number = Kernel['Number::constructor']
         format: ['camelCase', 'PascalCase'],
      },

      {
         selector: 'variable',
         modifiers: ['destructured'],
         format: ['camelCase', 'PascalCase', 'snake_case'],
      },

      { selector: 'variable', format: ['camelCase'] },

      { selector: 'function', format: ['camelCase'] },

      { selector: 'classMethod', modifiers: ['static'], format: ['PascalCase'] },

      { selector: 'classMethod', format: ['camelCase'], leadingUnderscore: 'allowDouble' },

      { selector: 'classProperty', modifiers: ['readonly', 'private'], format: ['UPPER_CASE'] },
      { selector: 'classProperty', modifiers: ['readonly', 'public'], format: ['camelCase'] },

      {
         selector: 'import',
         format: ['camelCase', 'PascalCase'],
      },

      {
         selector: 'typeLike',
         format: ['PascalCase'],
      },
   ];
}
