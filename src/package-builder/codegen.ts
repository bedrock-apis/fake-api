import ts, { factory } from 'typescript';
import { ClassDefinition } from '../api-builder';

// Just for sake of test
import * as prettier from 'prettier';

import { InterfaceBindType } from '../api-builder/type-validators/bind-type';
import { toDefaultType } from '../api-builder/type-validators/default-types';
import {
  MetadataClassDefinition,
  MetadataConstantDefinition,
  MetadataInterfaceDefinition,
  MetadataModuleDefinition,
  MetadataPropertyMemberDefinition,
} from './ScriptModule';
import { TypeScriptAstHelper as t } from './ts-ast-helper';
import { BaseType } from '../api-builder/type-validators';

const CLASS_DEFINITION_IDENTITY = t.i`${ClassDefinition.name}`;
const CLASS_DEFINITION_IDENTITY_API_CLASS_PROPERTY = 'apiClass' satisfies keyof ClassDefinition;
const CLASS_DEFINITION_IDENTITY_ADD_METHOD = 'addMethod' satisfies keyof ClassDefinition;
const CLASS_DEFINITION_IDENTITY_ADD_PROPERTY = 'addProperty' satisfies keyof ClassDefinition;

const INTERFACE_BIND_TYPE_IDENTITY = t.i`${InterfaceBindType.name}`;
const INTERFACE_BIND_TYPE_IDENTITY_ADD_PROPERTY = 'addProperty' satisfies keyof InterfaceBindType;
const REGISTRY_EXPRESSION = t.accessBy(t.i`${BaseType.name}`, BaseType.registerBindType.name);

export async function generateModule(source: MetadataModuleDefinition, useFormatting = true) {
  const MODULE_NAME = source.name.split('/')[1] ?? 'unknown';
  const DEFINITIONS_IDENTITY = t.i`__defs`;
  const definitions: ts.Node[] = [];
  const exportDeclarations: ts.Node[] = [t.importAsFrom(DEFINITIONS_IDENTITY, `./${MODULE_NAME}.native.js`)];

  for (const interfaceMetadata of source.interfaces) {
    const node = GenerateInterface(interfaceMetadata);
    definitions.push(t.call(REGISTRY_EXPRESSION, [node]));
  }

  for (const classMeta of source.classes) {
    const name = classMeta.name;

    const node = GenerateClass(classMeta);

    definitions.push(t.exportConst(name, node));
    exportDeclarations.push(
      t.exportConst(
        name,
        t.accessBy(t.accessBy(DEFINITIONS_IDENTITY, name), CLASS_DEFINITION_IDENTITY_API_CLASS_PROPERTY),
      ),
    );
  }

  if (source.enums)
    for (const enumMeta of source.enums) {
      exportDeclarations.push(
        t.createEnum(
          enumMeta.name,
          enumMeta.constants.filter(e => !!e.name && !!e.value).map(e => [e.name, t.v(e.value)]),
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
        t.v(property.name),
        t.v(toDefaultType(property.type)),
        t.v(property.is_read_only),
        'value' in property ? t.v(property.value) : undefined,
      ].filter(e => !!e),
    );
  }
  return node;
}

function GenerateClass(classMeta: MetadataClassDefinition) {
  const name = classMeta.name;
  const nameString = t.v(name);
  const baseClass = classMeta.base_types[0]?.name ? t.v(classMeta.base_types[0].name) : t.v(null);

  let node: ts.Expression = factory.createNewExpression(CLASS_DEFINITION_IDENTITY, undefined, [nameString, baseClass]);

  for (const method of classMeta.functions) {
    const paramTypes = t.v(method.arguments.map(e => ({ ...e, type: toDefaultType(e.type) })));

    if (method.is_constructor) {
      console.log('SKIPPED CONSTRUCTOR for ', classMeta.name);
    } else {
      node = t.methodCall(node, CLASS_DEFINITION_IDENTITY_ADD_METHOD, [
        t.v(method.name),
        paramTypes,
        t.v(toDefaultType(method.return_type)),
      ]);
    }
  }

  node = addProperties(node, CLASS_DEFINITION_IDENTITY_ADD_PROPERTY, classMeta.properties);
  node = addProperties(node, CLASS_DEFINITION_IDENTITY_ADD_PROPERTY, classMeta.constants);

  return node;
}

function GenerateInterface(interfaceMetadata: MetadataInterfaceDefinition) {
  const name = interfaceMetadata.name;

  let node: ts.Expression = factory.createNewExpression(INTERFACE_BIND_TYPE_IDENTITY, undefined, [t.v(name)]);

  for (const { is_read_only, is_static, name, type } of interfaceMetadata.properties) {
    node = t.methodCall(node, INTERFACE_BIND_TYPE_IDENTITY_ADD_PROPERTY, [
      t.v(name),
      t.v(type.name),
      t.v('optional_type' in type),
    ]);
  }

  return node;
}
