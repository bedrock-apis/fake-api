import { Diagnostics } from '../errors';
import { BaseType } from './base-types';
import { Kernel } from '../kernel';

export class BooleanType extends BaseType {
  public constructor() {
    super();
  }
  public override validate(diagnostics: Diagnostics, value: unknown): void {
    // TODO: No error message
    if (typeof value !== 'boolean')
      diagnostics.report('CHECK TODOS, No implementation error', Kernel['Error::constructor']);
  }
}
