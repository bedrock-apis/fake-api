import ts, { factory } from 'typescript';
import { Identifier, NamedImport } from '../codegen/index';
import * as apiBuilder from '../../api-builder';
import { Context } from '../../api-builder/context';

export const API_EXPORTS = new NamedImport('../api.js');
export const TYPES_IDENTIFIER = API_EXPORTS.import(Identifier.Create('Types' satisfies keyof typeof apiBuilder));
export const CONTEXT_IDENTIFIER = API_EXPORTS.import(Identifier.Create('CONTEXT' satisfies keyof typeof apiBuilder));
export const CONTEXT_RESOLVE_TYPE = CONTEXT_IDENTIFIER.access(Identifier.Unique(Context.prototype.resolveType));
export const CONTEXT_CREATE_CLASS = CONTEXT_IDENTIFIER.access(
   Identifier.Unique(Context.prototype.createClassDefinition),
);
export const CONTEXT_RESOLVE_ALL_EXPRESSION = CONTEXT_IDENTIFIER.methodCall(
   Identifier.Unique(Context.prototype.resolveAllDynamicTypes),
);
export const CONTEXT_REGISTER_TYPE = CONTEXT_IDENTIFIER.access(Identifier.Unique(Context.prototype.registerType));
// Types Features
export const INTERFACE_BIND_TYPE_NODE = TYPES_IDENTIFIER.access(Identifier.Unique(apiBuilder.Types.InterfaceBindType));
export const PARAMS_DEFINITION_NODE = TYPES_IDENTIFIER.access(Identifier.Unique(apiBuilder.Types.ParamsDefinition));
export const PARAMS_DEFINITION_FROM = PARAMS_DEFINITION_NODE.access(
   Identifier.Unique(apiBuilder.Types.ParamsDefinition.From),
);
// Identifiers
export const ADD_PROPERTY_IDENTIFIER = Identifier.Unique(apiBuilder.ClassDefinition.prototype.addProperty);
export const ADD_METHOD_IDENTIFIER = Identifier.Unique(apiBuilder.ClassDefinition.prototype.addMethod);
export const NULL_KEYWORD = factory.createNull();
