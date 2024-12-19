import { API_ERRORS_MESSAGES, ErrorFactory, QUICK_JS_ENV_ERROR_MESSAGES, WARNING_ERROR_MESSAGES } from '../diagnostics';
import { Kernel } from '../kernel';
import { ParamsDefinition, Type } from '../type-validators';
import { ClassDefinition } from './class-definition';
import { ContextOptions } from './context-options';
import { ConstructionExecutionContext, ExecutionContext } from './execution-context';

export type FunctionNativeHandler = (that: unknown, params: ArrayLike<unknown>) => unknown;

function createFunctionalConstructor(
   paramsDefinition: ParamsDefinition,
   contextFactory: (params: ArrayLike<unknown>) => ConstructionExecutionContext,
   trimStack: number = 0,
): new () => unknown {
   // Create function as constructor
   // @ts-expect-error We want to explicitly show that this is unsafe & un_isolated array
   return function ctor(...params: ArrayLike<unknown>) {
      const executionContext = contextFactory(params);
      const { definition, diagnostics } = executionContext;
      // Constructor should be callable only with "NEW" keyword
      if (!new.target && definition.newExpected) diagnostics.errors.report(QUICK_JS_ENV_ERROR_MESSAGES.NewExpected());

      // If constructor is present for this class
      if (!definition.hasConstructor) diagnostics.errors.report(API_ERRORS_MESSAGES.NoConstructor(definition.classId));

      // Validate Errors
      paramsDefinition.validate(diagnostics.errors, executionContext.parameters);

      // Checks
      if (!diagnostics.success) {
         executionContext.dispose();
         throw diagnostics.throw(trimStack + 1);
      }

      // Call Native constructor and sets its result as new.target.prototype
      const result = Kernel.__setPrototypeOf(
         definition.__construct(executionContext)[0],
         new.target?.prototype ?? definition.api.prototype,
      );
      if (executionContext.error) {
         throw executionContext.error.throw(trimStack + 1);
      }

      executionContext.dispose();
      // Checks 2
      if (!diagnostics.success) {
         // TODO: What design of our plugin system we want right?
         // definition.__reports(executionContext);
         throw diagnostics.throw(trimStack + 1);
      }
      return result;
   };
}
function createFunctionalMethod(
   paramsDefinition: ParamsDefinition,
   returnType: Type,
   contextFactory: (...params: Parameters<FunctionNativeHandler>) => ExecutionContext,
   trimStack: number = 0,
): FunctionNativeHandler {
   return (that: unknown, params: ArrayLike<unknown>) => {
      const executionContext = contextFactory(that, params);
      const { diagnostics, context, definition, methodId } = executionContext;

      // Check if the object has native bound
      if (!context.nativeHandles.has(that as object))
         diagnostics.errors.report(API_ERRORS_MESSAGES.NativeBound('function', methodId));
      // Validate correctness of this type
      definition.type.validate(diagnostics.errors, that);
      // Validate params
      paramsDefinition.validate(diagnostics.errors, executionContext.parameters);

      // Check for diagnostics and report first value
      if (!diagnostics.success) {
         executionContext.dispose();
         throw diagnostics.throw(trimStack + 1);
      }

      definition.__call(executionContext);
      if (executionContext.error) {
         throw executionContext.error.throw(trimStack + 1);
      }

      // TODO: Shouldn't throw as execution context.dispose should be always called
      validateReturnType(executionContext, returnType);

      executionContext.dispose();

      // Checks 2
      if (!diagnostics.success) {
         // TODO: What design of our plugin system we want right?
         // definition.__reports(executionContext);
         // +1 proxyify
         throw diagnostics.throw(trimStack + 1);
      }
      // TODO: Implement privileges and type checking
      //if(currentPrivilege && currentPrivilege !== functionType.privilege) throw new ErrorConstructors.NoPrivilege(ErrorMessages.NoPrivilege("function", id));
      //let error = functionType.ValidArgumentTypes(params);
      //if(error) throw new error.ctor(error.message);

      return executionContext.result;
   };
}
function createFunctionalSetter(
   type: Type,
   contextFactory: (...params: Parameters<FunctionNativeHandler>) => ExecutionContext,
): FunctionNativeHandler {
   return (that: unknown, params: ArrayLike<unknown>) => {
      const executionContext = contextFactory(that, params);
      const { diagnostics, context, definition, methodId } = executionContext;

      // Check if the object has native bound
      if (!context.nativeHandles.has(that as object))
         diagnostics.errors.report(API_ERRORS_MESSAGES.NativeBound('setter', methodId));

      // Validate params
      type.validate(diagnostics.errors, params[0]);

      // Validate correctness of this type
      // If that fails it should throw "Failed to set member"
      definition.type.validate(diagnostics.errors, that);

      // Check for diagnostics and report first value
      if (!diagnostics.success) {
         executionContext.dispose();
         throw diagnostics.throw(1 + 1);
      }

      definition.__call(executionContext);
      if (executionContext.error) {
         throw executionContext.error.throw(1 + 1);
      }

      // TODO: Implement privileges and type checking
      //if(currentPrivilege && currentPrivilege !== functionType.privilege) throw new ErrorConstructors.NoPrivilege(ErrorMessages.NoPrivilege("function", id));
      //let error = functionType.ValidArgumentTypes(params);
      //if(error) throw new error.ctor(error.message);

      if (executionContext.result !== undefined)
         diagnostics.warns.report(
            ErrorFactory.New(
               WARNING_ERROR_MESSAGES.SettersShouldReturnUndefined(methodId),
               Kernel['TypeError::constructor'],
            ),
         );
      executionContext.dispose();

      // Checks 2
      if (!diagnostics.success) {
         // TODO: What design of our plugin system we want right?
         // definition.__reports(executionContext);
         throw diagnostics.throw(1 + 1);
      }
      return undefined;
   };
}
function createFunctionalGetter(
   type: Type,
   contextFactory: (...params: Parameters<FunctionNativeHandler>) => ExecutionContext,
): FunctionNativeHandler {
   return (that: unknown, params: ArrayLike<unknown>) => {
      const executionContext = contextFactory(that, params);
      const { diagnostics, context, definition, methodId } = executionContext;
      // Check if the object has native bound
      if (!definition.context.nativeHandles.has(that as object)) {
         diagnostics.errors.report(API_ERRORS_MESSAGES.NativeBound('getter', methodId));
      }

      // Validate correctness of this type
      definition.type.validate(diagnostics.errors, that);

      // Check for diagnostics and report first value
      if (!diagnostics.success) {
         executionContext.dispose();
         if (!definition.context.getConfigProperty(ContextOptions.GetterRequireValidBound)) return undefined;
         throw diagnostics.throw(1 + 1);
      }

      definition.__call(executionContext);

      if (executionContext.error) {
         throw executionContext.error.throw(1 + 1);
      }

      validateReturnType(executionContext, type);

      executionContext.dispose();
      // Checks 2
      if (!diagnostics.success) {
         // TODO: What design of our plugin system we want right?
         // definition.__reports(executionContext);

         throw diagnostics.throw(1 + 1);
      }
      // TODO: Implement privileges and type checking
      //if(currentPrivilege && currentPrivilege !== functionType.privilege) throw new ErrorConstructors.NoPrivilege(ErrorMessages.NoPrivilege("function", id));
      //let error = functionType.ValidArgumentTypes(params);
      //if(error) throw new error.ctor(error.message);

      return executionContext.result;
   };
}
export function createConstructorFor<T extends ClassDefinition<ClassDefinition | null, unknown>>(
   definition: T,
   paramsDefinition: ParamsDefinition,
): T['api'] {
   // Create function as constructor
   const ctor = createFunctionalConstructor(
      paramsDefinition,
      params =>
         new ConstructionExecutionContext(
            ctor,
            definition as ClassDefinition,
            `${definition.classId}::constructor`,
            Kernel.As(params, 'Array'),
         ),
      0,
   );

   // Create new prototype with this constructor function
   ctor.prototype = { constructor: ctor };

   // Check for inheritance
   const parent = definition.parent;
   if (parent) {
      Kernel.__setPrototypeOf(ctor, parent.api);
      Kernel.__setPrototypeOf(ctor.prototype, parent.api.prototype);
   }

   // Final sealing so the class has readonly prototype
   Kernel.SetClass(ctor, definition.classId);

   // return the Fake API Class
   return ctor as T['api'];
}
export function createMethodFor<T extends ClassDefinition<ClassDefinition | null, unknown>>(
   definition: T,
   name: string,
   paramsDefinition: ParamsDefinition,
   returnType: Type,
): FunctionNativeHandler {
   const id = `${definition.classId}::${name}`;
   // Build arrow function so the methods are not possible to call with new expression
   const proxyThis: FunctionNativeHandler = proxyify(
      createFunctionalMethod(
         paramsDefinition,
         returnType,
         (that, params) =>
            new ExecutionContext(
               proxyThis,
               definition as ClassDefinition,
               id,
               Kernel.As(params, 'Array'),
               that as object,
            ),
      ),
   );

   // Finalize function properties
   finalizeFunction(proxyThis, 0);
   // Return builded method
   return proxyThis;
}
export function createSetterFor<T extends ClassDefinition<ClassDefinition | null>>(
   definition: T,
   name: string,
   paramType: Type,
) {
   const id = `${definition.classId}::${name} setter`;
   // Build arrow function so the methods are not possible to call with new expression

   // for setters virtual number of params is always 1
   const proxyThis: FunctionNativeHandler = proxyify(
      createFunctionalSetter(
         paramType,
         (that, params) =>
            new ExecutionContext(
               proxyThis,
               definition as ClassDefinition,
               id,
               Kernel.As(params, 'Array'),
               that as object,
            ),
      ),
   );

   finalizeFunction(proxyThis, 1);
   return proxyThis;
}
export function createGetterFor<T extends ClassDefinition<ClassDefinition | null>>(
   definition: T,
   name: string,
   type: Type,
) {
   const id = `${definition.classId}::${name} getter`;
   // Build arrow function so the methods are not possible to call with new expression
   const proxyThis: FunctionNativeHandler = proxyify(
      createFunctionalGetter(
         type,
         (that, params) =>
            new ExecutionContext(
               proxyThis,
               definition as ClassDefinition,
               id,
               Kernel.As(params, 'Array'),
               that as object,
            ),
      ),
   );

   finalizeFunction(proxyThis, 0);
   return proxyThis;
}
function proxyify<T extends FunctionNativeHandler>(method: T): T {
   // Handle with proxy for support with "this" callback
   const final = new Kernel['globalThis::Proxy'](method, {
      apply(t, that, params) {
         return t(that, params);
      },
   });

   // Return
   return final;
}
function finalizeFunction<T extends FunctionNativeHandler>(method: T, length = 0): T {
   // Mark function as native
   Kernel.SetFakeNative(method);

   // Set virtual number of params
   Kernel.SetLength(method, length);

   // All these names of methods are empty
   Kernel.SetName(method, '');

   return method;
}
export function validateReturnType(executionContext: ExecutionContext, returnType: Type) {
   const validate = executionContext.context.getConfigProperty(ContextOptions.StrictReturnTypes);
   returnType.validate(
      validate ? executionContext.diagnostics.errors : executionContext.diagnostics.warns,
      executionContext.result,
   );
}
