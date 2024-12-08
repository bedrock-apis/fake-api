import { ClassDefinition } from '../../context/class-definition';
import { Diagnostics, ERRORS } from '../../errors';
import { Type } from '../type';

export class ClassBindType extends Type {
   public constructor(public readonly definition: ClassDefinition) {
      super();
   }
   public validate(diagnostics: Diagnostics, object: unknown): void {
      // TODO: What Error it should report?
      if (!this.definition.isThisType(object)) diagnostics.report(ERRORS.NoImplementation);
   }
}
