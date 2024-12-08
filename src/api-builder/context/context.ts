import { MetadataType } from '../../package-builder/script-module-metadata';
import { NativeEvent } from '../events';
import { Kernel } from '../kernel';
import { DynamicType, ParamsDefinition, VoidType, type Type } from '../type-validators';
import { ArrayType } from '../type-validators/types/array';
import { BooleanType } from '../type-validators/types/boolean';
import { FunctionType } from '../type-validators/types/function';
import { BigIntType, NumberType } from '../type-validators/types/number';
import { OptionalType } from '../type-validators/types/optional';
import { StringType } from '../type-validators/types/string';
import { VariantType } from '../type-validators/types/variant';
import { ClassDefinition } from './class-definition';
/*0
import { isGeneratorObject, isPromise } from 'node:util/types';

isGeneratorObject();
isPromise();
*/

export type MethodCallBack = (methodId: string, handle: object, cache: object, definition: ClassDefinition) => unknown;

export class Context extends Kernel.Empty {
   private readonly TYPES = Kernel.Construct('Map') as Map<string, Type>;
   private readonly UNRESOLVED_TYPES = Kernel.Construct('Map') as Map<string, DynamicType>;
   /**
    * Register new type
    * @param name
    * @param type
    */
   public registerType(name: string, type: Type) {
      this.TYPES.set(name, type);
   }
   /**
    * Get dynamic type that will resolve once this.resolveAll is called
    * @param name
    * @returns
    */
   public getDynamicType(name: string) {
      let dynamicType = this.UNRESOLVED_TYPES.get(name);
      if (!dynamicType) {
         this.UNRESOLVED_TYPES.set(name, (dynamicType = new DynamicType()));
      }
      return dynamicType;
   }
   /**
    * Tries to resolve all unresolved types
    */
   public resolveAllDynamicTypes() {
      for (const typeName of this.UNRESOLVED_TYPES.keys()) {
         const resolvedType = this.TYPES.get(typeName);
         if (!resolvedType) continue;
         // It is available trust me!!!
         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
         const unresolvedType = this.UNRESOLVED_TYPES.get(typeName)!;
         unresolvedType.setType(resolvedType);
         this.UNRESOLVED_TYPES.delete(typeName);
      }
   }
   public resolveType(metadataType: MetadataType): Type {
      const { name } = metadataType;

      if (metadataType.is_bind_type) {
         const bindType = this.getDynamicType(metadataType.name);
         if (!bindType) throw Kernel['ReferenceError::constructor']('resolveType - Unknown bind type: ' + name);
         return bindType;
      }

      switch (name) {
         case 'uint8':
         case 'int8':
         case 'uint16':
         case 'int16':
         case 'uint32':
         case 'int32':
         case 'float':
         case 'double':
            return new NumberType(metadataType.valid_range);
         case 'uint64':
         case 'int64':
            return new BigIntType(metadataType.valid_range as unknown as { min: bigint; max: bigint });
         case 'boolean':
            return new BooleanType();
         case 'string':
            return new StringType();
         case 'closure':
            return new FunctionType();
         case 'variant':
            return new VariantType(metadataType.variant_types.map(e => this.resolveType(e)));
         case 'optional':
            return new OptionalType(this.resolveType(metadataType.optional_type));
         case 'undefined':
            return new VoidType();
         case 'array':
            return new ArrayType(this.resolveType(metadataType.element_type));
         case 'promise':
         case 'generator':
         case 'map':
         case 'this':
         case 'iterator':
         default:
            // TODO: Metadata type
            throw new Kernel['ReferenceError::constructor'](`resolveType - Unknown type: ${name}`);
      }
   }

   public constructor() {
      super();
   }
   public readonly nativeHandles = Kernel.Construct('WeakSet');
   public readonly nativeEvents = Kernel.Construct('Map') as ReadonlyMap<
      string,
      NativeEvent<Parameters<MethodCallBack>>
   >;
   public onInvocation<T extends MethodCallBack>(eventName: string, callBack: T) {
      const event = this.nativeEvents.get(eventName);
      if (!event) {
         throw new Kernel['ReferenceError::constructor'](`Unknown methodId specified: ${eventName}`);
      }
      event.subscribe(callBack);
   }
   public isHandleNative(handle: unknown) {
      return this.nativeHandles.has(handle as object);
   }
   // Without first parameter!!!
   public createClassDefinition<T extends ClassDefinition | null>(
      name: string,
      parent: T,
      paramDefinition: ParamsDefinition = new ParamsDefinition(),
      hasConstructor = false,
      newExpected = true,
   ): ClassDefinition<T, object, object> {
      return new ClassDefinition<T, object, object>(this, name, parent, paramDefinition, hasConstructor, newExpected);
   }
}
