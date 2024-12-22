import { defineConfig } from 'rolldown';

/**@type {import('rolldown').RolldownOptions[]} */
export const CONFIG = [
   {
      input: './src/package-builder/index.ts',
      external: ['typescript', /node/, 'prettier'],
      output: {
         file: 'build.js',
      },
   },
   {
      input: './src/api-builder/index.ts',
      external: ['typescript', /node/],
      output: {
         file: 'api-builder.js',
      },
   },
];
export default defineConfig(CONFIG);
