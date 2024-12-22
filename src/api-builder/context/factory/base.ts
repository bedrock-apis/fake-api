import { Kernel } from '../../kernel';
import { Type } from '../../type-validators';
import { ContextOptions } from '../context-options';
import { ExecutionContext } from '../execution-context';

export type FunctionNativeHandler = (that: unknown, params: ArrayLike<unknown>) => unknown;

export function proxyify<T extends FunctionNativeHandler>(method: T): T {
   // Handle with proxy for support with "this" callback
   const final = new Kernel['globalThis::Proxy'](method, {
      apply(t, that, params) {
         return t(that, params);
      },
   });

   // Return
   return final;
}
export function finalize<T extends FunctionNativeHandler>(method: T, length = 0): T {
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
   Kernel.log(validate);
   returnType.validate(
      validate ? executionContext.diagnostics.errors : executionContext.diagnostics.warns,
      executionContext.result,
   );
}
