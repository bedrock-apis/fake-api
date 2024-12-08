import ts, { factory } from 'typescript';
import { ClassDefinition } from '../api-builder';

// Just for sake of test
import * as prettier from 'prettier';

import { Type } from '../api-builder/type-validators';
import { toDefaultType } from '../api-builder/type-validators/default';
import { InterfaceBindType } from '../api-builder/type-validators/types/interface';
import {
   MetadataClassDefinition,
   MetadataConstantDefinition,
   MetadataInterfaceDefinition,
   MetadataModuleDefinition,
   MetadataPropertyMemberDefinition,
} from './script-module-metadata';
import { TYPESCRIPT_AST_HELPER as t } from './typescript-ast-helper';

const classDefinitionI = t.i`${ClassDefinition.name}`;
const classDefinitionIApiClassProperty = 'api' satisfies keyof ClassDefinition;
const classDefinitionIAddMethod = 'addMethod' satisfies keyof ClassDefinition;
const classDefinitonAddProperty = 'addProperty' satisfies keyof ClassDefinition;

const interfaceBindTypeI = t.i`${InterfaceBindType.name}`;
const interfaceBindTypeIAddProperty = 'addProperty' satisfies keyof InterfaceBindType;

const typeI = t.i`${Type.name}`;
const typeIRegisterBindType = t.accessBy(typeI, Type.RegisterBindType.name);

export async function generateModule(source: MetadataModuleDefinition, apiFilename: string, useFormatting = true) {
   const moduleName = source.name.split('/')[1] ?? 'unknown';
   const definitionsI = t.i`__`;
   const definitions: ts.Node[] = [
      t.importStarFrom('../' + apiFilename, [classDefinitionI, interfaceBindTypeI, typeI]),
   ];
   const exportDeclarations: ts.Node[] = [t.importAsFrom(definitionsI, `./${moduleName}.native.js`)];

   for (const interfaceMetadata of source.interfaces) {
      const node = generateInterfaceDefinition(interfaceMetadata);
      definitions.push(t.call(typeIRegisterBindType, [node]));
   }

   for (const classMeta of source.classes) {
      const name = classMeta.name;

      const node = generateClassDefinition(classMeta);

      definitions.push(t.exportConst(name, node));
      exportDeclarations.push(
         t.exportConst(name, t.accessBy(t.accessBy(definitionsI, name), classDefinitionIApiClassProperty)),
      );
   }

   if (source.enums)
      for (const enumMeta of source.enums) {
         exportDeclarations.push(
            t.createEnum(
               enumMeta.name,
               enumMeta.constants.filter(e => !!e.name && !!e.value).map(e => [e.name, t.asIs(e.value)]),
            ),
         );
      }

   // Create a printer to print the AST back to a string
   const printer = ts.createPrinter({ newLine: ts.NewLineKind.CarriageReturnLineFeed });

   async function writeCode(body: ts.Node[]) {
      // Emit the JavaScript code
      const resultCode = printer.printList(
         ts.ListFormat.AllowTrailingComma |
            ts.ListFormat.MultiLine |
            ts.ListFormat.MultiLineBlockStatements |
            ts.ListFormat.Indented,
         body as unknown as ts.NodeArray<ts.Node>,
         ts.createSourceFile('file.js', '', ts.ScriptTarget.ES2020, false, ts.ScriptKind.JS),
      );

      // Prettify code
      return useFormatting ? await prettier.format(resultCode, { parser: 'acorn', printWidth: 120 }) : resultCode;
   }

   const definitionsCode = await writeCode(definitions);
   const exportsCode = await writeCode(exportDeclarations);

   return { definitionsCode, exportsCode };
}

function addProperties(
   node: ts.Expression,
   methodName: string,
   properties: MetadataPropertyMemberDefinition[] | MetadataConstantDefinition[],
) {
   for (const property of properties) {
      node = t.methodCall(
         node,
         methodName,
         [
            t.asIs(property.name),
            t.asIs(toDefaultType(property.type)),
            t.asIs(property.is_read_only),
            'value' in property ? t.asIs(property.value) : undefined,
         ].filter(e => !!e),
      );
   }
   return node;
}

function generateClassDefinition(classMeta: MetadataClassDefinition) {
   const name = classMeta.name;
   const nameString = t.asIs(name);
   const baseClass = classMeta.base_types[0]?.name ? t.i`${classMeta.base_types[0].name}` : t.asIs(null);

   let node: ts.Expression = factory.createNewExpression(classDefinitionI, undefined, [nameString, baseClass]);

   for (const { name, return_type, arguments: args, is_constructor } of classMeta.functions) {
      if (is_constructor) {
         console.warn('Skipping constructor for', classMeta.name);
      } else {
         const argTypes = t.asIs(args.map(e => ({ ...e, type: toDefaultType(e.type) })));

         node = t.methodCall(node, classDefinitionIAddMethod, [
            t.asIs(name),
            argTypes,
            t.asIs(toDefaultType(return_type)),
         ]);
      }
   }

   node = addProperties(node, classDefinitonAddProperty, classMeta.properties);
   node = addProperties(node, classDefinitonAddProperty, classMeta.constants);

   return node;
}

function generateInterfaceDefinition(interfaceMetadata: MetadataInterfaceDefinition) {
   const name = interfaceMetadata.name;

   let node: ts.Expression = factory.createNewExpression(interfaceBindTypeI, undefined, [t.asIs(name)]);

   for (const { is_read_only, is_static, name, type } of interfaceMetadata.properties) {
      node = t.methodCall(node, interfaceBindTypeIAddProperty, [
         t.asIs(name),
         t.asIs(type.name),
         t.asIs('optional_type' in type),
      ]);
   }

   return node;
}
