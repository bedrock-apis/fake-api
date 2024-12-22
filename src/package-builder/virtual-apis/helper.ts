import ts, { factory } from 'typescript';
import { ParamsDefinition } from '../../api-builder/type-validators';
import { MetadataFunctionDefinition } from '../../script-module-metadata';
import { TsNode, ValueLiteral } from '../codegen/index';
import { CONTEXT_IDENTIFIER, NULL_KEYWORD, PARAMS_DEFINITION_FROM, PARAMS_DEFINITION_NODE } from './constants';

export function constructParams(meta: MetadataFunctionDefinition['arguments']) {
   return PARAMS_DEFINITION_FROM.invoke([CONTEXT_IDENTIFIER, rawASTFor(meta)]);
}

export function mapToRecord<T extends { name: string }[]>(array: T): { [key: string]: T[number] } {
   const map: { [key: string]: T[number] } = {};
   for (const v of array) map[v.name] = v;
   return map;
}

export function rawASTFor(object: unknown): TsNode {
   switch (typeof object) {
      case 'boolean':
      case 'number':
      case 'string':
      case 'undefined':
         return ValueLiteral.GetValue(object);
      case 'object':
         return rawObject(object);
      default:
         throw new TypeError(`Unsupported raw type: ${typeof object}`);
   }
}
function rawObject<O extends object>(object: O | null) {
   if (object === null) return NULL_KEYWORD;
   if (Array.isArray(object)) return factory.createArrayLiteralExpression(object.map(rawASTFor) as ts.Expression[]);
   const keys = Object.getOwnPropertyNames(object) as (keyof O)[];
   return factory.createObjectLiteralExpression(
      keys.map(
         key =>
            factory.createPropertyAssignment(
               factory.createStringLiteral(key as string),
               rawASTFor(object[key]) as ts.Expression,
            ) as ts.PropertyAssignment,
      ),
      true,
   );
}
