import { APIWrapper } from './api-wrapper';
import { ClassDefinition } from './class-definition';
import { Errors } from './errors';
import { Kernel } from './kernel';
import { BaseType, ParamsDefinition } from './type-validators';

export class APIBuilder {
  /**
   * Builds new Fake API Class
   * @param definition Class Definition
   * @returns API Class function
   */
  public static CreateConstructor<T extends ClassDefinition<ClassDefinition | null, unknown>>(definition: T) {
    // Create function as constructor
    const ctor = function () {
      // Constructor should be callable only with "NEW" keyword
      if (!new.target) throw new (Kernel.Constructor('TypeError'))('must be called with new');

      // If constructor is present for this class
      if (!definition.hasConstructor) Errors.NoConstructor(definition.classId).Throw();

      // TODO: Implement type checking
      // const error = functionType.ValidArgumentTypes(arguments);
      //if(error) throw new error.ctor(error.message)

      // Call Native constructor and sets its result as new.target.prototype
      // eslint-disable-next-line prefer-rest-params
      const result = Kernel.__setPrototypeOf(definition.construct(arguments)[0], new.target.prototype);
      return result;
    };

    // Create new prototype with this constructor function
    ctor.prototype = { constructor: ctor };

    // Check for inheritance
    const parent = definition.parent;
    if (parent) {
      Kernel.__setPrototypeOf(ctor, parent.apiClass);
      Kernel.__setPrototypeOf(ctor.prototype, parent.apiClass.prototype);
    }

    // Final sealing so the class has readonly prototype
    Kernel.SetClass(ctor, definition.classId);

    // return the Fake API Class
    return ctor as T['apiClass'];
  }

  /**
   * @param definition Class Definition
   * @param id Name of the function
   * @returns Fake API Functions
   */
  public static CreateMethod<T extends ClassDefinition<ClassDefinition | null, unknown>>(
    definition: T,
    id: string,
    isStatic: boolean,
    params: ParamsDefinition,
    returnType: BaseType,
  ) {
    // Build arrow function so the methods are not possible to call with new expression
    const ctor = (that: unknown, params: unknown[]) => {
      // Check if the object has native bound
      if (!APIWrapper.NATIVE_HANDLES.has(that as object))
        throw new (Kernel.Constructor('ReferenceError'))(
          `Native function [${definition.classId}::${id}] object bound to prototype does not exist.`,
        );

      // TODO: Implement privileges and type checking
      //if(currentPrivilege && currentPrivilege !== functionType.privilege) throw new ErrorConstructors.NoPrivilege(ErrorMessages.NoPrivilege("function", id));
      //let error = functionType.ValidArgumentTypes(params);
      //if(error) throw new error.ctor(error.message);

      // TODO: Yes
      const results = null; /*definition.__APICall(that, id, params);*/

      // TODO: Implement Type checking
      //error = functionType.ResolveReturnType(returnKind);
      //if(error) throw new error.ctor(error.message);

      return results;
    };

    // Mark function as native
    Kernel.SetFakeNative(ctor);

    // Set virtual number of params to 0
    Kernel.SetLength(ctor, 0);

    // Assign name to this function
    Kernel.SetName(ctor, id);

    // Handle with proxy for support with "this" callback
    const final = new Kernel['globalThis::Proxy'](ctor, {
      apply(t, that, params) {
        return (t as typeof ctor)(that, params);
      },
    });

    // Set the proxy also as native
    Kernel.SetFakeNative(final);

    // Return
    return final;
  }

  /**@param {APIClassDefinition} definition @param {FunctionValidator} functionType  */ /*
    static CreateSetter(definition, id, functionType){
        const ctor = (that, params)=>{
            if(!nativeObjects.has(that)) throw new ErrorConstructors.BoundToPrototype(ErrorMessages.BoundToPrototype("property setter",id));
            let error = functionType.ValidArgumentTypes(params);
            if(error) throw new error.ctor(error.message);
            const cache = definition.cache.get(that);
            if(!cache) return undefined;
            const returnKind = definition.__methodCall(cache, that, id, ...params);            
            error = functionType.ResolveReturnType(returnKind);
            if(error) throw new error.ctor(error.message);
            return returnKind;
        };
        Kernel.SetFakeNative(ctor);
        Kernel.SetLength(ctor, 0);
        Kernel.SetName(ctor, "");

        const final = new Proxy(ctor, {apply(t,that,params){return t(that,params)}});
        Kernel.SetFakeNative(final);
        return final;
    }*/
}
