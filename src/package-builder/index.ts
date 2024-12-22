import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { MetadataModuleDefinition } from '../script-module-metadata';
import { printModule } from './printer';
//import { generateModule } from './codegen';

const baseLink = `https://raw.githubusercontent.com/Bedrock-APIs/bds-docs/stable`;
const repoExists = `${baseLink}/exist.json`;
const outDir = 'packages';
const apiFilename = 'api.js';
const apiBuilder = resolve(import.meta.dirname, './api-builder.js');
type ExistJson = {
   'build-version': string;
   'version': string;
   'flags': string[];
   'SCRIPT_MODULES_MAPPING'?: {
      script_modules: string[];
      script_modules_mapping: {
         [key: string]: {
            name: string;
            uuid: string;
            versions: string[];
         };
      };
      script_module_files: string[];
   };
};

main().then(
   r => (process.exitCode = r),
   e => {
      console.error(e);
      process.exit(-1);
   },
);

async function test(): Promise<number> {
   const data = JSON.parse(readFileSync('./data/server_1.15.0-beta.json').toString());
   const { definitionsCode, exportsCode } = await printModule(data);
   writeFileSync('./tests/server.native.js', definitionsCode);
   writeFileSync('./tests/server.js', exportsCode);
   return 0;
}

async function main(): Promise<number> {
   // Static Move Copy
   if (!existsSync(outDir)) {
      await mkdir(outDir);
      console.log('Created ' + outDir);
   }

   if (!existsSync(resolve(outDir, './@minecraft'))) {
      await mkdir(resolve(outDir, './@minecraft'));
      console.log('Created ' + outDir + './@minecraft');
   }

   if (!existsSync(apiBuilder)) {
      console.log(`Failed to find API builder code file: ` + apiBuilder);
      return -1;
   }

   const successes = await copyFile(apiBuilder, resolve(outDir, apiFilename)).then(
      () => true,
      () => false,
   );

   if (!successes) {
      console.error('Failed to copy api builder file to the package destination: ' + apiBuilder);
      return -1;
   }

   console.log('Copied ' + apiBuilder);

   // Fetch Latest Metadata
   const exists = await (downloadAndParseJSON(repoExists).catch(e => null) as Promise<ExistJson | null>);

   if (!exists) {
      console.error('Failed to fetch repository from ' + repoExists);
      return -1;
   }

   if (!exists.flags.includes('SCRIPT_MODULES_MAPPING') || !exists.SCRIPT_MODULES_MAPPING) {
      console.error('Generator version mismatch with BDS-DOCS!!!, "SCRIPT_MODULES_MAPPING" is not available');
      return -1;
   }

   console.log('Fetching from version: ' + exists['build-version']);

   const metadata = exists.SCRIPT_MODULES_MAPPING;
   const tasks = exists.SCRIPT_MODULES_MAPPING.script_modules
      .filter(e => e.startsWith('@minecraft'))
      .map(e => {
         const meta = metadata.script_modules_mapping[e];
         if (!meta) return;

         const { name, versions } = meta;
         const version = versions.sort(compareVersions).at(-1);
         if (!version) return;

         return generateModuleFor(name, version);
      })
      .filter(e => !!e);

   if ((await Promise.all(tasks)).find(e => e !== 0) !== undefined) {
      console.error('Failed to generate Metadata for at least one module');
      return -1;
   }

   // 0 is success
   return 0;
}

async function downloadAndParseJSON(link: string): Promise<unknown | null> {
   const response = await fetch(link);
   if (!response.ok) return null;
   return await response.json();
}

function compareVersions(a: string, b: string): number {
   const [aVersion, aTag] = a.split('-');
   const [bVersion, bTag] = b.split('-');

   const aNums = (aVersion ?? '').split('.').map(Number);
   const bNums = (bVersion ?? '').split('.').map(Number);

   for (let i = 0; i < aNums.length || i < bNums.length; i++) {
      const a = aNums[i] ?? 0;
      const b = bNums[i] ?? 0;
      if (a !== b) return a - b;
   }

   // If versions are the same, compare tags
   if (aTag === bTag) return 0;

   // Handle cases where either tag is undefined
   if (!aTag) return -1;
   if (!bTag) return 1;
   return [aTag, bTag].sort()[0] == aTag ? 1 : -1;
}

async function generateModuleFor(name: string, version: string): Promise<number> {
   const builderLink = `${baseLink}/metadata/script_modules/${name}_${version}.json`;

   console.log('Fetching: ' + builderLink);
   const moduleObject = (await downloadAndParseJSON(builderLink).catch(e => null)) as MetadataModuleDefinition;

   if (!moduleObject) {
      console.error('Failed to fetch or parse: ' + builderLink);
      return -1;
   }

   const { definitionsCode, exportsCode } = await printModule(moduleObject);

   await writeFile(resolve(outDir, name + '.native.js'), definitionsCode);
   console.log('Generated ' + resolve(outDir, name + '.native.js'));
   await writeFile(resolve(outDir, name + '.js'), exportsCode);
   console.log('Generated ' + resolve(outDir, name + '.js'));
   console.log(' ');

   return 0;
}
