import { Kernel } from '../../kernel';
import { ParamsDefinition, Type } from '../../type-validators';
import { ExecutionContext } from '../execution-context';
import { finalize, FunctionNativeHandler, proxyify, validateReturnType } from './base';

function createFunctionalFunction(
   paramsDefinition: ParamsDefinition,
   returnType: Type,
   contextFactory: (params: ArrayLike<unknown>) => ExecutionContext,
   trimStack: number = 0,
) {
   return (that: unknown, params: ArrayLike<unknown>) => {
      const executionContext = contextFactory(params);
      const { diagnostics, context, methodId } = executionContext;

      // Validate params
      paramsDefinition.validate(diagnostics.errors, executionContext.parameters);

      // Check for diagnostics and report first value
      if (!diagnostics.success) {
         executionContext.dispose();
         throw diagnostics.throw(trimStack + 1);
      }

      // Run
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
export function createFunction(
   fullId: string,
   paramsDefinition: ParamsDefinition,
   returnType: Type,
): FunctionNativeHandler {
   const id = fullId;
   // Build arrow function so the methods are not possible to call with new expression
   const proxyThis: FunctionNativeHandler = proxyify(
      createFunctionalFunction(
         paramsDefinition,
         returnType,

         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
         params => new ExecutionContext(proxyThis, null!, id, Kernel.As(params, 'Array'), null!),
      ),
   );

   // Finalize function properties
   finalize(proxyThis, 0);
   // Return builded method
   return proxyThis;
}
