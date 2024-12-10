import { Diagnostics, ERRORS } from '../errors';
import { Kernel } from '../kernel';
import { ParamsDefinition, Type } from '../type-validators';
import { ClassDefinition } from './class-definition';
import { ConstructionExecutionContext, ExecutionContext } from './execution-context';

export class APIBuilder extends Kernel.Empty {
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //////////////////////////////////////////////////// CREATE CONSTRUCTOR /////////////////////////////////////////
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Builds new Fake API Class
    * @param definition Class Definition
    * @returns API Class function
    */
   public static CreateConstructor<T extends ClassDefinition<ClassDefinition | null, unknown>>(
      definition: T,
      paramsDefinition: ParamsDefinition,
   ) {
      // Create function as constructor
      // @ts-expect-error We want to explicitly show that this is unsafe & un_isolated array
      const ctor = function (...params: ArrayLike<unknown>) {
         const diagnostics = new Diagnostics();
         const executionContext = new ConstructionExecutionContext(
            definition as ClassDefinition,
            'constructor',
            Kernel.As(params, 'Array'),
            diagnostics,
         );
         // Constructor should be callable only with "NEW" keyword
         if (!new.target && definition.newExpected) diagnostics.report(ERRORS.NewExpected);

         // If constructor is present for this class
         if (!definition.hasConstructor) diagnostics.report(ERRORS.NoConstructor(definition.classId));

         // Validate Errors
         paramsDefinition.validate(diagnostics, executionContext.parameters);

         // Checks
         if (!diagnostics.success) {
            definition.__reports(executionContext);
            diagnostics.throw(1);
         }

         // Call Native constructor and sets its result as new.target.prototype
         const result = Kernel.__setPrototypeOf(
            definition.__construct(executionContext)[0],
            new.target?.prototype ?? definition.api.prototype,
         );

         // Checks 2
         if (!diagnostics.success) {
            // TODO: What design of our plugin system we want right?
            // definition.__reports(executionContext);
            diagnostics.throw(1);
         }
         return result;
      };

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

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //////////////////////////////////////////////////// CREATE METHOD /////////////////////////////////////////
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * @param definition Class Definition
    * @param name Name of the function
    * @returns Fake API Functions
    */
   public static CreateMethod<T extends ClassDefinition<ClassDefinition | null, unknown>>(
      definition: T,
      name: string,
      paramsDefinition: ParamsDefinition,
      returnType: Type,
   ) {
      const id = `${definition.classId}::${name}`;
      // Build arrow function so the methods are not possible to call with new expression
      const method = (that: unknown, params: ArrayLike<unknown>) => {
         const diagnostics = new Diagnostics();
         const executionContext = new ExecutionContext(
            definition as ClassDefinition,
            id,
            Kernel.As(params, 'Array'),
            diagnostics,
            that as object,
         );
         // Check if the object has native bound
         if (!definition.context.nativeHandles.has(that as object))
            diagnostics.report(ERRORS.BoundToPrototype('function', id));
         // Validate correctness of this type
         definition.type.validate(diagnostics, that);
         // Validate params
         paramsDefinition.validate(diagnostics, executionContext.parameters);

         // Check for diagnostics and report first value
         if (!diagnostics.success) {
            definition.__reports(executionContext);
            diagnostics.throw(1);
         }

         definition.__call(executionContext);

         returnType.validate(diagnostics, executionContext.result);

         // Checks 2
         if (!diagnostics.success) {
            // TODO: What design of our plugin system we want right?
            // definition.__reports(executionContext);
            diagnostics.throw(1);
         }
         // TODO: Implement privileges and type checking
         //if(currentPrivilege && currentPrivilege !== functionType.privilege) throw new ErrorConstructors.NoPrivilege(ErrorMessages.NoPrivilege("function", id));
         //let error = functionType.ValidArgumentTypes(params);
         //if(error) throw new error.ctor(error.message);

         return executionContext.result;
      };

      return this.Finalize(method, 0);
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //////////////////////////////////////////////////// CREATE SETTER /////////////////////////////////////////
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////

   public static CreateSetter<T extends ClassDefinition<ClassDefinition | null>>(
      definition: T,
      name: string,
      paramType: Type,
   ) {
      const id = `${definition.classId}::${name}`;
      // Build arrow function so the methods are not possible to call with new expression
      const method = (that: unknown, params: ArrayLike<unknown>) => {
         const diagnostics = new Diagnostics();
         const executionContext = new ExecutionContext(
            definition as ClassDefinition,
            id + ' setter',
            Kernel['Array::constructor'](params),
            diagnostics,
            that as object,
         );

         // Check if the object has native bound
         if (!definition.context.nativeHandles.has(that as object))
            diagnostics.report(ERRORS.BoundToPrototype('setter', id));

         // Validate params
         paramType.validate(diagnostics, params[0]);

         // Validate correctness of this type
         // If that fails it should throw "Failed to set member"
         definition.type.validate(diagnostics, that);

         // Check for diagnostics and report first value
         if (!diagnostics.success) {
            definition.__reports(executionContext);
            diagnostics.throw(1);
         }

         definition.__call(executionContext);

         // Checks 2
         if (!diagnostics.success) {
            // TODO: What design of our plugin system we want right?
            // definition.__reports(executionContext);
            diagnostics.throw(1);
         }
         // TODO: Implement privileges and type checking
         //if(currentPrivilege && currentPrivilege !== functionType.privilege) throw new ErrorConstructors.NoPrivilege(ErrorMessages.NoPrivilege("function", id));
         //let error = functionType.ValidArgumentTypes(params);
         //if(error) throw new error.ctor(error.message);

         if (executionContext.result !== undefined)
            diagnostics.warn(
               'Result should be always undefined for property setter methods: ' + id,
               Kernel['TypeError::constructor'],
            );

         return undefined;
      };

      // for setters virtual number of params is always 1
      return this.Finalize(method, 1);
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //////////////////////////////////////////////////// CREATE GETTER /////////////////////////////////////////
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////

   public static CreateGetter<T extends ClassDefinition<ClassDefinition | null>>(
      definition: T,
      name: string,
      returnType: Type,
   ) {
      const id = `${definition.classId}::${name}`;
      // Build arrow function so the methods are not possible to call with new expression
      const method = (that: unknown, params: ArrayLike<unknown>) => {
         const diagnostics = new Diagnostics();
         const executionContext = new ExecutionContext(
            definition as ClassDefinition,
            id + ' getter',
            Kernel['Array::constructor'](),
            diagnostics,
            that as object,
         );
         // Check if the object has native bound
         if (!definition.context.nativeHandles.has(that as object)) {
            diagnostics.warn(ERRORS.BoundToPrototype('getter', id));
         }

         // Validate correctness of this type
         definition.type.validate(diagnostics, that);

         // Check for diagnostics and report first value
         if (!diagnostics.success) {
            definition.__reports(executionContext);
            // Hardcoded
            return undefined;
            diagnostics.throw(1);
         }

         definition.__call(executionContext);

         returnType.validate(diagnostics, executionContext.result);

         // Checks 2
         if (!diagnostics.success) {
            // TODO: What design of our plugin system we want right?
            // definition.__reports(executionContext);
            // Hardcoded
            return undefined;
            diagnostics.throw(1);
         }
         // TODO: Implement privileges and type checking
         //if(currentPrivilege && currentPrivilege !== functionType.privilege) throw new ErrorConstructors.NoPrivilege(ErrorMessages.NoPrivilege("function", id));
         //let error = functionType.ValidArgumentTypes(params);
         //if(error) throw new error.ctor(error.message);

         return executionContext.result;
      };

      return this.Finalize(method, 0);
   }

   private static Finalize(method: CallableFunction, length: number) {
      // Mark function as native
      Kernel.SetFakeNative(method);

      // Set virtual number of params
      Kernel.SetLength(method, length);

      // All these names of methods are empty
      Kernel.SetName(method, '');

      // Handle with proxy for support with "this" callback
      const final = new Kernel['globalThis::Proxy'](method, {
         apply(t, that, params) {
            return t(that, params);
         },
      });

      // Set the proxy also as native
      Kernel.SetFakeNative(final);

      // Return
      return final;
   }
}
