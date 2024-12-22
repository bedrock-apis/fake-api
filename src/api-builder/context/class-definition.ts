import { ContextPanicError, Diagnostics, PANIC_ERROR_MESSAGES } from '../diagnostics';
import { NativeEvent } from '../events';
import { Kernel } from '../kernel';
import { ParamsDefinition, Type, VoidType } from '../type-validators';
import { ClassBindType } from '../type-validators/types/class';
import { createConstructorFor, createGetterFor, createMethodFor, createSetterFor } from './factory';
import type { Context } from './context';
import { ConstructionExecutionContext, ExecutionContext } from './execution-context';
// Class for single fake api definition

export class ClassDefinition<
   T extends ClassDefinition | null = null,
   P = object,
   S extends object = object,
   NAME extends string = string,
> extends Kernel.Empty {
   private readonly HANDLE_TO_NATIVE_CACHE = Kernel.Construct('WeakMap');
   private readonly NATIVE_TO_HANDLE_CACHE = Kernel.Construct('WeakMap');
   public readonly virtualApis = Kernel.Construct('Map') as Map<string, (...args: unknown[]) => unknown>;
   public readonly onConstruct: NativeEvent<[handle: object, cache: object, this, ConstructionExecutionContext]>;
   public readonly constructorId: string;
   public readonly type: Type;
   public readonly hasConstructor: boolean;
   public readonly invocable = Kernel.Construct('WeakMap') as WeakMap<
      CallableFunction,
      NativeEvent<[handle: object, cache: object, this, ExecutionContext]>
   >;
   private addInvocable(id: string, method: (...args: unknown[]) => unknown) {
      this.virtualApis.set(id, method);
      const event = new NativeEvent();
      this.invocable.set(method, event);
      (this.context.nativeEvents as Map<unknown, unknown>).set(id, event);
   }
   /**
    * TODO: Improve the types tho
    */
   public readonly api: {
      new (...any: unknown[]): P & (T extends ClassDefinition ? T['api']['prototype'] : object);
      readonly name: NAME;
      readonly prototype: P & (T extends ClassDefinition ? T['api']['prototype'] : object);
   } & S &
      (T extends ClassDefinition ? Omit<T['api'], 'prototype' | 'name'> : object);

   public getAPIMethod<T extends keyof P>(name: T) {
      return this.virtualApis.get(`${this.classId}::${name.toString()}`) as P[typeof name];
   }
   /**
    *
    * @param classId Fake API Class Name
    * @param parent Inject inheritance
    */
   public constructor(
      public readonly context: Context,
      /**
       * Fake API Class Name
       */
      public readonly classId: string,
      public readonly parent: T,
      public readonly constructorParams: ParamsDefinition | null,
      public readonly newExpected: boolean = true,
   ) {
      super();
      this.hasConstructor = Kernel['Boolean::constructor'](constructorParams);
      this.api = createConstructorFor(this, constructorParams ?? new ParamsDefinition());
      this.constructorId = `${classId}:constructor`;
      if (context.nativeEvents.has(this.constructorId)) {
         throw new Kernel['ReferenceError::constructor'](`Class with this id already exists '${classId}'`);
      }
      (context.nativeEvents as unknown as Map<unknown, unknown>).set(
         this.constructorId,
         (this.onConstruct = new NativeEvent()),
      );
      this.virtualApis.set(this.constructorId, this.api as () => unknown);
      context.registerType(classId, (this.type = new ClassBindType(this as ClassDefinition)));
   }

   /**
    *
    * @returns New Virtual API Instance of the handle
    */
   public create(): this['api']['prototype'] {
      const [handle] = Kernel.ArrayIterator(
         this.__construct(
            new ConstructionExecutionContext(null, this as ClassDefinition, this.classId, Kernel.Construct('Array')),
         ),
      );
      return Kernel.__setPrototypeOf(handle, this.api.prototype);
   }
   /**
    * If specific handle is type of this definition
    */
   public isThisType(handle: unknown): handle is this['api']['prototype'] {
      return this.HANDLE_TO_NATIVE_CACHE.has(handle as object);
   }

   public addMethod<Name extends string>(
      name: Name,
      params: ParamsDefinition = new ParamsDefinition(),
      returnType: Type = new VoidType(),
   ) {
      const method = ((this.api.prototype as Record<Name, unknown>)[name] = createMethodFor(
         this,
         name,
         params,
         returnType,
      ));
      const id = `${this.classId}::${name}`;
      this.addInvocable(id, method as () => unknown);
      return this as ClassDefinition<T, P & Record<Name, (...params: unknown[]) => unknown>, S, NAME>;
   }

   public addProperty<Name extends string>(name: Name, type: Type, isReadonly: boolean) {
      // TODO

      const getter = createGetterFor(this as ClassDefinition, name, type);
      const setter = isReadonly ? undefined : createSetterFor(this as ClassDefinition, name, type);
      Kernel.__defineProperty(this.api.prototype, name, {
         configurable: true,
         enumerable: true,
         get: getter as () => void,
         set: setter as (n: unknown) => void,
      });

      this.addInvocable(`${this.classId}::${name} getter`, getter as () => unknown);
      if (setter) this.addInvocable(`${this.classId}::${name} setter`, setter as () => unknown);
      return this as ClassDefinition<T, P & Record<Name, unknown>, S>;
   }

   public addStaticFunction<Name extends string>(
      name: Name,
      params: ParamsDefinition = new ParamsDefinition(),
      returnType: Type = new VoidType(),
   ) {
      //throw new ContextPanicError(PANIC_ERROR_MESSAGES.NoImplementation);
      return this as ClassDefinition<T, P, S & Record<Name, (...params: unknown[]) => unknown>, NAME>;
   }

   public addStaticConstant<PropertyType, Name extends string>(
      name: Name,
      type: string,
      isReadonly: boolean,
      defaultValue: unknown,
   ) {
      // TODO
      // (this.api as Record<Name, unknown>)[name] = defaultValue;
      Kernel.warn(new ContextPanicError(PANIC_ERROR_MESSAGES.NoImplementation));
      return this as ClassDefinition<T, P, S & Record<Name, PropertyType>, NAME>;
   }

   /**
    *
    * @param params IArguments passed by api context, unpredictable but type safe
    * @returns handle and cache pair
    */
   public __construct(context: ConstructionExecutionContext): [object, object] {
      let data = this.parent?.__construct(context);
      if (!data) data = Kernel.Construct('Array', Kernel.__create(null), Kernel.__create(null)) as [object, object];
      const [handle, cache] = Kernel.ArrayIterator(data) as unknown as [object, object];

      this.context.nativeHandles.add(handle);
      this.HANDLE_TO_NATIVE_CACHE.set(handle, cache);
      this.NATIVE_TO_HANDLE_CACHE.set(cache, handle);

      const results = this.onConstruct.invoke(handle, cache, this, context);
      if (results.successCount !== results.totalCount) {
         // TODO: Some exceptions were throw by plugin calls
      }

      return data;
   }
   public __call(context: ExecutionContext) {
      if (context.self) {
         const event = this.invocable.get(context.self as (...params: unknown[]) => unknown);
         if (event) {
            const result = event.invoke(
               // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
               context.handle!,
               // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
               this.HANDLE_TO_NATIVE_CACHE.get(context.handle!)!,
               this,
               context,
            );
            if (result.successCount !== result.totalCount) {
               Kernel.log(result);
            }
         }
      }
   }

   /**
    * TRASH HERE
    * @param factory
    * @returns
    */
   /*
    setConstructFunction(factory: (cache: any, definition: this, handle: object, data: any) => object){
        this.factory = factory;
        return this;
    }
    setHasConstructor(hasConstructor){
        this.hasConstructor = hasConstructor??false;
        return this;
    }
    setNewExpected(newExpected){
        this.newExpected = newExpected??false;
        return this;
    }
    CreateNativeInstance(data){
        const pub = {};
        const cache = {};
        this.__nativeConstruct(cache, pub, data, this);
        nativeObjects.add(pub);
        return pub;
    }
    AddMethod(name, functionValidator){
        APIBuilder.CreateMethod(this, this.className + "::" + name, )
    }
    GetCache(handle){ return this.cache.get(handle); }
    FreeHandle(handle){
        const a = this.cache.get(handle);
        this.native.delete(a);
        this.cache.delete(handle);
        nativeObjects.delete(handle);
    }
    FreeObject(cache){
        const a = this.native.get(cache);
        this.native.delete(cache);
        this.cache.delete(a);
        nativeObjects.delete(a);
    }
    __isThisType(data){
        return this.cache.has(data);
    }
    __nativeConstruct(cache, pub, data, newTarget){
        if(this.parent) this.parent.__nativeConstruct(cache, pub, data, newTarget);
        this.factory(cache, newTarget, pub, data);
        this.cache.set(pub, cache);
        this.native.get(cache, pub);
    }
    __constructionCallBack(...params){
        return  this.CreateNativeInstance(this.dataBuilder(...params));
    }
    __methodCall(cache, handle, id, ...params){
        return 5;
    }*/
}
