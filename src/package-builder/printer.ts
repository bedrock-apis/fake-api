import ts from 'typescript';
// Just for sake of test
import * as prettier from 'prettier';

import { MetadataModuleDefinition } from '../script-module-metadata';
import { VirtualNativeModule } from './virtual-apis';

export async function printModule(source: MetadataModuleDefinition) {
   const virtualModule = new VirtualNativeModule(source);
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
      return await prettier.format(resultCode, { parser: 'acorn', printWidth: 120 }); //: resultCode;
   }

   const definitionsCode = await writeCode([...virtualModule.emit()]);
   const exportsCode = await writeCode([...virtualModule.emitVirtualAPIs()]);

   return { definitionsCode, exportsCode };
}
/*
export async function generateModule2(source: MetadataModuleDefinition, apiFilename: string, useFormatting = true) {
   const pathToApi = '../' + apiFilename;
   const moduleName = source.name.split('/')[1] ?? 'unknown';
   const definitionsI = t.i`__`;
   const definitions: ts.Node[] = [
      t.importStarFrom(pathToApi, [classDefinitionI, interfaceBindTypeI, paramsDefinitionI, contextI]),
   ];
   const exportDeclarations: ts.Node[] = [
      t.importAsFrom(definitionsI, `./${moduleName}.native.js`),
      t.importStarFrom(pathToApi, [contextI]),
   ];

   for (const interfaceMetadata of source.interfaces) {
      const node = generateInterfaceDefinition(interfaceMetadata);
      definitions.push(t.call(contextIRegisterType, [t.asIs(interfaceMetadata.name), node]));
   }

   const classesWithResolvedDependencies = resolveDependencies(
      source.classes.map(e => ({ id: e.name, dependencies: e.base_types.map(e => e.name), value: e })),
   );
   for (const classMeta of classesWithResolvedDependencies) {
      const name = classMeta.name;
      const node = generateClassDefinition(classMeta);

      definitions.push(t.exportConst(name, node));
      exportDeclarations.push(t.exportConst(name, t.accessBy(t.accessBy(definitionsI, name), classDefinitionIApi)));
   }

   if (source.enums)
      for (const enumMeta of source.enums) {
         exportDeclarations.push(
            t.createEnum(
               enumMeta.name,
               enumMeta.constants.map(e => [e.name, t.asIs(e.value)]),
            ),
         );
      }

   exportDeclarations.push(t.methodCall(contextI, contextIResolveAllDynamicTypes, []));

   for (const constant of source.constants) {
      exportDeclarations.push(t.exportConst(constant.name, t.asIs(constant.value)));
   }

   for (const object of source.objects) {
      exportDeclarations.push(
         t.exportConst(
            object.name,
            t.methodCall(t.accessBy(definitionsI, object.type.name), classDefinitionICreate, []),
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

function generateClassDefinition(classMeta: MetadataClassDefinition) {
   const classId = classMeta.name;
   const classIdI = t.asIs(classId);
   const parent = classMeta.base_types[0]?.name ? t.i`${classMeta.base_types[0].name}` : t.null;

   function createParamsDefinition(args: MetadataFunctionArgumentDefinition[] = []) {
      return t.createNewCall(paramsDefinitionI, [contextI, t.asIs(args.map(e => ({ ...e, type: e.type })))]);
   }

   const constructorType = classMeta.functions.find(e => e.is_constructor);
   const constructorArgs = createParamsDefinition(constructorType?.arguments);

   let node: ts.Expression = factory.createNewExpression(classDefinitionI, undefined, [
       context  contextI,
       classId classIdI,
       parent  parent,
       constructorParams constructorArgs,
       hasConstructor t.asIs(!!constructorType),
       newExpected  t.asIs(true),
   ]);

   for (const { name, return_type, is_static, arguments: args, is_constructor } of classMeta.functions) {
      if (is_constructor) continue;

      node = t.methodCall(node, is_static ? classDefinitionIAddStaticMethod : classDefinitionIAddMethod, [
         t.asIs(name),
         createParamsDefinition(args),
         createContextResolveType(return_type),
      ]);
   }

   node = addPropertiesToClass(node, classDefinitionAddProperty, classMeta.properties);
   node = addPropertiesToClass(node, classDefinitionAddStaticProperty, classMeta.constants);

   return node;
}

function addPropertiesToClass(
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
            t.methodCall(contextI, contextIResolveType, [t.asIs(property.type)]),
            t.asIs(property.is_read_only),
            'value' in property ? t.asIs(property.value) : undefined,
         ].filter(e => !!e),
      );
   }
   return node;
}

function generateInterfaceDefinition(interfaceMetadata: MetadataInterfaceDefinition) {
   let node: ts.Expression = t.createNewCall(interfaceBindTypeI, [t.asIs(interfaceMetadata.name)]);

   for (const { name, type } of interfaceMetadata.properties) {
      node = t.methodCall(node, interfaceBindTypeIAddProperty, [t.asIs(name), createContextResolveType(type)]);
   }

   return node;
}
*/
