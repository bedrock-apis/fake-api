import { APIBuilder } from './api-builder';
import { APIWrapper } from './api-wrapper';
import { NativeEvent } from './events';
import { Kernel } from './kernel';
import { BaseType, ParamsDefinition, VoidType } from './type-validators';
import { ClassBindType } from './type-validators/bind-type';

// Class for single fake api definition

export class ClassDefinition<T extends ClassDefinition | null = null, P = object, S extends object = object> {
  private readonly HANDLE_TO_NATIVE_CACHE = Kernel.Construct('WeakMap');
  private readonly NATIVE_TO_HANDLE_CACHE = Kernel.Construct('WeakMap');
  public readonly onConstruct: NativeEvent<[object, object, this, ArrayLike<unknown>]>;
  public readonly constructorId: string;
  /**
   * TODO: Improve the types tho
   */
  public readonly apiClass: {
    new (...any: unknown[]): P & (T extends ClassDefinition ? T['apiClass']['prototype'] : object);
    readonly name: string;
    readonly prototype: P & (T extends ClassDefinition ? T['apiClass']['prototype'] : object);
  } & S &
    (T extends ClassDefinition ? Omit<T['apiClass'], 'prototype' | 'name'> : object);

  /**
   *
   * @param classId Fake API Class Name
   * @param parent Inject inheritance
   */
  public constructor(
    /**
     * Fake API Class Name
     */
    public readonly classId: string,
    public readonly parent: T,
    public readonly hasConstructor: boolean = false,
    public readonly newExpected: boolean = true,
  ) {
    this.apiClass = APIBuilder.CreateConstructor(this);
    this.constructorId = `${classId}:constructor`;
    if (APIWrapper.NATIVE_EVENTS.has(this.constructorId)) {
      throw new (Kernel.Constructor('ReferenceError'))(`Class with this id already exists '${classId}'`);
    }
    (APIWrapper.NATIVE_EVENTS as unknown as Map<unknown, unknown>).set(
      this.constructorId,
      (this.onConstruct = new NativeEvent()),
    );

    BaseType.registerBindType(classId, new ClassBindType(this as ClassDefinition));
  }

  /**
   *
   * @param params IArguments passed by api context, unpredictable but type safe
   * @returns handle and cache pair
   */
  public construct(params: ArrayLike<unknown>): [object, object] {
    let data = this.parent?.construct(params);
    if (!data) data = [Kernel.__create(null), Kernel.__create(null)];
    const [handle, cache] = data;

    APIWrapper.NATIVE_HANDLES.add(handle);
    this.HANDLE_TO_NATIVE_CACHE.set(handle, cache);
    this.NATIVE_TO_HANDLE_CACHE.set(cache, handle);

    this.onConstruct.trigger(handle, cache, this, params).catch(Kernel.error);

    return data;
  }
  /**
   * If specific handle is type of this definition
   */
  public isThisType(handle: unknown): handle is this['apiClass']['prototype'] {
    return this.HANDLE_TO_NATIVE_CACHE.has(handle as object);
  }

  public addMethod<Name extends string>(
    name: Name,
    isStatic: boolean = false,
    params: ParamsDefinition,
    returnType: BaseType = new VoidType(),
  ) {
    (this.apiClass.prototype as Record<Name, unknown>)[name] = APIBuilder.CreateMethod(
      this,
      name,
      isStatic,
      params,
      returnType,
    );

    return this as ClassDefinition<T, P & Record<Name, (...params: unknown[]) => unknown>>;
  }

  public addProperty<PropertyType, Name extends string>(name: Name, type: string, isReadonly: boolean) {
    // TODO

    return this as ClassDefinition<T, P & Record<Name, PropertyType>>;
  }

  public addStaticProperty<PropertyType, Name extends string>(
    name: Name,
    type: string,
    isReadonly: boolean,
    defaultValue: unknown,
  ) {
    // TODO
    (this.apiClass as Record<Name, unknown>)[name] = defaultValue;

    return this as ClassDefinition<T, P, S & Record<Name, PropertyType>>;
  }

  public __APICall(that: unknown, id: string, params: unknown[]) {
    Kernel.log('call: ' + id);
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
