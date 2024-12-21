import { API_ERRORS_MESSAGES, ErrorFactory, WARNING_ERROR_MESSAGES } from '../../diagnostics';
import { Kernel } from '../../kernel';
import { Type } from '../../type-validators';
import { ClassDefinition } from '../class-definition';
import { ContextOptions } from '../context-options';
import { ExecutionContext } from '../execution-context';
import { finalize, FunctionNativeHandler, proxyify, validateReturnType } from './base';

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

   finalize(proxyThis, 1);
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

   finalize(proxyThis, 0);
   return proxyThis;
}
